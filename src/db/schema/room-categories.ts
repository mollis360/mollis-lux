import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  integer,
  numeric,
  check,
  index,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";

import { hotel } from "./hotel";

export const roomCategories = pgTable(
  "room_categories",
  {
    id: uuid().defaultRandom().primaryKey(),

    hotelId: uuid()
      .notNull()
      .references(() => hotel.id, { onDelete: "restrict" }),

    name: varchar({ length: 255 }).notNull(),

    slug: varchar({ length: 255 }).notNull().unique(),

    shortDescription: varchar({ length: 500 }),

    description: text(),

    maxAdults: integer().notNull().default(2),

    maxChildren: integer().notNull().default(0),

    roomSize: numeric({ precision: 8, scale: 2 }),

    bedType: varchar({ length: 100 }),

    basePrice: numeric({ precision: 12, scale: 2 }).notNull(),

    status: varchar({ length: 20 })
      .notNull()
      .default("active"),

    createdAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("room_category_hotel_id_idx").on(table.hotelId),

    check(
      "room_category_max_adults_check",
      sql`${table.maxAdults} >= 1`,
    ),

    check(
      "room_category_max_children_check",
      sql`${table.maxChildren} >= 0`,
    ),

    check(
      "room_category_room_size_check",
      sql`${table.roomSize} IS NULL OR ${table.roomSize} > 0`,
    ),

    check(
      "room_category_base_price_check",
      sql`${table.basePrice} > 0`,
    ),

    check(
      "room_category_status_check",
      sql`${table.status} IN ('active', 'inactive', 'draft')`,
    ),

    check(
      "room_category_slug_format_check",
      sql`${table.slug} ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`,
    ),
  ],
);