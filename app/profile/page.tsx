
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { requireAuthenticatedUser } from "@/src/lib/auth/server";
import SignOutButton from "@/src/components/public/sign-out-button";
import ProfileNameEditor from "@/src/components/public/profile-name-editor";

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function ProfilePage() {
  const session = await requireAuthenticatedUser({
    disableCookieCache: true,
  });

  const user = session.user;

  return (
    <main className="min-h-screen bg-[#f8f6f2] px-4 py-10 text-[#29251f] sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Back navigation */}
        <Link
          href="/"
          className="group mb-9 inline-flex items-center gap-2 rounded-full text-sm font-medium text-[#8b7658] transition hover:text-[#5f4a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655] focus-visible:ring-offset-4"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-1"
            aria-hidden="true"
          />
          Back to homepage
        </Link>

        {/* Page heading */}
        <header className="mb-9 sm:mb-11">
          <div className="flex items-center gap-2">
            <span className="h-px w-8 bg-[#b69a70]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#a1845c]">
              MOLLIS LUX
            </p>
          </div>

          <h1 className="mt-4 font-serif text-4xl tracking-tight text-[#29251f] sm:text-5xl lg:text-6xl">
            Your personal space.
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-[#777067] sm:text-base">
            Welcome to your account. Manage your personal information,
            keep track of your reservations and stay connected with
            everything MOLLIS LUX has to offer.
          </p>
        </header>

        {/* Profile card */}
        <section className="overflow-hidden rounded-[2rem] border border-[#e9e1d5] bg-white/90 shadow-[0_24px_80px_rgba(48,39,27,0.07)] backdrop-blur-sm">
          {/* Profile hero */}
          <div className="relative overflow-hidden border-b border-[#eee8df] bg-gradient-to-br from-[#fbf9f5] via-[#f8f4ed] to-[#f0e8dc] px-6 py-9 sm:px-9 sm:py-11">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#e9d8bd]/50 blur-3xl"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-white/70 blur-3xl"
            />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
              {/* Avatar */}
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-[#dfcfb7] bg-gradient-to-br from-white to-[#e9ddca] font-serif text-3xl text-[#94764d] shadow-[0_8px_25px_rgba(90,70,42,0.10)] ring-4 ring-white/60">
                {getInitials(user.name || "Guest")}
              </div>

              {/* User information */}
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e8dcc9] bg-white/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8b7049]">
                    <Sparkles size={12} aria-hidden="true" />
                    Guest account
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e8dcc9] bg-[#f7f1e8] px-3 py-1.5 text-[10px] font-medium capitalize text-[#8b7049]">
                    <ShieldCheck size={12} aria-hidden="true" />
                    {user.role}
                  </span>
                </div>

                <ProfileNameEditor initialName={user.name} />

                <p className="mt-3 break-all text-sm text-[#777067]">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Account information */}
          <div className="p-6 sm:p-9">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-serif text-2xl text-[#29251f]">
                  Account information
                </h2>

                <p className="mt-2 text-sm text-[#898174]">
                  Your personal account details.
                </p>
              </div>

              <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a1845c] sm:inline">
                Personal details
              </span>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {/* Full name */}
              <div className="group rounded-2xl border border-[#eee8df] bg-[#fffdf9] p-5 transition duration-300 hover:border-[#d9c8ad] hover:shadow-[0_8px_25px_rgba(48,39,27,0.04)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f7f3ed] text-[#9b8059] transition group-hover:bg-[#eee3d2]">
                    <UserRound size={19} aria-hidden="true" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-[#928a80]">
                      Full name
                    </p>

                    <p className="mt-2 break-words text-sm font-medium text-[#29251f]">
                      {user.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="group rounded-2xl border border-[#eee8df] bg-[#fffdf9] p-5 transition duration-300 hover:border-[#d9c8ad] hover:shadow-[0_8px_25px_rgba(48,39,27,0.04)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f7f3ed] text-[#9b8059] transition group-hover:bg-[#eee3d2]">
                    <Mail size={19} aria-hidden="true" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-[#928a80]">
                      Email address
                    </p>

                    <p className="mt-2 break-all text-sm font-medium text-[#29251f]">
                      {user.email}
                    </p>

                    <p className="mt-2 text-xs text-[#928a80]">
                      {user.emailVerified
                        ? "Email verified"
                        : "Email not verified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account role */}
              <div className="group rounded-2xl border border-[#eee8df] bg-[#fffdf9] p-5 transition duration-300 hover:border-[#d9c8ad] hover:shadow-[0_8px_25px_rgba(48,39,27,0.04)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f7f3ed] text-[#9b8059] transition group-hover:bg-[#eee3d2]">
                    <ShieldCheck size={19} aria-hidden="true" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-[#928a80]">
                      Account role
                    </p>

                    <p className="mt-2 text-sm font-medium capitalize text-[#29251f]">
                      {user.role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Member since */}
              <div className="group rounded-2xl border border-[#eee8df] bg-[#fffdf9] p-5 transition duration-300 hover:border-[#d9c8ad] hover:shadow-[0_8px_25px_rgba(48,39,27,0.04)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f7f3ed] text-[#9b8059] transition group-hover:bg-[#eee3d2]">
                    <CalendarDays size={19} aria-hidden="true" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-[#928a80]">
                      Member since
                    </p>

                    <p className="mt-2 text-sm font-medium text-[#29251f]">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account navigation */}
            <div className="mt-9 flex flex-col gap-3 border-t border-[#eee8df] pt-7 sm:flex-row">
              <Link
                href="/my-reservations"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#a88a60] px-7 py-3 text-sm font-medium text-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-[#92744c] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655] focus-visible:ring-offset-2"
              >
                View my reservations

                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>

              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#e5ddd1] bg-white px-7 py-3 text-sm font-medium text-[#655b4e] transition duration-300 hover:-translate-y-0.5 hover:border-[#cdbb9e] hover:bg-[#faf8f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78655] focus-visible:ring-offset-2"
              >
                Explore MOLLIS LUX
              </Link>
            </div>
          </div>

          {/* Account security */}
          <div className="border-t border-[#eee8df] bg-[#fbf9f5] px-6 py-7 sm:px-9">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-lg">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    size={17}
                    className="text-[#a1845c]"
                    aria-hidden="true"
                  />

                  <h3 className="text-sm font-semibold text-[#29251f]">
                    Account security
                  </h3>
                </div>

                <p className="mt-2 text-sm leading-6 text-[#777067]">
                  Keep your account secure. Sign out of your MOLLIS LUX
                  account on this device when you are finished.
                </p>
              </div>

              <div className="shrink-0">
                <SignOutButton />
              </div>
            </div>
          </div>
        </section>

        {/* Bottom note */}
        <div className="mt-8 text-center">
          <p className="font-serif text-sm italic text-[#a1845c]">
            MOLLIS LUX — A more personal kind of hospitality.
          </p>
        </div>
      </div>
    </main>
  );
}
