import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";
import { reservations } from "./reservations";

export const reservationEvents = pgTable(
  "reservation_events",
  {
    id: uuid().defaultRandom().primaryKey(),
    reservationId: uuid().notNull().references(() => reservations.id, { onDelete: "cascade" }),
    actorUserId: text().references(() => user.id, { onDelete: "set null" }),
    eventType: varchar({ length: 40 }).notNull(),
    fromStatus: varchar({ length: 20 }),
    toStatus: varchar({ length: 20 }),
    metadata: jsonb(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    note: text(),
  },
  (table) => [index("reservation_events_reservation_id_idx").on(table.reservationId)],
);
