import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  numeric,
  check,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";

export const hotel = pgTable(
  "hotel",
  {
    id: uuid().defaultRandom().primaryKey(),

    name: varchar({ length: 255 }).notNull(),

    slug: varchar({ length: 255 }).notNull().unique(),

    description: text(),

    address: text().notNull(),

    city: varchar({ length: 100 }).notNull(),

    country: varchar({ length: 100 }).notNull(),

    timezone: varchar({ length: 100 }).notNull(),

    currency: varchar({ length: 3 }).notNull(),

    contactEmail: varchar({ length: 255 }).notNull(),

    contactPhone: varchar({ length: 50 }),

    starRating: numeric({ precision: 2, scale: 1 }),

    checkInTime: varchar({ length: 5 })
      .notNull()
      .default("14:00"),

    checkOutTime: varchar({ length: 5 })
      .notNull()
      .default("11:00"),

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
    // A unique index over a constant makes the singleton invariant a
    // database rule instead of an application convention.
    uniqueIndex("hotel_singleton_idx").on(sql`(true)`),

    check(
      "hotel_currency_length",
      sql`char_length(${table.currency}) = 3`,
    ),

    check(
      "hotel_currency_uppercase",
      sql`${table.currency} = upper(${table.currency})`,
    ),

    check(
      "hotel_status_check",
      sql`${table.status} IN ('active', 'inactive', 'maintenance')`,
    ),

    check(
      "hotel_slug_format",
      sql`${table.slug} ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`,
    ),

    check(
      "hotel_star_rating_check",
      sql`${table.starRating} IS NULL OR (${table.starRating} >= 1 AND ${table.starRating} <= 5)`,
    ),

    check(
      "hotel_check_in_time_format",
      sql`${table.checkInTime} ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'`,
    ),

    check(
      "hotel_check_out_time_format",
      sql`${table.checkOutTime} ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'`,
    ),
  ],
);

