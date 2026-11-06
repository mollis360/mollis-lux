
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BedDouble,
  CheckCircle2,
  CirclePlus,
  CircleSlash,
  Layers3,
  Wrench,
} from "lucide-react";

import RoomImageGallery from "@/src/components/admin/rooms/room-image-gallery";
import { getRooms } from "@/src/lib/rooms/queries";

export default async function AdminRoomsPage() {
  const rooms = await getRooms();

  const availableCount = rooms.filter(
    (room) => room.status === "available",
  ).length;

  const maintenanceCount = rooms.filter(
    (room) => room.status === "maintenance",
  ).length;

  const inactiveCount = rooms.filter(
    (room) => room.status === "inactive",
  ).length;

  return (
    <main className="space-y-7 pb-10 sm:space-y-9">
      <header className="relative isolate overflow-hidden rounded-[1.75rem] border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 -z-10 h-64 w-64 rounded-full bg-amber-100/50 blur-3xl"
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500 sm:text-xs">
              <BedDouble size={15} strokeWidth={1.7} aria-hidden="true" />
              MOLLIS LUX · Room inventory
            </p>

            <h1 className="mt-3 font-serif text-3xl tracking-tight text-neutral-950 sm:text-4xl lg:text-5xl">
              Rooms
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500 sm:text-base sm:leading-7">
              Every room, thoughtfully managed. View room details, explore
              images, and keep your physical inventory organized.
            </p>
          </div>

          <Link
            href="/admin/rooms/new"
            className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white shadow-sm transition duration-200 hover:bg-neutral-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:transform-none sm:w-auto"
          >
            <CirclePlus size={17} strokeWidth={1.8} aria-hidden="true" />
            Add room
            <ArrowRight
              size={15}
              className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none"
              aria-hidden="true"
            />
          </Link>
        </div>

        <div className="relative mt-8 grid grid-cols-1 gap-3 border-t border-neutral-100 pt-6 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          <InventoryStat
            icon={<BedDouble size={18} strokeWidth={1.7} />}
            label="Total rooms"
            value={rooms.length}
            description="Physical inventory"
            iconClass="bg-neutral-100 text-neutral-700"
          />

          <InventoryStat
            icon={<CheckCircle2 size={18} strokeWidth={1.7} />}
            label="Available"
            value={availableCount}
            description="Ready for use"
            iconClass="bg-emerald-50 text-emerald-700"
          />

          <InventoryStat
            icon={<Wrench size={18} strokeWidth={1.7} />}
            label="Maintenance"
            value={maintenanceCount}
            description="Under maintenance"
            iconClass="bg-amber-50 text-amber-700"
          />

          <InventoryStat
            icon={<CircleSlash size={18} strokeWidth={1.7} />}
            label="Inactive"
            value={inactiveCount}
            description="Not in active inventory"
            iconClass="bg-neutral-100 text-neutral-600"
          />
        </div>
      </header>

      <section aria-labelledby="inventory-heading" className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="inventory-heading"
              className="font-serif text-2xl text-neutral-900 sm:text-3xl"
            >
              Your room collection
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              {rooms.length} {rooms.length === 1 ? "room" : "rooms"} in your
              inventory
            </p>
          </div>

          {rooms.length > 0 ? (
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-500">
              <Layers3 size={14} aria-hidden="true" />
              Sorted by room number
            </span>
          ) : null}
        </div>

        {rooms.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-neutral-300 bg-white/80 px-5 py-14 text-center sm:px-8 sm:py-20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 text-neutral-600">
              <BedDouble size={29} strokeWidth={1.4} aria-hidden="true" />
            </div>

            <h3 className="mt-5 font-serif text-2xl text-neutral-900">
              Your room collection starts here
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              Add your first physical room to begin organizing your inventory,
              images, and operational status.
            </p>

            <Link
              href="/admin/rooms/new"
              className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2"
            >
              <CirclePlus size={17} aria-hidden="true" />
              Add your first room
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
            {rooms.map((room) => {
              const galleryImages = [...room.images]
                .sort((a, b) => {
                  if (a.isCover !== b.isCover) {
                    return a.isCover ? -1 : 1;
                  }

                  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
                })
                .slice(0, 5)
                .map((image) => ({
                  id: image.id,
                  imageUrl: image.imageUrl,
                  altText: image.altText,
                  isCover: image.isCover,
                }));

              return (
                <article
                  key={room.id}
                  className="group min-w-0 overflow-hidden rounded-[1.5rem] border border-neutral-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-lg motion-reduce:transform-none motion-reduce:transition-none"
                >
                  <RoomImageGallery
                    roomNumber={room.roomNumber}
                    roomName={room.name}
                    images={galleryImages}
                  />

                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                          Room number
                        </p>

                        <h3 className="mt-1 break-words font-serif text-2xl text-neutral-950">
                          {room.roomNumber}
                        </h3>

                        <p className="mt-1 break-words text-sm text-neutral-500">
                          {room.name?.trim() || "Unnamed room"}
                        </p>
                      </div>

                      <StatusPill status={room.status} />
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-neutral-100 pt-4 text-xs text-neutral-500">
                      {room.floor ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Layers3 size={14} aria-hidden="true" />
                          Floor {room.floor}
                        </span>
                      ) : null}

                      <span className="inline-flex items-center gap-1.5">
                        <BedDouble size={14} aria-hidden="true" />
                        {room.images.length}{" "}
                        {room.images.length === 1 ? "image" : "images"}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <Link
                        href={`/admin/rooms/${room.id}/edit`}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-neutral-200 px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors duration-200 hover:bg-neutral-50 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
                      >
                        Edit room
                      </Link>

                      <Link
                        href={`/admin/room-categories/${room.roomCategoryId}`}
                        className="group/category inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-neutral-950 px-3 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2"
                      >
                        Category
                        <ArrowRight
                          size={14}
                          className="transition-transform duration-200 group-hover/category:translate-x-0.5 motion-reduce:transform-none"
                          aria-hidden="true"
                        />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function InventoryStat({
  icon,
  label,
  value,
  description,
  iconClass,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  description: string;
  iconClass: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white/80 p-4 transition-colors duration-200 hover:bg-white sm:p-5">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-neutral-500">{label}</p>
        <p className="mt-0.5 text-2xl font-semibold tabular-nums text-neutral-950">
          {value}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-neutral-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    available: "border-emerald-200 bg-emerald-50 text-emerald-700",
    maintenance: "border-amber-200 bg-amber-50 text-amber-800",
    inactive: "border-neutral-200 bg-neutral-100 text-neutral-600",
  };

  const dotStyles: Record<string, string> = {
    available: "bg-emerald-500",
    maintenance: "bg-amber-500",
    inactive: "bg-neutral-400",
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-medium capitalize ${
        styles[status] ?? "border-neutral-200 bg-neutral-50 text-neutral-600"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${
          dotStyles[status] ?? "bg-neutral-400"
        }`}
      />
      {status.replaceAll("_", " ")}
    </span>
  );
}
