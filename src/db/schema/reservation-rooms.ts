import {
  boolean,
  check,
  index,
  pgTable,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { rooms } from "./rooms";
import { reservations } from "./reservations";
import { dateRange } from "./custom-types";

export const reservationRooms = pgTable(
  "reservation_rooms",
  {
    id: uuid().defaultRandom().primaryKey(),
    reservationId: uuid().notNull().references(() => reservations.id, { onDelete: "cascade" }),
    roomId: uuid().notNull().references(() => rooms.id, { onDelete: "restrict" }),
    stayRange: dateRange("stayRange").notNull(),
    blocksInventory: boolean().notNull().default(true),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("reservation_rooms_reservation_room_unique").on(table.reservationId, table.roomId),
    index("reservation_rooms_reservation_id_idx").on(table.reservationId),
    index("reservation_rooms_room_id_idx").on(table.roomId),
    check("reservation_rooms_range_not_empty_check", sql`NOT isempty(${table.stayRange})`),
  ],
);
