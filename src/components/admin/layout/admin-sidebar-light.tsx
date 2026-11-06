
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BedDouble,
  CalendarDays,
  ExternalLink,
  House,
  LayoutDashboard,
  Plus,
  Settings2,
} from "lucide-react";

type AdminSidebarCategory = {
  id: string;
  name: string;
  slug: string;
};

type AdminSidebarLightProps = {
  categories: AdminSidebarCategory[];
};

const primaryNavigation = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Add Room",
    href: "/admin/rooms/new",
    icon: Plus,
  },
] as const;

const secondaryNavigation = [
  {
    label: "All Rooms",
    href: "/admin/rooms",
    icon: BedDouble,
  },
  {
    label: "Reservations",
    href: "/admin/reservations",
    icon: CalendarDays,
  },
  {
    label: "Hotel Settings",
    href: "/admin/hotel",
    icon: Settings2,
  },
] as const;

export default function AdminSidebarLight({
  categories,
}: AdminSidebarLightProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact = false) => {
    if (exact) {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const desktopLinkClass = (active: boolean) =>
    [
      "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all duration-200",
      active
        ? "border border-amber-200/90 bg-amber-50 font-medium text-neutral-950 shadow-[0_8px_20px_rgba(180,140,60,0.08)]"
        : "border border-transparent text-neutral-600 hover:border-neutral-200 hover:bg-neutral-50 hover:text-neutral-950",
    ].join(" ");

  const mobileLinkClass = (active: boolean) =>
    [
      "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2.5 text-xs font-medium whitespace-nowrap transition-all duration-200",
      active
        ? "border-neutral-900 bg-neutral-900 text-white shadow-sm"
        : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-950",
    ].join(" ");

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-neutral-200/80 bg-white/90 backdrop-blur-xl lg:block">
        <div className="flex h-full flex-col px-5 py-6">
          <Link
            href="/"
            className="group rounded-2xl px-3 py-2 transition hover:bg-neutral-50"
            aria-label="MOLLIS LUX homepage"
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-amber-700">
              MOLLIS LUX
            </p>

            <h2 className="mt-2 font-serif text-2xl tracking-tight text-neutral-950">
              Administration
            </h2>

            <p className="mt-1 text-xs text-neutral-500">
              Hotel operations
            </p>
          </Link>

          <nav
            aria-label="Admin navigation"
            className="mt-8 flex-1 space-y-1 overflow-y-auto pr-1"
          >
            {primaryNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, true);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={desktopLinkClass(active)}
                >
                  <Icon
                    size={18}
                    strokeWidth={1.7}
                    className={
                      active
                        ? "text-amber-700"
                        : "text-neutral-400 group-hover:text-neutral-700"
                    }
                  />

                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="my-5 border-t border-neutral-200/80" />

            <p className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Room Categories
            </p>

            {categories.length > 0 ? (
              categories.map((category) => {
                const href = `/admin/room-categories/${category.id}`;
                const active = isActive(href);

                return (
                  <Link
                    key={category.id}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={desktopLinkClass(active)}
                    title={category.name}
                  >
                    <BedDouble
                      size={17}
                      strokeWidth={1.7}
                      className={
                        active
                          ? "text-amber-700"
                          : "text-neutral-400 group-hover:text-neutral-700"
                      }
                    />

                    <span className="min-w-0 flex-1 truncate">
                      {category.name}
                    </span>
                  </Link>
                );
              })
            ) : (
              <p className="px-4 py-2 text-xs leading-5 text-neutral-400">
                No categories yet
              </p>
            )}

            <div className="my-5 border-t border-neutral-200/80" />

            {secondaryNavigation.map((item) => {
              const Icon = item.icon;

              // All Rooms is active only on its own page.
              // Reservations and Hotel Settings remain active on their detail pages.
              const active = isActive(
                item.href,
                item.href === "/admin/rooms",
              );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={desktopLinkClass(active)}
                >
                  <Icon
                    size={18}
                    strokeWidth={1.7}
                    className={
                      active
                        ? "text-amber-700"
                        : "text-neutral-400 group-hover:text-neutral-700"
                    }
                  />

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 border-t border-neutral-200/80 pt-4">
            <Link
              href="/"
              className="group flex items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-neutral-950"
            >
              <span className="flex items-center gap-3">
                <House size={18} strokeWidth={1.7} />
                Homepage
              </span>

              <ExternalLink
                size={15}
                className="text-neutral-400 transition group-hover:text-amber-700"
              />
            </Link>

            <p className="mt-4 px-3 text-[11px] leading-5 text-neutral-400">
              MOLLIS LUX
              <span className="block">Hotel management</span>
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile navigation */}
      <div className="sticky top-0 z-30 border-b border-neutral-200/80 bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <nav
          aria-label="Mobile admin navigation"
          className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {primaryNavigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, true);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={mobileLinkClass(active)}
              >
                <Icon size={15} />
                {item.label}
              </Link>
            );
          })}

          {categories.map((category) => {
            const href = `/admin/room-categories/${category.id}`;
            const active = isActive(href);

            return (
              <Link
                key={category.id}
                href={href}
                aria-current={active ? "page" : undefined}
                className={mobileLinkClass(active)}
              >
                <BedDouble size={15} />
                {category.name}
              </Link>
            );
          })}

          {secondaryNavigation.map((item) => {
            const active = isActive(
              item.href,
              item.href === "/admin/rooms",
            );
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={mobileLinkClass(active)}
              >
                <Icon size={15} />
                {item.label}
              </Link>
            );
          })}

          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-neutral-800 transition hover:bg-amber-100"
          >
            <House size={15} />
            Homepage
            <ExternalLink size={12} />
          </Link>
        </nav>
      </div>
    </>
  );
}
