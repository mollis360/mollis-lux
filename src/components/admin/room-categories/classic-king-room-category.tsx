
import Link from "next/link";

import RoomGrid from "@/src/components/admin/rooms/room-grid";

import type {
  RoomCategory,
  RoomWithImages,
} from "@/src/lib/rooms/types";

type Props = {
  category: RoomCategory;
  rooms: RoomWithImages[];
};

type IconName =
  | "arrow-left"
  | "arrow-up-right"
  | "bed"
  | "check"
  | "door"
  | "edit"
  | "info"
  | "plus"
  | "ruler"
  | "users"
  | "wallet";

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  const common = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.7,
    viewBox: "0 0 24 24",
    "aria-hidden": true as const,
  };

  switch (name) {
    case "arrow-left":
      return (
        <svg {...common}>
          <path d="m12 19-7-7 7-7" />
          <path d="M5 12h14" />
        </svg>
      );

    case "arrow-up-right":
      return (
        <svg {...common}>
          <path d="M7 17 17 7" />
          <path d="M8 7h9v9" />
        </svg>
      );

    case "bed":
      return (
        <svg {...common}>
          <path d="M3 18v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5" />
          <path d="M3 15h18" />
          <path d="M5 11V7a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v4" />
          <path d="M12 11V8a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3" />
          <path d="M3 18v2M21 18v2" />
        </svg>
      );

    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    case "door":
      return (
        <svg {...common}>
          <path d="M4 21h16" />
          <path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17" />
          <path d="M14 12h.01" />
        </svg>
      );

    case "edit":
      return (
        <svg {...common}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
        </svg>
      );

    case "info":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5" />
          <path d="M12 8h.01" />
        </svg>
      );

    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );

    case "ruler":
      return (
        <svg {...common}>
          <path d="m3 7 4-4 14 14-4 4Z" />
          <path d="m7 7 3 3M11 11l2-2M15 15l2-2" />
        </svg>
      );

    case "users":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="10" cy="7" r="4" />
          <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );

    case "wallet":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="15" rx="2" />
          <path d="M3 9h18" />
          <path d="M16 14h.01" />
          <path d="M7 5V3h10v2" />
        </svg>
      );
  }
}

function formatPrice(value: string | number | null | undefined) {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return "Not set";
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatRoomSize(value: string | number | null | undefined) {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return "Not specified";
  }

  const size = String(value).trim();

  return /m²|sqm|sq\.?\s?m/i.test(size) ? size : `${size} m²`;
}

function StatCard({
  icon,
  label,
  value,
  description,
  accent = "neutral",
}: {
  icon: IconName;
  label: string;
  value: string;
  description: string;
  accent?: "neutral" | "emerald" | "gold";
}) {
  const iconStyles = {
    neutral: "border-white/10 bg-white/10 text-white",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    gold: "border-[#e8d8b5] bg-[#f7f0df] text-[#927747]",
  };

  const cardStyles =
    accent === "neutral"
      ? "border-neutral-800 bg-neutral-950 text-white"
      : "border-neutral-200/80 bg-white text-neutral-900";

  const descriptionStyles =
    accent === "neutral" ? "text-neutral-400" : "text-neutral-500";

  return (
    <article
      className={`group rounded-2xl border p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-neutral-900/5 motion-reduce:transform-none motion-reduce:transition-none ${cardStyles}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={`text-xs font-medium ${
            accent === "neutral"
              ? "text-neutral-300"
              : "text-neutral-500"
          }`}
        >
          {label}
        </p>

        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none ${iconStyles[accent]}`}
        >
          <Icon name={icon} className="h-4 w-4" />
        </span>
      </div>

      <p className="mt-5 break-words font-serif text-4xl tracking-tight tabular-nums">
        {value}
      </p>

      <p className={`mt-2 text-xs leading-5 ${descriptionStyles}`}>
        {description}
      </p>
    </article>
  );
}

function InventorySummary({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "emerald" | "amber" | "neutral";
}) {
  const styles = {
    emerald: {
      dot: "bg-emerald-500",
      text: "text-emerald-700",
      background: "bg-emerald-50/70",
    },
    amber: {
      dot: "bg-amber-500",
      text: "text-amber-700",
      background: "bg-amber-50/70",
    },
    neutral: {
      dot: "bg-neutral-400",
      text: "text-neutral-600",
      background: "bg-neutral-50",
    },
  };

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border border-neutral-200/70 px-4 py-3 transition-colors hover:border-neutral-300 ${styles[color].background}`}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${styles[color].dot}`}
        />
        <span className="text-sm text-neutral-600">{label}</span>
      </div>

      <span
        className={`text-sm font-semibold tabular-nums ${styles[color].text}`}
      >
        {value}
      </span>
    </div>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-neutral-100 py-4 last:border-b-0 last:pb-0">
      <dt className="flex min-w-0 items-center gap-3 text-sm text-neutral-500">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-100 bg-neutral-50 text-neutral-500">
          <Icon name={icon} className="h-4 w-4" />
        </span>

        <span>{label}</span>
      </dt>

      <dd className="max-w-[55%] break-words text-right text-sm font-medium text-neutral-800">
        {value}
      </dd>
    </div>
  );
}

