import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { rooms } from "@/src/db/schema/rooms";

export const roomImages = pgTable(
  "room_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    imageUrl: text("image_url").notNull(),

    publicId: varchar("public_id", { length: 512 }),

    width: integer("width"),
    height: integer("height"),
    format: varchar("format", { length: 20 }),
    bytes: integer("bytes"),

    altText: varchar("alt_text", { length: 255 }),

    sortOrder: integer("sort_order").notNull().default(0),

    isCover: boolean("is_cover").notNull().default(false),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("room_images_room_id_idx").on(table.roomId),

    uniqueIndex("room_images_room_sort_order_unique").on(
      table.roomId,
      table.sortOrder,
    ),

    uniqueIndex("room_images_public_id_unique")
      .on(table.publicId)
      .where(sql`${table.publicId} IS NOT NULL`),

    uniqueIndex("room_images_one_cover_unique")
      .on(table.roomId)
      .where(sql`${table.isCover} = true`),

    check(
      "room_images_sort_order_check",
      sql`${table.sortOrder} >= 0 AND ${table.sortOrder} <= 4`,
    ),

    check(
      "room_images_width_check",
      sql`${table.width} IS NULL OR ${table.width} > 0`,
    ),

    check(
      "room_images_height_check",
      sql`${table.height} IS NULL OR ${table.height} > 0`,
    ),

    check(
      "room_images_bytes_check",
      sql`${table.bytes} IS NULL OR ${table.bytes} > 0`,
    ),

    check(
      "room_images_image_url_check",
      sql`length(trim(${table.imageUrl})) > 0`,
    ),
  ],
);