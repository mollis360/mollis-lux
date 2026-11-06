CREATE TABLE "room_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"hotelId" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL UNIQUE,
	"shortDescription" varchar(500),
	"description" text,
	"maxAdults" integer DEFAULT 2 NOT NULL,
	"maxChildren" integer DEFAULT 0 NOT NULL,
	"roomSize" numeric(8,2),
	"bedType" varchar(100),
	"basePrice" numeric(12,2) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "room_category_max_adults_check" CHECK ("maxAdults" >= 1),
	CONSTRAINT "room_category_max_children_check" CHECK ("maxChildren" >= 0),
	CONSTRAINT "room_category_room_size_check" CHECK ("roomSize" IS NULL OR "roomSize" > 0),
	CONSTRAINT "room_category_base_price_check" CHECK ("basePrice" > 0),
	CONSTRAINT "room_category_status_check" CHECK ("status" IN ('active', 'inactive', 'draft')),
	CONSTRAINT "room_category_slug_format_check" CHECK ("slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);
--> statement-breakpoint
ALTER TABLE "hotel" DROP CONSTRAINT "currency_check";--> statement-breakpoint
ALTER TABLE "hotel" DROP CONSTRAINT "status_check";--> statement-breakpoint
ALTER TABLE "hotel" RENAME CONSTRAINT "currency_uppercase" TO "hotel_currency_uppercase";--> statement-breakpoint
ALTER TABLE "hotel" RENAME CONSTRAINT "slug_format" TO "hotel_slug_format";--> statement-breakpoint
ALTER TABLE "hotel" ADD COLUMN "starRating" numeric(2,1);--> statement-breakpoint
ALTER TABLE "hotel" ADD COLUMN "checkInTime" varchar(5) DEFAULT '14:00' NOT NULL;--> statement-breakpoint
ALTER TABLE "hotel" ADD COLUMN "checkOutTime" varchar(5) DEFAULT '11:00' NOT NULL;--> statement-breakpoint
CREATE INDEX "room_category_hotel_id_idx" ON "room_categories" ("hotelId");--> statement-breakpoint
ALTER TABLE "room_categories" ADD CONSTRAINT "room_categories_hotelId_hotel_id_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotel"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "hotel" ADD CONSTRAINT "hotel_currency_length" CHECK (char_length("currency") = 3);--> statement-breakpoint
ALTER TABLE "hotel" ADD CONSTRAINT "hotel_status_check" CHECK ("status" IN ('active', 'inactive', 'maintenance'));--> statement-breakpoint
ALTER TABLE "hotel" ADD CONSTRAINT "hotel_star_rating_check" CHECK ("starRating" IS NULL OR ("starRating" >= 1 AND "starRating" <= 5));--> statement-breakpoint
ALTER TABLE "hotel" ADD CONSTRAINT "hotel_check_in_time_format" CHECK ("checkInTime" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');--> statement-breakpoint
ALTER TABLE "hotel" ADD CONSTRAINT "hotel_check_out_time_format" CHECK ("checkOutTime" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');