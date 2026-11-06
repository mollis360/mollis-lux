import {
  check,
  date,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { user } from "./auth-schema";
import { hotel } from "./hotel";
import { roomCategories } from "./room-categories";

export const reservations = pgTable(
  "reservations",
  {
    id: uuid().defaultRandom().primaryKey(),
    hotelId: uuid().notNull().references(() => hotel.id, { onDelete: "restrict" }),
    customerId: text().references(() => user.id, { onDelete: "set null" }),
    roomCategoryId: uuid().notNull().references(() => roomCategories.id, { onDelete: "restrict" }),
    confirmationCode: varchar({ length: 32 }).notNull().unique(),
    idempotencyKey: varchar({ length: 128 }),
    status: varchar({ length: 20 }).notNull().default("pending"),
    checkIn: date({ mode: "string" }).notNull(),
    checkOut: date({ mode: "string" }).notNull(),
    adults: integer().notNull(),
    children: integer().notNull().default(0),
    guestName: varchar({ length: 255 }).notNull(),
    guestEmail: varchar({ length: 255 }).notNull(),
    guestPhone: varchar({ length: 50 }),
    currency: varchar({ length: 3 }).notNull(),
    pricePerNight: numeric({ precision: 12, scale: 2 }).notNull(),
    totalAmount: numeric({ precision: 12, scale: 2 }).notNull(),
    expiresAt: timestamp({ withTimezone: true }),
    cancelledAt: timestamp({ withTimezone: true }),
    cancellationReason: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [
    unique("reservations_customer_idempotency_unique").on(table.customerId, table.idempotencyKey),
    index("reservations_status_idx").on(table.status),
    index("reservations_check_in_idx").on(table.checkIn),
    index("reservations_check_out_idx").on(table.checkOut),
    index("reservations_created_at_idx").on(table.createdAt),
    check("reservations_status_check", sql`${table.status} IN ('pending', 'held', 'confirmed', 'cancelled', 'expired', 'checked_in', 'checked_out', 'no_show')`),
    check("reservations_date_order_check", sql`${table.checkIn} < ${table.checkOut}`),
    check("reservations_adults_check", sql`${table.adults} >= 1`),
    check("reservations_children_check", sql`${table.children} >= 0`),
    check("reservations_currency_check", sql`char_length(${table.currency}) = 3 AND ${table.currency} = upper(${table.currency})`),
    check("reservations_price_per_night_check", sql`${table.pricePerNight} >= 0`),
    check("reservations_total_amount_check", sql`${table.totalAmount} >= 0`),
  ],
);

export type ReservationStatus =
  | "pending"
  | "held"
  | "confirmed"
  | "cancelled"
  | "expired"
  | "checked_in"
  | "checked_out"
  | "no_show";
