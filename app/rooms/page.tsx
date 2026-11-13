
import type { Metadata } from "next";

import Link from "next/link";
import { BedDouble, Sparkles, ArrowRight } from "lucide-react";

import PublicNavbar from "@/src/components/public/public-navbar";
import RoomCategorySection from "@/src/components/public/room-category-section";
import { getActiveRoomCategories } from "@/src/lib/rooms/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Rooms | MOLLIS LUX",
  description:
    "Explore the room collections at MOLLIS LUX. Discover thoughtful comfort and find a room for your stay.",
};

export default async function RoomsPage() {
  const roomCategories = await getActiveRoomCategories();

  return (
    <>
      <PublicNavbar />

      <main className="min-h-screen bg-[#f8f6f1] pt-[76px] text-stone-900 lg:pt-[88px]">
        {/* Page introduction */}
        <section className="relative isolate overflow-hidden border-b border-stone-200/80 bg-[#f8f6f1] px-6 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-32">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_30%,rgba(215,185,140,0.20),transparent_35%),radial-gradient(circle_at_85%_70%,rgba(167,134,85,0.12),transparent_40%)]"
          />

          <div className="relative mx-auto max-w-5xl text-center">
            <div className="flex items-center justify-center gap-3">
              <span className="h-px w-9 bg-[#a78655]" />

              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#967344]">
                The MOLLIS LUX experience
              </p>

              <span className="h-px w-9 bg-[#a78655]" />
            </div>

            <div className="mx-auto mt-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e7d9c3] bg-white/70 text-[#967344] shadow-sm">
              <BedDouble size={25} strokeWidth={1.5} />
            </div>

            <h1 className="mt-7 font-serif text-5xl leading-tight tracking-tight text-stone-950 sm:text-6xl lg:text-7xl">
              Discover your
              <span className="mt-2 block italic text-[#a78655]">
                perfect stay.
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-sm leading-8 text-stone-600 sm:text-base">
              Explore our carefully presented room collections, each offering
              its own character, thoughtful details, and a welcoming space to
              unwind.
            </p>

            <div className="mt-9 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#967344]">
              <Sparkles size={15} strokeWidth={1.5} />
              Find a space that feels like yours
            </div>
          </div>
        </section>

        {/* Room categories */}
        {roomCategories.length > 0 ? (
          <div>
            {roomCategories.map((category, index) => (
              <RoomCategorySection
                key={category.id}
                category={category}
                priority={index === 0}
              />
            ))}
          </div>
        ) : (
          <section className="px-6 py-24 sm:px-8 lg:px-10">
            <div className="mx-auto max-w-3xl rounded-[2rem] border border-dashed border-stone-300 bg-white/60 px-6 py-20 text-center">
              <BedDouble
                className="mx-auto h-12 w-12 text-[#a78655]"
                strokeWidth={1.3}
                aria-hidden="true"
              />

              <h2 className="mt-6 font-serif text-3xl text-stone-950 sm:text-4xl">
                Our room collections are being prepared.
              </h2>

              <p className="mx-auto mt-4 max-w-lg text-sm leading-8 text-stone-600">
                We are preparing our collections for your next stay. Please
                check back soon.
              </p>

              <Link
                href="/"
                className="mt-8 inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-stone-900 px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-stone-700"
              >
                Return home
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </section>
        )}

        {/* Closing section */}
        <section className="border-t border-stone-200/80 bg-white px-6 py-20 text-center sm:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#967344]">
              MOLLIS LUX
            </p>

            <h2 className="mt-5 font-serif text-3xl leading-tight text-stone-950 sm:text-4xl lg:text-5xl">
              Your next memorable stay begins here.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-8 text-stone-600">
              Discover a room that suits your needs and let us make your stay
              a comfortable one.
            </p>

            <Link
              href="/my-reservations"
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-[#b99a6b] bg-[#d8c5a5] px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#29241e] transition hover:bg-[#c5a675]"
            >
              View your reservations
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

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

        <div className="mt-6 flex flex-wrap justify-center gap-x-7 gap-y-3 text-[10px] uppercase tracking-[0.15em] text-white/55">
          <Link href="/" className="transition hover:text-[#e2c69a]">
            Home
          </Link>
          <Link href="/about" className="transition hover:text-[#e2c69a]">
            About
          </Link>
          <Link href="/contact" className="transition hover:text-[#e2c69a]">
            Contact
          </Link>
          <Link
            href="/my-reservations"
            className="transition hover:text-[#e2c69a]"
          >
            Reservations
          </Link>
        </div>

        <p className="mt-8 text-[9px] uppercase tracking-[0.2em] text-white/35">
          Discover comfort. Experience MOLLIS LUX.
        </p>
      </footer>
    </>
  );
}
