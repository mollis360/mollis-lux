"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/src/db";
import { reservationRooms } from "@/src/db/schema/reservation-rooms";
import { roomCategories } from "@/src/db/schema/room-categories";
import { rooms } from "@/src/db/schema/rooms";
import { requireAdmin } from "@/src/lib/auth/server";
import { runSafeAction, ActionError } from "@/src/lib/errors";
import { roomCategorySchema, roomSchema } from "@/src/lib/rooms/validation";

export async function updateRoomCategory(id: string, input: unknown) {
  await requireAdmin();

  return runSafeAction("update room category", async () => {
    const validId = z.uuid("Invalid room category identifier.").parse(id);
    const data = roomCategorySchema.parse(input);

    const [existingCategory] = await db
      .select({ id: roomCategories.id })
      .from(roomCategories)
      .where(eq(roomCategories.id, validId))
      .limit(1);

    if (!existingCategory) {
      throw new ActionError("NOT_FOUND", "Room category not found.");
    }

    const [duplicateSlug] = await db
      .select({ id: roomCategories.id })
      .from(roomCategories)
      .where(eq(roomCategories.slug, data.slug))
      .limit(1);

    if (duplicateSlug && duplicateSlug.id !== validId) {
      throw new ActionError(
        "CONFLICT",
        "A room category with this slug already exists.",
      );
    }

    const [roomCategory] = await db
      .update(roomCategories)
      .set({
        name: data.name,
        slug: data.slug,
        shortDescription: data.shortDescription || null,
        description: data.description || null,
        maxAdults: data.maxAdults,
        maxChildren: data.maxChildren,
        roomSize: data.roomSize?.toString() ?? null,
        bedType: data.bedType || null,
        basePrice: data.basePrice.toString(),
        status: data.status,
      })
      .where(eq(roomCategories.id, validId))
      .returning();

    if (!roomCategory) {
      throw new ActionError(
        "INTERNAL",
        "The room category could not be updated.",
      );
    }

    revalidatePath("/admin/room-categories");
    revalidatePath(`/admin/room-categories/${validId}`);
    revalidatePath(`/admin/room-categories/${validId}/edit`);

    return roomCategory;
  }, "The room category could not be updated.");
}

export async function updateRoomCategoryStatus(
  id: string,
  status: "active" | "inactive" | "draft",
) {
  await requireAdmin();

  return runSafeAction("update room category status", async () => {
    const validId = z.uuid("Invalid room category identifier.").parse(id);

    const [roomCategory] = await db
      .update(roomCategories)
      .set({ status })
      .where(eq(roomCategories.id, validId))
      .returning();

    if (!roomCategory) {
      throw new ActionError("NOT_FOUND", "Room category not found.");
    }

    revalidatePath("/admin/room-categories");
    revalidatePath(`/admin/room-categories/${validId}`);
    revalidatePath(`/admin/room-categories/${validId}/edit`);

    return roomCategory;
  }, "The room category status could not be updated.");
}

export async function createRoom(input: unknown) {
  await requireAdmin();

  return runSafeAction("create physical room", async () => {
    const data = roomSchema.parse(input);

    const [category] = await db
      .select({ id: roomCategories.id })
      .from(roomCategories)
      .where(eq(roomCategories.id, data.roomCategoryId))
      .limit(1);

    if (!category) {
      throw new ActionError("NOT_FOUND", "Room category not found.");
    }

    const [existingRoom] = await db
      .select({ id: rooms.id })
      .from(rooms)
      .where(
        sql`lower(trim(${rooms.roomNumber})) = lower(trim(${data.roomNumber}))`,
      )
      .limit(1);

    if (existingRoom) {
      throw new ActionError(
        "CONFLICT",
        "A room with this number already exists.",
      );
    }

    const [room] = await db
      .insert(rooms)
      .values({
        roomCategoryId: data.roomCategoryId,
        roomNumber: data.roomNumber,
        name: data.name || null,
        description: data.description || null,
        floor: data.floor || null,
        status: data.status,
      })
      .returning();

    if (!room) {
      throw new ActionError("INTERNAL", "The room could not be created.");
    }

    revalidatePath("/admin/rooms");
    revalidatePath(`/admin/room-categories/${data.roomCategoryId}`);
    revalidatePath(`/admin/room-categories/${data.roomCategoryId}/edit`);

    return room;
  }, "The room could not be created.");
}

