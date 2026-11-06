
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ArrowDownRight,
  ArrowRight,
  BedDouble,
  CalendarDays,
  ChevronDown,
  CircleUserRound,
  DoorOpen,
  House,
  Info,
  LogOut,
  Mail,
  MapPin,
  Menu,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import { auth } from "@/src/lib/auth";
import { getActiveRoomCategories } from "@/src/lib/rooms/queries";

async function signOut() {
  "use server";

  await auth.api.signOut({
    headers: await headers(),
  });

  redirect("/");
}

export default async function PublicNavbar() {
  const [session, categories] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
    getActiveRoomCategories(),
  ]);

  const user = session?.user;
  const isAdmin = user?.role === "admin";

  const navigationLink =
    "group/link inline-flex min-h-10 items-center gap-2 rounded-full px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-700 transition-colors duration-300 hover:bg-white/80 hover:text-[#967344] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655] motion-reduce:transition-none";

  const iconClass =
    "h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover/link:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none";

  return (
    <header className="group/nav fixed inset-x-0 top-0 z-50 border-b border-transparent bg-transparent transition-[background-color,border-color,box-shadow] duration-300 hover:border-stone-200/80 hover:bg-[#fbfaf7]/95 hover:shadow-[0_12px_40px_rgba(41,37,36,0.06)] focus-within:border-stone-200/80 focus-within:bg-[#fbfaf7]/95 focus-within:shadow-[0_12px_40px_rgba(41,37,36,0.06)] motion-reduce:transition-none">
      <div className="mx-auto flex min-h-[76px] max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6 lg:min-h-[88px] lg:px-10">
        {/* Brand */}
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
            <span className="whitespace-nowrap font-serif text-xs tracking-[0.16em] text-stone-950 transition-colors group-hover/brand:text-[#967344] sm:text-base sm:tracking-[0.22em]">
              MOLLIS LUX
            </span>
            <span className="hidden text-[8px] uppercase tracking-[0.22em] text-stone-500 sm:block">
              A considered stay
            </span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-0.5 xl:flex"
        >
          <Link href="/" className={navigationLink}>
            <House className={iconClass} aria-hidden="true" />
            Home
          </Link>

          {/* Room categories menu */}
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

                    <p className="mt-2 max-w-sm text-xs leading-5 text-stone-500">
                      Explore our room categories and find a stay that suits
                      your visit.
                    </p>
                  </div>

                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#e5d6bd] bg-[#f4ecdf] text-[#967344]">
                    <BedDouble size={20} aria-hidden="true" />
                  </span>
                </div>

                {categories.length > 0 ? (
                  <div className="grid gap-2 py-4 sm:grid-cols-2">
                    {categories.map((category, index) => (
                      <Link
                        key={category.id}
                        href={`/rooms/${category.slug}`}
                        className="group/category flex min-w-0 items-center gap-3 rounded-2xl border border-transparent p-3 transition-all duration-200 hover:border-stone-200 hover:bg-white hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655] motion-reduce:transition-none"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-600 transition-colors group-hover/category:bg-[#f4ecdf] group-hover/category:text-[#967344]">
                          <BedDouble size={17} aria-hidden="true" />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-semibold text-stone-800">
                            {category.name}
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
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-sm text-stone-600">
                      Room categories will appear here soon.
                    </p>
                  </div>
                )}

                <Link
                  href="/#rooms"
                  className="group/all flex items-center justify-between gap-3 rounded-xl bg-stone-900 px-4 py-3.5 text-xs font-medium text-white transition-colors hover:bg-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655] focus-visible:ring-offset-2 motion-reduce:transition-none"
                >
                  <span className="flex items-center gap-2">
                    <DoorOpen size={15} aria-hidden="true" />
                    Explore all rooms
                  </span>
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover/all:translate-x-1 motion-reduce:transform-none"
                    aria-hidden="true"
                  />
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

        {/* Desktop account actions */}
        <div className="hidden shrink-0 items-center gap-2 xl:flex">
          {user ? (
            <>
              <Link
                href="/profile"
                className="group/profile inline-flex min-h-10 items-center gap-2 rounded-full border border-stone-300/80 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-700 transition-all duration-200 hover:border-[#c7ae87] hover:bg-white/80 hover:text-[#967344] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655] motion-reduce:transition-none"
              >
                <CircleUserRound
                  size={15}
                  className="transition-transform duration-200 group-hover/profile:scale-110 motion-reduce:transition-none"
                  aria-hidden="true"
                />
                Profile
              </Link>

              {isAdmin ? (
                <Link
                  href="/admin"
                  className="group/admin inline-flex min-h-10 items-center gap-2 rounded-full border border-[#e5d6bd] bg-[#f4ecdf] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#967344] transition-all duration-200 hover:border-[#c7ae87] hover:bg-[#eadcc7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655] focus-visible:ring-offset-2 motion-reduce:transition-none"
                >
                  <ShieldCheck size={14} aria-hidden="true" />
                  Admin
                  <ArrowRight
                    size={13}
                    className="transition-transform group-hover/admin:translate-x-0.5 motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </Link>
              ) : null}

              <form action={signOut}>
                <button
                  type="submit"
                  aria-label="Log out"
                  title="Log out"
                  className="group/logout inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300/80 text-stone-600 transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 motion-reduce:transition-none"
                >
                  <LogOut
                    size={15}
                    className="transition-transform duration-200 group-hover/logout:translate-x-0.5 motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-700 transition-colors hover:bg-white/80 hover:text-[#967344] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655] motion-reduce:transition-none"
              >
                Log in
              </Link>

              <Link
                href="/signup"
                className="group/signup inline-flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition-all duration-200 hover:bg-[#967344] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655] focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                Sign up
                <ArrowRight
                  size={13}
                  className="transition-transform group-hover/signup:translate-x-0.5 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </Link>
            </>
          )}
        </div>

        {/* Mobile and tablet navigation */}
        <details className="group/mobile relative xl:hidden">
          <summary
            aria-label="Toggle navigation menu"
            className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-stone-300/80 bg-white/30 text-stone-800 transition-all duration-200 hover:border-[#c7ae87] hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655] motion-reduce:transition-none [&::-webkit-details-marker]:hidden"
          >
            <Menu
              size={19}
              className="group-open/mobile:hidden"
              aria-hidden="true"
            />
            <X
              size={19}
              className="hidden group-open/mobile:block"
              aria-hidden="true"
            />
          </summary>

          <div className="invisible absolute right-0 top-full mt-3 max-h-[min(78vh,680px)] w-[min(360px,calc(100vw-2rem))] translate-y-2 overflow-y-auto rounded-3xl border border-stone-200 bg-[#fbfaf7] p-4 opacity-0 shadow-[0_24px_80px_rgba(41,37,36,0.15)] transition-all duration-200 group-open/mobile:visible group-open/mobile:translate-y-0 group-open/mobile:opacity-100 motion-reduce:transition-none">
            <div className="border-b border-stone-200 px-2 pb-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#9b7b4b]">
                MOLLIS LUX
              </p>
              <p className="mt-2 font-serif text-2xl text-stone-950">
                Welcome to your stay.
              </p>
            </div>

            <nav
              aria-label="Mobile navigation"
              className="flex flex-col gap-1 py-3"
            >
              <Link
                href="/"
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-stone-700 transition-colors hover:bg-white hover:text-[#967344]"
              >
                <House size={17} aria-hidden="true" />
                Home
              </Link>

              <details className="group/mobile-rooms rounded-xl">
                <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-3 py-3 text-sm text-stone-700 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655] [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-3">
                    <BedDouble size={17} aria-hidden="true" />
                    Rooms
                  </span>
                  <ChevronDown
                    size={15}
                    className="transition-transform group-open/mobile-rooms:rotate-180 motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </summary>

                <div className="ml-4 border-l border-stone-200 py-1 pl-3">
                  <Link
                    href="/#rooms"
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium text-[#967344] transition-colors hover:bg-white"
                  >
                    <ArrowRight size={13} aria-hidden="true" />
                    All rooms
                  </Link>

                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/rooms/${category.slug}`}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-stone-600 transition-colors hover:bg-white hover:text-[#967344]"
                    >
                      <BedDouble
                        size={14}
                        className="shrink-0"
                        aria-hidden="true"
                      />
                      {category.name}
                    </Link>
                  ))}
                </div>
              </details>

              <Link
                href="/my-reservations"
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-stone-700 transition-colors hover:bg-white hover:text-[#967344]"
              >
                <CalendarDays size={17} aria-hidden="true" />
                Reservation
              </Link>

              <Link
  href="/about"
  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-stone-700 transition-colors hover:bg-white hover:text-[#967344]"
>
  <Info size={17} aria-hidden="true" />
  About
</Link>

              <Link
                href="/contact"
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-stone-700 transition-colors hover:bg-white hover:text-[#967344]"
              >
                <Mail size={17} aria-hidden="true" />
                Contact us
              </Link>
            </nav>

            <div className="border-t border-stone-200 pt-3">
              {user ? (
                <div className="flex flex-col gap-1">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-stone-700 transition-colors hover:bg-white"
                  >
                    <CircleUserRound size={17} aria-hidden="true" />
                    Profile
                  </Link>

                  {isAdmin ? (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 rounded-xl border border-[#e5d6bd] bg-[#f4ecdf] px-3 py-3 text-sm text-[#967344] transition-colors hover:bg-[#eadcc7]"
                    >
                      <ShieldCheck size={17} aria-hidden="true" />
                      Admin dashboard
                    </Link>
                  ) : null}

                  <form action={signOut}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                    >
                      <LogOut size={17} aria-hidden="true" />
                      Log out
                    </button>
                  </form>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 rounded-full border border-stone-300 px-3 py-3 text-xs font-medium text-stone-700 transition-colors hover:bg-white"
                  >
                    <CircleUserRound size={15} aria-hidden="true" />
                    Log in
                  </Link>

                  <Link
                    href="/signup"
                    className="flex items-center justify-center gap-2 rounded-full bg-stone-900 px-3 py-3 text-xs font-medium text-white transition-colors hover:bg-[#967344]"
                  >
                    Sign up
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 px-2 text-[10px] tracking-wide text-stone-400">
              <MapPin size={12} aria-hidden="true" />
              A considered hotel stay
              <ArrowDownRight
                size={12}
                className="ml-auto"
                aria-hidden="true"
              />
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
