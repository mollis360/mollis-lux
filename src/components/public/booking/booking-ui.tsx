
"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import Link from "next/link";

export type BookingStep = "dates" | "guest" | "review";

export type BookingImage = {
  id: string;
  imageUrl: string;
  altText: string | null;
  isCover: boolean;
  sortOrder: number;
};

export type BookingFeature = {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
};

export type BookingCategorySummary = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  maxAdults: number;
  maxChildren: number;
  roomSize: string | null;
  bedType: string | null;
  images: BookingImage[];
  features: BookingFeature[];
};

export type BookingPhysicalRoomSummary = {
  roomNumber: string;
  name: string | null;
  description: string | null;
  floor: string | null;
  images: BookingImage[];
};

const STEPS: {
  id: BookingStep;
  number: string;
  label: string;
  description: string;
}[] = [
  {
    id: "dates",
    number: "01",
    label: "Your stay",
    description: "Dates and guests",
  },
  {
    id: "guest",
    number: "02",
    label: "Your details",
    description: "Guest information",
  },
  {
    id: "review",
    number: "03",
    label: "Review",
    description: "Confirm your details",
  },
];

function getStepIndex(step: BookingStep) {
  return step === "dates" ? 0 : step === "guest" ? 1 : 2;
}

function formatShortDate(value: string): string {
  if (!value) return "Not selected";

  const date = new Date(`${value}T12:00:00Z`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function BookingProgress({ step }: { step: BookingStep }) {
  const currentStepIndex = getStepIndex(step);

  return (
    <nav aria-label="Booking progress" className="w-full">
      <ol className="grid grid-cols-3">
        {STEPS.map((item, index) => {
          const isCurrent = item.id === step;
          const isComplete = index < currentStepIndex;

          return (
            <li
              key={item.id}
              aria-current={isCurrent ? "step" : undefined}
              className="relative min-w-0"
            >
              {index < STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={`absolute left-[calc(50%+19px)] right-0 top-5 h-px ${
                    index < currentStepIndex
                      ? "bg-[#b99a68]"
                      : "bg-[#e9e2d8]"
                  }`}
                />
              ) : null}

              <div className="relative flex flex-col items-center text-center">
                <span
                  className={`relative z-10 flex size-10 items-center justify-center rounded-full border transition ${
                    isCurrent
                      ? "border-[#b99a68] bg-[#f2e7d5] text-[#80633d] shadow-[0_0_0_5px_rgba(185,154,104,0.09)]"
                      : isComplete
                        ? "border-[#b99a68] bg-[#b99a68] text-white"
                        : "border-[#e9e2d8] bg-white text-stone-400"
                  }`}
                >
                  {isComplete ? (
                    <CheckIcon />
                  ) : (
                    <span className="text-[11px] font-semibold">
                      {item.number}
                    </span>
                  )}
                </span>

                <p
                  className={`mt-3 text-xs font-semibold sm:text-sm ${
                    isCurrent
                      ? "text-[#493a29]"
                      : isComplete
                        ? "text-stone-700"
                        : "text-stone-400"
                  }`}
                >
                  {item.label}
                </p>

                <p className="mt-1 hidden text-[10px] text-stone-400 sm:block">
                  {item.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function BookingField({
  id,
  label,
  type,
  value,
  onChange,
  min,
  max,
  autoComplete,
  placeholder,
  required = false,
}: {
  id: string;
  label: string;
  type: ComponentProps<"input">["type"];
  value: string;
  onChange: (value: string) => void;
  min?: number | string;
  max?: number | string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={id} className="block min-w-0">
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
        {label}
      </span>

      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        min={min}
        max={max}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        className="mt-2 min-h-12 w-full rounded-xl border border-[#e9e2d8] bg-[#fffefa] px-4 py-3 text-sm text-stone-800 outline-none transition placeholder:text-stone-300 hover:border-[#cdbb9d] focus:border-[#b99a68] focus:ring-2 focus:ring-[#b99a68]/15"
      />
    </label>
  );
}

export function BookingFeedback({
  children,
  variant = "error",
}: {
  children: ReactNode;
  variant?: "error" | "info" | "success";
}) {
  const styles = {
    error: "border-red-200 bg-red-50 text-red-800",
    info: "border-[#e9e1d5] bg-[#faf8f4] text-stone-600",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  };

  const icons = {
    error: <AlertIcon />,
    info: <InfoIcon />,
    success: <CheckIcon />,
  };

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-6 ${styles[variant]}`}
    >
      <span className="mt-0.5 shrink-0">{icons[variant]}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function BookingReviewRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5 sm:px-5">
      <dt className="text-xs text-stone-500">{label}</dt>
      <dd className="break-words text-sm font-medium text-stone-800 sm:max-w-[65%] sm:text-right">
        {value}
      </dd>
    </div>
  );
}

function RoomFact({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="mt-0.5 shrink-0 text-[#a18455]">{icon}</span>

      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-[0.16em] text-stone-400">
          {label}
        </p>
        <p className="mt-1.5 break-words text-sm text-stone-700">{value}</p>
      </div>
    </div>
  );
}

export function BookingRoomSummary({
  category,
  physicalRoom,
  checkIn,
  checkOut,
  adults,
  childCount,
  nights,
  totalPrice,
  showPrice,
}: {
  category: BookingCategorySummary;
  physicalRoom?: BookingPhysicalRoomSummary;
  checkIn: string;
  checkOut: string;
  adults: string;
  childCount: string;
  nights: number;
  totalPrice: string | null;
  showPrice: boolean;
}) {
  const isSpecificRoom = Boolean(physicalRoom);

  const images = (
    isSpecificRoom && physicalRoom
      ? physicalRoom.images
      : category.images
  )
    .slice()
    .sort((a, b) => {
      if (a.isCover !== b.isCover) return a.isCover ? -1 : 1;
      return a.sortOrder - b.sortOrder;
    });

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const safeImageIndex =
    activeImageIndex < images.length ? activeImageIndex : 0;

  const activeImage = images[safeImageIndex];

  const title = isSpecificRoom
    ? physicalRoom?.name?.trim() || `Room ${physicalRoom?.roomNumber}`
    : category.name;

  const imageAlt =
    activeImage?.altText?.trim() ||
    (isSpecificRoom
      ? `${title} at MOLLIS LUX`
      : `${category.name} at MOLLIS LUX`);

  return (
    <aside
      className="min-w-0 overflow-hidden rounded-[28px] border border-[#e9e1d5] bg-white shadow-[0_20px_70px_-45px_rgba(58,43,28,0.22)]"
      aria-label="Accommodation showcase"
    >
      <div className="relative overflow-hidden bg-[#e9e2d7]">
        {activeImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage.imageUrl}
              alt={imageAlt}
              className="aspect-[4/3] w-full object-cover"
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/5" />

            <span className="absolute bottom-4 left-5 inline-flex items-center gap-2 rounded-full border border-white/40 bg-black/25 px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] text-white backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-[#e4c99c]" />
              {isSpecificRoom ? "Your selected room" : "Room collection"}
            </span>

            {images.length > 1 ? (
              <span className="absolute bottom-4 right-5 rounded-full border border-white/30 bg-black/25 px-3 py-1.5 text-[10px] text-white backdrop-blur-sm">
                {safeImageIndex + 1} / {images.length}
              </span>
            ) : null}
          </>
        ) : (
          <div className="relative flex aspect-[4/3] flex-col justify-end bg-[radial-gradient(ellipse_at_70%_15%,#e2cda9_0%,transparent_38%),linear-gradient(145deg,#d7c6ad,#a9967d)] p-6">
            <span className="text-[9px] uppercase tracking-[0.2em] text-stone-800/70">
              MOLLIS LUX
            </span>

            <span className="mt-2 font-serif text-2xl text-stone-900">
              A room of your own.
            </span>
          </div>
        )}
      </div>

      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto border-b border-[#eee7dc] bg-[#fffdf9] p-3">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveImageIndex(index)}
              aria-label={`Show image ${index + 1}`}
              aria-pressed={safeImageIndex === index}
              className={`relative size-[68px] shrink-0 overflow-hidden rounded-lg border-2 transition ${
                safeImageIndex === index
                  ? "border-[#b99a68]"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.imageUrl}
                alt={image.altText?.trim() || `Accommodation image ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9a7847]">
            {isSpecificRoom ? "Selected accommodation" : "Room category"}
          </p>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e9e1d5] bg-[#fffdf9] px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.12em] text-[#92764e]">
            <ShieldIcon />
            {isSpecificRoom ? "Specific room" : "Room collection"}
          </span>
        </div>

        <h2 className="mt-3 font-serif text-2xl leading-snug tracking-tight text-[#30291f]">
          {title}
        </h2>

        {isSpecificRoom && physicalRoom?.roomNumber ? (
          <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[#9a7847]">
            Room {physicalRoom.roomNumber}
          </p>
        ) : null}

        <p className="mt-3 text-sm leading-6 text-stone-500">
          {isSpecificRoom
            ? physicalRoom?.description?.trim() ||
              category.shortDescription ||
              "Your selected accommodation at MOLLIS LUX."
            : category.shortDescription ||
              "Explore this room collection at MOLLIS LUX."}
        </p>

        <div className="my-5 h-px bg-[#eee7dc]" />

        <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
          <RoomFact
            label="Adults"
            value={`${category.maxAdults} maximum`}
            icon={<UserIcon />}
          />

          <RoomFact
            label="Children"
            value={`${category.maxChildren} maximum`}
            icon={<UsersIcon />}
          />

          {category.roomSize ? (
            <RoomFact
              label="Room size"
              value={category.roomSize}
              icon={<RulerIcon />}
            />
          ) : null}

          {category.bedType ? (
            <RoomFact
              label="Bed arrangement"
              value={category.bedType}
              icon={<BedIcon />}
            />
          ) : null}

          {isSpecificRoom && physicalRoom?.floor ? (
            <RoomFact
              label="Floor"
              value={physicalRoom.floor}
              icon={<BuildingIcon />}
            />
          ) : null}
        </div>

        {category.features.length > 0 ? (
          <>
            <div className="my-5 h-px bg-[#eee7dc]" />

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a7847]">
                Accommodation features
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {category.features.map((feature) => (
                  <li key={feature.id} className="flex items-start gap-2.5">
                    <span className="mt-1 text-[#a18455]">
                      <CheckIcon />
                    </span>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-700">
                        {feature.name}
                      </p>

                      {feature.description ? (
                        <p className="mt-1 text-xs leading-5 text-stone-500">
                          {feature.description}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : null}

        <div className="my-5 h-px bg-[#eee7dc]" />

        <div className="space-y-4">
          <SummaryRow
            label="Your dates"
            value={
              checkIn && checkOut
                ? `${formatShortDate(checkIn)} – ${formatShortDate(checkOut)}`
                : "Not selected"
            }
            icon={<CalendarIcon />}
          />

          <SummaryRow
            label="Length of stay"
            value={
              nights > 0
                ? `${nights} ${nights === 1 ? "night" : "nights"}`
                : "—"
            }
            icon={<ClockIcon />}
          />

          <SummaryRow
            label="Party size"
            value={`${adults} ${
              Number(adults) === 1 ? "adult" : "adults"
            }${
              Number(childCount) > 0
                ? `, ${childCount} ${
                    Number(childCount) === 1 ? "child" : "children"
                  }`
                : ""
            }`}
            icon={<UsersIcon />}
          />
        </div>

        {showPrice && totalPrice ? (
          <div className="mt-5 rounded-2xl border border-[#e9dfcd] bg-[#faf7f1] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#92764e]">
              Estimated stay total
            </p>

            <p className="mt-2 font-serif text-2xl text-[#80633d]">
              {totalPrice}
            </p>

            <p className="mt-1 text-[11px] leading-5 text-stone-500">
              Your current reservation estimate.
            </p>
          </div>
        ) : null}

        <Link
          href={`/rooms/${category.slug}`}
          className="mt-6 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-stone-500 transition hover:text-[#9a7847]"
        >
          <span aria-hidden="true">←</span>
          Explore room details
        </Link>
      </div>

      <div className="border-t border-[#eee7dc] bg-[#faf8f4] px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-[#a18455]">
            <SparkleIcon />
          </span>

          <p className="text-xs leading-5 text-stone-500">
            A considered stay begins with the details. Review your dates and
            guest information before submitting.
          </p>
        </div>
      </div>
    </aside>
  );
}

function SummaryRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="shrink-0 text-[#a18455]">{icon}</span>
        <span className="text-xs text-stone-500">{label}</span>
      </div>

      <span className="text-right text-xs font-medium text-stone-800">
        {value}
      </span>
    </div>
  );
}

export function formatBookingDate(value: string) {
  if (!value) return "Not selected";

  const date = new Date(`${value}T12:00:00Z`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatBookingShortDate(value: string) {
  if (!value) return "—";

  const date = new Date(`${value}T12:00:00Z`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatBookingMoney(
  value: string | number,
  currency: string,
) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return `${currency} ${value}`;
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function calculateBookingNights(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut || checkIn >= checkOut) return 0;

  const start = new Date(`${checkIn}T00:00:00Z`);
  const end = new Date(`${checkOut}T00:00:00Z`);

  const nights = Math.round(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );

  return Number.isFinite(nights) && nights > 0 ? nights : 0;
}

/* ---------------------------------
   Line icons
---------------------------------- */

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path
        d="m5 12.5 4.2 4.2L19 7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 7.5v5M12 16.5h.01"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 11v5M12 8h.01"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M5 20c.7-3.2 3.1-5 7-5s6.3 1.8 7 5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <circle cx="9" cy="8" r="2.8" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M3.5 19c.5-2.8 2.3-4.3 5.5-4.3s5 1.5 5.5 4.3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M15 5.7a2.8 2.8 0 0 1 0 5.5M17 14.8c2 .6 3.2 2 3.5 4.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path
        d="M3 18V7m18 11V11a2 2 0 0 0-2-2H9v9M3 14h18M6 10h1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RulerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path
        d="m4 16 12-12 4 4L8 20l-4-4Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="m13 7 2 2m-5 1 2 2m-5 1 2 2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15.5"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M12 7v5l3.5 2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-3" aria-hidden="true">
      <path
        d="M12 3 19 6v5c0 4.5-2.8 7.8-7 10-4.2-2.2-7-5.5-7-10V6l7-3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="m9 12 2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path
        d="m12 3 1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8L12 3Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path
        d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16M2 21h20M9 7h2m2 0h2M9 11h2m2 0h2M9 15h2m2 0h2M10 21v-3h4v3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
