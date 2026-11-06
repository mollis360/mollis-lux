
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { requireAuthenticatedUser } from "@/src/lib/auth/server";
import { expireCustomerReservationIfNeeded } from "@/src/lib/reservations/actions";
import { isReservationHoldActive } from "@/src/lib/reservations/hold";
import { getCustomerReservationById } from "@/src/lib/reservations/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reservation | MOLLIS LUX",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function formatMoney(amount: string | number, currency: string) {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return `${currency} ${amount}`;
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString("en-US")}`;
  }
}

function formatStayDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatExpiryDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStatusStyle(status: string) {
  switch (status) {
    case "confirmed":
      return "border-emerald-300/50 bg-emerald-100/40 text-emerald-800";

    case "pending":
    case "held":
      return "border-amber-300/50 bg-amber-100/40 text-amber-800";

    case "checked_in":
      return "border-sky-300/50 bg-sky-100/40 text-sky-800";

    case "checked_out":
      return "border-stone-300/50 bg-stone-200/40 text-stone-700";

    case "cancelled":
    case "expired":
    case "no_show":
      return "border-red-300/50 bg-red-100/40 text-red-800";

    default:
      return "border-[#d9cbb8]/50 bg-white/30 text-[#766b5d]";
  }
}

function getReservationHeading(status: string) {
  switch (status) {
    case "confirmed":
      return "Your reservation is confirmed.";

    case "expired":
      return "This reservation hold has expired.";

    case "cancelled":
      return "This reservation was cancelled.";

    case "checked_in":
      return "Welcome to MOLLIS LUX.";

    case "checked_out":
      return "Thank you for staying with us.";

    case "no_show":
      return "This reservation was marked as a no-show.";

    case "pending":
    case "held":
      return "Your stay is on hold.";

    default:
      return "Your reservation details.";
  }
}

function getReservationDescription(status: string) {
  switch (status) {
    case "confirmed":
      return "The hotel has marked this reservation confirmed. Payment is still not configured in this application.";

    case "expired":
      return "This reservation hold has expired. The room inventory is no longer held.";

    case "cancelled":
      return "This reservation has been cancelled. Payment is not configured in this application.";

    case "checked_in":
      return "Your reservation is currently checked in. We hope you enjoy your stay.";

    case "checked_out":
      return "Your stay has been completed. Thank you for choosing MOLLIS LUX.";

    case "no_show":
      return "This reservation was marked as a no-show by the hotel.";

    case "pending":
    case "held":
      return "Your reservation has been created, but payment has not been processed. This is not a payment confirmation.";

    default:
      return "Here are the details of your reservation.";
  }
}

export default async function BookingConfirmationPage({
  params,
}: PageProps) {
  const { id } = await params;

  const session = await requireAuthenticatedUser({
    disableCookieCache: true,
    redirectTo: `/login?returnTo=${encodeURIComponent(
      `/booking/confirmation/${id}`,
    )}`,
  });

  // Verify ownership before performing reservation expiration.
  const existingReservation = await getCustomerReservationById(
    id,
    session.user.id,
  );

  if (!existingReservation) {
    notFound();
  }

  await expireCustomerReservationIfNeeded(id);

  // Retrieve the latest persisted reservation state.
  const reservation = await getCustomerReservationById(
    id,
    session.user.id,
  );

  if (!reservation) {
    notFound();
  }

  const holdActive = isReservationHoldActive(
    reservation.status,
    reservation.expiresAt,
  );

  const statusLabel = formatStatus(reservation.status);
  const heading = getReservationHeading(reservation.status);
  const description = getReservationDescription(reservation.status);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eee9df] px-4 py-10 text-[#29251f] sm:px-6 sm:py-14 lg:px-8 lg:py-20">

      {/* Ambient background lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#d9c5a5]/40 blur-[110px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-40 h-[550px] w-[550px] rounded-full bg-[#c9b99e]/35 blur-[120px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50 blur-[130px]"
      />

      <div className="relative z-10 mx-auto max-w-5xl">

        {/* Header */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <Link
            href="/"
            className="font-serif text-xl tracking-[0.24em] text-[#29251f] transition-colors hover:text-[#a1845c]"
          >
            MOLLIS LUX
          </Link>

          <div className="flex flex-wrap items-center gap-5">

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-[#776b5b] transition hover:text-[#a1845c]"
            >
              <ArrowLeft size={15} aria-hidden="true" />
              Return to hotel
            </Link>

            <Link
              href="/my-reservations"
              className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9b7950] transition hover:text-[#6f5431]"
            >
              My reservations
            </Link>

          </div>
        </header>

        {/* Main glass card */}
        <section
          className="relative mt-12 overflow-hidden rounded-[2rem] border border-white/80 bg-white/45 shadow-[0_30px_100px_rgba(65,52,34,0.12)] backdrop-blur-2xl sm:mt-16 sm:rounded-[2.5rem]"
          aria-labelledby="confirmation-heading"
        >

          {/* Subtle glass reflection */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white/70 to-transparent"
          />

          <div className="relative p-6 sm:p-10 lg:p-14">

            {/* Reservation status */}
            <div className="flex flex-wrap items-center gap-3">

              <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#a1845c]">
                <Sparkles size={14} aria-hidden="true" />
                MOLLIS LUX RESERVATIONS
              </span>

              <span
                className={`inline-flex rounded-full border px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] backdrop-blur-md ${getStatusStyle(
                  reservation.status,
                )}`}
              >
                {statusLabel}
              </span>

            </div>

            {/* Heading */}
            <div className="mt-8 max-w-3xl">

              <h1
                id="confirmation-heading"
                className="font-serif text-4xl leading-[1.15] tracking-tight text-[#29251f] sm:text-5xl lg:text-6xl"
              >
                {heading}
              </h1>

              <p className="mt-6 max-w-2xl text-sm leading-8 text-[#756d62] sm:text-base">
                {description}
              </p>

            </div>

            {/* Reservation reference */}
            <div className="mt-10 rounded-2xl border border-white/80 bg-white/35 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl sm:flex sm:items-center sm:justify-between sm:gap-5">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9b8c78]">
                  Reservation reference
                </p>

                <p className="mt-2 break-all font-serif text-xl tracking-[0.08em] text-[#302a21] sm:text-2xl">
                  {reservation.confirmationCode}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-[#8a7b66] sm:mt-0">
                <ShieldCheck size={16} aria-hidden="true" />
                Your reservation details
              </div>

            </div>

            {/* Details heading */}
            <div className="mt-12 flex items-center justify-between gap-4">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a1845c]">
                  Your booking
                </p>

                <h2 className="mt-2 font-serif text-2xl text-[#302a21] sm:text-3xl">
                  Reservation overview
                </h2>
              </div>

              <Sparkles
                size={22}
                className="text-[#b69a70]"
                aria-hidden="true"
              />

            </div>

            {/* Transparent detail cards */}
            <div className="mt-7 grid gap-4 sm:grid-cols-2">

              <Detail
                icon={<CalendarDays size={17} aria-hidden="true" />}
                label="Room category"
                value={reservation.categoryName}
              />

              <Detail
                icon={<Clock3 size={17} aria-hidden="true" />}
                label="Stay dates"
                value={`${formatStayDate(reservation.checkIn)} → ${formatStayDate(reservation.checkOut)}`}
              />

              <Detail
                icon={<Users size={17} aria-hidden="true" />}
                label="Guests"
                value={`${reservation.adults} adults, ${reservation.children} children`}
              />

              <Detail
                icon={<Users size={17} aria-hidden="true" />}
                label="Guest name"
                value={reservation.guestName}
              />

              <Detail
                icon={<ReceiptText size={17} aria-hidden="true" />}
                label="Reservation total"
                value={formatMoney(
                  reservation.totalAmount,
                  reservation.currency,
                )}
              />

              <Detail
                icon={<ShieldCheck size={17} aria-hidden="true" />}
                label="Payment status"
                value="Not configured"
              />

            </div>

            {/* Hold expiration */}
            {holdActive && reservation.expiresAt ? (
              <div className="mt-8 rounded-2xl border border-amber-200/70 bg-amber-50/45 p-5 backdrop-blur-xl">

                <div className="flex items-start gap-3">

                  <Clock3
                    size={19}
                    className="mt-0.5 shrink-0 text-amber-700"
                    aria-hidden="true"
                  />

                  <div>
                    <p className="text-sm font-semibold text-amber-900">
                      Reservation hold expiration
                    </p>

                    <p className="mt-2 text-sm leading-7 text-amber-800">
                      Your reservation hold expires at{" "}
                      {formatExpiryDate(reservation.expiresAt)} Los Angeles
                      time. The server remains authoritative if this page
                      stays open.
                    </p>
                  </div>

                </div>
              </div>
            ) : null}

            {/* Expired notice */}
            {reservation.status === "expired" ? (
              <div className="mt-8 rounded-2xl border border-red-200/70 bg-red-50/45 p-5 backdrop-blur-xl">
                <p className="text-sm font-semibold text-red-900">
                  Reservation expired
                </p>

                <p className="mt-2 text-sm leading-7 text-red-800">
                  This reservation hold has expired and the inventory is no
                  longer held. Start a new availability request to try again.
                </p>
              </div>
            ) : null}

            {/* Cancelled notice */}
            {reservation.status === "cancelled" ? (
              <div className="mt-8 rounded-2xl border border-stone-300/60 bg-white/35 p-5 backdrop-blur-xl">
                <p className="text-sm font-semibold text-stone-800">
                  Reservation cancelled
                </p>

                <p className="mt-2 text-sm leading-7 text-stone-600">
                  This reservation was cancelled. No refund is shown because
                  payment is not configured.
                </p>
              </div>
            ) : null}

            {/* Actions */}
            <div className="mt-12 flex flex-col gap-4 border-t border-white/70 pt-8 sm:flex-row">

              <Link
                href="/my-reservations"
                className="group inline-flex min-h-14 flex-1 items-center justify-center gap-3 rounded-full border border-[#a88a60]/70 bg-[#a88a60]/90 px-7 py-4 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(120,91,51,0.18)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-[#92744c] hover:shadow-[0_14px_30px_rgba(120,91,51,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655] focus-visible:ring-offset-2"
              >
                View my reservations

                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>

              <Link
                href="/"
                className="inline-flex min-h-14 flex-1 items-center justify-center rounded-full border border-white/90 bg-white/40 px-7 py-4 text-sm font-medium text-[#655b4e] shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655] focus-visible:ring-offset-2"
              >
                Return to hotel
              </Link>

            </div>

            {/* Footer */}
            <div className="mt-10 border-t border-white/60 pt-6 text-center">

              <p className="font-serif text-sm tracking-[0.24em] text-[#9b7950]">
                MOLLIS LUX
              </p>

              <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[#a39a8e]">
                An experience beyond accommodation
              </p>

            </div>

          </div>
        </section>

      </div>
    </main>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/80 bg-white/35 p-5 shadow-[0_8px_25px_rgba(65,52,34,0.035)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#cbb795]/70 hover:bg-white/55 hover:shadow-[0_15px_35px_rgba(65,52,34,0.08)]">

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
      />

      <p className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#948775]">

        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/80 bg-white/45 text-[#a1845c] shadow-sm backdrop-blur-md transition-colors group-hover:bg-white/75">
          {icon}
        </span>

        {label}

      </p>

      <p className="mt-4 break-words font-medium text-[#302a21]">
        {value}
      </p>

    </div>
  );
}
