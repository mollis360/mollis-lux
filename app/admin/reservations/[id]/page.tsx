
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Baby,
  BedDouble,
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Coins,
  FileText,
  History,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

import ReservationStatusActions from "@/src/components/admin/reservations/reservation-status-actions";
import { getReservationDetails } from "@/src/lib/reservations/queries";
import type { ReservationStatus } from "@/src/db/schema/reservations";

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function formatDateTime(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatStayDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

function formatMoney(
  amount: string | number | null | undefined,
  currency: string | null | undefined,
) {
  if (amount === null || amount === undefined || amount === "") {
    return "Not available";
  }

  const value = Number(amount);
  const code = (currency || "USD").toUpperCase();

  if (!Number.isFinite(value)) {
    return `${code} ${amount}`;
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${code} ${value.toFixed(2)}`;
  }
}

function getDateTimeISO(value: Date | string): string | undefined {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
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

function DetailItem({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-500">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
          {label}
        </p>

        <div className="mt-1.5 break-words text-sm leading-6 text-neutral-700">
          {children}
        </div>
      </div>
    </div>
  );
}

function SectionHeading({
  icon,
  eyebrow,
  title,
  description,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-3.5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-200/70 bg-amber-50 text-amber-800">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
          {eyebrow}
        </p>

        <h2 className="mt-1 font-serif text-xl tracking-tight text-neutral-950 sm:text-2xl">
          {title}
        </h2>

        {description ? (
          <p className="mt-1 text-sm leading-6 text-neutral-500">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default async function ReservationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getReservationDetails(id);

  if (!result) {
    notFound();
  }

  const reservation = result;
  const assignment = result.rooms[0] ?? null;
  const { events } = result;

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

        <div className="relative">
          <Link
            href="/admin/reservations"
            className="group inline-flex min-h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white/80 px-3.5 py-2 text-sm font-medium text-neutral-600 transition duration-200 hover:border-amber-200 hover:bg-amber-50 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 motion-reduce:transition-none"
          >
            <ArrowLeft
              size={16}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transform-none"
            />
            Back to reservations
          </Link>

          <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500 sm:text-xs">
                <FileText size={15} strokeWidth={1.7} aria-hidden="true" />
                MOLLIS LUX · Reservation details
              </p>

              <h1 className="mt-3 break-words font-serif text-3xl tracking-tight text-neutral-950 sm:text-4xl lg:text-5xl">
                {reservation.confirmationCode}
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500 sm:text-base">
                Review guest information, stay arrangements, room assignment,
                and the reservation&apos;s activity history.
              </p>
            </div>

            <div
              className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium capitalize shadow-sm ${statusBadgeClass(
                reservation.status,
              )}`}
            >
              <span
                aria-hidden="true"
                className={`h-2 w-2 rounded-full ${statusDotClass(
                  reservation.status,
                )}`}
              />
              {formatStatus(reservation.status)}
            </div>
          </div>

          <div className="mt-8 grid gap-3 border-t border-neutral-100 pt-6 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl border border-neutral-200/70 bg-white/70 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                <UserRound size={18} aria-hidden="true" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                  Guest
                </p>

                <p className="mt-1 truncate text-sm font-medium text-neutral-800">
                  {reservation.guestName || "Guest"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-neutral-200/70 bg-white/70 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                <CalendarDays size={18} aria-hidden="true" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                  Check-in
                </p>

                <p className="mt-1 text-sm font-medium text-neutral-800">
                  {formatStayDate(reservation.checkIn)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-neutral-200/70 bg-white/70 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                <BedDouble size={18} aria-hidden="true" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                  Room assignment
                </p>

                <p className="mt-1 text-sm font-medium text-neutral-800">
                  {assignment
                    ? `Room ${assignment.roomNumber}`
                    : "Not assigned"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Guest information and stay summary */}
      <section
        aria-label="Guest and stay information"
        className="grid gap-6 lg:grid-cols-3"
      >
        <div className="rounded-[1.5rem] border border-neutral-200/80 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md motion-reduce:transition-none sm:p-6 lg:col-span-2">
          <SectionHeading
            icon={<UsersRound size={20} strokeWidth={1.7} />}
            eyebrow="Guest profile"
            title="Guest information"
            description="Contact details and the number of guests included in this booking."
          />

          <div className="grid gap-5 border-t border-neutral-100 pt-6 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-7">
            <DetailItem
              icon={<UserRound size={17} aria-hidden="true" />}
              label="Guest name"
            >
              <span className="font-medium text-neutral-900">
                {reservation.guestName || "Not provided"}
              </span>
            </DetailItem>

            <DetailItem
              icon={<Mail size={17} aria-hidden="true" />}
              label="Email address"
            >
              {reservation.guestEmail || "Not provided"}
            </DetailItem>

            <DetailItem
              icon={<Phone size={17} aria-hidden="true" />}
              label="Phone number"
            >
              {reservation.guestPhone || "Not provided"}
            </DetailItem>

            <DetailItem
              icon={<UsersRound size={17} aria-hidden="true" />}
              label="Adults"
            >
              {reservation.adults}
            </DetailItem>

            <DetailItem
              icon={<Baby size={17} aria-hidden="true" />}
              label="Children"
            >
              {reservation.children}
            </DetailItem>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-neutral-200/80 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md motion-reduce:transition-none sm:p-6">
          <SectionHeading
            icon={<CalendarClock size={20} strokeWidth={1.7} />}
            eyebrow="Booking summary"
            title="Stay details"
            description="Arrival, departure, and reservation total."
          />

          <div className="space-y-5 border-t border-neutral-100 pt-6">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <CalendarDays size={17} aria-hidden="true" />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                  Check-in
                </p>

                <p className="mt-1.5 text-sm font-medium text-neutral-900">
                  {formatStayDate(reservation.checkIn)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                <CalendarDays size={17} aria-hidden="true" />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                  Check-out
                </p>

                <p className="mt-1.5 text-sm font-medium text-neutral-900">
                  {formatStayDate(reservation.checkOut)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                <Coins size={17} aria-hidden="true" />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                  Currency
                </p>

                <p className="mt-1.5 text-sm font-medium text-neutral-900">
                  {reservation.currency || "Not set"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200/70 bg-amber-50/60 p-4">
              <div className="flex items-center gap-2 text-amber-800">
                <ShieldCheck size={17} aria-hidden="true" />

                <p className="text-[10px] font-semibold uppercase tracking-[0.16em]">
                  Reservation total
                </p>
              </div>

              <p className="mt-2 break-words font-serif text-2xl text-neutral-950 sm:text-3xl">
                {formatMoney(
                  reservation.totalAmount,
                  reservation.currency,
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Room assignment */}
      <section className="rounded-[1.5rem] border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-6">
        <SectionHeading
          icon={<BedDouble size={20} strokeWidth={1.7} />}
          eyebrow="Accommodation"
          title="Room assignment"
          description="Physical room information associated with this reservation."
        />

        {assignment ? (
          <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50/80 p-5 sm:p-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-amber-100/60 blur-3xl"
            />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-200/70 bg-white text-amber-800 shadow-sm">
                  <BedDouble
                    size={25}
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    Assigned room
                  </p>

                  <h3 className="mt-1 break-words font-serif text-2xl text-neutral-950">
                    Room {assignment.roomNumber}
                  </h3>

                  {assignment.name ? (
                    <p className="mt-1 text-sm text-neutral-600">
                      {assignment.name}
                    </p>
                  ) : null}

                  {assignment.floor !== null &&
                  assignment.floor !== undefined ? (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-neutral-500">
                      <MapPin size={13} aria-hidden="true" />
                      Floor {assignment.floor}
                    </p>
                  ) : null}
                </div>
              </div>

              <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-700">
                <CheckCircle2 size={14} aria-hidden="true" />
                Assigned
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/70 px-5 py-8 text-center sm:px-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-500">
              <BedDouble size={22} aria-hidden="true" />
            </div>

            <h3 className="mt-4 font-medium text-neutral-900">
              No physical room assigned
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              A specific room has not been assigned to this reservation yet.
            </p>
          </div>
        )}
      </section>

      {/* Reservation status actions */}
      <section className="rounded-[1.5rem] border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-6">
        <SectionHeading
          icon={<Activity size={20} strokeWidth={1.7} />}
          eyebrow="Reservation management"
          title="Status and actions"
          description="Manage the reservation using the status transitions available to your account."
        />

        <div className="border-t border-neutral-100 pt-6">
          <ReservationStatusActions
            reservationId={reservation.id}
            status={reservation.status as ReservationStatus}
          />
        </div>
      </section>

      {/* Reservation event history */}
      <section className="rounded-[1.5rem] border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-6">
        <SectionHeading
          icon={<History size={20} strokeWidth={1.7} />}
          eyebrow="Reservation history"
          title="Activity timeline"
          description="Review the recorded events and status changes for this booking."
        />

        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/70 px-5 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-500">
              <History size={22} aria-hidden="true" />
            </div>

            <h3 className="mt-4 font-medium text-neutral-900">
              No activity recorded
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              Reservation events will appear here when they have been recorded.
            </p>
          </div>
        ) : (
          <div className="relative space-y-4 border-t border-neutral-100 pt-6">
            <div
              aria-hidden="true"
              className="absolute bottom-6 left-[19px] top-8 w-px bg-neutral-200"
            />

            {events.map((event) => {
              const eventDateTime = getDateTimeISO(event.createdAt);

              return (
                <article
                  key={event.id}
                  className="relative flex min-w-0 gap-3.5 sm:gap-4"
                >
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 shadow-sm">
                    <History size={17} aria-hidden="true" />
                  </div>

                  <div className="min-w-0 flex-1 rounded-2xl border border-neutral-200/80 bg-neutral-50/70 p-4 transition duration-200 hover:border-amber-200 hover:bg-white motion-reduce:transition-none sm:p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="break-words text-sm font-semibold capitalize text-neutral-900">
                          {formatStatus(event.eventType)}
                        </h3>

                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-neutral-400">
                          <Clock3 size={13} aria-hidden="true" />

                          {eventDateTime ? (
                            <time dateTime={eventDateTime}>
                              {formatDateTime(event.createdAt)}
                            </time>
                          ) : (
                            <span>Date unavailable</span>
                          )}
                        </div>
                      </div>

                      <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-neutral-500">
                        <History size={12} aria-hidden="true" />
                        Event
                      </span>
                    </div>

                    {event.fromStatus || event.toStatus ? (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {event.fromStatus ? (
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusBadgeClass(
                              event.fromStatus,
                            )}`}
                          >
                            {formatStatus(event.fromStatus)}
                          </span>
                        ) : (
                          <span className="text-xs text-neutral-500">
                            Created
                          </span>
                        )}

                        <ArrowRight
                          size={14}
                          className="text-neutral-400"
                          aria-hidden="true"
                        />

                        {event.toStatus ? (
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusBadgeClass(
                              event.toStatus,
                            )}`}
                          >
                            {formatStatus(event.toStatus)}
                          </span>
                        ) : (
                          <span className="text-xs text-neutral-400">—</span>
                        )}
                      </div>
                    ) : null}

                    {event.note ? (
                      <p className="mt-4 border-t border-neutral-200/70 pt-3 text-sm leading-6 text-neutral-600">
                        {event.note}
                      </p>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-6 border-t border-neutral-100 pt-5">
          <Link
            href="/admin/reservations"
            className="group inline-flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 motion-reduce:transition-none"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            Back to all reservations

            <ArrowUpRight
              size={14}
              aria-hidden="true"
              className="ml-1 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none"
            />
          </Link>
        </div>
      </section>
    </main>
  );
}
