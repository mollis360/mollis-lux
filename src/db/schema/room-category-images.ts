import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  integer,
  boolean,
  check,
  index,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";

import { roomCategories } from "./room-categories";

export const roomCategoryImages = pgTable(
  "room_category_images",
  {
    id: uuid().defaultRandom().primaryKey(),

    roomCategoryId: uuid()
      .notNull()
      .references(() => roomCategories.id, {
        onDelete: "cascade",
      }),

    imageUrl: text().notNull(),

    // Cloudinary identifiers are nullable so existing URL-only records remain
    // readable during the storage migration.
    publicId: varchar({ length: 512 }),

    width: integer(),

    height: integer(),

    format: varchar({ length: 20 }),

    bytes: integer(),

    altText: varchar({ length: 255 }),

    sortOrder: integer().notNull().default(0),

    isCover: boolean().notNull().default(false),

    createdAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("room_category_images_category_id_idx").on(
      table.roomCategoryId,
    ),

    unique("room_category_images_category_order_unique").on(
      table.roomCategoryId,
      table.sortOrder,
    ),

    uniqueIndex("room_category_images_one_cover_idx")
      .on(table.roomCategoryId)
      .where(sql`${table.isCover} = true`),

    uniqueIndex("room_category_images_public_id_unique")
      .on(table.publicId)
      .where(sql`${table.publicId} IS NOT NULL`),

    check(
      "room_category_images_sort_order_check",
      sql`${table.sortOrder} >= 0 AND ${table.sortOrder} <= 4`,
    ),

    check(
      "room_category_images_url_not_empty_check",
      sql`length(trim(${table.imageUrl})) > 0`,
    ),

    check(
      "room_category_images_dimensions_check",
      sql`(${table.width} IS NULL OR ${table.width} > 0) AND (${table.height} IS NULL OR ${table.height} > 0)`,
    ),

    check(
      "room_category_images_bytes_check",
      sql`${table.bytes} IS NULL OR ${table.bytes} >= 0`,
    ),

    check(
      "room_category_images_format_check",
      sql`${table.format} IS NULL OR ${table.format} IN ('jpg', 'jpeg', 'png', 'webp', 'avif')`,
    ),
  ],
);
