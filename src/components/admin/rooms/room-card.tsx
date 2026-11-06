"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type TouchEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  BedDouble,
  Check,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Layers3,
  Pencil,
  Ruler,
  Trash2,
  Users,
  Wallet,
  X,
} from "lucide-react";

import AdminModal from "@/src/components/admin/ui/admin-modal";
import { deleteRoom } from "@/src/lib/rooms/actions";
import type { RoomWithImages } from "@/src/lib/rooms/types";

type RoomCategoryDetails = {
  shortDescription?: string | null;
  description?: string | null;
  maxAdults?: number | null;
  maxChildren?: number | null;
  roomSize?: string | number | null;
  bedType?: string | null;
  basePrice?: string | number | null;
};

type RoomCardProps = {
  room: RoomWithImages;
  fallbackName: string;
  label?: string;
  categorySlug?: string;
  categoryDetails?: RoomCategoryDetails;
};

const CATEGORY_HIGHLIGHTS: Record<string, string[]> = {
  "classic-king-room": [
    "Comfortable king-bed accommodation",
    "A calm, understated room experience",
    "A practical layout for a relaxed stay",
  ],
  "deluxe-king-room": [
    "Elevated comfort with a refined feel",
    "Careful attention to room presentation",
    "Designed for a relaxed, premium stay",
  ],
  "executive-king-room": [
    "A polished setting for business or leisure",
    "A comfortable place to unwind after a busy day",
    "A refined atmosphere for longer stays",
  ],
  "presidential-suite": [
    "A spacious, suite-style experience",
    "A distinctive choice for special stays",
    "Designed around privacy and elevated comfort",
  ],
};

