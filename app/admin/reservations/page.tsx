
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowDownUp,
  ArrowRight,
  ArrowUpRight,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  Filter,
  Search,
  SlidersHorizontal,
  UsersRound,
} from "lucide-react";

import {
  countReservations,
  getReservations,
} from "@/src/lib/reservations/queries";
import type { ReservationStatus } from "@/src/db/schema/reservations";

const reservationStatuses: {
  label: string;
  value: ReservationStatus | "all";
}[] = [
  { label: "All reservations", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Held", value: "held" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Checked in", value: "checked_in" },
  { label: "Checked out", value: "checked_out" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Expired", value: "expired" },
  { label: "No show", value: "no_show" },
];

const PAGE_SIZE = 20;

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function formatDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

function getString(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "confirmed":
    case "checked_in":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "held":
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-800";

    case "cancelled":
    case "expired":
    case "no_show":
      return "border-rose-200 bg-rose-50 text-rose-700";

    case "checked_out":
      return "border-neutral-200 bg-neutral-100 text-neutral-600";

    default:
      return "border-neutral-200 bg-neutral-50 text-neutral-600";
  }
}

function statusDotClass(status: string) {
  switch (status) {
    case "confirmed":
    case "checked_in":
      return "bg-emerald-500";

    case "held":
    case "pending":
      return "bg-amber-500";

    case "cancelled":
    case "expired":
    case "no_show":
      return "bg-rose-500";

    case "checked_out":
      return "bg-neutral-400";

    default:
      return "bg-neutral-400";
  }
}

