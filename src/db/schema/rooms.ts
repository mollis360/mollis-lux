import {
pgTable,
text,
timestamp,
uuid,
varchar,
check,
index,
uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { roomCategories } from "./room-categories";

export const rooms = pgTable(
"rooms",
{
id: uuid().defaultRandom().primaryKey(),


roomCategoryId: uuid()
  .notNull()
  .references(() => roomCategories.id, {
    onDelete: "restrict",
  }),

roomNumber: varchar({ length: 50 }).notNull(),

name: varchar({ length: 255 }),

description: text(),

floor: varchar({ length: 20 }),

status: varchar({ length: 20 })
  .notNull()
  .default("available"),

createdAt: timestamp({ withTimezone: true })
  .notNull()
  .defaultNow(),

updatedAt: timestamp({ withTimezone: true })
  .notNull()
  .defaultNow()
  .$onUpdate(() => new Date()),


},
(table) => [
index("rooms_room_category_id_idx").on(table.roomCategoryId),


index("rooms_status_idx").on(table.status),

uniqueIndex("rooms_room_number_unique_idx").on(
  sql`lower(trim(${table.roomNumber}))`,
),

check(
  "rooms_room_number_not_empty_check",
  sql`length(trim(${table.roomNumber})) > 0`,
),

check(
  "rooms_status_check",
  sql`${table.status} IN ('available', 'maintenance', 'inactive')`,
),

check(
  "rooms_floor_not_empty_check",
  sql`${table.floor} IS NULL OR length(trim(${table.floor})) > 0`,
),


],
);
