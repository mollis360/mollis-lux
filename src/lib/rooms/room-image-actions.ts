"use server";

import { asc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/src/db";
import { rooms } from "@/src/db/schema/rooms";
import { roomImages } from "@/src/db/schema/room-images";

import { requireAdmin } from "@/src/lib/auth/server";

import {
  CLOUDINARY_ALLOWED_FORMATS,
  CLOUDINARY_MAX_IMAGE_BYTES,
  destroyCloudinaryImage,
  getCloudinaryImageResource,
  getCloudinaryImageUrl,
  isRoomImagePublicId,
} from "@/src/lib/cloudinary/server";

import { ActionError, runSafeAction } from "@/src/lib/errors";

const cloudinaryImageSchema = z.object({
  roomId: z.uuid("Invalid room ID."),
  publicId: z
    .string()
    .trim()
    .min(1, "Cloudinary public ID is required.")
    .max(512, "Cloudinary public ID is too long."),
  width: z.coerce.number().int().min(1).max(12_000),
  height: z.coerce.number().int().min(1).max(12_000),
  bytes: z
    .coerce
    .number()
    .int()
    .min(1)
    .max(CLOUDINARY_MAX_IMAGE_BYTES),
  format: z.enum(CLOUDINARY_ALLOWED_FORMATS),
  altText: z
    .string()
    .trim()
    .min(5, "Meaningful alt text is required.")
    .max(255, "Alt text must not exceed 255 characters."),
});

const imageMetadataSchema = z.object({
  id: z.uuid("Invalid image ID."),
  altText: z
    .string()
    .trim()
    .min(5, "Meaningful alt text is required.")
    .max(255, "Alt text must not exceed 255 characters."),
});

const cloudinaryDiscardSchema = z.object({
  roomId: z.uuid("Invalid room ID."),
  publicId: z
    .string()
    .trim()
    .min(1)
    .max(512),
});

function imageInsertValues(
  image: typeof roomImages.$inferSelect,
  sortOrder: number,
  isCover: boolean,
) {
  return {
    id: image.id,
    roomId: image.roomId,
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

async function removeUploadedAssetIfUnpersisted(
  publicId: string,
) {
  const [persistedImage] = await db
    .select({ id: roomImages.id })
    .from(roomImages)
    .where(eq(roomImages.publicId, publicId))
    .limit(1);

  if (persistedImage) return;

  try {
    await destroyCloudinaryImage(publicId);
  } catch (error) {
    console.error(
      "[add room image] orphan cleanup failed",
      error,
    );
  }
}

export async function addCloudinaryRoomImage(input: unknown) {
  await requireAdmin();

  const candidate =
    typeof input === "object" && input !== null
      ? (input as Record<string, unknown>)
      : {};

  const candidatePublicId =
    typeof candidate.publicId === "string"
      ? candidate.publicId.trim()
      : null;

  const candidateRoomId =
    typeof candidate.roomId === "string"
      ? candidate.roomId.trim()
      : null;

  try {
    let data = cloudinaryImageSchema.parse(input);

    if (!isRoomImagePublicId(data.publicId, data.roomId)) {
      throw new ActionError(
        "VALIDATION",
        "The uploaded image does not belong to this room.",
      );
    }

    let resource;

    try {
      resource = await getCloudinaryImageResource(
        data.publicId,
      );
    } catch {
      throw new ActionError(
        "PROVIDER",
        "The uploaded image could not be verified with Cloudinary.",
      );
    }

    if (
      resource.public_id !== data.publicId ||
      resource.resource_type !== "image" ||
      resource.type !== "upload"
    ) {
      throw new ActionError(
        "VALIDATION",
        "The uploaded file is not a supported Cloudinary image.",
      );
    }

    data = cloudinaryImageSchema.parse({
      ...data,
      width: resource.width,
      height: resource.height,
      bytes: resource.bytes,
      format: resource.format.toLowerCase(),
    });

    return await runSafeAction(
      "add Cloudinary room image",
      async () => {
        const result = await db.transaction(async (tx) => {
          await tx.execute(
            sql`SELECT id FROM rooms WHERE id = ${data.roomId} FOR UPDATE`,
          );

          const [room] = await tx
            .select({ id: rooms.id })
            .from(rooms)
            .where(eq(rooms.id, data.roomId))
            .limit(1);

          if (!room) {
            throw new ActionError(
              "NOT_FOUND",
              "Room not found.",
            );
          }

          const [existingByPublicId] = await tx
            .select()
            .from(roomImages)
            .where(eq(roomImages.publicId, data.publicId))
            .limit(1);

          if (existingByPublicId) {
            return existingByPublicId;
          }

          const existingImages = await tx
            .select()
            .from(roomImages)
            .where(eq(roomImages.roomId, data.roomId))
            .orderBy(asc(roomImages.sortOrder));

          if (existingImages.length >= 5) {
            throw new ActionError(
              "CONFLICT",
              "A room can have a maximum of 5 images.",
            );
          }

          const [createdImage] = await tx
            .insert(roomImages)
            .values({
              roomId: data.roomId,
              imageUrl: getCloudinaryImageUrl(
                data.publicId,
              ),
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

          if (!createdImage) {
            throw new ActionError(
              "INTERNAL",
              "The image could not be added.",
            );
          }

          return createdImage;
        });

        return result;
      },
      "The image could not be added.",
    );
  } catch (error) {
    if (
      candidatePublicId &&
      candidateRoomId &&
      isRoomImagePublicId(
        candidatePublicId,
        candidateRoomId,
      )
    ) {
      await removeUploadedAssetIfUnpersisted(
        candidatePublicId,
      );
    }

    if (error instanceof z.ZodError) {
      throw new ActionError(
        "VALIDATION",
        error.issues[0]?.message ??
          "The submitted image metadata is invalid.",
      );
    }

    throw error;
  }
}

export async function updateRoomImage(input: unknown) {
  await requireAdmin();

  return runSafeAction(
    "update room image",
    async () => {
      const data = imageMetadataSchema.parse(input);

      const [image] = await db
        .update(roomImages)
        .set({
          altText: data.altText,
        })
        .where(eq(roomImages.id, data.id))
        .returning();

      if (!image) {
        throw new ActionError(
          "NOT_FOUND",
          "Room image not found.",
        );
      }

      return image;
    },
    "The image could not be updated.",
  );
}

export async function discardCloudinaryRoomImage(
  input: unknown,
) {
  await requireAdmin();

  return runSafeAction(
    "discard Cloudinary room image",
    async () => {
      const data =
        cloudinaryDiscardSchema.parse(input);

      if (
        !isRoomImagePublicId(
          data.publicId,
          data.roomId,
        )
      ) {
        throw new ActionError(
          "VALIDATION",
          "The uploaded image does not belong to this room.",
        );
      }

      const [persistedImage] = await db
        .select({ id: roomImages.id })
        .from(roomImages)
        .where(
          eq(roomImages.publicId, data.publicId),
        )
        .limit(1);

      if (persistedImage) {
        return {
          success: true,
          alreadySaved: true,
        };
      }

      try {
        await destroyCloudinaryImage(
          data.publicId,
        );
      } catch {
        throw new ActionError(
          "PROVIDER",
          "The image storage provider could not delete this upload.",
        );
      }

      return {
        success: true,
        alreadySaved: false,
      };
    },
    "The uploaded image could not be discarded.",
  );
}

export async function setRoomImageCover(
  imageId: string,
) {
  await requireAdmin();

  return runSafeAction(
    "set room image cover",
    async () => {
      const validImageId = z
        .uuid("Invalid image ID.")
        .parse(imageId);

      const result = await db.transaction(
        async (tx) => {
          const [image] = await tx
            .select()
            .from(roomImages)
            .where(
              eq(roomImages.id, validImageId),
            )
            .limit(1);

          if (!image) {
            throw new ActionError(
              "NOT_FOUND",
              "Room image not found.",
            );
          }

          await tx.execute(
            sql`SELECT id FROM rooms WHERE id = ${image.roomId} FOR UPDATE`,
          );

          await tx
            .update(roomImages)
            .set({ isCover: false })
            .where(
              eq(roomImages.roomId, image.roomId),
            );

          await tx
            .update(roomImages)
            .set({ isCover: true })
            .where(
              eq(roomImages.id, validImageId),
            );

          return image.roomId;
        },
      );

      return {
        success: true,
        roomId: result,
      };
    },
    "The cover image could not be changed.",
  );
}

export async function deleteRoomImage(
  imageId: string,
) {
  await requireAdmin();

  return runSafeAction(
    "delete room image",
    async () => {
      const validImageId = z
        .uuid("Invalid image ID.")
        .parse(imageId);

      const [image] = await db
        .select()
        .from(roomImages)
        .where(
          eq(roomImages.id, validImageId),
        )
        .limit(1);

      if (!image) {
        throw new ActionError(
          "NOT_FOUND",
          "Room image not found.",
        );
      }

      if (image.publicId) {
        try {
          await destroyCloudinaryImage(
            image.publicId,
          );
        } catch {
          throw new ActionError(
            "PROVIDER",
            "The image storage provider could not delete this image.",
          );
        }
      }

      await db.transaction(async (tx) => {
        await tx.execute(
          sql`SELECT id FROM rooms WHERE id = ${image.roomId} FOR UPDATE`,
        );

        await tx
          .delete(roomImages)
          .where(
            eq(roomImages.id, validImageId),
          );

        const remainingImages = await tx
          .select()
          .from(roomImages)
          .where(
            eq(roomImages.roomId, image.roomId),
          )
          .orderBy(asc(roomImages.sortOrder));

        if (remainingImages.length === 0) {
          return;
        }

        const hasCover = remainingImages.some(
          (remainingImage) =>
            remainingImage.isCover,
        );

        await tx
          .delete(roomImages)
          .where(
            eq(
              roomImages.roomId,
              image.roomId,
            ),
          );

        for (
          let index = 0;
          index < remainingImages.length;
          index++
        ) {
          const remainingImage =
            remainingImages[index];

          await tx
            .insert(roomImages)
            .values(
              imageInsertValues(
                remainingImage,
                index,
                hasCover
                  ? remainingImage.isCover
                  : index === 0,
              ),
            );
        }
      });

      return { success: true };
    },
    "The image could not be deleted.",
  );
}

export async function reorderRoomImages(
  roomId: string,
  imageIds: string[],
) {
  await requireAdmin();

  return runSafeAction(
    "reorder room images",
    async () => {
      const validRoomId = z
        .uuid("Invalid room ID.")
        .parse(roomId);

      const validImageIds = z
        .array(z.uuid("Invalid image ID."))
        .min(1)
        .max(5)
        .parse(imageIds);

      if (
        new Set(validImageIds).size !==
        validImageIds.length
      ) {
        throw new ActionError(
          "VALIDATION",
          "Duplicate image IDs are not allowed.",
        );
      }

      const existingImages = await db
        .select()
        .from(roomImages)
        .where(eq(roomImages.roomId, validRoomId))
        .orderBy(asc(roomImages.sortOrder));

      const existingImageIds = new Set(
        existingImages.map(
          (image) => image.id,
        ),
      );

      if (
        validImageIds.some(
          (imageId) =>
            !existingImageIds.has(imageId),
        )
      ) {
        throw new ActionError(
          "VALIDATION",
          "One or more images do not belong to this room.",
        );
      }

      if (
        validImageIds.length !==
        existingImages.length
      ) {
        throw new ActionError(
          "VALIDATION",
          "The image list must contain every image in the room.",
        );
      }

      const imageMap = new Map(
        existingImages.map((image) => [
          image.id,
          image,
        ]),
      );

      const reorderedImages =
        validImageIds.map(
          (imageId) => imageMap.get(imageId)!,
        );

      await db.transaction(async (tx) => {
        await tx.execute(
          sql`SELECT id FROM rooms WHERE id = ${validRoomId} FOR UPDATE`,
        );

        await tx
          .delete(roomImages)
          .where(
            eq(
              roomImages.roomId,
              validRoomId,
            ),
          );

        for (
          let index = 0;
          index < reorderedImages.length;
          index++
        ) {
          const image =
            reorderedImages[index];

          await tx
            .insert(roomImages)
            .values(
              imageInsertValues(
                image,
                index,
                image.isCover,
              ),
            );
        }
      });
    },
    "The image order could not be updated.",
  );
}
