import type { Metadata } from "next";
import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  CalendarDays,
  Check,
  ChevronDown,
  DoorOpen,
  House,
  Info,
  Mail,
  Maximize2,
  Sparkles,
  Users,
} from "lucide-react";

import RoomCard from "@/src/components/public/room-card";
import {
  getActiveRoomCategories,
  getAllPublicRoomsByCategoryId,
  getPublicRoomCategoryBySlug,
} from "@/src/lib/rooms/queries";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const categoryBanners: Record<string, string> = {
  "classic-king-room": "/images/rooms/classic-king.jpg",
  "deluxe-king-room": "/images/rooms/deluxe-king.jpg",
  "executive-king-room": "/images/rooms/executive-king.jpg",
  "presidential-suite": "/images/rooms/presidential-suite.jpg",
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getPublicRoomCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Room not found | MOLLIS LUX",
    };
  }

  return {
    title: `${category.name} | MOLLIS LUX`,
    description:
      category.shortDescription?.trim() ||
      `Discover ${category.name} at MOLLIS LUX. Explore the rooms and plan your stay.`,
  };
}

export default async function PublicRoomPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getPublicRoomCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const [rooms, categories] = await Promise.all([
    getAllPublicRoomsByCategoryId(category.id),
    getActiveRoomCategories(),
  ]);

  const bannerImage = categoryBanners[category.slug];

  const shortCopy =
    category.shortDescription?.trim() ||
    `Discover comfort, thoughtful details, and a relaxing stay with ${category.name} at MOLLIS LUX.`;

  const longCopy =
    category.description?.trim() ||
    category.shortDescription?.trim() ||
    `Explore the ${category.name} collection at MOLLIS LUX and find a room that suits your stay.`;

  const navigationLink =
    "group/link inline-flex min-h-10 items-center gap-2 rounded-full px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/90 transition-colors duration-300 hover:bg-white/80 hover:text-[#967344] group-hover/nav:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655] motion-reduce:transition-none";

  const iconClass =
    "h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover/link:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none";

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f6f1] text-stone-900">
      {/* Transparent navbar until hover */}
      <header className="group/nav fixed inset-x-0 top-0 z-50 border-b border-transparent bg-transparent transition-[background-color,border-color,box-shadow] duration-300 hover:border-stone-200/80 hover:bg-[#fbfaf7]/95 hover:shadow-[0_12px_40px_rgba(41,37,36,0.06)] focus-within:border-stone-200/80 focus-within:bg-[#fbfaf7]/95 focus-within:shadow-[0_12px_40px_rgba(41,37,36,0.06)] motion-reduce:transition-none">
        <div className="mx-auto flex min-h-[76px] max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6 lg:min-h-[88px] lg:px-10">
          <Link
            href="/"
            aria-label="MOLLIS LUX homepage"
            className="group/brand flex min-w-0 shrink-0 items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655] focus-visible:ring-offset-4 sm:gap-3"
          >
            <span className="relative flex h-11 w-9 shrink-0 items-center justify-center sm:h-14 sm:w-12">
              <Image
                src="/images/mollis-lux-logo.png"
                alt=""
                fill
                sizes="48px"
                priority
                className="object-contain transition-transform duration-500 group-hover/brand:scale-105 motion-reduce:transition-none"
              />
            </span>

            <span className="flex min-w-0 flex-col gap-1">
              <span className="whitespace-nowrap font-serif text-xs tracking-[0.16em] text-white transition-colors group-hover/nav:text-stone-950 group-hover/brand:text-[#967344] sm:text-base sm:tracking-[0.22em]">
                MOLLIS LUX
              </span>

              <span className="hidden text-[8px] uppercase tracking-[0.22em] text-white/70 group-hover/nav:text-stone-500 sm:block">
                A considered stay
              </span>
            </span>
          </Link>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-0.5 xl:flex"
          >
            <Link href="/" className={navigationLink}>
              <House className={iconClass} aria-hidden="true" />
              Home
            </Link>

            <div className="group/rooms relative">
              <Link
                href="/#rooms"
                aria-haspopup="true"
                className={navigationLink}
              >
                <BedDouble className={iconClass} aria-hidden="true" />
                Rooms

                <ChevronDown
                  size={12}
                  className="transition-transform duration-300 group-hover/rooms:rotate-180 group-focus-within/rooms:rotate-180 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </Link>

              <div className="invisible pointer-events-none absolute left-1/2 top-full z-50 w-[min(660px,90vw)] -translate-x-1/2 translate-y-3 pt-4 opacity-0 transition-[opacity,transform,visibility] duration-300 group-hover/rooms:visible group-hover/rooms:pointer-events-auto group-hover/rooms:translate-y-0 group-hover/rooms:opacity-100 group-focus-within/rooms:visible group-focus-within/rooms:pointer-events-auto group-focus-within/rooms:translate-y-0 group-focus-within/rooms:opacity-100 motion-reduce:transition-none">
                <div className="overflow-hidden rounded-3xl border border-stone-200/90 bg-[#fbfaf7] p-5 shadow-[0_24px_80px_rgba(41,37,36,0.13)] sm:p-7">
                  <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-5">
                    <div>
                      <p className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#9b7b4b]">
                        <Sparkles size={13} aria-hidden="true" />
                        The collection
                      </p>

                      <h2 className="mt-2 font-serif text-2xl text-stone-950">
                        Find your room.
                      </h2>
                    </div>

                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#e5d6bd] bg-[#f4ecdf] text-[#967344]">
                      <BedDouble size={20} aria-hidden="true" />
                    </span>
                  </div>

                  {categories.length > 0 ? (
                    <div className="grid gap-2 py-4 sm:grid-cols-2">
                      {categories.map((item, index) => (
                        <Link
                          key={item.id}
                          href={`/rooms/${item.slug}`}
                          className="group/category flex min-w-0 items-center gap-3 rounded-2xl border border-transparent p-3 transition-all duration-200 hover:border-stone-200 hover:bg-white hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655]"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-600 transition-colors group-hover/category:bg-[#f4ecdf] group-hover/category:text-[#967344]">
                            <BedDouble size={17} aria-hidden="true" />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-semibold text-stone-800">
                              {item.name}
                            </span>

                            <span className="mt-1 block text-[9px] uppercase tracking-[0.12em] text-stone-400">
                              Room collection{" "}
                              {String(index + 1).padStart(2, "0")}
                            </span>
                          </span>

                          <ArrowRight
                            size={14}
                            className="shrink-0 text-stone-400 transition-transform duration-200 group-hover/category:translate-x-0.5 group-hover/category:text-[#967344]"
                            aria-hidden="true"
                          />
                        </Link>
                      ))}
                    </div>
                  ) : null}

                  <Link
                    href="/#rooms"
                    className="group/all flex items-center justify-between gap-3 rounded-xl bg-stone-900 px-4 py-3.5 text-xs font-medium text-white transition-colors hover:bg-stone-700"
                  >
                    <span className="flex items-center gap-2">
                      <DoorOpen size={15} aria-hidden="true" />
                      Explore all rooms
                    </span>

                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
<Link href="/my-reservations" className={navigationLink}>
  <CalendarDays className={iconClass} aria-hidden="true" />
  Reservation
</Link>

            <Link href="/about" className={navigationLink}>
  <Info className={iconClass} aria-hidden="true" />
  About
</Link>
            <Link href="/contact" className={navigationLink}>
              <Mail className={iconClass} aria-hidden="true" />
              Contact us
            </Link>
          </nav>

          <Link
            href="/#rooms"
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-white/50 bg-white/15 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md transition-all duration-200 hover:border-[#c7ae87] hover:bg-white hover:text-[#967344] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655] group-hover/nav:border-stone-300/80 group-hover/nav:bg-white/70 group-hover/nav:text-stone-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to collection
          </Link>
        </div>
      </header>

      {/* Luxury hero banner */}
      <section className="relative isolate flex min-h-[560px] items-center overflow-hidden bg-[#29241e] pt-20 sm:min-h-[640px] lg:min-h-[740px]">
        {bannerImage ? (
          <Image
            src={bannerImage}
            alt={`${category.name} at MOLLIS LUX`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_20%,#75634a_0%,transparent_40%),linear-gradient(125deg,#29241e,#514332_55%,#a78655)]" />
        )}

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20"
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24 sm:px-8 lg:px-10 lg:py-32">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#d8bd91]" />

              <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-[#e2c69a] sm:text-xs">
                The MOLLIS LUX collection
              </p>
            </div>

            <h1 className="mt-7 font-serif text-5xl leading-[1.08] text-white sm:text-6xl lg:text-8xl">
              Discover the
              <span className="mt-3 block text-[#e2c69a]">
                {category.name}
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-sm leading-8 text-white/80 sm:text-base sm:leading-9">
              {shortCopy}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-5">
              <a
                href="#available-rooms"
                className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#d8c5a5] px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#29241e] shadow-xl shadow-black/10 transition duration-300 hover:-translate-y-1 hover:bg-[#c5a675] hover:text-[#241d14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none"
              >
                Explore the rooms

                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </a>

              <span className="text-xs tracking-wide text-white/70">
                Thoughtfully prepared for your stay
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction section */}
      <section className="relative overflow-hidden px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(215,185,140,0.18),transparent_34%),radial-gradient(circle_at_85%_70%,rgba(167,134,85,0.12),transparent_40%)]"
        />

        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="rounded-[2rem] border border-white/60 bg-white/45 p-7 shadow-[0_30px_80px_rgba(83,66,45,0.08)] backdrop-blur-xl sm:p-10">
            <div className="flex items-center gap-3">
              <span className="h-px w-9 bg-[#a78655]" />

              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9b7b4b]">
                The experience
              </p>
            </div>

            <h2 className="mt-6 max-w-xl font-serif text-4xl leading-[1.18] text-stone-950 sm:text-5xl">
              A space to settle in and feel at ease.
            </h2>

            <p className="mt-7 max-w-xl text-sm leading-8 text-stone-600 sm:text-[15px]">
              {longCopy}
            </p>

            <div className="mt-9 inline-flex items-center gap-3 rounded-full border border-[#e4d5bd]/80 bg-white/55 px-4 py-3 backdrop-blur-md">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d8c5a5] bg-[#f8f3ea] text-[#9b7b4b]">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </span>

              <p className="text-xs uppercase tracking-[0.17em] text-stone-600">
                A more considered way to stay
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/55 p-6 shadow-[0_30px_80px_rgba(83,66,45,0.10)] backdrop-blur-2xl sm:p-9">
            <div
              aria-hidden="true"
              className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#f0e2cb]/70 blur-2xl"
            />

            <div
              aria-hidden="true"
              className="absolute -bottom-12 left-8 h-28 w-28 rounded-full bg-[#e7d4b3]/50 blur-2xl"
            />

            <div className="relative">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9b7b4b]">
                Designed around you
              </p>

              <h2 className="mt-4 font-serif text-3xl text-stone-950 sm:text-4xl">
                The details of your stay.
              </h2>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <Detail
                  icon={<Users className="h-4 w-4" aria-hidden="true" />}
                  label="Maximum adults"
                  value={category.maxAdults.toString()}
                />

                <Detail
                  icon={<Users className="h-4 w-4" aria-hidden="true" />}
                  label="Maximum children"
                  value={category.maxChildren.toString()}
                />

                <Detail
                  icon={<Maximize2 className="h-4 w-4" aria-hidden="true" />}
                  label="Room size"
                  value={category.roomSize?.trim() || "Not specified"}
                />

                <Detail
                  icon={<BedDouble className="h-4 w-4" aria-hidden="true" />}
                  label="Bed type"
                  value={category.bedType?.trim() || "Not specified"}
                />
              </div>

              {category.features.length > 0 ? (
                <div className="mt-8 border-t border-stone-200/70 pt-7">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-500">
                    Room features
                  </p>

                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {category.features.map((feature) => (
                      <li
                        key={feature.id}
                        className="flex items-center gap-3 rounded-xl border border-white/70 bg-white/50 px-3 py-2.5 text-sm text-stone-700 backdrop-blur-sm"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f2eadc] text-[#987748]">
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>

                        {feature.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-8 rounded-2xl border border-[#e6d5b9]/90 bg-[#faf6ef]/80 p-5 backdrop-blur-md sm:p-6">
                <p className="text-sm leading-7 text-stone-700">
                  Ready to book? Choose a specific room below, or continue with
                  this category to find an available room for your dates.
                </p>

                <Link
                  href={`/booking?room=${encodeURIComponent(category.slug)}`}
                  className="mt-5 inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-[#b99a6b] bg-[#d8c5a5] px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#29241e] shadow-sm transition duration-300 hover:border-[#a78655] hover:bg-[#c5a675] hover:text-[#241d14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655] focus-visible:ring-offset-2 motion-reduce:transition-none"
                >
                  Book this category

                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Physical rooms */}
      <section
        id="available-rooms"
        className="scroll-mt-24 border-y border-stone-200/80 bg-white"
      >
        <div className="mx-auto max-w-[1500px] px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-9 bg-[#a78655]" />

                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9b7b4b]">
                  Find your room
                </p>
              </div>

              <h2 className="mt-5 font-serif text-4xl text-stone-950 sm:text-5xl">
                {category.name} rooms
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-8 text-stone-600">
                Explore individual rooms in this collection. Choose a specific
                room to request it during booking, subject to availability for
                your dates.
              </p>
            </div>

            <p className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-stone-200 bg-[#f8f6f1] px-5 py-3 text-xs text-stone-600 sm:self-auto">
              <BedDouble
                className="h-4 w-4 text-[#a78655]"
                aria-hidden="true"
              />

              {rooms.length} {rooms.length === 1 ? "room" : "rooms"} listed
            </p>
          </div>

          {rooms.length > 0 ? (
            <div className="mt-12 grid items-stretch gap-7 sm:grid-cols-2 xl:grid-cols-3">
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={{
                    id: room.id,
                    roomNumber: room.roomNumber,
                    name: room.name,
                    description: room.description,
                    floor: room.floor,
                    images: room.images,
                  }}
                  categorySlug={category.slug}
                  categoryDetails={{
                    name: category.name,
                    shortDescription: category.shortDescription,
                    description: category.description,
                    basePrice: category.basePrice,
                    maxAdults: category.maxAdults,
                    maxChildren: category.maxChildren,
                    roomSize: category.roomSize,
                    bedType: category.bedType,
                    features: category.features,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-[2rem] border border-dashed border-stone-300 bg-[#f8f6f1] px-6 py-20 text-center">
              <BedDouble
                className="mx-auto h-11 w-11 text-[#a78655]"
                aria-hidden="true"
              />

              <h3 className="mt-6 font-serif text-3xl text-stone-950">
                No rooms currently listed
              </h3>

              <p className="mx-auto mt-4 max-w-lg text-sm leading-8 text-stone-600">
                There are currently no physical rooms marked as available in
                this category. You can browse other collections or check again
                later.
              </p>

              <Link
                href="/#rooms"
                className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-stone-300 px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-800 transition hover:border-[#a78655] hover:text-[#9b7b4b]"
              >
                Browse all rooms

                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </section>

      <footer className="bg-[#201d19] px-6 py-12 text-center text-white sm:px-8">
        <Link
          href="/"
          className="font-serif text-base tracking-[0.25em] transition hover:text-[#e2c69a]"
        >
          MOLLIS LUX
        </Link>

        <p className="mt-4 text-xs tracking-wide text-white/55">
          A more considered way to stay.
        </p>

        <div className="mx-auto mt-8 h-px max-w-24 bg-[#a78655]/70" />

        <p className="mt-6 text-[10px] uppercase tracking-[0.2em] text-white/35">
          Discover comfort. Experience MOLLIS LUX.
        </p>
      </footer>
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
    <div className="rounded-2xl border border-white/70 bg-white/55 p-4 shadow-sm backdrop-blur-md transition duration-300 hover:border-[#d8c5a5] hover:bg-white/75">
      <p className="flex items-center gap-2 text-[9px] font-medium uppercase tracking-[0.13em] text-stone-500 sm:text-[10px]">
        <span className="text-[#a78655]">{icon}</span>
        {label}
      </p>

      <p className="mt-3 text-sm font-medium text-stone-800">{value}</p>
    </div>
  );
}