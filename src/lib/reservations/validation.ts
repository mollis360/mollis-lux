
import { z } from "zod";

export const reservationRequestSchema = z
  .object({
    roomCategoryId: z.uuid("Invalid room category ID."),
    roomId: z.uuid("Invalid room ID.").optional(),

    checkIn: z.iso.date("Check-in must be a valid date."),
    checkOut: z.iso.date("Check-out must be a valid date."),

    adults: z.coerce
      .number()
      .int("Adults must be a whole number.")
      .min(1, "At least one adult is required.")
      .max(20, "The maximum number of adults is 20."),

    children: z.coerce
      .number()
      .int("Children must be a whole number.")
      .min(0, "Children cannot be negative.")
      .max(20, "The maximum number of children is 20."),

    guestName: z
      .string()
      .trim()
      .min(2, "Guest name must contain at least 2 characters.")
      .max(255, "Guest name cannot exceed 255 characters."),

    guestPhone: z
      .string()
      .trim()
      .max(50, "Phone number cannot exceed 50 characters.")
      .optional()
      .or(z.literal("")),

    idempotencyKey: z
      .string()
      .trim()
      .min(16, "Invalid idempotency key.")
      .max(128, "Invalid idempotency key.")
      .regex(/^[A-Za-z0-9_-]+$/, "Invalid idempotency key."),
  })
  .superRefine((value, context) => {
    if (value.checkIn >= value.checkOut) {
      context.addIssue({
        code: "custom",
        path: ["checkOut"],
        message: "Check-out must be after check-in.",
      });
    }
  });

export type ReservationRequest = z.infer<
  typeof reservationRequestSchema
>;
