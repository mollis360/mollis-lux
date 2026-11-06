import type { ReactNode } from "react";

import { requireAdmin } from "@/src/lib/auth/server";
import { getRoomCategories } from "@/src/lib/rooms/queries";

import AdminSidebarLight from "@/src/components/admin/layout/admin-sidebar-light";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();

  const categories = await getRoomCategories();

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <AdminSidebarLight categories={categories} />

      <div className="min-h-screen lg:pl-72">
        <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
