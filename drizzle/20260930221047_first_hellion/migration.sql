CREATE TABLE "room_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"room_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"public_id" varchar(512),
	"width" integer,
	"height" integer,
	"format" varchar(20),
	"bytes" integer,
	"alt_text" varchar(255),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_cover" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "room_images_sort_order_check" CHECK ("sort_order" >= 0 AND "sort_order" <= 4),
	CONSTRAINT "room_images_width_check" CHECK ("width" IS NULL OR "width" > 0),
	CONSTRAINT "room_images_height_check" CHECK ("height" IS NULL OR "height" > 0),
	CONSTRAINT "room_images_bytes_check" CHECK ("bytes" IS NULL OR "bytes" > 0),
	CONSTRAINT "room_images_image_url_check" CHECK (length(trim("image_url")) > 0)
);
--> statement-breakpoint
CREATE INDEX "room_images_room_id_idx" ON "room_images" ("room_id");--> statement-breakpoint
CREATE UNIQUE INDEX "room_images_room_sort_order_unique" ON "room_images" ("room_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "room_images_public_id_unique" ON "room_images" ("public_id") WHERE "public_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "room_images_one_cover_unique" ON "room_images" ("room_id") WHERE "is_cover" = true;--> statement-breakpoint
ALTER TABLE "room_images" ADD CONSTRAINT "room_images_room_id_rooms_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;