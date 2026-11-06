
import { z } from "zod";

export const availabilityRequestSchema = z
  .object({
    roomCategoryId: z.uuid("Invalid room category ID."),
    roomId: z.uuid("Invalid room ID.").optional(),

    checkIn: z.iso.date("Check-in must be a valid date."),
    checkOut: z.iso.date("Check-out must be a valid date."),

    adults: z.coerce.number().int().min(1).max(20),
    children: z.coerce.number().int().min(0).max(20),
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

export type AvailabilityRequest = z.infer<
  typeof availabilityRequestSchema
>;
