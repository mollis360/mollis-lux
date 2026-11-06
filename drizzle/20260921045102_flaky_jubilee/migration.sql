CREATE UNIQUE INDEX "hotel_singleton_idx" ON "hotel" ((true));--> statement-breakpoint
CREATE UNIQUE INDEX "rooms_room_number_unique_idx" ON "rooms" (lower(trim("roomNumber")));
