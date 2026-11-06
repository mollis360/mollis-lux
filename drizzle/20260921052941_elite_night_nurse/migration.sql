CREATE TABLE "reservation_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"reservationId" uuid NOT NULL,
	"actorUserId" text,
	"eventType" varchar(40) NOT NULL,
	"fromStatus" varchar(20),
	"toStatus" varchar(20),
	"metadata" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "reservation_rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"reservationId" uuid NOT NULL,
	"roomId" uuid NOT NULL,
	"stayRange" daterange NOT NULL,
	"blocksInventory" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reservation_rooms_reservation_room_unique" UNIQUE("reservationId","roomId"),
	CONSTRAINT "reservation_rooms_range_not_empty_check" CHECK (NOT isempty("stayRange"))
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"hotelId" uuid NOT NULL,
	"customerId" text,
	"roomCategoryId" uuid NOT NULL,
	"confirmationCode" varchar(32) NOT NULL UNIQUE,
	"idempotencyKey" varchar(128),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"checkIn" varchar(10) NOT NULL,
	"checkOut" varchar(10) NOT NULL,
	"adults" integer NOT NULL,
	"children" integer DEFAULT 0 NOT NULL,
	"guestName" varchar(255) NOT NULL,
	"guestEmail" varchar(255) NOT NULL,
	"guestPhone" varchar(50),
	"currency" varchar(3) NOT NULL,
	"pricePerNight" numeric(12,2) NOT NULL,
	"totalAmount" numeric(12,2) NOT NULL,
	"expiresAt" timestamp with time zone,
	"cancelledAt" timestamp with time zone,
	"cancellationReason" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reservations_customer_idempotency_unique" UNIQUE("customerId","idempotencyKey"),
	CONSTRAINT "reservations_status_check" CHECK ("status" IN ('pending', 'held', 'confirmed', 'cancelled', 'expired', 'checked_in', 'checked_out', 'no_show')),
	CONSTRAINT "reservations_check_in_format_check" CHECK ("checkIn" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'),
	CONSTRAINT "reservations_check_out_format_check" CHECK ("checkOut" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'),
	CONSTRAINT "reservations_date_order_check" CHECK ("checkIn" < "checkOut"),
	CONSTRAINT "reservations_adults_check" CHECK ("adults" >= 1),
	CONSTRAINT "reservations_children_check" CHECK ("children" >= 0),
	CONSTRAINT "reservations_currency_check" CHECK (char_length("currency") = 3 AND "currency" = upper("currency")),
	CONSTRAINT "reservations_price_per_night_check" CHECK ("pricePerNight" >= 0),
	CONSTRAINT "reservations_total_amount_check" CHECK ("totalAmount" >= 0)
);
--> statement-breakpoint
DROP INDEX "hotel_singleton_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "hotel_singleton_idx" ON "hotel" ((true));--> statement-breakpoint
CREATE INDEX "reservation_events_reservation_id_idx" ON "reservation_events" ("reservationId");--> statement-breakpoint
CREATE INDEX "reservation_rooms_reservation_id_idx" ON "reservation_rooms" ("reservationId");--> statement-breakpoint
CREATE INDEX "reservation_rooms_room_id_idx" ON "reservation_rooms" ("roomId");--> statement-breakpoint
CREATE INDEX "reservations_status_idx" ON "reservations" ("status");--> statement-breakpoint
CREATE INDEX "reservations_check_in_idx" ON "reservations" ("checkIn");--> statement-breakpoint
CREATE INDEX "reservations_check_out_idx" ON "reservations" ("checkOut");--> statement-breakpoint
CREATE INDEX "reservations_created_at_idx" ON "reservations" ("createdAt");--> statement-breakpoint
ALTER TABLE "reservation_events" ADD CONSTRAINT "reservation_events_reservationId_reservations_id_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "reservation_events" ADD CONSTRAINT "reservation_events_actorUserId_user_id_fkey" FOREIGN KEY ("actorUserId") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reservation_rooms" ADD CONSTRAINT "reservation_rooms_reservationId_reservations_id_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "reservation_rooms" ADD CONSTRAINT "reservation_rooms_roomId_rooms_id_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_hotelId_hotel_id_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotel"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_customerId_user_id_fkey" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_roomCategoryId_room_categories_id_fkey" FOREIGN KEY ("roomCategoryId") REFERENCES "room_categories"("id") ON DELETE RESTRICT;
--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS btree_gist;
--> statement-breakpoint
ALTER TABLE "reservation_rooms" ADD CONSTRAINT "reservation_rooms_no_overlapping_inventory" EXCLUDE USING gist ("roomId" WITH =, "stayRange" WITH &&) WHERE ("blocksInventory" = true);
