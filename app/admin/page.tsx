
import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Hotel,
  Plus,
  Settings2,
  Sparkles,
  Users,
} from "lucide-react";

import {
  getActiveReservationCount,
  getReservations,
} from "@/src/lib/reservations/queries";
import {
  getRoomCategoryCount,
  getRoomCount,
} from "@/src/lib/rooms/queries";

function formatDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function getStatusStyle(status: string) {
  switch (status) {
    case "confirmed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "checked_in":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "checked_out":
      return "border-neutral-200 bg-neutral-100 text-neutral-600";
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "held":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "cancelled":
    case "expired":
    case "no_show":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-neutral-200 bg-neutral-50 text-neutral-600";
  }
}

const statCardClass =
  "group relative overflow-hidden rounded-[1.75rem] border border-neutral-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_16px_40px_rgba(28,25,23,0.06)] sm:p-6";

export default async function AdminDashboardPage() {
  const [
    totalRooms,
    availableRooms,
    activeReservations,
    categories,
    reservations,
  ] = await Promise.all([
    getRoomCount(),
    getRoomCount("available"),
    getActiveReservationCount(),
    getRoomCategoryCount(),
    getReservations({ limit: 6 }),
  ]);

  const stats = [
    {
      label: "Total Rooms",
      value: totalRooms,
      description: "Rooms in your inventory",
      icon: BedDouble,
      iconClass: "bg-amber-50 text-amber-800",
      accent: "from-amber-100/70",
    },
    {
      label: "Available Rooms",
      value: availableRooms,
      description: "Currently marked available",
      icon: CheckCircle2,
      iconClass: "bg-emerald-50 text-emerald-700",
      accent: "from-emerald-100/70",
    },
    {
      label: "Active Reservations",
      value: activeReservations,
      description: "Reservations in active statuses",
      icon: CalendarDays,
      iconClass: "bg-sky-50 text-sky-700",
      accent: "from-sky-100/70",
    },
    {
      label: "Room Categories",
      value: categories,
      description: "Distinct room categories",
      icon: Hotel,
      iconClass: "bg-violet-50 text-violet-700",
      accent: "from-violet-100/70",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-8 pb-8 sm:space-y-10">
      {/* Page heading */}
      <header className="relative overflow-hidden rounded-[2rem] border border-neutral-200/80 bg-white px-5 py-7 shadow-sm sm:px-8 sm:py-9">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-amber-100/60 blur-3xl"
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-px w-7 bg-amber-700" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-800">
                MOLLIS LUX · HOTEL OPERATIONS
              </p>
            </div>

            <h1 className="mt-4 font-serif text-3xl tracking-tight text-neutral-950 sm:text-4xl">
              Dashboard
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
              Your hotel at a glance. Monitor room inventory, review
              reservations, and manage daily operations from one place.
            </p>
          </div>

          <Link
            href="/admin/rooms/new"
            className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-neutral-950/10 transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 sm:w-auto"
          >
            <Plus size={17} />
            Add a Room
          </Link>
        </div>
      </header>

      {/* Overview statistics */}
      <section aria-label="Hotel overview">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-xl text-neutral-950">
              Hotel Overview
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              Current inventory and reservation counts
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
            <Sparkles size={12} className="text-amber-700" />
            Overview
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article key={stat.label} className={statCardClass}>
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${stat.accent} to-transparent opacity-70`}
                />

                <div className="relative flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-neutral-500">
                      {stat.label}
                    </p>

                    <p className="mt-4 font-serif text-4xl tracking-tight text-neutral-950 tabular-nums">
                      {stat.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${stat.iconClass}`}
                  >
                    <Icon size={21} strokeWidth={1.7} />
                  </div>
                </div>

                <div className="relative mt-5 flex items-center gap-2 border-t border-neutral-100 pt-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                  <p className="text-xs text-neutral-500">
                    {stat.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Recent reservations and quick actions */}
      <section className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="min-w-0 rounded-[1.75rem] border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <CalendarDays
                  size={18}
                  className="text-amber-800"
                  strokeWidth={1.7}
                />

                <h2 className="font-serif text-xl text-neutral-950">
                  Recent Reservations
                </h2>
              </div>

              <p className="mt-1 text-xs text-neutral-500">
                The latest reservations returned by your system
              </p>
            </div>

            <Link
              href="/admin/reservations"
              className="inline-flex min-h-10 w-fit items-center gap-2 rounded-xl px-3 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-950"
            >
              View all
              <ArrowRight size={15} />
            </Link>
          </div>

          {reservations.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/70 px-4 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-neutral-400 shadow-sm">
                <CalendarDays size={22} strokeWidth={1.5} />
              </div>

              <h3 className="mt-4 text-sm font-medium text-neutral-800">
                No reservations yet
              </h3>

              <p className="mt-1 max-w-xs text-xs leading-5 text-neutral-500">
                Reservations will appear here when they are available in your
                system.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reservations.map((reservation) => (
                <Link
                  key={reservation.id}
                  href={`/admin/reservations/${reservation.id}`}
                  className="group flex min-w-0 flex-col gap-3 rounded-2xl border border-neutral-200/80 bg-white p-4 transition-all duration-200 hover:border-amber-200 hover:bg-amber-50/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-100 bg-neutral-50 text-neutral-500 transition group-hover:border-amber-100 group-hover:bg-amber-50 group-hover:text-amber-800">
                      <Users size={18} strokeWidth={1.7} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-900">
                        {reservation.guestName?.trim() || "Guest"}
                      </p>

                      <p className="mt-1 break-words text-xs leading-5 text-neutral-500">
                        {formatDate(reservation.checkIn)}
                        <span className="mx-1.5 text-neutral-300">→</span>
                        {formatDate(reservation.checkOut)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span
                      className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-[11px] font-medium capitalize ${getStatusStyle(reservation.status)}`}
                    >
                      {formatStatus(reservation.status)}
                    </span>

                    <ArrowRight
                      size={16}
                      className="shrink-0 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-amber-800"
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-5 border-t border-neutral-100 pt-4">
            <Link
              href="/admin/reservations"
              className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 transition hover:text-neutral-950"
            >
              Open reservation management
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Quick actions */}
        <aside className="min-w-0 rounded-[1.75rem] border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <Settings2
              size={18}
              className="text-amber-800"
              strokeWidth={1.7}
            />

            <h2 className="font-serif text-xl text-neutral-950">
              Quick Actions
            </h2>
          </div>

          <p className="mt-2 text-xs leading-5 text-neutral-500">
            Shortcuts to your main hotel operations.
          </p>

          <div className="mt-6 space-y-3">
            <Link
              href="/admin/rooms/new"
              className="group flex min-h-14 items-center gap-3 rounded-2xl border border-neutral-200 p-3.5 transition hover:border-amber-200 hover:bg-amber-50/50"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                <Plus size={19} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-neutral-800">
                  Add Room
                </span>
                <span className="mt-1 block text-xs text-neutral-500">
                  Add inventory
                </span>
              </span>

              <ArrowRight
                size={16}
                className="shrink-0 text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-amber-800"
              />
            </Link>

            <Link
              href="/admin/rooms"
              className="group flex min-h-14 items-center gap-3 rounded-2xl border border-neutral-200 p-3.5 transition hover:border-amber-200 hover:bg-amber-50/50"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                <BedDouble size={19} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-neutral-800">
                  Manage Rooms
                </span>
                <span className="mt-1 block text-xs text-neutral-500">
                  View room inventory
                </span>
              </span>

              <ArrowRight
                size={16}
                className="shrink-0 text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-amber-800"
              />
            </Link>

            <Link
              href="/admin/reservations"
              className="group flex min-h-14 items-center gap-3 rounded-2xl border border-neutral-200 p-3.5 transition hover:border-amber-200 hover:bg-amber-50/50"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <CalendarDays size={19} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-neutral-800">
                  Reservations
                </span>
                <span className="mt-1 block text-xs text-neutral-500">
                  Review guest stays
                </span>
              </span>

              <ArrowRight
                size={16}
                className="shrink-0 text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-amber-800"
              />
            </Link>

            <Link
              href="/admin/hotel"
              className="group flex min-h-14 items-center gap-3 rounded-2xl border border-neutral-200 p-3.5 transition hover:border-amber-200 hover:bg-amber-50/50"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                <Settings2 size={19} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-neutral-800">
                  Hotel Settings
                </span>
                <span className="mt-1 block text-xs text-neutral-500">
                  Manage hotel details
                </span>
              </span>

              <ArrowRight
                size={16}
                className="shrink-0 text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-amber-800"
              />
            </Link>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
            <div className="flex items-start gap-3">
              <Clock3
                size={17}
                className="mt-0.5 shrink-0 text-amber-800"
              />

              <div>
                <p className="text-xs font-medium text-neutral-800">
                  Keep operations up to date
                </p>
                <p className="mt-1 text-xs leading-5 text-neutral-600">
                  Review reservations and room availability regularly.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
