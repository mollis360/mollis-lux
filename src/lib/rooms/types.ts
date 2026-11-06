import type { InferSelectModel } from "drizzle-orm";

import { roomCategories } from "@/src/db/schema/room-categories";
import { roomCategoryFeatures } from "@/src/db/schema/room-category-features";
import { roomCategoryImages } from "@/src/db/schema/room-category-images";
import { roomImages } from "@/src/db/schema/room-images";
import { rooms } from "@/src/db/schema/rooms";

export type RoomCategory =
  InferSelectModel<typeof roomCategories>;

export type RoomCategorySummary = RoomCategory & {
  roomCount: number;
  coverImageUrl: string | null;
  coverImagePublicId: string | null;
  coverImageAltText: string | null;
};

export type Room =
  InferSelectModel<typeof rooms>;

export type RoomImage =
  InferSelectModel<typeof roomImages>;

export type RoomWithImages = Room & {
  images: RoomImage[];
};

export type RoomCategoryImage =
  InferSelectModel<typeof roomCategoryImages>;

export type RoomCategoryFeature =
  InferSelectModel<typeof roomCategoryFeatures>;

export type RoomCategoryWithRooms =
  RoomCategory & {
    rooms: RoomWithImages[];
  };

export type RoomCategoryStatus =
  | "active"
  | "inactive"
  | "draft";

export type RoomStatus =
  | "available"
  | "maintenance"
  | "inactive";