function EmptyRooms({ categoryId }: { categoryId: string }) {
  return (
    <div className="px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-[#e8dfce] bg-[#faf7f0] text-[#927747]">
          <Icon name="bed" className="h-9 w-9" />

          <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-neutral-950 text-white">
            <Icon name="plus" className="h-3.5 w-3.5" />
          </span>
        </div>

        <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#927747]">
          Physical inventory
        </p>

        <h3 className="mt-3 font-serif text-2xl text-neutral-900 sm:text-3xl">
          Your first room starts here
        </h3>

        <p className="mt-3 text-sm leading-7 text-neutral-500">
          This category does not have any physical rooms yet. Add your
          first room to begin managing its room number, images, and
          operational status.
        </p>

        <Link
          href={`/admin/rooms/new?categoryId=${categoryId}`}
          className="group mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-neutral-900/10 transition duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b89a62] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
        >
          <Icon name="plus" className="h-4 w-4" />
          Add your first room
          <Icon
            name="arrow-up-right"
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
          />
        </Link>
      </div>
    </div>
  );
}

export default function ClassicKingRoomCategory({
  category,
  rooms,
}: Props) {
  const availableRooms = rooms.filter(
    (room) => room.status === "available",
  ).length;

  const maintenanceRooms = rooms.filter(
    (room) => room.status === "maintenance",
  ).length;

  const inactiveRooms = rooms.filter(
    (room) => room.status === "inactive",
  ).length;

  const availabilityPercentage =
    rooms.length > 0
      ? Math.round((availableRooms / rooms.length) * 100)
      : 0;

  const status = category.status.toLowerCase();

  const statusClasses =
    status === "active"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "draft"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-neutral-200 bg-neutral-100 text-neutral-600";

  const statusDotClasses =
    status === "active"
      ? "bg-emerald-500"
      : status === "draft"
        ? "bg-amber-500"
        : "bg-neutral-400";

  return (
    <main className="space-y-6 pb-10 sm:space-y-8">
      {/* Breadcrumb navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <Link
          href="/admin"
          className="group inline-flex min-h-10 items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-950"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white transition-colors group-hover:border-[#b89a62] group-hover:bg-[#faf7f0]">
            <Icon name="arrow-left" className="h-4 w-4" />
          </span>
          <span>Back to dashboard</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
          <span>Room management</span>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-neutral-700">
            {category.name}
          </span>
        </div>
      </nav>

      {/* Category hero */}
      <header className="relative isolate overflow-hidden rounded-[1.75rem] border border-[#e8e1d4] bg-[#fbfaf7] shadow-[0_18px_60px_-40px_rgba(28,25,23,0.35)] sm:rounded-[2rem]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-28 -z-10 h-80 w-80 rounded-full bg-[#e9d7ae]/35 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 left-1/3 -z-10 h-64 w-64 rounded-full bg-stone-300/30 blur-3xl"
        />

        <div className="relative p-5 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d9c9a7]/80 bg-white/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a7042]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#b89a62]" />
                MOLLIS LUX COLLECTION
              </div>

              <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400 sm:text-xs">
                Room category overview
              </p>

              <h1 className="mt-3 break-words font-serif text-4xl font-normal leading-tight tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
                {category.name}
              </h1>

              <p className="mt-5 max-w-2xl break-words text-sm leading-7 text-neutral-600 sm:text-base">
                {category.shortDescription?.trim() ||
                  "A refined king room designed around comfort, simplicity, and quiet luxury."}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${statusClasses}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${statusDotClasses}`}
                  />
                  {category.status}
                </span>

                {category.slug ? (
                  <span className="break-all text-xs text-neutral-400">
                    /{category.slug}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row xl:min-w-fit">
              <Link
                href={`/admin/rooms/new?categoryId=${category.id}`}
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-neutral-900/10 transition duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b89a62] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
              >
                <Icon name="plus" className="h-4 w-4" />
                Add physical room
                <Icon
                  name="arrow-up-right"
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                />
              </Link>

              <Link
                href={`/admin/room-categories/${category.id}/edit`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white/90 px-5 py-3 text-sm font-medium text-neutral-700 transition-colors hover:border-[#b89a62] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b89a62] focus-visible:ring-offset-2"
              >
                <Icon name="edit" className="h-4 w-4" />
                Edit category
              </Link>
            </div>
          </div>

          {/* Category statistics */}
          <div className="mt-9 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon="door"
              label="Total rooms"
              value={String(rooms.length)}
              description="Physical room inventory"
            />

            <StatCard
              icon="check"
              label="Available rooms"
              value={String(availableRooms)}
              description="Currently marked available"
              accent="emerald"
            />

            <StatCard
              icon="users"
              label="Guest capacity"
              value={String(category.maxAdults)}
              description="Maximum adult occupancy"
              accent="gold"
            />

            <StatCard
              icon="bed"
              label="Room availability"
              value={`${availabilityPercentage}%`}
              description={
                rooms.length > 0
                  ? "Share of rooms marked available"
                  : "Add rooms to track availability"
              }
              accent="gold"
            />
          </div>
        </div>
      </header>

      {/* Physical inventory */}
      <section className="overflow-hidden rounded-[1.75rem] border border-neutral-200/80 bg-white shadow-[0_18px_60px_-45px_rgba(28,25,23,0.3)] sm:rounded-[2rem]">
        <div className="flex flex-col gap-5 border-b border-neutral-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8dfce] bg-[#faf7f0] text-[#927747]">
                <Icon name="bed" className="h-4 w-4" />
              </span>

              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                Physical inventory
              </p>
            </div>

            <h2 className="mt-4 font-serif text-2xl text-neutral-900 sm:text-3xl">
              Your rooms
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
              Manage individual rooms, review their images, and monitor
              their operational status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-600">
              {rooms.length} {rooms.length === 1 ? "room" : "rooms"}
            </span>

            <Link
              href={`/admin/rooms/new?categoryId=${category.id}`}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:border-[#b89a62] hover:bg-[#faf7f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b89a62] focus-visible:ring-offset-2"
            >
              <Icon name="plus" className="h-4 w-4" />
              Add room
            </Link>
          </div>
        </div>

        {rooms.length === 0 ? (
          <EmptyRooms categoryId={category.id} />
        ) : (
          <>
            <div className="border-b border-neutral-100 bg-[#fbfaf7] p-5 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <InventorySummary
                  label="Available"
                  value={availableRooms}
                  color="emerald"
                />

                <InventorySummary
                  label="Maintenance"
                  value={maintenanceRooms}
                  color="amber"
                />

                <InventorySummary
                  label="Inactive"
                  value={inactiveRooms}
                  color="neutral"
                />
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-neutral-600">
                    Available inventory
                  </span>

                  <span className="tabular-nums text-neutral-500">
                    {availabilityPercentage}%
                  </span>
                </div>

                <div
                  className="h-2 overflow-hidden rounded-full bg-neutral-200"
                  role="progressbar"
                  aria-label="Available room percentage"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={availabilityPercentage}
                >
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-[width] duration-500 motion-reduce:transition-none"
                    style={{ width: `${availabilityPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-8">
              <RoomGrid
                rooms={rooms}
                fallbackName={category.name}
                categorySlug={category.slug}
                categoryDetails={category}
              />
            </div>
          </>
        )}
      </section>

      {/* Category information */}
      <section className="grid gap-5 xl:grid-cols-[1fr_1.1fr]">
        <div className="rounded-[1.75rem] border border-neutral-200/80 bg-white p-5 shadow-[0_18px_60px_-45px_rgba(28,25,23,0.25)] sm:rounded-[2rem] sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                Specifications
              </p>

              <h2 className="mt-3 font-serif text-2xl text-neutral-900 sm:text-3xl">
                Category details
              </h2>

              <p className="mt-2 text-sm leading-6 text-neutral-500">
                The core specifications configured for this category.
              </p>
            </div>

            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#e8dfce] bg-[#faf7f0] text-[#927747]">
              <Icon name="info" className="h-5 w-5" />
            </span>
          </div>

          <dl className="mt-7">
            <Detail
              icon="wallet"
              label="Base price"
              value={formatPrice(category.basePrice)}
            />

            <Detail
              icon="ruler"
              label="Room size"
              value={formatRoomSize(category.roomSize)}
            />

            <Detail
              icon="bed"
              label="Bed type"
              value={category.bedType?.trim() || "Not specified"}
            />

            <Detail
              icon="users"
              label="Maximum adults"
              value={String(category.maxAdults)}
            />

            <Detail
              icon="users"
              label="Maximum children"
              value={String(category.maxChildren)}
            />
          </dl>

          <Link
            href={`/admin/room-categories/${category.id}/edit`}
            className="group mt-7 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-neutral-700 transition-colors hover:text-[#927747] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b89a62] focus-visible:ring-offset-4"
          >
            Update category details
            <Icon
              name="arrow-up-right"
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
            />
          </Link>
        </div>

        <div className="relative isolate overflow-hidden rounded-[1.75rem] border border-[#e8dfce] bg-[#f9f7f2] p-5 sm:rounded-[2rem] sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 -z-10 h-56 w-56 rounded-full bg-[#e6d9bc]/40 blur-3xl"
          />

          <div className="inline-flex items-center gap-2 rounded-full border border-[#e4d7bd] bg-white/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#927747]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#b89a62]" />
            The room experience
          </div>

          <h2 className="mt-5 font-serif text-3xl leading-tight text-neutral-900 sm:text-4xl">
            Space to unwind.
            <br />
            Comfort to remember.
          </h2>

          <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-neutral-600">
            {category.description?.trim() || "No description provided."}
          </p>

          <div className="mt-8 border-t border-neutral-200/80 pt-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e8dfce] bg-white text-[#927747]">
                <Icon name="check" className="h-4 w-4" />
              </span>

              <div>
                <p className="text-sm font-semibold text-neutral-800">
                  Category identity
                </p>

                <p className="mt-1 text-sm leading-6 text-neutral-500">
                  Keep the category description and specifications accurate
                  so your team can manage the room inventory consistently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
