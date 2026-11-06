
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Ban,
  BedDouble,
  CheckCircle2,
  Clock3,
  FilePenLine,
  Info,
  Layers3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import EditRoomCategoryForm from "@/src/components/admin/room-categories/edit-room-category-form";
import { requireAdmin } from "@/src/lib/auth/server";
import { getRoomCategoryDetails } from "@/src/lib/rooms/queries";

type RoomCategoryStatus = "active" | "inactive" | "draft";

function isRoomCategoryStatus(
  value: string,
): value is RoomCategoryStatus {
  return (
    value === "active" ||
    value === "inactive" ||
    value === "draft"
  );
}

function getStatusPresentation(status: RoomCategoryStatus) {
  switch (status) {
    case "active":
      return {
        label: "Active",
        description: "This category is active.",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
        icon: CheckCircle2,
        iconClassName: "text-emerald-600",
      };

    case "inactive":
      return {
        label: "Inactive",
        description: "This category is currently inactive.",
        className: "border-neutral-200 bg-neutral-100 text-neutral-600",
        icon: Ban,
        iconClassName: "text-neutral-500",
      };

    case "draft":
      return {
        label: "Draft",
        description: "This category is still a draft.",
        className: "border-amber-200 bg-amber-50 text-amber-800",
        icon: Clock3,
        iconClassName: "text-amber-700",
      };
  }
}

export default async function EditRoomCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const category = await getRoomCategoryDetails(id);

  if (!category) {
    notFound();
  }

  if (!isRoomCategoryStatus(category.status)) {
    throw new Error("Room category has an invalid status.");
  }

  const formCategory = {
    id: category.id,
    name: category.name,
    slug: category.slug,
    shortDescription: category.shortDescription,
    description: category.description,
    maxAdults: category.maxAdults,
    maxChildren: category.maxChildren,
    roomSize: category.roomSize,
    bedType: category.bedType,
    basePrice: category.basePrice,
    status: category.status,
  };

  const status = getStatusPresentation(category.status);
  const StatusIcon = status.icon;

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 pb-10 sm:space-y-8">
      {/* Page header */}
      <header className="relative isolate overflow-hidden rounded-[1.75rem] border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-7 lg:p-9">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 -z-10 h-64 w-64 rounded-full bg-amber-100/70 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-1/3 -z-10 h-48 w-48 rounded-full bg-stone-100/80 blur-3xl"
        />

        <div className="relative">
          <Link
            href={`/admin/room-categories/${category.id}`}
            className="group inline-flex min-h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white/80 px-3.5 py-2 text-sm font-medium text-neutral-600 transition duration-200 hover:border-amber-200 hover:bg-amber-50 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 motion-reduce:transition-none"
          >
            <ArrowLeft
              size={16}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transform-none"
            />
            Back to category
          </Link>

          <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-amber-50/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-800">
                <Sparkles size={13} aria-hidden="true" />
                MOLLIS LUX · Room management
              </div>

              <div className="mt-5 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-700 shadow-sm sm:h-14 sm:w-14">
                  <FilePenLine
                    size={24}
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400 sm:text-xs">
                    Room category
                  </p>

                  <h1 className="mt-1.5 break-words font-serif text-3xl tracking-tight text-neutral-950 sm:text-4xl lg:text-5xl">
                    Edit category
                  </h1>

                  <p className="mt-2 break-words text-base font-medium text-neutral-700 sm:text-lg">
                    {category.name}
                  </p>
                </div>
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base sm:leading-7">
                Refine this category&apos;s details, guest capacity, pricing,
                descriptions, and operational status to keep your hotel&apos;s
                room information accurate and consistent.
              </p>
            </div>

            <div
              className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold ${status.className}`}
              aria-label={`Current category status: ${status.label}`}
            >
              <StatusIcon size={15} aria-hidden="true" />
              {status.label}
            </div>
          </div>

          {/* Category identity */}
          <div className="mt-7 grid gap-3 border-t border-neutral-100 pt-6 sm:grid-cols-2">
            <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-neutral-200/80 bg-white/75 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                <Layers3 size={18} aria-hidden="true" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                  Category name
                </p>

                <p className="mt-1 break-words text-sm font-medium text-neutral-800">
                  {category.name}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-neutral-200/80 bg-white/75 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                <BedDouble size={18} aria-hidden="true" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                  Room category slug
                </p>

                <p className="mt-1 break-all text-sm font-medium text-neutral-800">
                  {category.slug}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Status information */}
      <section
        aria-label="Current category status"
        className="flex items-start gap-3.5 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm sm:p-5"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50">
          <StatusIcon
            size={19}
            className={status.iconClassName}
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-neutral-900">
            Current status: {status.label}
          </h2>

          <p className="mt-1 text-sm leading-6 text-neutral-500">
            {status.description} You can review the available status options in
            the category form below.
          </p>
        </div>

        <Info
          size={17}
          className="mt-1 shrink-0 text-neutral-400"
          aria-hidden="true"
        />
      </section>

      {/* Edit form */}
      <section className="overflow-hidden rounded-[1.75rem] border border-neutral-200/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md motion-reduce:transition-none">
        <div className="border-b border-neutral-100 bg-neutral-50/60 px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-200/70 bg-amber-50 text-amber-800">
              <FilePenLine
                size={20}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                Category configuration
              </p>

              <h2 className="mt-1 font-serif text-xl tracking-tight text-neutral-950 sm:text-2xl">
                Edit room details
              </h2>

              <p className="mt-1 text-sm leading-6 text-neutral-500">
                Make your changes using the fields below.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-7 lg:p-8">
          <EditRoomCategoryForm category={formCategory} />
        </div>
      </section>

      {/* Return navigation */}
      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200/70 bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-start gap-2.5 text-sm text-neutral-500 sm:items-center">
          <ShieldCheck
            size={17}
            className="mt-0.5 shrink-0 text-neutral-400 sm:mt-0"
            aria-hidden="true"
          />

          <span>
            Changes should reflect the actual room category details.
          </span>
        </div>

        <Link
          href={`/admin/room-categories/${category.id}`}
          className="group inline-flex min-h-10 w-fit items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-neutral-600 transition duration-200 hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 motion-reduce:transition-none"
        >
          Return to category

          <ArrowRight
            size={15}
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none"
          />
        </Link>
      </div>
    </main>
  );
}
