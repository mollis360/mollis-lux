import {
  and,
  asc,
  count,
  eq,
  getTableColumns,
  inArray,
  sql,
} from "drizzle-orm";
import { z } from "zod";

import { db } from "@/src/db";
import { roomCategories } from "@/src/db/schema/room-categories";
import { roomCategoryFeatures } from "@/src/db/schema/room-category-features";
import { roomCategoryImages } from "@/src/db/schema/room-category-images";
import { roomImages } from "@/src/db/schema/room-images";
import { rooms } from "@/src/db/schema/rooms";

// ======================
// ROOM CATEGORIES
// ======================

const uuidSchema = z.uuid();

function isValidUuid(value: string) {
  return uuidSchema.safeParse(value).success;
}

const roomCategorySummarySelection = {
  ...getTableColumns(roomCategories),

  roomCount: sql<number>`
    (
      SELECT count(*)::int
      FROM ${rooms}
      WHERE ${rooms.roomCategoryId} = ${roomCategories.id}
    )
  `.mapWith(Number),

  coverImageUrl: sql<string | null>`
    (
      SELECT ${roomCategoryImages.imageUrl}
      FROM ${roomCategoryImages}
      WHERE ${roomCategoryImages.roomCategoryId} = ${roomCategories.id}
        AND ${roomCategoryImages.isCover} = true
      ORDER BY ${roomCategoryImages.sortOrder}
      LIMIT 1
    )
  `,

  coverImagePublicId: sql<string | null>`
    (
      SELECT ${roomCategoryImages.publicId}
      FROM ${roomCategoryImages}
      WHERE ${roomCategoryImages.roomCategoryId} = ${roomCategories.id}
        AND ${roomCategoryImages.isCover} = true
      ORDER BY ${roomCategoryImages.sortOrder}
      LIMIT 1
    )
  `,

  coverImageAltText: sql<string | null>`
    (
      SELECT ${roomCategoryImages.altText}
      FROM ${roomCategoryImages}
      WHERE ${roomCategoryImages.roomCategoryId} = ${roomCategories.id}
        AND ${roomCategoryImages.isCover} = true
      ORDER BY ${roomCategoryImages.sortOrder}
      LIMIT 1
    )
  `,
};

export async function getRoomCategories() {
  return db
    .select(roomCategorySummarySelection)
    .from(roomCategories)
    .orderBy(asc(roomCategories.name));
}

export async function getRoomCategoriesCount() {
  const [result] = await db
    .select({
      value: count(),
    })
    .from(roomCategories);

  return result?.value ?? 0;
}

export async function getRoomCategoryCount() {
  return getRoomCategoriesCount();
}


export async function getActiveRoomCategories() {
  const categories = await db
    .select(roomCategorySummarySelection)
    .from(roomCategories)
    .where(eq(roomCategories.status, "active"))
    .orderBy(asc(roomCategories.name));

  if (categories.length === 0) {
    return [];
  }

  const categoryIds = categories.map((category) => category.id);

  const features = await db
    .select()
    .from(roomCategoryFeatures)
    .where(inArray(roomCategoryFeatures.roomCategoryId, categoryIds))
    .orderBy(
      asc(roomCategoryFeatures.sortOrder),
      asc(roomCategoryFeatures.name),
    );

  const featuresByCategoryId = new Map<
    string,
    typeof features
  >();

  for (const feature of features) {
    const existing = featuresByCategoryId.get(feature.roomCategoryId);

    if (existing) {
      existing.push(feature);
    } else {
      featuresByCategoryId.set(feature.roomCategoryId, [feature]);
    }
  }

  return categories.map((category) => ({
    ...category,
    features: featuresByCategoryId.get(category.id) ?? [],
  }));
}


export async function getRoomCategoryById(id: string) {
  if (!isValidUuid(id)) {
    return null;
  }

  const [roomCategory] = await db
    .select()
    .from(roomCategories)
    .where(eq(roomCategories.id, id))
    .limit(1);

  return roomCategory ?? null;
}

