import { z } from "zod";

export const hotelSchema = z.object({
  name: z.string().trim().min(2).max(255),
  slug: z.string().trim().min(2).max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  address: z.string().trim().min(1).max(500),
  city: z.string().trim().min(1).max(100),
  country: z.string().trim().min(1).max(100),
  timezone: z.string().trim().min(1).max(100),
  currency: z.string().trim().length(3).regex(/^[A-Z]{3}$/),
  contactEmail: z.string().trim().email().max(255),
  contactPhone: z.string().trim().max(50).optional().or(z.literal("")),
  starRating: z.number().min(1).max(5).optional(),
  checkInTime: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/),
  checkOutTime: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/),
  status: z.enum(["active", "inactive", "maintenance"]),
});

export type HotelInput = z.infer<typeof hotelSchema>;
