import { db } from "../../db";
import { hotel } from "../../db/schema/hotel";

export async function getHotel() {
  try {
    const [hotelRecord] = await db
      .select()
      .from(hotel)
      .limit(1);

    return hotelRecord ?? null;
  } catch (error) {
    console.error("getHotel database error:", error);
    throw error;
  }
}
export async function getHotelOrThrow() {
  const hotelRecord = await getHotel();

  if (!hotelRecord) {
    throw new Error(
      "Hotel record not found. Please create the hotel first.",
    );
  }

  return hotelRecord;
}

export async function getHotelId() {
  const hotelRecord = await getHotelOrThrow();

  return hotelRecord.id;
}

