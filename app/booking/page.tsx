
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  BedDouble,
} from "lucide-react";

import BookingFlow from "@/src/components/public/booking-flow";
import type {
  BookingCategorySummary,
  BookingPhysicalRoomSummary,
} from "@/src/components/public/booking/booking-ui";
import { getCurrentSession } from "@/src/lib/auth/server";
import {
  getActiveRoomCategories,
  getPublicRoomCategoryBySlug,
  getRoomById,
} from "@/src/lib/rooms/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book your stay | MOLLIS LUX",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function formatPrice(price: string | number) {
  const amount = Number(price);

  if (!Number.isFinite(amount)) {
    return "Price unavailable";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

function buildBookingUrl(
  slug: string,
  values: {
    checkIn: string;
    checkOut: string;
    adults: string;
    children: string;
    roomId?: string;
  },
) {
  const query = new URLSearchParams({
    room: slug,
    checkIn: values.checkIn,
    checkOut: values.checkOut,
    adults: values.adults,
    children: values.children,
  });

  if (values.roomId) {
    query.set("roomId", values.roomId);
  }

  return `/booking?${query.toString()}`;
}

export default async function BookingPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const roomSlug = firstValue(params.room).trim();
  const requestedRoomId = firstValue(params.roomId).trim();
  const checkIn = firstValue(params.checkIn).trim();
  const checkOut = firstValue(params.checkOut).trim();
  const adults = firstValue(params.adults).trim() || "1";
  const children = firstValue(params.children).trim() || "0";

  // MODE 1: Choose a room category.
  if (!roomSlug) {
    if (requestedRoomId) {
      notFound();
    }

    const categories = await getActiveRoomCategories();

    return (
      <main className="luxury-public min-h-screen bg-[#fbfaf7] px-5 py-8 text-stone-900 sm:px-8 lg:px-12 lg:py-12">
        <div className="mx-auto max-w-7xl">
          <header className="mb-12 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="font-serif text-lg tracking-[0.24em] transition hover:text-[#9b7b4b]"
            >
              MOLLIS LUX
            </Link>

            <Link
              href="/#rooms"
              className="text-xs uppercase tracking-[0.18em] text-stone-500 transition hover:text-stone-950"
            >
              Explore rooms
            </Link>
          </header>

          <section className="mb-12 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.28em] text-[#9b7b4b]">
              Reservations
            </p>

            <h1 className="mt-4 font-serif text-4xl leading-tight text-stone-950 sm:text-5xl">
              Find your perfect stay.
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
              Choose a room category to begin your reservation. You can
              request a specific room or let the hotel assign an available
              room from your chosen collection.
            </p>
          </section>

          {categories.length === 0 ? (
            <section className="rounded-[2rem] border border-stone-200 bg-white px-6 py-14 text-center shadow-sm">
              <BedDouble
                className="mx-auto h-10 w-10 text-[#a78655]"
                aria-hidden="true"
              />

              <h2 className="mt-5 font-serif text-2xl text-stone-950">
                Rooms are currently unavailable
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-600">
                We are unable to display room categories right now. Please
                check again later.
              </p>

              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-sm text-white transition hover:bg-stone-700"
              >
                Return to MOLLIS LUX
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </section>
          ) : (
            <section
              aria-label="Choose a room category"
              className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
            >
              {categories.map((category) => (
                <article
                  key={category.id}
                  className="overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-white shadow-[0_10px_30px_rgba(83,66,45,0.04)] transition duration-300 hover:-translate-y-1 hover:border-[#d8c5a5] hover:shadow-[0_22px_50px_rgba(83,66,45,0.10)]"
                >
                  <Link
                    href={buildBookingUrl(category.slug, {
                      checkIn,
                      checkOut,
                      adults,
                      children,
                    })}
                    className="group block"
                  >
                    {category.coverImageUrl ? (
                      <div className="aspect-[4/3] overflow-hidden bg-stone-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={category.coverImageUrl}
                          alt={
                            category.coverImageAltText || category.name
                          }
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[4/3] items-center justify-center bg-[#eee7dc]">
                        <span className="font-serif text-2xl tracking-[0.18em] text-stone-400">
                          MOLLIS LUX
                        </span>
                      </div>
                    )}

                    <div className="p-6 sm:p-7">
                      <h2 className="font-serif text-2xl leading-snug text-stone-950">
                        {category.name}
                      </h2>

                      {category.shortDescription && (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-600">
                          {category.shortDescription}
                        </p>
                      )}

                      <div className="mt-6 flex items-end justify-between gap-4 border-t border-stone-100 pt-5">
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-stone-500">
                            Starting from
                          </p>

                          <p className="mt-1 font-serif text-2xl text-stone-950">
                            {formatPrice(category.basePrice)}
                          </p>

                          <p className="mt-1 text-xs text-stone-500">
                            Per night
                          </p>
                        </div>

                        <span className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-4 py-3 text-xs uppercase tracking-[0.12em] text-white transition group-hover:bg-[#80613b]">
                          Choose room
                          <ArrowRight
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </section>
          )}

          <p className="mt-10 text-center text-xs leading-6 text-stone-500">
            Displayed prices are starting rates. The reservation process
            checks availability for your selected dates.
          </p>
        </div>
      </main>
    );
  }

  // MODE 2: Book a category or request a specific physical room.
  const category = await getPublicRoomCategoryBySlug(roomSlug);

  if (!category) {
    notFound();
  }

  let selectedRoom: Awaited<ReturnType<typeof getRoomById>> = null;

  if (requestedRoomId) {
    selectedRoom = await getRoomById(requestedRoomId);

    if (!selectedRoom || selectedRoom.roomCategoryId !== category.id) {
      notFound();
    }
  }

  const specificRoomUnavailable =
    Boolean(requestedRoomId) && selectedRoom?.status !== "available";

  const session = await getCurrentSession({
    disableCookieCache: true,
  });

  if (!session) {
    const returnTo = buildBookingUrl(category.slug, {
      checkIn,
      checkOut,
      adults,
      children,
      roomId: requestedRoomId || undefined,
    });

    redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  const categoryImages: BookingCategorySummary["images"] = category.images.map(
    (image) => ({
      id: image.id,
      imageUrl: image.imageUrl,
      altText: image.altText,
      isCover: image.isCover,
      sortOrder: image.sortOrder,
    }),
  );

  const categoryFeatures: BookingCategorySummary["features"] =
    category.features.map((feature) => ({
      id: feature.id,
      name: feature.name,
      description: feature.description,
      sortOrder: feature.sortOrder,
    }));

  const bookingCategory: BookingCategorySummary = {
    id: category.id,
    name: category.name,
    slug: category.slug,
    shortDescription: category.shortDescription,
    maxAdults: category.maxAdults,
    maxChildren: category.maxChildren,
    roomSize: category.roomSize,
    bedType: category.bedType,
    images: categoryImages,
    features: categoryFeatures,
  };

  // Only pass a room into the flow when its current status is available.
  // Date-specific availability is checked separately by the booking logic.
  const bookableRoom =
    selectedRoom && selectedRoom.status === "available"
      ? selectedRoom
      : null;

  const physicalRoom: BookingPhysicalRoomSummary | undefined = bookableRoom
    ? {
        roomNumber: bookableRoom.roomNumber,
        name: bookableRoom.name,
        description: bookableRoom.description,
        floor: bookableRoom.floor,
        images: bookableRoom.images.map((image) => ({
          id: image.id,
          imageUrl: image.imageUrl,
          altText: image.altText,
          isCover: image.isCover,
          sortOrder: image.sortOrder,
        })),
      }
    : undefined;

  return (
    <main className="luxury-public min-h-screen bg-[#fbfaf7] px-5 py-8 text-stone-900 sm:px-8 lg:px-12 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="font-serif text-lg tracking-[0.24em] transition hover:text-[#9b7b4b]"
          >
            MOLLIS LUX
          </Link>

          <Link
            href={`/rooms/${category.slug}`}
            className="text-xs uppercase tracking-[0.18em] text-stone-500 transition hover:text-stone-950"
          >
            Back to room
          </Link>
        </header>

        {specificRoomUnavailable && (
          <section
            role="status"
            className="mb-8 rounded-[1.75rem] border border-amber-300 bg-amber-50 p-5 sm:p-6"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle
                className="mt-1 h-5 w-5 shrink-0 text-amber-700"
                aria-hidden="true"
              />

              <div>
                <h1 className="font-serif text-2xl text-stone-950">
                  This room cannot be selected right now.
                </h1>

                <p className="mt-2 text-sm leading-6 text-stone-700">
                  {selectedRoom
                    ? `Room ${selectedRoom.roomNumber} is not currently marked as available.`
                    : "The requested room is no longer available."}{" "}
                  You can continue with this room category, and the booking
                  process will check for another available room.
                </p>

                <Link
                  href={buildBookingUrl(category.slug, {
                    checkIn,
                    checkOut,
                    adults,
                    children,
                  })}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-sm text-white transition hover:bg-stone-700"
                >
                  Continue with this category
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>
        )}

        <BookingFlow
          category={bookingCategory}
          initialCheckIn={checkIn}
          initialCheckOut={checkOut}
          initialAdults={adults}
          initialChildren={children}
          roomId={bookableRoom?.id}
          roomNumber={bookableRoom?.roomNumber}
          physicalRoom={physicalRoom}
        />
      </div>
    </main>
  );
}
