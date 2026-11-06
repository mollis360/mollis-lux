"use server";

import { asc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/src/db";
import { roomCategories } from "@/src/db/schema/room-categories";
import { roomCategoryImages } from "@/src/db/schema/room-category-images";
import { requireAdmin } from "@/src/lib/auth/server";
import {
  CLOUDINARY_ALLOWED_FORMATS,
  CLOUDINARY_MAX_IMAGE_BYTES,
  destroyCloudinaryImage,
  getCloudinaryImageResource,
  getCloudinaryImageUrl,
  isRoomCategoryImagePublicId,
} from "@/src/lib/cloudinary/server";
import { ActionError, runSafeAction } from "@/src/lib/errors";

const imageSchema = z.object({
  roomCategoryId: z.uuid("Invalid room category ID."),
  imageUrl: z.string().trim().url("Invalid image URL.").max(2048, "Image URL is too long."),
  altText: z.string().trim().max(255, "Alt text must not exceed 255 characters.").optional().or(z.literal("")),
});

const cloudinaryImageSchema = z.object({
  roomCategoryId: z.uuid("Invalid room category ID."),
  publicId: z.string().trim().min(1, "Cloudinary public ID is required.").max(512, "Cloudinary public ID is too long."),
  width: z.coerce.number().int().min(1).max(12_000),
  height: z.coerce.number().int().min(1).max(12_000),
  bytes: z.coerce.number().int().min(1).max(CLOUDINARY_MAX_IMAGE_BYTES),
  format: z.enum(CLOUDINARY_ALLOWED_FORMATS),
  altText: z.string().trim().min(5, "Meaningful alt text is required.").max(255, "Alt text must not exceed 255 characters."),
});

const imageMetadataSchema = z.object({
  id: z.uuid("Invalid image ID."),
  altText: z.string().trim().min(5, "Meaningful alt text is required.").max(255, "Alt text must not exceed 255 characters."),
});

const cloudinaryDiscardSchema = z.object({
  roomCategoryId: z.uuid("Invalid room category ID."),
  publicId: z.string().trim().min(1).max(512),
});

type ImageRow = typeof roomCategoryImages.$inferSelect;

function imageInsertValues(image: ImageRow, sortOrder: number, isCover: boolean) {
  return {
    id: image.id,
    roomCategoryId: image.roomCategoryId,
    imageUrl: image.imageUrl,
    publicId: image.publicId,
    width: image.width,
    height: image.height,
    format: image.format,
    bytes: image.bytes,
    altText: image.altText,
    sortOrder,
    isCover,
    createdAt: image.createdAt,
    updatedAt: image.updatedAt,
  };
}

async function removeUploadedAssetIfUnpersisted(publicId: string) {
  const [persistedImage] = await db
    .select({ id: roomCategoryImages.id })
    .from(roomCategoryImages)
    .where(eq(roomCategoryImages.publicId, publicId))
    .limit(1);

  if (persistedImage) return;

  try {
    await destroyCloudinaryImage(publicId);
  } catch (error) {
    console.error("[add room category image] orphan cleanup failed", error);
  }
}

// Legacy URL-only insert. Existing records remain supported while all new admin
// uploads use addCloudinaryRoomCategoryImage below.
export async function addRoomCategoryImage(input: unknown) {
  await requireAdmin();

  return runSafeAction("add room category image", async () => {
    const data = imageSchema.parse(input);

    const image = await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT id FROM room_categories WHERE id = ${data.roomCategoryId} FOR UPDATE`);

      const [category] = await tx
        .select({ id: roomCategories.id })
        .from(roomCategories)
        .where(eq(roomCategories.id, data.roomCategoryId))
        .limit(1);

      if (!category) throw new ActionError("NOT_FOUND", "Room category not found.");

      const existingImages = await tx
        .select({ id: roomCategoryImages.id, sortOrder: roomCategoryImages.sortOrder })
        .from(roomCategoryImages)
        .where(eq(roomCategoryImages.roomCategoryId, data.roomCategoryId))
        .orderBy(asc(roomCategoryImages.sortOrder));

      if (existingImages.length >= 5) {
        throw new ActionError("CONFLICT", "A room category can have a maximum of 5 images.");
      }

      const [createdImage] = await tx
        .insert(roomCategoryImages)
        .values({
          roomCategoryId: data.roomCategoryId,
          imageUrl: data.imageUrl,
          altText: data.altText || null,
          sortOrder: existingImages.length,
          isCover: existingImages.length === 0,
        })
        .returning();

      if (!createdImage) throw new ActionError("INTERNAL", "The image could not be added.");
      return createdImage;
    });

    return image;
  }, "The image could not be added.");
}

export async function addCloudinaryRoomCategoryImage(input: unknown) {
  await requireAdmin();

  const candidate = typeof input === "object" && input !== null ? input as Record<string, unknown> : {};
  const candidatePublicId = typeof candidate.publicId === "string" ? candidate.publicId.trim() : null;
  const candidateCategoryId = typeof candidate.roomCategoryId === "string" ? candidate.roomCategoryId.trim() : null;

  try {
    let data = cloudinaryImageSchema.parse(input);

    if (!isRoomCategoryImagePublicId(data.publicId, data.roomCategoryId)) {
      throw new ActionError("VALIDATION", "The uploaded image does not belong to this room category.");
    }

    let resource;
    try {
      resource = await getCloudinaryImageResource(data.publicId);
    } catch {
      throw new ActionError("PROVIDER", "The uploaded image could not be verified with Cloudinary.");
    }

    if (
      resource.public_id !== data.publicId ||
      resource.resource_type !== "image" ||
      resource.type !== "upload"
    ) {
      throw new ActionError("VALIDATION", "The uploaded file is not a supported Cloudinary image.");
    }

    // Treat the provider's inspected metadata as authoritative. Values from the
    // browser callback are only used to validate request shape, never trust.
    data = cloudinaryImageSchema.parse({
      ...data,
      width: resource.width,
      height: resource.height,
      bytes: resource.bytes,
      format: resource.format.toLowerCase(),
    });

    return await runSafeAction("add Cloudinary room category image", async () => {
      const result = await db.transaction(async (tx) => {
        await tx.execute(sql`SELECT id FROM room_categories WHERE id = ${data.roomCategoryId} FOR UPDATE`);

        const [category] = await tx
          .select({ id: roomCategories.id })
          .from(roomCategories)
          .where(eq(roomCategories.id, data.roomCategoryId))
          .limit(1);

        if (!category) throw new ActionError("NOT_FOUND", "Room category not found.");

        const [existingByPublicId] = await tx
          .select()
          .from(roomCategoryImages)
          .where(eq(roomCategoryImages.publicId, data.publicId))
          .limit(1);

        // Cloudinary upload callbacks can be retried. Returning the existing row
        // makes the database write idempotent without duplicating the asset.
        if (existingByPublicId) return existingByPublicId;

        const existingImages = await tx
          .select()
          .from(roomCategoryImages)
          .where(eq(roomCategoryImages.roomCategoryId, data.roomCategoryId))
          .orderBy(asc(roomCategoryImages.sortOrder));

        if (existingImages.length >= 5) {
          throw new ActionError("CONFLICT", "A room category can have a maximum of 5 images.");
        }

        const [createdImage] = await tx
          .insert(roomCategoryImages)
          .values({
            roomCategoryId: data.roomCategoryId,
            imageUrl: getCloudinaryImageUrl(data.publicId),
            publicId: data.publicId,
            width: data.width,
            height: data.height,
            format: data.format,
            bytes: data.bytes,
            altText: data.altText,
            sortOrder: existingImages.length,
            isCover: existingImages.length === 0,
          })
          .returning();

        if (!createdImage) throw new ActionError("INTERNAL", "The image could not be added.");
        return createdImage;
      });

      return result;
    }, "The image could not be added.");
  } catch (error) {
    if (
      candidatePublicId &&
      candidateCategoryId &&
      isRoomCategoryImagePublicId(candidatePublicId, candidateCategoryId)
    ) {
      await removeUploadedAssetIfUnpersisted(candidatePublicId);
    }

    if (error instanceof z.ZodError) {
      throw new ActionError("VALIDATION", error.issues[0]?.message ?? "The submitted image metadata is invalid.");
    }

    throw error;
  }
}

export async function updateRoomCategoryImage(input: unknown) {
  await requireAdmin();

  return runSafeAction("update room category image", async () => {
    const data = imageMetadataSchema.parse(input);
    const [image] = await db
      .update(roomCategoryImages)
      .set({ altText: data.altText })
      .where(eq(roomCategoryImages.id, data.id))
      .returning();

    if (!image) throw new ActionError("NOT_FOUND", "Room category image not found.");
    return image;
  }, "The image could not be updated.");
}

export async function discardCloudinaryRoomCategoryImage(input: unknown) {
  await requireAdmin();

  return runSafeAction("discard Cloudinary room category image", async () => {
    const data = cloudinaryDiscardSchema.parse(input);

    if (!isRoomCategoryImagePublicId(data.publicId, data.roomCategoryId)) {
      throw new ActionError("VALIDATION", "The uploaded image does not belong to this room category.");
    }

    const [persistedImage] = await db
      .select({ id: roomCategoryImages.id })
      .from(roomCategoryImages)
      .where(eq(roomCategoryImages.publicId, data.publicId))
      .limit(1);

    if (persistedImage) return { success: true, alreadySaved: true };

    try {
      await destroyCloudinaryImage(data.publicId);
    } catch {
      throw new ActionError("PROVIDER", "The image storage provider could not delete this upload.");
    }

    return { success: true, alreadySaved: false };
  }, "The uploaded image could not be discarded.");
}

export async function setRoomCategoryCoverImage(imageId: string) {
  await requireAdmin();

  return runSafeAction("set room category cover image", async () => {
    const validImageId = z.uuid("Invalid image ID.").parse(imageId);
    const [image] = await db
      .select()
      .from(roomCategoryImages)
      .where(eq(roomCategoryImages.id, validImageId))
      .limit(1);

    if (!image) throw new ActionError("NOT_FOUND", "Room category image not found.");

    await db.transaction(async (tx) => {
      await tx
        .update(roomCategoryImages)
        .set({ isCover: false })
        .where(eq(roomCategoryImages.roomCategoryId, image.roomCategoryId));

      await tx
        .update(roomCategoryImages)
        .set({ isCover: true })
        .where(eq(roomCategoryImages.id, validImageId));
    });

    return { success: true };
  }, "The cover image could not be changed.");
}

export async function deleteRoomCategoryImage(imageId: string) {
  await requireAdmin();

  return runSafeAction("delete room category image", async () => {
    const validImageId = z.uuid("Invalid image ID.").parse(imageId);
    const [image] = await db
      .select()
      .from(roomCategoryImages)
      .where(eq(roomCategoryImages.id, validImageId))
      .limit(1);

    if (!image) throw new ActionError("NOT_FOUND", "Room category image not found.");

    if (image.publicId) {
      try {
        await destroyCloudinaryImage(image.publicId);
      } catch {
        throw new ActionError("PROVIDER", "The image storage provider could not delete this image.");
      }
    }

    await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT id FROM room_categories WHERE id = ${image.roomCategoryId} FOR UPDATE`);
      await tx.delete(roomCategoryImages).where(eq(roomCategoryImages.id, validImageId));

      const remainingImages = await tx
        .select()
        .from(roomCategoryImages)
        .where(eq(roomCategoryImages.roomCategoryId, image.roomCategoryId))
        .orderBy(asc(roomCategoryImages.sortOrder));

      if (remainingImages.length === 0) return;

      const hasCover = remainingImages.some((remainingImage) => remainingImage.isCover);
      await tx.delete(roomCategoryImages).where(eq(roomCategoryImages.roomCategoryId, image.roomCategoryId));

      for (let index = 0; index < remainingImages.length; index++) {
        const remainingImage = remainingImages[index];
        await tx.insert(roomCategoryImages).values(
          imageInsertValues(remainingImage, index, hasCover ? remainingImage.isCover : index === 0),
        );
      }
    });

    return { success: true };
  }, "The image could not be deleted.");
}

