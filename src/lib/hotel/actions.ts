"use server";

import { eq } from "drizzle-orm";

import { db } from "@/src/db";
import { hotel } from "@/src/db/schema/hotel";
import { requireAdmin } from "@/src/lib/auth/server";
import { getHotelOrThrow } from "@/src/lib/hotel/queries";
import { hotelSchema } from "@/src/lib/hotel/validation";
import { runSafeAction, ActionError } from "@/src/lib/errors";

export async function updateHotel(input: unknown) {
  await requireAdmin();

  return runSafeAction("update hotel", async () => {
    const data = hotelSchema.parse(input);
    const currentHotel = await getHotelOrThrow();

    const [updatedHotel] = await db
      .update(hotel)
      .set({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        address: data.address,
        city: data.city,
        country: data.country,
        timezone: data.timezone,
        currency: data.currency,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone || null,
        starRating: data.starRating?.toString() ?? null,
        checkInTime: data.checkInTime,
        checkOutTime: data.checkOutTime,
        status: data.status,
      })
      .where(eq(hotel.id, currentHotel.id))
      .returning();

    if (!updatedHotel) throw new ActionError("INTERNAL", "Hotel could not be updated.");
    return updatedHotel;
  }, "The hotel could not be updated.");
}