function buildPageUrl(
  search: string,
  status: ReservationStatus | "all",
  page: number,
) {
  const query = new URLSearchParams();

  if (search) {
    query.set("search", search);
  }

  if (status !== "all") {
    query.set("status", status);
  }

  query.set("page", String(page));

  return `/admin/reservations?${query.toString()}`;
}

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string | string[];
    status?: string | string[];
    page?: string | string[];
  }>;
}) {
  const params = await searchParams;

  const search = getString(params.search).trim();
  const requestedStatus = getString(params.status);
  const requestedPage = Number(getString(params.page));

  const status: ReservationStatus | "all" =
    reservationStatuses.some((item) => item.value === requestedStatus)
      ? (requestedStatus as ReservationStatus | "all")
      : "all";

  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;

  const filters = {
    ...(search ? { search } : {}),
    ...(status !== "all" ? { status } : {}),
  };

  const totalReservations = await countReservations(filters);

  const totalPages = Math.max(
    1,
    Math.ceil(totalReservations / PAGE_SIZE),
  );

  const currentPage = Math.min(page, totalPages);

  const reservations = await getReservations({
    ...filters,
    limit: PAGE_SIZE,
    offset: (currentPage - 1) * PAGE_SIZE,
  });

  const hasFilters = Boolean(search) || status !== "all";

  const firstRecord =
    totalReservations === 0
      ? 0
      : (currentPage - 1) * PAGE_SIZE + 1;

  const lastRecord = Math.min(
    currentPage * PAGE_SIZE,
    totalReservations,
  );

  const previousPageUrl = buildPageUrl(
    search,
    status,
    currentPage - 1,
  );

  const nextPageUrl = buildPageUrl(
    search,
    status,
    currentPage + 1,
  );

  return (
    <main className="space-y-7 pb-10 sm:space-y-9">
      {/* Page header */}
      <header className="relative isolate overflow-hidden rounded-[1.75rem] border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 -z-10 h-64 w-64 rounded-full bg-amber-100/60 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-1/3 -z-10 h-48 w-48 rounded-full bg-stone-100/80 blur-3xl"
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500 sm:text-xs">
              <CalendarDays
                size={15}
                strokeWidth={1.7}
                aria-hidden="true"
              />
              MOLLIS LUX · Guest management
            </p>

            <h1 className="mt-3 font-serif text-3xl tracking-tight text-neutral-950 sm:text-4xl lg:text-5xl">
              Reservations
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500 sm:text-base sm:leading-7">
              Every stay begins with a thoughtful experience. Manage guest
              bookings, stay dates, and reservation details from one place.
            </p>
          </div>

          <div className="flex w-full items-center gap-4 rounded-2xl border border-neutral-200/80 bg-white/85 p-4 shadow-sm transition duration-300 hover:border-amber-200 hover:shadow-md motion-reduce:transition-none sm:w-auto sm:min-w-56 sm:p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
              <ClipboardList
                size={22}
                strokeWidth={1.6}
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                {hasFilters
                  ? "Matching reservations"
                  : "Total reservations"}
              </p>

              <p className="mt-1 font-serif text-3xl tabular-nums text-neutral-950">
                {totalReservations.toLocaleString("en-US")}
              </p>

              <p className="mt-1 text-xs text-neutral-500">
                {hasFilters
                  ? "Based on your filters"
                  : "Across all booking records"}
              </p>
            </div>
          </div>
        </div>

        <div className="relative mt-8 grid gap-3 border-t border-neutral-100 pt-6 sm:grid-cols-3 sm:gap-4">
          <HeaderFeature
            icon={<UsersRound size={17} strokeWidth={1.7} />}
            title="Guest records"
            description="Guest and confirmation details"
          />

          <HeaderFeature
            icon={<CalendarDays size={17} strokeWidth={1.7} />}
            title="Stay details"
            description="Arrival and departure dates"
          />

          <HeaderFeature
            icon={<CheckCircle2 size={17} strokeWidth={1.7} />}
            title="Status tracking"
            description="Follow each booking's progress"
          />
        </div>
      </header>

      {/* Search and filters */}
      <section
        aria-labelledby="reservation-filters-heading"
        className="rounded-[1.5rem] border border-neutral-200/80 bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
            <SlidersHorizontal size={18} aria-hidden="true" />
          </div>

          <div>
            <h2
              id="reservation-filters-heading"
              className="font-serif text-xl text-neutral-900"
            >
              Find a reservation
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Search booking records or narrow the results by status.
            </p>
          </div>
        </div>

        <form
          action="/admin/reservations"
          method="GET"
          className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px_auto]"
        >
          <label className="relative block min-w-0">
            <span className="sr-only">Search reservations</span>

            <Search
              size={17}
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Guest, email, or confirmation code"
              className="min-h-12 w-full min-w-0 rounded-xl border border-neutral-200 bg-neutral-50/50 py-3 pl-11 pr-4 text-sm text-neutral-900 outline-none transition duration-200 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100/70 motion-reduce:transition-none"
            />
          </label>

          <label className="relative block min-w-0">
            <span className="sr-only">
              Filter by reservation status
            </span>

            <Filter
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <select
              name="status"
              defaultValue={status}
              className="min-h-12 w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50/50 py-3 pl-10 pr-9 text-sm text-neutral-700 outline-none transition duration-200 hover:border-neutral-300 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100/70 motion-reduce:transition-none"
            >
              {reservationStatuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <ArrowDownUp
              size={14}
              aria-hidden="true"
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
            />
          </label>

          <button
            type="submit"
            className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white shadow-sm transition duration-200 hover:bg-neutral-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:transform-none sm:w-auto"
          >
            <Search size={16} aria-hidden="true" />
            Apply filters

            <ArrowRight
              size={14}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none"
            />
          </button>
        </form>

        {hasFilters ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-neutral-500">
              Active filters:
            </span>

            {search ? (
              <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-700">
                <Search size={12} aria-hidden="true" />
                <span className="max-w-48 truncate">{search}</span>
              </span>
            ) : null}

            {status !== "all" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs capitalize text-amber-800">
                <Filter size={12} aria-hidden="true" />
                {formatStatus(status)}
              </span>
            ) : null}

            <Link
              href="/admin/reservations"
              className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-xs font-medium text-neutral-500 underline-offset-4 transition hover:text-neutral-950 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 motion-reduce:transition-none"
            >
              Clear all
            </Link>
          </div>
        ) : null}
      </section>

      {/* Reservation records */}
      <section
        aria-labelledby="booking-records-heading"
        className="overflow-hidden rounded-[1.5rem] border border-neutral-200/80 bg-white shadow-sm"
      >
        <div className="flex flex-col gap-3 border-b border-neutral-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
              <BedDouble
                size={19}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </div>

            <div>
              <h2
                id="booking-records-heading"
                className="font-serif text-xl text-neutral-900"
              >
                Booking records
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                {totalReservations === 0
                  ? "No matching reservations"
                  : `Showing ${firstRecord}–${lastRecord} of ${totalReservations.toLocaleString("en-US")}`}
              </p>
            </div>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-500">
            <ClipboardList size={14} aria-hidden="true" />
            {PAGE_SIZE} records per page
          </span>
        </div>

        {reservations.length === 0 ? (
          <div className="px-5 py-16 text-center sm:px-8 sm:py-20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 text-neutral-500">
              {hasFilters ? (
                <Search
                  size={27}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              ) : (
                <CalendarDays
                  size={27}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              )}
            </div>

            <h3 className="mt-5 font-serif text-2xl text-neutral-900">
              {hasFilters
                ? "No matching reservations"
                : "Your reservations will appear here"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              {hasFilters
                ? "Try another search term or select a different reservation status."
                : "When booking records are available, you can review guest details, stay dates, and reservation status here."}
            </p>

            {hasFilters ? (
              <Link
                href="/admin/reservations"
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                Clear filters
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        ) : (
          <>
            <div className="divide-y divide-neutral-100">
              {reservations.map((reservation) => (
                <Link
                  key={reservation.id}
                  href={`/admin/reservations/${reservation.id}`}
                  className="group block px-5 py-5 transition-colors duration-200 hover:bg-amber-50/30 focus-visible:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-400 motion-reduce:transition-none sm:px-6 sm:py-6"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Guest details */}
                    <div className="flex min-w-0 items-start gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-600 transition duration-200 group-hover:border-amber-200 group-hover:bg-amber-50 group-hover:text-amber-800 motion-reduce:transition-none">
                        <UsersRound
                          size={19}
                          strokeWidth={1.7}
                          aria-hidden="true"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="break-words font-medium text-neutral-950">
                            {reservation.guestName || "Guest"}
                          </p>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium capitalize ${statusBadgeClass(
                              reservation.status,
                            )}`}
                          >
                            <span
                              aria-hidden="true"
                              className={`h-1.5 w-1.5 rounded-full ${statusDotClass(
                                reservation.status,
                              )}`}
                            />

                            {formatStatus(reservation.status)}
                          </span>
                        </div>

                        <p className="mt-1 break-words text-sm text-neutral-500">
                          {reservation.guestEmail}
                        </p>

                        <p className="mt-2 inline-flex max-w-full items-center gap-1.5 break-all text-xs text-neutral-400">
                          <ClipboardList
                            size={13}
                            className="shrink-0"
                            aria-hidden="true"
                          />
                          Confirmation: {reservation.confirmationCode}
                        </p>
                      </div>
                    </div>

                    {/* Stay details */}
                    <div className="flex min-w-0 flex-col gap-3 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between lg:min-w-[340px] lg:gap-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                      <div className="min-w-0">
                        <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                          <CalendarDays size={13} aria-hidden="true" />
                          Stay dates
                        </p>

                        <p className="mt-1.5 text-sm font-medium text-neutral-800">
                          {formatDate(reservation.checkIn)} –{" "}
                          {formatDate(reservation.checkOut)}
                        </p>

                        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
                          <BedDouble
                            size={13}
                            className="shrink-0"
                            aria-hidden="true"
                          />

                          <span className="break-words">
                            {reservation.categoryName || "Room category"}
                            {reservation.roomNumbers.length > 0
                              ? ` · Room ${reservation.roomNumbers.join(", ")}`
                              : ""}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <span className="inline-flex items-center gap-1.5 text-xs text-neutral-400">
                          <Clock3 size={13} aria-hidden="true" />
                          View details
                        </span>

                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition duration-200 group-hover:border-neutral-950 group-hover:bg-neutral-950 group-hover:text-white motion-reduce:transition-none">
                          <ArrowUpRight size={16} aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 ? (
              <nav
                aria-label="Reservation pages"
                className="flex flex-col gap-4 border-t border-neutral-200 bg-neutral-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <p className="text-center text-sm text-neutral-500 sm:text-left">
                  Page{" "}
                  <span className="font-semibold tabular-nums text-neutral-900">
                    {currentPage}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold tabular-nums text-neutral-900">
                    {totalPages}
                  </span>
                </p>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  {currentPage > 1 ? (
                    <Link
                      href={previousPageUrl}
                      rel="prev"
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 motion-reduce:transition-none"
                    >
                      <ChevronLeft size={16} aria-hidden="true" />
                      Previous
                    </Link>
                  ) : (
                    <span
                      aria-disabled="true"
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-2 text-sm text-neutral-300"
                    >
                      <ChevronLeft size={16} aria-hidden="true" />
                      Previous
                    </span>
                  )}

                  {currentPage < totalPages ? (
                    <Link
                      href={nextPageUrl}
                      rel="next"
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 motion-reduce:transition-none"
                    >
                      Next
                      <ChevronRight size={16} aria-hidden="true" />
                    </Link>
                  ) : (
                    <span
                      aria-disabled="true"
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-2 text-sm text-neutral-300"
                    >
                      Next
                      <ChevronRight size={16} aria-hidden="true" />
                    </span>
                  )}
                </div>
              </nav>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}

function HeaderFeature({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-neutral-200/70 bg-white/70 p-4 transition-colors duration-200 hover:border-amber-200 hover:bg-white motion-reduce:transition-none">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium text-neutral-800">{title}</p>
        <p className="mt-1 text-xs leading-5 text-neutral-500">
          {description}
        </p>
      </div>
    </div>
  );
}
