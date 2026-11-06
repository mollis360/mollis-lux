import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  MapPin,
  Sparkles
} from "lucide-react";

import { getHotel } from "@/src/lib/hotel/queries";
import { getActiveRoomCategories } from "@/src/lib/rooms/queries";
import PublicNavbar from "@/src/components/public/public-navbar";
import RoomCategorySection from "@/src/components/public/room-category-section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "MOLLIS LUX | A considered hotel stay",
  description:
    "Discover MOLLIS LUX and explore the available room categories.",
};

export default async function HomePage() {
  const [hotel, roomCategories] = await Promise.all([
    getHotel(),
    getActiveRoomCategories(),
  ]);

  const hotelDescription =
    hotel?.description?.trim() ||
    "Hotel information is being prepared.";

  const locationLabel =
    hotel?.city && hotel?.country
      ? `${hotel.city}, ${hotel.country}`
      : hotel?.city || hotel?.country || null;

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-stone-900">
      <PublicNavbar />




<section className="relative isolate flex min-h-[760px] items-center overflow-hidden bg-[#11130f] px-5 pb-16 pt-28 sm:min-h-[820px] sm:px-8 sm:pb-20 sm:pt-32 lg:min-h-[900px] lg:px-10 lg:pb-24 lg:pt-36">
  {/* Cinematic background with slow camera movement */}
  <div
    className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    aria-hidden="true"
  >
    <div
      className="absolute -inset-[5%] bg-cover bg-[center_55%] bg-no-repeat"
      style={{
        backgroundImage: "url('/images/mollis-hero.jpg')",
        animation:
          "mollis-hero-drift 32s ease-in-out infinite alternate",
      }}
    />
  </div>

  {/* Rich cinematic color grading */}
  <div
    className="pointer-events-none absolute inset-0 z-0 bg-[#11130f]/25"
    aria-hidden="true"
  />

  <div
    className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-[#11130f]/85 via-[#11130f]/45 to-[#11130f]/10"
    aria-hidden="true"
  />

  <div
    className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-[#11130f]/90 via-transparent to-[#11130f]/30"
    aria-hidden="true"
  />

  {/* Atmospheric light */}
  <div
    className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_72%_38%,rgba(218,187,139,0.17),transparent_43%)]"
    aria-hidden="true"
  />

  <div
    className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,transparent_45%,rgba(17,19,15,0.28)_100%)]"
    aria-hidden="true"
  />

  {/* Fine cinematic frame */}
  <div
    className="pointer-events-none absolute inset-3 z-0 rounded-[1.5rem] border border-white/[0.12] sm:inset-5 sm:rounded-[2rem]"
    aria-hidden="true"
  />

  {/* Main composition */}
  <div className="relative z-10 mx-auto w-full max-w-7xl">
    <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(250px,0.65fr)] lg:gap-16 xl:gap-24">
      {/* Editorial headline */}
      <div className="relative min-w-0 max-w-4xl">
        {/* Brand signature */}
        <div
          className="flex items-center gap-3 opacity-0"
          style={{
            animation: "mollis-hero-reveal 1s ease-out 0.15s forwards",
          }}
        >
          <span
            className="h-px w-10 bg-[#e8cda3] sm:w-14"
            aria-hidden="true"
          />

          <p className="text-[10px] font-medium uppercase tracking-[0.36em] text-[#f0d8b3] sm:text-xs">
            MOLLIS LUX
          </p>

          <span className="ml-1 text-[10px] uppercase tracking-[0.2em] text-white/60">
            A considered stay
          </span>
        </div>

        {/* Main statement */}
        <h1
          className="mt-9 max-w-4xl font-serif text-[clamp(3.6rem,11vw,5.5rem)] font-normal leading-[0.94] tracking-[-0.055em] text-white opacity-0 sm:mt-12 sm:text-8xl lg:mt-14 lg:text-[7.5rem] xl:text-[8.5rem]"
          style={{
            animation: "mollis-hero-reveal 1.2s ease-out 0.3s forwards",
          }}
        >
          A place to
          <br />

          <span className="relative inline-block pb-3 pr-2 font-serif italic text-[#f0d8b3]">
            feel elsewhere.
            <span
              className="absolute bottom-0 left-1 h-px w-[72%] bg-gradient-to-r from-[#f0d8b3]/80 to-transparent"
              aria-hidden="true"
            />
          </span>
        </h1>

        {/* Description */}
        <p
          className="mt-8 max-w-md text-sm leading-7 text-white/85 opacity-0 sm:mt-9 sm:text-base sm:leading-8"
          style={{
            animation: "mollis-hero-reveal 1s ease-out 0.55s forwards",
          }}
        >
          {hotelDescription}
        </p>

        {/* Primary action */}
        <div
          className="mt-9 flex flex-col items-start gap-5 opacity-0 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6"
          style={{
            animation: "mollis-hero-reveal 1s ease-out 0.7s forwards",
          }}
        >
          <Link
            href="#rooms"
            className="group inline-flex min-h-14 items-center gap-8 rounded-full border border-[#f0d8b3]/70 bg-[#f0d8b3] px-6 py-3.5 text-sm font-medium text-[#24251f] shadow-[0_12px_45px_rgba(0,0,0,0.2)] transition-all duration-500 hover:border-white/80 hover:bg-white hover:shadow-[0_16px_55px_rgba(0,0,0,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0d8b3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#11130f] motion-reduce:transition-none sm:min-w-[245px] sm:justify-between"
          >
            <span>Discover your room</span>

            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#24251f]/15 transition-all duration-300 group-hover:border-transparent group-hover:bg-[#24251f] group-hover:text-white">
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none"
                aria-hidden="true"
              />
            </span>
          </Link>

          {locationLabel ? (
            <div className="inline-flex max-w-full items-center gap-3 rounded-full border border-white/20 bg-[#171914]/30 px-4 py-3 text-sm text-white/90 backdrop-blur-md">
              <MapPin
                className="h-4 w-4 shrink-0 text-[#f0d8b3]"
                aria-hidden="true"
              />

              <span className="break-words">{locationLabel}</span>
            </div>
          ) : null}
        </div>

        {/* Quiet brand signature */}
        <div
          className="mt-10 flex items-center gap-3 opacity-0 sm:mt-14"
          style={{
            animation: "mollis-hero-reveal 1s ease-out 0.9s forwards",
          }}
        >
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#e8cda3] shadow-[0_0_14px_rgba(232,205,163,0.8)]"
            aria-hidden="true"
          />

          <p className="text-[9px] uppercase tracking-[0.23em] text-white/70 sm:text-[10px] sm:tracking-[0.3em]">
            Thoughtfully considered. Effortlessly welcoming.
          </p>
        </div>
      </div>

      {/* Floating editorial glass detail */}
      <aside
        className="relative mx-auto w-full max-w-[370px] opacity-0 lg:mx-0 lg:ml-auto"
        style={{
          animation: "mollis-hero-reveal 1.2s ease-out 0.6s forwards",
        }}
      >
        {/* Fine glass panel */}
        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/25 bg-white/[0.07] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.2)] backdrop-blur-md sm:rounded-[2rem] sm:p-7">
          <div
            className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
            aria-hidden="true"
          />

          {/* Editorial label */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-[9px] uppercase tracking-[0.28em] text-white/75">
              The MOLLIS feeling
            </p>

            <span
              className="h-1.5 w-1.5 rounded-full bg-[#e8cda3]"
              aria-hidden="true"
            />
          </div>

          {/* Emotional statement */}
          <p className="mt-10 font-serif text-4xl leading-[1.08] tracking-[-0.035em] text-white sm:mt-14 sm:text-5xl">
            Leave the noise.
            <br />

            <span className="italic text-[#f0d8b3]">
              Find your quiet.
            </span>
          </p>

          <div className="mt-7 h-px w-full bg-gradient-to-r from-white/35 via-white/15 to-transparent" />

          <p className="mt-5 max-w-[230px] text-xs leading-6 text-white/70 sm:text-sm sm:leading-7">
            Some places give you a room. Others give you room to breathe.
          </p>

          {/* Glass detail */}
          <div className="mt-8 flex items-center gap-3 rounded-xl border border-white/15 bg-white/[0.05] px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#f0d8b3]/35 bg-[#f0d8b3]/10">
              <span
                className="h-2 w-2 rounded-full bg-[#f0d8b3]"
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/55">
                Your time, your pace
              </p>

              <p className="mt-1 font-serif text-lg text-white">
                Stay a little longer.
              </p>
            </div>
          </div>
        </div>

        {/* Floating caption */}
        <div className="absolute -bottom-5 right-4 rounded-full border border-white/25 bg-[#171914]/55 px-4 py-3 shadow-[0_12px_35px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:-right-5 sm:px-5">
          <p className="text-[9px] uppercase tracking-[0.22em] text-[#f0d8b3]">
            A quieter kind of luxury
          </p>
        </div>
      </aside>
    </div>

    {/* Bottom navigation cue */}
    <div className="mt-16 flex items-center justify-between gap-4 border-t border-white/20 pt-5 sm:mt-20 lg:mt-24">
      <div className="flex items-center gap-3">
        <span
          className="h-px w-7 bg-[#f0d8b3]/80 sm:w-10"
          aria-hidden="true"
        />

        <p className="text-[9px] font-medium uppercase tracking-[0.23em] text-white/70 sm:text-[10px] sm:tracking-[0.3em]">
          Discover the collection
        </p>
      </div>

      <Link
        href="#rooms"
        aria-label="Explore room categories"
        className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/[0.06] text-white backdrop-blur-md transition-all duration-500 hover:border-[#f0d8b3] hover:bg-[#f0d8b3] hover:text-[#25251f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0d8b3] motion-reduce:transition-none"
      >
        <ArrowRight
          className="h-4 w-4 rotate-90 transition-transform duration-300 group-hover:translate-y-0.5 motion-reduce:transform-none"
          aria-hidden="true"
        />
      </Link>
    </div>
  </div>

  {/* Animation definitions and reduced-motion support */}
  <style>{`
    @keyframes mollis-hero-drift {
      0% {
        transform: scale(1) translate3d(0, 0, 0);
      }
      100% {
        transform: scale(1.09) translate3d(-1%, 0.5%, 0);
      }
    }

    @keyframes mollis-hero-reveal {
      from {
        opacity: 0;
        transform: translate3d(0, 18px, 0);
      }
      to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      [style*="mollis-hero-drift"],
      [style*="mollis-hero-reveal"] {
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
      }
    }
  `}</style>
</section>





{/* Hotel introduction */}
<section className="relative overflow-hidden bg-[#f3f0e9] text-[#24251f]">
  {/* Soft ambient background */}
  <div
    className="pointer-events-none absolute -right-32 top-0 h-[420px] w-[420px] rounded-full bg-[#c9b28e]/15 blur-[110px]"
    aria-hidden="true"
  />

  <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-32">
    <div className="grid items-start gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
      {/* Editorial introduction */}
      <div className="relative lg:sticky lg:top-24">
        <div className="flex items-center gap-3">
          <span
            className="h-px w-10 bg-[#a78655]"
            aria-hidden="true"
          />

          <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-[#947348] sm:text-xs">
            MOLLIS LUX
          </p>
        </div>

        <h2 className="mt-7 max-w-lg font-serif text-5xl font-normal leading-[1.04] tracking-[-0.045em] text-[#25251f] sm:text-6xl lg:text-[4.5rem]">
          A slower way
          <br />
          <span className="italic text-[#a78655]">to arrive.</span>
        </h2>

        <div className="mt-8 h-px w-20 bg-gradient-to-r from-[#a78655] to-transparent" />

        <p className="mt-7 max-w-md text-sm leading-7 text-[#68665d] sm:text-base sm:leading-8">
          {hotelDescription}
        </p>

        {locationLabel ? (
          <div className="mt-8 inline-flex max-w-full items-center gap-3 border-t border-[#25251f]/15 pt-5">
            <MapPin
              className="h-4 w-4 shrink-0 text-[#a78655]"
              aria-hidden="true"
            />

            <p className="break-words text-[10px] uppercase tracking-[0.18em] text-[#68665d] sm:text-xs">
              {locationLabel}
            </p>
          </div>
        ) : null}

        <p className="mt-10 font-serif text-lg italic text-[#947348]">
          A place to feel at home in the moment.
        </p>
      </div>

      {/* Architectural photography */}
      <div className="relative min-w-0 lg:pt-8">
        <div className="group relative overflow-hidden rounded-[1.5rem] bg-[#ded6c8] shadow-[0_25px_70px_rgba(45,38,27,0.12)] sm:rounded-[2rem]">
          <div
            className="aspect-[4/3] w-full bg-cover bg-center transition-transform duration-[1400ms] ease-out group-hover:scale-[1.035] sm:aspect-[5/4]"
            style={{
              backgroundImage:
                "url('/images/mollis-introduction.jpg')",
            }}
            role="img"
            aria-label="Elegant MOLLIS LUX hotel lobby with sculptural architectural details and warm lighting"
          />

          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#171914]/40 via-transparent to-white/[0.04]"
            aria-hidden="true"
          />

          {/* Image caption */}
          <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 sm:inset-x-8 sm:bottom-8">
            <div>
              <p className="text-[9px] uppercase tracking-[0.25em] text-white/75 sm:text-[10px]">
                The art of staying
              </p>

              <p className="mt-2 font-serif text-2xl text-white sm:text-3xl">
                Space to simply be.
              </p>
            </div>

            <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/45 bg-white/10 text-white backdrop-blur-md sm:flex">
              <span
                className="h-2 w-2 rounded-full bg-[#e8cda3]"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Subtle editorial detail */}
        <div className="mt-5 flex items-center justify-between gap-4 px-1">
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#777267] sm:text-[10px] sm:tracking-[0.25em]">
            Considered in every detail
          </p>

          <span
            className="h-px w-12 shrink-0 bg-[#a78655]/50 sm:w-20"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  </div>
</section>


      {/* Rooms section header */}
      <section
        id="rooms"
        className="border-y border-stone-200 bg-white px-6 py-12 lg:px-10 lg:py-16"
      >
        <div className="mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-[0.3em] text-[#9b7b4b]">
            The rooms
          </p>

          <h2 className="mt-4 font-serif text-4xl text-stone-950 sm:text-5xl">
            Discover your stay.
          </h2>

          <p className="mt-5 max-w-xl text-sm leading-7 text-stone-500">
            Explore each collection and discover the available rooms at
            MOLLIS LUX.
          </p>
        </div>
      </section>

      {/* Category blocks: banner on top + 4-column room grid */}
      {roomCategories.length === 0 ? (
        <section className="px-6 py-16 lg:px-10">
          <div className="mx-auto max-w-7xl rounded-3xl border border-dashed border-stone-300 bg-stone-50 px-6 py-16 text-center text-stone-500">
            Published room categories will appear here.
          </div>
        </section>
      ) : (
        roomCategories.map((category, index) => (
          <RoomCategorySection
            key={category.id}
            category={category }
            priority={index === 0}
          />
        ))
      )}

      {/* Call to action */}
    
<section className="mx-auto max-w-7xl px-6 py-20 sm:py-24 lg:px-10 lg:py-32">
  <div className="group relative isolate overflow-hidden rounded-[2.5rem] border border-[#d8c5a5]/60 bg-[linear-gradient(135deg,#e9dfcf_0%,#f4eee4_48%,#e5d8c2_100%)] px-6 py-14 shadow-[0_30px_100px_rgba(83,66,45,0.16)] sm:px-10 sm:py-16 lg:px-16 lg:py-20">
    {/* Ambient lighting */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-[#e8d5b3]/50 blur-[100px]"
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/90 blur-[90px]"
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[2.5rem] bg-[linear-gradient(115deg,rgba(255,255,255,0.55),transparent_38%,transparent_70%,rgba(255,255,255,0.3))]"
    />
    {/* Fine inner border */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-[1px] rounded-[calc(2.5rem-1px)] border border-white/60"
    />

    <div className="relative grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
      {/* Content */}
      <div>
        <div className="inline-flex items-center gap-3 rounded-full border border-[#d8c5a5]/70 bg-white/65 px-4 py-2.5 shadow-[0_4px_18px_rgba(83,66,45,0.05)] backdrop-blur-xl">
          <CalendarCheck
            className="h-4 w-4 text-[#a17d4c]"
            aria-hidden="true"
          />
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#92734b]">
            Plan your stay
          </span>
        </div>

        <h2 className="mt-7 max-w-2xl font-serif text-4xl leading-[1.12] tracking-[-0.035em] text-[#29241e] sm:text-5xl lg:text-[4.25rem]">
          Find the right time
          <span className="block font-light italic text-[#a1845c]">
            to arrive.
          </span>
        </h2>

        <p className="mt-7 max-w-xl text-sm leading-8 text-[#70675b] sm:text-[15px]">
          Discover a room that suits your stay. Explore live availability and
          secure a temporary 15-minute reservation hold. Payment is not
          configured yet.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <span className="h-px w-10 bg-[#b99b70]" />
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#9a866a]">
            An exceptional stay begins here
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-stretch gap-4 lg:items-end">
        {roomCategories[0] && (
          <Link
            href={`/rooms/${roomCategories[0].slug}`}
            className="group/button inline-flex min-h-16 w-full items-center justify-center gap-3 rounded-full border border-[#3b3328] bg-[#9ece5e02] px-7 py-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(41,36,30,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#80613b] hover:bg-[#80613b] hover:shadow-[0_18px_35px_rgba(41,36,30,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655] focus-visible:ring-offset-2"
          >
            Start with {roomCategories[0].name}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover/button:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        )}

        <Link
          href="/#rooms"
          className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full border border-[#d7c5a7]/80 bg-white/55 px-7 py-4 text-sm font-medium text-[#625747] shadow-[0_5px_18px_rgba(83,66,45,0.04)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-[#b99b70] hover:bg-white/85 hover:shadow-[0_12px_25px_rgba(83,66,45,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655] focus-visible:ring-offset-2"
        >
          Browse all rooms
          <ArrowRight
            className="h-4 w-4 text-[#a1845c]"
            aria-hidden="true"
          />
        </Link>

        <p className="mt-2 text-center text-[10px] uppercase tracking-[0.18em] text-[#9a8b77] lg:text-right">
          Thoughtfully designed for your comfort
        </p>
      </div>
    </div>
  </div>
</section>


      {/* Footer */}
      
<footer className="relative overflow-hidden border-t border-[#e8dfd1] bg-[#f5f0e7]">
  {/* Ambient background */}
  <div
    aria-hidden="true"
    className="pointer-events-none absolute -right-28 -top-28 h-[28rem] w-[28rem] rounded-full bg-[#dfcba9]/28 blur-[110px]"
  />
  <div
    aria-hidden="true"
    className="pointer-events-none absolute -bottom-36 -left-24 h-[26rem] w-[26rem] rounded-full bg-white/75 blur-[110px]"
  />

  <div className="relative mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-20 lg:px-10">
    {/* Main footer content */}
    <div className="grid gap-12 border-b border-[#ded3c1]/90 pb-14 sm:grid-cols-2 lg:grid-cols-[1.45fr_0.95fr_0.95fr_1.25fr] lg:gap-12">
      {/* Brand */}
      <div className="max-w-sm">
        <Link
          href="/"
          className="inline-flex flex-col rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655] focus-visible:ring-offset-4"
        >
          <span className="font-serif text-3xl tracking-[0.18em] text-[#29241e]">
            MOLLIS LUX
          </span>
          <span className="mt-2 text-[9px] font-semibold uppercase tracking-[0.32em] text-[#a1845c]">
            A more beautiful way to stay
          </span>
        </Link>

        <p className="mt-6 text-sm leading-8 text-[#71675a]">
          Discover a refined hotel experience where thoughtful comfort,
          timeless elegance, and exceptional hospitality come together. Your
          stay deserves something special.
        </p>

        {locationLabel ? (
          <div className="mt-6 inline-flex max-w-full items-start gap-3 rounded-2xl border border-[#e5d9c6] bg-white/55 px-4 py-3 text-sm text-[#71675a] backdrop-blur-sm">
            <MapPin
              className="mt-0.5 h-4 w-4 shrink-0 text-[#a1845c]"
              aria-hidden="true"
            />
            <span className="min-w-0 break-words">{locationLabel}</span>
          </div>
        ) : null}
      </div>

      {/* Explore */}
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#332b21]">
          Explore
        </h3>

        <ul className="mt-6 space-y-3.5 text-sm text-[#71675a]">
          <li>
            <Link
              href="/"
              className="inline-flex transition-colors duration-200 hover:text-[#a1845c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655]"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/#rooms"
              className="inline-flex transition-colors duration-200 hover:text-[#a1845c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655]"
            >
              Our rooms
            </Link>
          </li>
          <li>
            <Link
              href="/#about"
              className="inline-flex transition-colors duration-200 hover:text-[#a1845c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655]"
            >
              About MOLLIS LUX
            </Link>
          </li>
          <li>
            <Link
              href="/#contact"
              className="inline-flex transition-colors duration-200 hover:text-[#a1845c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655]"
            >
              Contact
            </Link>
          </li>
        </ul>
      </div>

      {/* Accommodation */}
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#332b21]">
          Accommodation
        </h3>

        <ul className="mt-6 space-y-3.5 text-sm text-[#71675a]">
          {roomCategories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/rooms/${category.slug}`}
                className="inline-flex transition-colors duration-200 hover:text-[#a1845c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655]"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Guest services */}
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#332b21]">
          Guest services
        </h3>

        <ul className="mt-6 space-y-3.5 text-sm text-[#71675a]">
          <li>
            <Link
              href="/my-reservations"
              className="inline-flex transition-colors duration-200 hover:text-[#a1845c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655]"
            >
              My reservations
            </Link>
          </li>
          <li>
            <Link
              href="/profile"
              className="inline-flex transition-colors duration-200 hover:text-[#a1845c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655]"
            >
              My account
            </Link>
          </li>
          <li>
            <Link
              href="/login"
              className="inline-flex transition-colors duration-200 hover:text-[#a1845c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655]"
            >
              Sign in
            </Link>
          </li>
          <li>
            <Link
              href="/#rooms"
              className="inline-flex transition-colors duration-200 hover:text-[#a1845c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655]"
            >
              Find a room
            </Link>
          </li>
        </ul>

        <div className="mt-8 rounded-2xl border border-[#dfd1bb]/90 bg-white/65 p-5 shadow-[0_10px_30px_rgba(83,66,45,0.05)] backdrop-blur-xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfcd] bg-[#f7f1e7] text-[#a1845c]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </div>

          <p className="mt-4 font-serif text-lg leading-snug text-[#332b21]">
            Make your stay memorable.
          </p>

          <p className="mt-2 text-xs leading-6 text-[#817565]">
            Explore our room collections and find the space that feels right
            for you.
          </p>

          <Link
            href="/#rooms"
            className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-[#e2d2b8] bg-[#ead9bc] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4f3d24] transition hover:border-[#d4bf98] hover:bg-[#e2cdaa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655]"
          >
            Discover rooms
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>

    {/* Footer bottom */}
    <div className="flex flex-col gap-5 pt-7 text-xs text-[#817565] sm:flex-row sm:items-center sm:justify-between">
      <p>© {new Date().getFullYear()} MOLLIS LUX. All rights reserved.</p>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] uppercase tracking-[0.18em]">
        <span>Comfort</span>
        <span
          className="h-1 w-1 rounded-full bg-[#b99b70]"
          aria-hidden="true"
        />
        <span>Elegance</span>
        <span
          className="h-1 w-1 rounded-full bg-[#b99b70]"
          aria-hidden="true"
        />
        <span>Hospitality</span>
      </div>

      <Link
        href="/"
        className="font-medium transition-colors hover:text-[#a1845c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655]"
      >
        Back to top ↑
      </Link>
    </div>
  </div>
</footer>

    </main>
  );
}