CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"roomCategoryId" uuid NOT NULL,
	"roomNumber" varchar(50) NOT NULL,
	"name" varchar(255),
	"description" text,
	"floor" varchar(20),
	"status" varchar(20) DEFAULT 'available' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rooms_room_number_not_empty_check" CHECK (length(trim("roomNumber")) > 0),
	CONSTRAINT "rooms_status_check" CHECK ("status" IN ('available', 'maintenance', 'inactive')),
	CONSTRAINT "rooms_floor_not_empty_check" CHECK ("floor" IS NULL OR length(trim("floor")) > 0)
);
--> statement-breakpoint
CREATE INDEX "rooms_room_category_id_idx" ON "rooms" ("roomCategoryId");--> statement-breakpoint
CREATE INDEX "rooms_status_idx" ON "rooms" ("status");--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_roomCategoryId_room_categories_id_fkey" FOREIGN KEY ("roomCategoryId") REFERENCES "room_categories"("id") ON DELETE RESTRICT;