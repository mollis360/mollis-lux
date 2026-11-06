ALTER TABLE "room_category_images" ADD COLUMN "publicId" varchar(512);--> statement-breakpoint
ALTER TABLE "room_category_images" ADD COLUMN "width" integer;--> statement-breakpoint
ALTER TABLE "room_category_images" ADD COLUMN "height" integer;--> statement-breakpoint
ALTER TABLE "room_category_images" ADD COLUMN "format" varchar(20);--> statement-breakpoint
ALTER TABLE "room_category_images" ADD COLUMN "bytes" integer;--> statement-breakpoint
CREATE UNIQUE INDEX "room_category_images_public_id_unique" ON "room_category_images" ("publicId") WHERE "publicId" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "room_category_images" ADD CONSTRAINT "room_category_images_dimensions_check" CHECK (("width" IS NULL OR "width" > 0) AND ("height" IS NULL OR "height" > 0));--> statement-breakpoint
ALTER TABLE "room_category_images" ADD CONSTRAINT "room_category_images_bytes_check" CHECK ("bytes" IS NULL OR "bytes" >= 0);--> statement-breakpoint
ALTER TABLE "room_category_images" ADD CONSTRAINT "room_category_images_format_check" CHECK ("format" IS NULL OR "format" IN ('jpg', 'jpeg', 'png', 'webp', 'avif'));