function formatPrice(value: string | number | null | undefined) {
  if (value == null || (typeof value === "string" && !value.trim())) {
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
  if (value == null || !String(value).trim()) {
    return "Not specified";
  }

  const size = String(value).trim();

  return /m²|sqm|sq\.?\s?m/i.test(size) ? size : `${size} m²`;
}

export default function RoomCard({
  room,
  fallbackName,
  label = "Room",
  categorySlug,
  categoryDetails,
}: RoomCardProps) {
  const router = useRouter();

  const titleId = useId();
  const descriptionId = useId();

  const drawerRef = useRef<HTMLElement | null>(null);
  const detailsButtonRef = useRef<HTMLButtonElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const [current, setCurrent] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coverImage = room.images.find((image) => image.isCover);

  const images = [
    ...(coverImage ? [coverImage] : []),
    ...room.images.filter((image) => image.id !== coverImage?.id),
  ].slice(0, 5);

  const hasImages = images.length > 0;
  const hasMultipleImages = images.length > 1;

  const currentImage = hasImages
    ? Math.min(Math.max(current, 0), images.length - 1)
    : 0;

  const highlights: string[] = categorySlug
    ? CATEGORY_HIGHLIGHTS[categorySlug] ?? [
        "Comfort-focused accommodation",
        "A clean and welcoming room environment",
        "A relaxing place to unwind",
      ]
    : [
        "Comfort-focused accommodation",
        "A clean and welcoming room environment",
        "A relaxing place to unwind",
      ];

  function prev() {
    if (!hasMultipleImages) return;

    setCurrent(currentImage <= 0 ? images.length - 1 : currentImage - 1);
  }

  function next() {
    if (!hasMultipleImages) return;

    setCurrent(currentImage >= images.length - 1 ? 0 : currentImage + 1);
  }

  useEffect(() => {
    if (!hasMultipleImages || isHovering) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrent((index) =>
        index >= images.length - 1 || index < 0 ? 0 : index + 1,
      );
    }, 4000);

    return () => window.clearInterval(timer);
  }, [hasMultipleImages, images.length, isHovering]);

  useEffect(() => {
    if (!showDetails) return;

    const oldOverflow = document.body.style.overflow;
    const detailsButton = detailsButtonRef.current;

    document.body.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
      drawerRef.current?.focus();
    });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowDetails(false);
        return;
      }

      if (event.key !== "Tab") return;

      const drawer = drawerRef.current;

      if (!drawer) return;

      const focusable = drawer.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );

      const first = focusable.item(0);
      const last = focusable.item(focusable.length - 1);

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = oldOverflow;
      detailsButton?.focus();
    };
  }, [showDetails]);

  function onTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    touchEndX.current = null;
  }

  function onTouchMove(event: TouchEvent<HTMLDivElement>) {
    touchEndX.current = event.touches[0]?.clientX ?? null;
  }

  function onTouchEnd() {
    if (
      touchStartX.current === null ||
      touchEndX.current === null
    ) {
      touchStartX.current = null;
      touchEndX.current = null;
      return;
    }

    const distance = touchStartX.current - touchEndX.current;

    if (Math.abs(distance) > 40) {
      if (distance > 0) {
        next();
      } else {
        prev();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  }

  async function handleDelete() {
    if (isDeleting) return;

    setIsDeleting(true);
    setError(null);

    try {
      await deleteRoom(room.id);

      setShowDeleteConfirmation(false);
      setShowDeleteSuccess(true);
    } catch (err) {
      setShowDeleteConfirmation(false);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete room. Please try again.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  function closeDeleteSuccess() {
    setShowDeleteSuccess(false);
    router.refresh();
  }

  return (
    <>
      <article
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-neutral-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.05)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:bg-white hover:shadow-[0_20px_55px_rgba(15,23,42,0.10)] motion-reduce:transform-none motion-reduce:transition-none"
      >
        {/* Room image gallery */}
        <div
          className="relative aspect-[16/10] shrink-0 overflow-hidden bg-neutral-100"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {hasImages ? (
            images.map((image, index) => (
              <div
                key={image.id}
                aria-hidden={index !== currentImage}
                className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${
                  index === currentImage
                    ? "opacity-100"
                    : "pointer-events-none opacity-0"
                }`}
              >
                <Image
                  src={image.imageUrl}
                  alt={
                    image.altText ||
                    `${fallbackName} ${room.roomNumber} image ${index + 1}`
                  }
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none"
                />
              </div>
            ))
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-neutral-400">
              <ImageOff size={30} strokeWidth={1.5} />
              <span className="text-[11px] uppercase tracking-[0.18em]">
                No images available
              </span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-black/10" />

          {hasImages && (
            <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-black/25 px-3 py-1.5 text-xs text-white shadow-sm backdrop-blur-md">
              <Layers3 size={13} />
              <span>
                {currentImage + 1} / {images.length}
              </span>
            </div>
          )}

          <div className="absolute bottom-4 left-4">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium capitalize shadow-sm backdrop-blur-md ${
                room.status === "available"
                  ? "border-emerald-100/70 bg-emerald-50/95 text-emerald-800"
                  : room.status === "maintenance"
                    ? "border-amber-100/70 bg-amber-50/95 text-amber-800"
                    : "border-white/50 bg-white/95 text-neutral-700"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  room.status === "available"
                    ? "bg-emerald-500"
                    : room.status === "maintenance"
                      ? "bg-amber-500"
                      : "bg-neutral-400"
                }`}
              />
              {room.status}
            </span>
          </div>

          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label={`Previous ${label.toLowerCase()} image`}
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-black/20 text-white shadow-sm backdrop-blur-md transition hover:scale-105 hover:bg-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronLeft size={19} />
              </button>

              <button
                type="button"
                onClick={next}
                aria-label={`Next ${label.toLowerCase()} image`}
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-black/20 text-white shadow-sm backdrop-blur-md transition hover:scale-105 hover:bg-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronRight size={19} />
              </button>

              <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-1.5">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    aria-label={`Go to image ${index + 1}`}
                    aria-current={
                      index === currentImage ? "true" : undefined
                    }
                    onClick={() => setCurrent(index)}
                    className={`h-1.5 rounded-full transition ${
                      index === currentImage
                        ? "w-6 bg-white"
                        : "w-1.5 bg-white/55 hover:bg-white/90"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Room card content */}
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">
                {label}
              </p>

              <h3 className="mt-1.5 break-words font-serif text-2xl tracking-tight text-neutral-900">
                {room.roomNumber}
              </h3>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-neutral-200/80 bg-neutral-50 text-neutral-500">
              <BedDouble size={18} strokeWidth={1.6} />
            </div>
          </div>

          <p className="mt-3 min-h-5 text-sm font-medium text-neutral-800">
            {room.name || fallbackName}
          </p>

          <p className="mt-2 min-h-[4.5rem] line-clamp-3 text-sm leading-6 text-neutral-500">
            {room.description || "No description provided for this room."}
          </p>

          <div className="mt-3 min-h-5">
            {room.floor ? (
              <p className="text-xs tracking-wide text-neutral-400">
                Floor {room.floor}
              </p>
            ) : null}
          </div>

          <div className="mt-auto pt-5">
            <div className="mb-3 border-t border-neutral-100" />

            <div className="grid grid-cols-2 gap-2.5">
              <button
                ref={detailsButtonRef}
                type="button"
                onClick={() => setShowDetails(true)}
                className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#f7f0e2] px-3 py-2.5 text-sm font-medium text-[#755d35] transition hover:bg-[#eee2c9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b89a62] focus-visible:ring-offset-2"
              >
                View details
              </button>

              <Link
                href={`/admin/rooms/${room.id}/edit`}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-700 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-950"
              >
                <Pencil size={15} />
                Edit
              </Link>
            </div>

            <button
              type="button"
              onClick={() => {
                setError(null);
                setShowDeleteConfirmation(true);
              }}
              disabled={isDeleting}
              className="mt-2.5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-2xl border border-red-200/80 bg-red-50/70 px-3 py-2 text-sm font-medium text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={15} />
              Delete room
            </button>
          </div>
        </div>
      </article>

      {/* Room details off-canvas panel */}
      {showDetails && (
        <div
          className="fixed inset-0 z-[100] flex justify-end"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowDetails(false);
            }
          }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-neutral-950/45 backdrop-blur-[2px]"
          />

          <aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            tabIndex={-1}
            className="relative z-10 flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-white/30 bg-[#fcfbf8] shadow-2xl outline-none"
          >
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-200/80 bg-[#fcfbf8]/95 px-5 py-4 backdrop-blur-xl sm:px-7">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#927747]">
                  MOLLIS LUX · Room details
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  Room {room.roomNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDetails(false)}
                aria-label="Close room details"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b89a62]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-7 p-5 sm:p-7">
              <div className="relative aspect-[16/9] overflow-hidden rounded-[1.5rem] bg-neutral-100">
                {hasImages ? (
                  <Image
                    src={
                      images[currentImage]?.imageUrl ??
                      images[0].imageUrl
                    }
                    alt={
                      images[currentImage]?.altText ||
                      `${fallbackName} ${room.roomNumber}`
                    }
                    fill
                    sizes="(max-width: 640px) 100vw, 560px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-neutral-400">
                    <ImageOff size={34} />
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-5 pt-12">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/75">
                    {fallbackName}
                  </span>

                  <h2
                    id={titleId}
                    className="mt-1 font-serif text-3xl text-white"
                  >
                    Room {room.roomNumber}
                  </h2>
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium capitalize text-neutral-700">
                    {room.status}
                  </span>

                  {room.floor ? (
                    <span className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-600">
                      Floor {room.floor}
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-4 font-serif text-2xl text-neutral-900">
                  {room.name || fallbackName}
                </h3>

                <p
                  id={descriptionId}
                  className="mt-2 whitespace-pre-wrap text-sm leading-7 text-neutral-600"
                >
                  {room.description?.trim() ||
                    categoryDetails?.shortDescription?.trim() ||
                    "No description has been provided for this room."}
                </p>
              </div>

              <section>
                <h3 className="font-serif text-xl text-neutral-900">
                  Room specifications
                </h3>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Specification
                    icon={<Wallet size={17} />}
                    label="Base price"
                    value={formatPrice(categoryDetails?.basePrice)}
                  />

                  <Specification
                    icon={<Ruler size={17} />}
                    label="Room size"
                    value={formatRoomSize(categoryDetails?.roomSize)}
                  />

                  <Specification
                    icon={<BedDouble size={17} />}
                    label="Bed type"
                    value={
                      categoryDetails?.bedType?.trim() || "Not specified"
                    }
                  />

                  <Specification
                    icon={<Users size={17} />}
                    label="Maximum adults"
                    value={
                      categoryDetails?.maxAdults == null
                        ? "Not specified"
                        : String(categoryDetails.maxAdults)
                    }
                  />

                  <Specification
                    icon={<Users size={17} />}
                    label="Maximum children"
                    value={
                      categoryDetails?.maxChildren == null
                        ? "Not specified"
                        : String(categoryDetails.maxChildren)
                    }
                  />

                  <Specification
                    icon={<Layers3 size={17} />}
                    label="Room images"
                    value={`${images.length} ${
                      images.length === 1 ? "image" : "images"
                    }`}
                  />
                </div>
              </section>

              <section className="rounded-[1.5rem] border border-[#e8dfce] bg-white p-5 sm:p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#927747]">
                  The MOLLIS LUX experience
                </p>

                <h3 className="mt-2 font-serif text-xl text-neutral-900">
                  Category highlights
                </h3>

                {categoryDetails?.description?.trim() ? (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-neutral-600">
                    {categoryDetails.description}
                  </p>
                ) : null}

                <ul className="mt-4 space-y-3">
                  {highlights.map((highlight: string) => (
                    <li
                      key={highlight}
                      className="flex items-start gap-3 text-sm leading-6 text-neutral-700"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f7f0e2] text-[#927747]">
                        <Check size={12} strokeWidth={2.2} />
                      </span>

                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-4 text-xs leading-5 text-neutral-400">
                  Category highlights describe the intended room experience;
                  they do not confirm specific in-room amenities.
                </p>
              </section>

              <div className="grid grid-cols-1 gap-3 pb-2 sm:grid-cols-2">
                <Link
                  href={`/admin/rooms/${room.id}/edit`}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  <Pencil size={16} />
                  Edit room
                </Link>

                <button
                  type="button"
                  onClick={() => setShowDetails(false)}
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
                >
                  Close details
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      <AdminModal
        open={showDeleteConfirmation}
        variant="confirm"
        title={`Delete ${label.toLowerCase()}?`}
        description={`Are you sure you want to delete ${label.toLowerCase()} ${room.roomNumber}? This action cannot be undone. Rooms with reservation history cannot be deleted.`}
        confirmLabel={isDeleting ? "Deleting..." : "Delete room"}
        cancelLabel="Keep room"
        busy={isDeleting}
        onConfirm={handleDelete}
        onClose={() => {
          if (!isDeleting) {
            setShowDeleteConfirmation(false);
          }
        }}
      />

      <AdminModal
        open={showDeleteSuccess}
        variant="success"
        title={`${label} deleted successfully`}
        description={`${label} ${room.roomNumber} has been deleted successfully.`}
        closeLabel="Continue"
        onClose={closeDeleteSuccess}
      />

      <AdminModal
        open={Boolean(error)}
        variant="error"
        title={`Unable to delete ${label.toLowerCase()}`}
        description={error ?? ""}
        closeLabel="Got it"
        onClose={() => setError(null)}
      />
    </>
  );
}

function Specification({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-neutral-200/80 bg-white p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f7f0e2] text-[#927747]">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-xs text-neutral-500">{label}</p>
        <p className="mt-1 break-words text-sm font-medium text-neutral-900">
          {value}
        </p>
      </div>
    </div>
  );
}