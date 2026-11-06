import { z } from "zod";

export const roomCategorySchema = z.object({
name: z
.string()
.trim()
.min(2, "Room category name must be at least 2 characters.")
.max(255, "Room category name must not exceed 255 characters."),

slug: z
.string()
.trim()
.min(2, "Slug must be at least 2 characters.")
.max(255, "Slug must not exceed 255 characters.")
.regex(
/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
"Slug can only contain lowercase letters, numbers, and hyphens.",
),

shortDescription: z
.string()
.trim()
.max(500, "Short description must not exceed 500 characters.")
.optional()
.or(z.literal("")),

description: z
.string()
.trim()
.optional()
.or(z.literal("")),

maxAdults: z
.number()
.int("Maximum adults must be a whole number.")
.min(1, "A room must allow at least 1 adult.")
.max(10, "Maximum adults cannot exceed 10."),

maxChildren: z
.number()
.int("Maximum children must be a whole number.")
.min(0, "Maximum children cannot be negative.")
.max(8, "Maximum children cannot exceed 8."),

roomSize: z
.number()
.positive("Room size must be greater than 0.")
.optional(),

bedType: z
.string()
.trim()
.max(100, "Bed type must not exceed 100 characters.")
.optional()
.or(z.literal("")),

basePrice: z
.number()
.positive("Base price must be greater than 0."),

status: z.enum(["active", "inactive", "draft"]),
});

export const roomSchema = z.object({
roomCategoryId: z.uuid("Invalid room category ID."),

roomNumber: z
.string()
.trim()
.min(1, "Room number is required.")
.max(50, "Room number must not exceed 50 characters."),

name: z
.string()
.trim()
.max(255, "Room name must not exceed 255 characters.")
.optional()
.or(z.literal("")),

description: z
.string()
.trim()
.optional()
.or(z.literal("")),

floor: z
.string()
.trim()
.max(20, "Floor must not exceed 20 characters.")
.optional()
.or(z.literal("")),

status: z.enum([
"available",
"maintenance",
"inactive",
]),
});

export type RoomCategoryInput = z.infer<typeof roomCategorySchema>;

export type RoomInput = z.infer<typeof roomSchema>;
