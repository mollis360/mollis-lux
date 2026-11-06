CREATE TABLE "room_category_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"roomCategoryId" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "room_category_features_category_name_unique" UNIQUE("roomCategoryId","name"),
	CONSTRAINT "room_category_features_name_not_empty_check" CHECK (length(trim("name")) > 0),
	CONSTRAINT "room_category_features_sort_order_check" CHECK ("sortOrder" >= 0)
);
--> statement-breakpoint
CREATE TABLE "room_category_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"roomCategoryId" uuid NOT NULL,
	"imageUrl" text NOT NULL,
	"altText" varchar(255),
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"isCover" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "room_category_images_category_order_unique" UNIQUE("roomCategoryId","sortOrder"),
	CONSTRAINT "room_category_images_sort_order_check" CHECK ("sortOrder" >= 0 AND "sortOrder" <= 4),
	CONSTRAINT "room_category_images_url_not_empty_check" CHECK (length(trim("imageUrl")) > 0)
);
--> statement-breakpoint
CREATE INDEX "room_category_features_category_id_idx" ON "room_category_features" ("roomCategoryId");--> statement-breakpoint
CREATE INDEX "room_category_images_category_id_idx" ON "room_category_images" ("roomCategoryId");--> statement-breakpoint
CREATE UNIQUE INDEX "room_category_images_one_cover_idx" ON "room_category_images" ("roomCategoryId") WHERE "isCover" = true;--> statement-breakpoint
ALTER TABLE "room_category_features" ADD CONSTRAINT "room_category_features_roomCategoryId_room_categories_id_fkey" FOREIGN KEY ("roomCategoryId") REFERENCES "room_categories"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "room_category_images" ADD CONSTRAINT "room_category_images_roomCategoryId_room_categories_id_fkey" FOREIGN KEY ("roomCategoryId") REFERENCES "room_categories"("id") ON DELETE CASCADE;