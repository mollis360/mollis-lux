import Link from "next/link";

import HotelSettingsForm from "@/src/components/admin/hotel/hotel-settings-form";
import { requireAdmin } from "@/src/lib/auth/server";
import { getHotelOrThrow } from "@/src/lib/hotel/queries";

type HotelStatus =
  | "active"
  | "inactive"
  | "maintenance";

function isHotelStatus(
  value: string,
): value is HotelStatus {
  return (
    value === "active" ||
    value === "inactive" ||
    value === "maintenance"
  );
}

export default async function AdminHotelPage() {
  await requireAdmin();

  const hotel = await getHotelOrThrow();

  if (!isHotelStatus(hotel.status)) {
    throw new Error(
      "Hotel has an invalid operational status.",
    );
  }

  const formHotel = {
    id: hotel.id,
    name: hotel.name,
    slug: hotel.slug,
    description: hotel.description,
    address: hotel.address,
    city: hotel.city,
    country: hotel.country,
    timezone: hotel.timezone,
    currency: hotel.currency,
    contactEmail: hotel.contactEmail,
    contactPhone: hotel.contactPhone,
    starRating: hotel.starRating,
    checkInTime: hotel.checkInTime,
    checkOutTime: hotel.checkOutTime,
    status: hotel.status,
  };

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8">
      <header className="rounded-[2rem] border border-neutral-200/80 bg-white/70 p-5 shadow-sm backdrop-blur sm:p-7">
        <Link
          href="/admin"
          className="text-xs uppercase tracking-[0.18em] text-neutral-400 transition hover:text-neutral-700"
        >
          ← Dashboard
        </Link>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-400">
              MOLLIS LUX
            </p>

            <h1 className="mt-2 font-serif text-3xl tracking-tight text-neutral-900 sm:text-4xl">
              Hotel Settings
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
              Manage the hotel information, contact details,
              operating hours, location, pricing currency, and
              operational status.
            </p>
          </div>

          <span
            className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs capitalize ${
              hotel.status === "active"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : hotel.status === "maintenance"
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-neutral-200 bg-neutral-50 text-neutral-600"
            }`}
          >
            {hotel.status}
          </span>
        </div>
      </header>

      <section className="rounded-[2rem] border border-neutral-200/80 bg-white/70 p-5 shadow-sm backdrop-blur sm:p-7">
        <HotelSettingsForm hotel={formHotel} />
      </section>
    </main>
  );
}
