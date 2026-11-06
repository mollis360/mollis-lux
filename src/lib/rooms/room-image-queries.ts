import { and, asc, eq } from "drizzle-orm";

import { db } from "@/src/db";
import { roomImages } from "@/src/db/schema/room-images";

export async function getRoomImages(roomId: string) {
  return db
    .select()
    .from(roomImages)
    .where(eq(roomImages.roomId, roomId))
    .orderBy(asc(roomImages.sortOrder));
}

export async function getRoomCoverImage(roomId: string) {
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