export async function reorderRoomCategoryImages(roomCategoryId: string, imageIds: string[]) {
  await requireAdmin();

  return runSafeAction("reorder room category images", async () => {
    const validCategoryId = z.uuid("Invalid room category ID.").parse(roomCategoryId);
    const validImageIds = z.array(z.uuid("Invalid image ID.")).min(1).max(5).parse(imageIds);

    if (new Set(validImageIds).size !== validImageIds.length) {
      throw new ActionError("VALIDATION", "Duplicate image IDs are not allowed.");
    }

    const existingImages = await db
      .select()
      .from(roomCategoryImages)
      .where(eq(roomCategoryImages.roomCategoryId, validCategoryId))
      .orderBy(asc(roomCategoryImages.sortOrder));

    const existingImageIds = new Set(existingImages.map((image) => image.id));
    if (validImageIds.some((imageId) => !existingImageIds.has(imageId))) {
      throw new ActionError("VALIDATION", "One or more images do not belong to this room category.");
    }

    if (validImageIds.length !== existingImages.length) {
      throw new ActionError("VALIDATION", "The image list must contain every image in the category.");
    }

    const imageMap = new Map(existingImages.map((image) => [image.id, image]));
    const reorderedImages = validImageIds.map((imageId) => imageMap.get(imageId)!);

    await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT id FROM room_categories WHERE id = ${validCategoryId} FOR UPDATE`);
      await tx.delete(roomCategoryImages).where(eq(roomCategoryImages.roomCategoryId, validCategoryId));

      for (let index = 0; index < reorderedImages.length; index++) {
        const image = reorderedImages[index];
        await tx.insert(roomCategoryImages).values(imageInsertValues(image, index, image.isCover));
      }
    });

    return { success: true };
  }, "The image order could not be updated.");
}