export async function updateRoom(id: string, input: unknown) {
  await requireAdmin();

  return runSafeAction("update physical room", async () => {
    const validId = z.uuid("Invalid room identifier.").parse(id);
    const data = roomSchema.parse(input);

    const [existingRoom] = await db
      .select({
        id: rooms.id,
        roomCategoryId: rooms.roomCategoryId,
      })
      .from(rooms)
      .where(eq(rooms.id, validId))
      .limit(1);

    if (!existingRoom) {
      throw new ActionError("NOT_FOUND", "Room not found.");
    }

    const [category] = await db
      .select({ id: roomCategories.id })
      .from(roomCategories)
      .where(eq(roomCategories.id, data.roomCategoryId))
      .limit(1);

    if (!category) {
      throw new ActionError("NOT_FOUND", "Room category not found.");
    }

    const [duplicateRoom] = await db
      .select({ id: rooms.id })
      .from(rooms)
      .where(
        sql`lower(trim(${rooms.roomNumber})) = lower(trim(${data.roomNumber}))`,
      )
      .limit(1);

    if (duplicateRoom && duplicateRoom.id !== validId) {
      throw new ActionError(
        "CONFLICT",
        "A room with this number already exists.",
      );
    }

    const [room] = await db
      .update(rooms)
      .set({
        roomCategoryId: data.roomCategoryId,
        roomNumber: data.roomNumber,
        name: data.name || null,
        description: data.description || null,
        floor: data.floor || null,
        status: data.status,
      })
      .where(eq(rooms.id, validId))
      .returning();

    if (!room) {
      throw new ActionError("INTERNAL", "The room could not be updated.");
    }

    revalidatePath("/admin/rooms");
    revalidatePath(`/admin/room-categories/${existingRoom.roomCategoryId}`);
    revalidatePath(
      `/admin/room-categories/${existingRoom.roomCategoryId}/edit`,
    );
    revalidatePath(`/admin/room-categories/${data.roomCategoryId}`);
    revalidatePath(`/admin/room-categories/${data.roomCategoryId}/edit`);

    return room;
  }, "The room could not be updated.");
}

export async function updateRoomStatus(
  id: string,
  status: "available" | "maintenance" | "inactive",
) {
  await requireAdmin();

  return runSafeAction("update physical room status", async () => {
    const validId = z.uuid("Invalid room identifier.").parse(id);

    const [room] = await db
      .update(rooms)
      .set({ status })
      .where(eq(rooms.id, validId))
      .returning();

    if (!room) {
      throw new ActionError("NOT_FOUND", "Room not found.");
    }

    revalidatePath("/admin/rooms");
    revalidatePath(`/admin/room-categories/${room.roomCategoryId}`);
    revalidatePath(`/admin/room-categories/${room.roomCategoryId}/edit`);

    return room;
  }, "The room status could not be updated.");
}

export async function deleteRoom(id: string) {
  await requireAdmin();

  return runSafeAction("delete physical room", async () => {
    const validId = z.uuid("Invalid room identifier.").parse(id);

    const [room] = await db
      .select({
        id: rooms.id,
        roomCategoryId: rooms.roomCategoryId,
      })
      .from(rooms)
      .where(eq(rooms.id, validId))
      .limit(1);

    if (!room) {
      throw new ActionError("NOT_FOUND", "Room not found.");
    }

    const [assignment] = await db
      .select({ id: reservationRooms.id })
      .from(reservationRooms)
      .where(eq(reservationRooms.roomId, validId))
      .limit(1);

    if (assignment) {
      throw new ActionError(
        "CONFLICT",
        "This room has reservation history and cannot be deleted. Set it to inactive instead.",
      );
    }

    const [deletedRoom] = await db
      .delete(rooms)
      .where(eq(rooms.id, validId))
      .returning({ id: rooms.id });

    if (!deletedRoom) {
      throw new ActionError("NOT_FOUND", "Room not found.");
    }

    revalidatePath("/admin/rooms");
    revalidatePath(`/admin/room-categories/${room.roomCategoryId}`);
    revalidatePath(`/admin/room-categories/${room.roomCategoryId}/edit`);

    return deletedRoom;
  }, "The room could not be deleted.");
}