export async function getRoomCategoryBySlug(slug: string) {
  const [roomCategory] = await db
    .select()
    .from(roomCategories)
    .where(eq(roomCategories.slug, slug))
    .limit(1);

  return roomCategory ?? null;
}

export async function getRoomCategoryOrThrow(id: string) {
  const roomCategory = await getRoomCategoryById(id);

  if (!roomCategory) {
    throw new Error("Room category not found.");
  }

  return roomCategory;
}

// ======================
// ROOM CATEGORY DETAILS
// ======================

export async function getRoomCategoryImages(
  roomCategoryId: string,
) {
  if (!isValidUuid(roomCategoryId)) {
    return [];
  }

  return db
    .select()
    .from(roomCategoryImages)
    .where(
      eq(
        roomCategoryImages.roomCategoryId,
        roomCategoryId,
      ),
    )
    .orderBy(asc(roomCategoryImages.sortOrder));
}

export async function getRoomCategoryFeatures(
  roomCategoryId: string,
) {
  if (!isValidUuid(roomCategoryId)) {
    return [];
  }

  return db
    .select()
    .from(roomCategoryFeatures)
    .where(
      eq(
        roomCategoryFeatures.roomCategoryId,
        roomCategoryId,
      ),
    )
    .orderBy(
      asc(roomCategoryFeatures.sortOrder),
      asc(roomCategoryFeatures.name),
    );
}

export async function getRoomCategoryDetails(id: string) {
  const roomCategory = await getRoomCategoryById(id);

  if (!roomCategory) {
    return null;
  }

  const [images, features, categoryRooms] =
    await Promise.all([
      getRoomCategoryImages(id),
      getRoomCategoryFeatures(id),
      getRoomsByCategoryId(id),
    ]);

  return {
    ...roomCategory,
    images,
    features,
    rooms: categoryRooms,
  };
}

export async function getRoomCategoryDetailsBySlug(
  slug: string,
) {
  const roomCategory = await getRoomCategoryBySlug(slug);

  if (!roomCategory) {
    return null;
  }

  return getRoomCategoryDetails(roomCategory.id);
}

// ======================
// ROOM IMAGES
// ======================

export async function getRoomImagesByRoomId(
  roomId: string,
) {
  if (!isValidUuid(roomId)) {
    return [];
  }

  return db
    .select()
    .from(roomImages)
    .where(eq(roomImages.roomId, roomId))
    .orderBy(asc(roomImages.sortOrder));
}

export async function getRoomCoverImageByRoomId(
  roomId: string,
) {
  if (!isValidUuid(roomId)) {
    return null;
  }

  const [image] = await db
    .select()
    .from(roomImages)
    .where(
      and(
        eq(roomImages.roomId, roomId),
        eq(roomImages.isCover, true),
      ),
    )
    .limit(1);

  return image ?? null;
}

async function attachImagesToRooms(
  roomList: typeof rooms.$inferSelect[],
) {
  if (roomList.length === 0) {
    return [];
  }

  const roomIds = roomList.map((room) => room.id);

  const images = await db
    .select()
    .from(roomImages)
    .where(inArray(roomImages.roomId, roomIds))
    .orderBy(asc(roomImages.sortOrder));

  const imagesByRoomId = new Map<
    string,
    typeof images
  >();

  for (const image of images) {
    const existing = imagesByRoomId.get(image.roomId);

    if (existing) {
      existing.push(image);
    } else {
      imagesByRoomId.set(image.roomId, [image]);
    }
  }

  return roomList.map((room) => ({
    ...room,
    images: imagesByRoomId.get(room.id) ?? [],
  }));
}

// ======================
// ROOMS
// ======================

export async function getRoomCount(
  status?:
    | "available"
    | "maintenance"
    | "inactive",
) {
  const [result] = status
    ? await db
        .select({
          value: count(),
        })
        .from(rooms)
        .where(eq(rooms.status, status))
    : await db
        .select({
          value: count(),
        })
        .from(rooms);

  return result?.value ?? 0;
}

export async function getRooms() {
  const roomList = await db
    .select()
    .from(rooms)
    .orderBy(asc(rooms.roomNumber));

  return attachImagesToRooms(roomList);
}

