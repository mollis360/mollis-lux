import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  integer,
  check,
  index,
  unique,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";

import { roomCategories } from "./room-categories";

export const roomCategoryFeatures = pgTable(
  "room_category_features",
  {
    id: uuid().defaultRandom().primaryKey(),

    roomCategoryId: uuid()
      .notNull()
      .references(() => roomCategories.id, {
        onDelete: "cascade",
      }),

    name: varchar({ length: 100 }).notNull(),

    description: text(),

    sortOrder: integer().notNull().default(0),

    createdAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("room_category_features_category_id_idx").on(
      table.roomCategoryId,
    ),

    unique(
      "room_category_features_category_name_unique",
    ).on(
      table.roomCategoryId,
      table.name,
    ),

    check(
      "room_category_features_name_not_empty_check",
      sql`length(trim(${table.name})) > 0`,
    ),

    check(
      "room_category_features_sort_order_check",
      sql`${table.sortOrder} >= 0`,
    ),
  ],
);
