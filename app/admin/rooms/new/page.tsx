import Link from "next/link";
import {
  ArrowLeft,
  BedDouble,
  ChevronRight,
  Plus,
  ShieldCheck,
} from "lucide-react";

import AddRoomForm from "@/src/components/admin/rooms/add-rooms-form";
import { getRoomCategories } from "@/src/lib/rooms/queries";

type NewRoomPageProps = {
  searchParams: Promise<{
    categoryId?: string;
  }>;
};

export default async function NewRoomPage({
  searchParams,
}: NewRoomPageProps) {
  const [{ categoryId }, categories] = await Promise.all([
    searchParams,
    getRoomCategories(),
  ]);

  const roomCategoryOptions = categories.map((category) => ({
    id: category.id,
    name: category.name,
  }));

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 pb-10 sm:space-y-8">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-sm"
      >
        <Link
          href="/admin/rooms"
          className="inline-flex items-center gap-2 rounded-md text-neutral-500 transition-colors duration-200 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
        >
          <ArrowLeft size={15} strokeWidth={1.8} aria-hidden="true" />
          <span>Rooms</span>
        </Link>

        <ChevronRight
          size={14}
          className="text-neutral-300"
          aria-hidden="true"
        />

        <span
          aria-current="page"
          className="font-medium text-neutral-900"
        >
          Add Room
        </span>
      </nav>

      {/* Page heading */}
      <header className="relative isolate overflow-hidden rounded-[1.75rem] border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 -z-10 h-56 w-56 rounded-full bg-amber-100/40 blur-3xl"
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600 sm:text-[11px]">
              <BedDouble size={14} strokeWidth={1.8} aria-hidden="true" />
              Room inventory
            </div>

            <h1 className="font-serif text-3xl tracking-tight text-neutral-950 sm:text-4xl lg:text-5xl">
              Add a new room
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500 sm:text-base sm:leading-7">
              Expand the MOLLIS LUX collection by adding a physical room
              to one of your existing room categories. Set up its details
              and prepare it for your inventory.
            </p>
          </div>

          <div className="hidden shrink-0 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:flex">
            <BedDouble
              size={30}
              strokeWidth={1.2}
              className="text-neutral-700"
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="relative mt-7 border-t border-neutral-100 pt-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck
                size={18}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-neutral-800">
                Keep your inventory organized
              </p>

              <p className="mt-1 text-xs leading-5 text-neutral-500 sm:text-sm">
                Choose the correct room category and provide accurate details
                so your room inventory stays consistent.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Room form */}
      <section
        aria-labelledby="room-details-heading"
        className="overflow-hidden rounded-[1.75rem] border border-neutral-200/80 bg-white shadow-sm"
      >
        <div className="border-b border-neutral-100 px-5 py-5 sm:px-8 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700">
              <Plus size={19} strokeWidth={1.8} aria-hidden="true" />
            </div>

            <div>
              <h2
                id="room-details-heading"
                className="font-serif text-xl text-neutral-900 sm:text-2xl"
              >
                Room details
              </h2>

              <p className="mt-1 text-sm leading-5 text-neutral-500">
                Enter the information for the room you want to create.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          {roomCategoryOptions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/70 px-5 py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-600">
                <BedDouble
                  size={23}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </div>

              <h3 className="mt-4 font-serif text-xl text-neutral-900">
                No room categories available
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                Create a room category first, then return here to add physical
                rooms to your inventory.
              </p>

              <Link
                href="/admin/room-categories/new"
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2"
              >
                <Plus size={16} strokeWidth={1.8} aria-hidden="true" />
                Create category
              </Link>
            </div>
          ) : (
            <AddRoomForm
              categories={roomCategoryOptions}
              defaultCategoryId={categoryId}
            />
          )}
        </div>
      </section>

      <p className="px-1 text-center text-xs leading-5 text-neutral-400">
        MOLLIS LUX · Thoughtfully managed hospitality
      </p>
    </main>
  );
}