export async function getRoomsByCategoryId(
  roomCategoryId: string,
) {
  if (!isValidUuid(roomCategoryId)) {
    return [];
  }

  const roomList = await db
    .select()
    .from(rooms)
    .where(
      eq(
        rooms.roomCategoryId,
        roomCategoryId,
      ),
    )
    .orderBy(asc(rooms.roomNumber));

  return attachImagesToRooms(roomList);
}

export async function getRoomById(id: string) {
  if (!isValidUuid(id)) {
    return null;
  }

  const [room] = await db
    .select()
    .from(rooms)
    .where(eq(rooms.id, id))
    .limit(1);

  if (!room) {
    return null;
  }

  const images = await getRoomImagesByRoomId(room.id);

  return {
    ...room,
    images,
  };
}

export async function getRoomOrThrow(id: string) {
  const room = await getRoomById(id);

  if (!room) {
    throw new Error("Room not found.");
  }

  return room;
}

export async function getAvailableRoomsByCategoryId(
  roomCategoryId: string,
) {
  if (!isValidUuid(roomCategoryId)) {
    return [];
  }

  const roomList = await db
    .select()
    .from(rooms)
    .where(
      and(
        eq(
          rooms.roomCategoryId,
          roomCategoryId,
        ),
        eq(rooms.status, "available"),
      ),
    )
    .orderBy(asc(rooms.roomNumber));

  return attachImagesToRooms(roomList);
}

export async function getRoomsByStatus(
  status:
    | "available"
    | "maintenance"
    | "inactive",
) {
  const roomList = await db
    .select()
    .from(rooms)
    .where(eq(rooms.status, status))
    .orderBy(asc(rooms.roomNumber));

  return attachImagesToRooms(roomList);
}

// ======================
// PUBLIC ROOM CATEGORY
// ======================

export async function getPublicRoomCategoryBySlug(
  slug: string,
) {
  const [roomCategory] = await db
    .select({
      id: roomCategories.id,
      name: roomCategories.name,
      slug: roomCategories.slug,
      shortDescription:
        roomCategories.shortDescription,
      description:
        roomCategories.description,
      maxAdults:
        roomCategories.maxAdults,
      maxChildren:
        roomCategories.maxChildren,
      roomSize:
        roomCategories.roomSize,
      bedType:
        roomCategories.bedType,
      basePrice:
        roomCategories.basePrice,
      status:
        roomCategories.status,
    })
    .from(roomCategories)
    .where(
      and(
        eq(roomCategories.slug, slug),
        eq(
          roomCategories.status,
          "active",
        ),
      ),
    )
    .limit(1);

  if (!roomCategory) {
    return null;
  }

  const [images, features] =
    await Promise.all([
      getRoomCategoryImages(
        roomCategory.id,
      ),
      getRoomCategoryFeatures(
        roomCategory.id,
      ),
    ]);

  return {
    ...roomCategory,
    images,
    features,
  };
}

export async function getPublicRoomsByCategoryId(
  roomCategoryId: string,
  limit = 8,
  offset = 0,
) {
  if (!isValidUuid(roomCategoryId)) {
    return [];
  }

  const safeLimit = Math.max(1, Math.min(Math.floor(limit), 8));
  const safeOffset = Math.max(0, Math.floor(offset));

  const roomList = await db
    .select()
    .from(rooms)
    .where(
      and(
        eq(rooms.roomCategoryId, roomCategoryId),
        eq(rooms.status, "available"),
      ),
    )
    .orderBy(asc(rooms.roomNumber), asc(rooms.id))
    .limit(safeLimit)
    .offset(safeOffset);

  return attachImagesToRooms(roomList);
}
export async function getAllPublicRoomsByCategoryId(
  roomCategoryId: string,
) {
  if (!isValidUuid(roomCategoryId)) {
    return [];
  }

  const roomList = await db
    .select()
    .from(rooms)
    .where(
      and(
        eq(rooms.roomCategoryId, roomCategoryId),
        eq(rooms.status, "available"),
      ),
    )
    .orderBy(asc(rooms.roomNumber), asc(rooms.id));

  return attachImagesToRooms(roomList);
}

