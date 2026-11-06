"use server";

import { z } from "zod";

import { getPublicRoomsByCategoryId } from "@/src/lib/rooms/queries";

const PAGE_SIZE = 8;
const uuidSchema = z.uuid();

export async function loadMorePublicRooms(
  categoryId: string,
  offset: number,
) {
  const safeCategoryId = uuidSchema.safeParse(categoryId?.trim());

  if (!safeCategoryId.success) {
    throw new Error("A valid room category is required.");
  }

  const safeOffset =
    Number.isFinite(offset) && offset > 0 ? Math.floor(offset) : 0;

  return getPublicRoomsByCategoryId(
    safeCategoryId.data,
    PAGE_SIZE,
    safeOffset,
  );
}
