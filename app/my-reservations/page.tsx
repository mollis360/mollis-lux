
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  ReceiptText,
  Sparkles,
} from "lucide-react";

import { requireAuthenticatedUser } from "@/src/lib/auth/server";
import { getReservationsForCustomer } from "@/src/lib/reservations/queries";

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatAmount(
  amount: number | string,
  currency: string,
) {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return `${currency} ${amount}`;
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(numericAmount);
  } catch {
    return `${currency} ${numericAmount.toLocaleString("en-US")}`;
  }
}

function getStatusStyle(status: string) {
  switch (status) {
    case "confirmed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "pending":
    case "held":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "checked_in":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "checked_out":
      return "border-slate-200 bg-slate-100 text-slate-700";

    case "cancelled":
    case "expired":
    case "no_show":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-[#e8e1d7] bg-[#f7f4ef] text-[#766b5d]";
  }
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default async function MyReservationsPage() {
  const session = await requireAuthenticatedUser();

  const reservations = await getReservationsForCustomer(session.user.id);

  return (
    <main className="min-h-screen bg-[#f8f6f2] px-4 py-10 text-[#29251f] sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 rounded-full px-1 py-1 text-sm text-[#8b7658] transition hover:text-[#5f4a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655]"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to homepage
        </Link>

        <header className="mb-8 sm:mb-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a1845c]">
            MOLLIS LUX
          </p>

          <h1 className="mt-3 font-serif text-4xl tracking-tight text-[#29251f] sm:text-5xl">
            My Reservations
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-7 text-[#777067]">
            View your bookings and keep track of your stays with MOLLIS LUX.
          </p>
        </header>

        {reservations.length === 0 ? (
          <section className="rounded-[1.75rem] border border-[#e9e1d5] bg-white/90 px-6 py-16 text-center shadow-[0_18px_55px_rgba(48,39,27,0.05)] backdrop-blur-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ebe3d7] bg-[#f7f3ed] text-[#9b8059]">
              <CalendarDays size={28} aria-hidden="true" />
            </div>

            <h2 className="mt-6 font-serif text-2xl text-[#29251f] sm:text-3xl">
              No reservations yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#777067]">
              You haven&apos;t made a reservation with MOLLIS LUX yet. Explore
              our rooms and find a stay that suits you.
            </p>

            <Link
              href="/#rooms"
              className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#a88a60] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#92744c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655] focus-visible:ring-offset-2"
            >
              Explore our rooms
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </section>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-[#777067]">
                {reservations.length}{" "}
                {reservations.length === 1 ? "reservation" : "reservations"}
              </p>

              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-[#a1845c]">
                <Sparkles size={12} aria-hidden="true" />
                Your stays
              </span>
            </div>

            {reservations.map((reservation) => (
              <article
                key={reservation.id}
                className="rounded-[1.75rem] border border-[#e9e1d5]/90 bg-white/95 p-6 shadow-[0_14px_45px_rgba(48,39,27,0.05)] backdrop-blur-sm transition hover:border-[#dccdb4] hover:shadow-[0_18px_50px_rgba(48,39,27,0.07)] sm:p-8"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a1845c]">
                      Reservation
                    </p>

                    <h2 className="mt-2 font-serif text-2xl tracking-tight text-[#29251f]">
                      {reservation.categoryName}
                    </h2>

                    <p className="mt-2 text-xs text-[#928a80]">
                      Confirmation code:{" "}
                      <span className="font-semibold text-[#655b4e]">
                        {reservation.confirmationCode}
                      </span>
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${getStatusStyle(
                      reservation.status,
                    )}`}
                  >
                    {formatStatus(reservation.status)}
                  </span>
                </div>

                <div className="mt-7 grid gap-4 border-t border-[#eee8df] pt-6 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[#eee8df] bg-[#fffdf9] p-4">
                    <div className="flex gap-3">
                      <CalendarDays
                        size={18}
                        className="mt-0.5 shrink-0 text-[#a1845c]"
                        aria-hidden="true"
                      />

                      <div>
                        <p className="text-xs text-[#928a80]">Check-in</p>
                        <p className="mt-1 text-sm font-medium text-[#29251f]">
                          {formatDate(reservation.checkIn)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#eee8df] bg-[#fffdf9] p-4">
                    <div className="flex gap-3">
                      <Clock3
                        size={18}
                        className="mt-0.5 shrink-0 text-[#a1845c]"
                        aria-hidden="true"
                      />

                      <div>
                        <p className="text-xs text-[#928a80]">Check-out</p>
                        <p className="mt-1 text-sm font-medium text-[#29251f]">
                          {formatDate(reservation.checkOut)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#eee8df] bg-[#fffdf9] p-4">
                    <div className="flex gap-3">
                      <ReceiptText
                        size={18}
                        className="mt-0.5 shrink-0 text-[#a1845c]"
                        aria-hidden="true"
                      />

                      <div>
                        <p className="text-xs text-[#928a80]">Total amount</p>
                        <p className="mt-1 text-sm font-medium text-[#29251f]">
                          {formatAmount(
                            reservation.totalAmount,
                            reservation.currency,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-[#eee8df] pt-5">
                  <Link
                    href={`/booking/confirmation/${reservation.id}`}
                    className="group inline-flex items-center gap-2 text-sm font-medium text-[#96764b] transition hover:text-[#6f5431] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655] focus-visible:ring-offset-2"
                  >
                    View reservation details

                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
