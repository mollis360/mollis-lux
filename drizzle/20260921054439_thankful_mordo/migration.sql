ALTER TABLE "reservations" DROP CONSTRAINT "reservations_check_in_format_check";--> statement-breakpoint
ALTER TABLE "reservations" DROP CONSTRAINT "reservations_check_out_format_check";--> statement-breakpoint
ALTER TABLE "reservations" ALTER COLUMN "checkIn" SET DATA TYPE date USING "checkIn"::date;--> statement-breakpoint
ALTER TABLE "reservations" ALTER COLUMN "checkOut" SET DATA TYPE date USING "checkOut"::date;