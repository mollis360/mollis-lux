import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/src/lib/auth/server";

import {
  getRoomById,
  getRoomCategories,
} from "@/src/lib/rooms/queries";

import EditRoomForm from "@/src/components/admin/rooms/edit-room-form";

export default async function EditRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const [room, categories] = await Promise.all([
    getRoomById(id),
    getRoomCategories(),
  ]);

  if (!room) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8">
      <header className="rounded-[2rem] border border-neutral-200/80 bg-white/70 p-5 shadow-sm backdrop-blur sm:p-7">
        <Link
          href={`/admin/room-categories/${room.roomCategoryId}`}
          className="text-xs uppercase tracking-[0.18em] text-neutral-400 transition hover:text-neutral-700"
        >
          ← Back to category
        </Link>

        <h1 className="mt-3 font-serif text-3xl text-neutral-900">
          Edit Room {room.roomNumber}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
          Update this physical MOLLIS LUX room, including its category,
          details, operational status, and images.
        </p>
      </header>

      <section className="rounded-[2rem] border border-neutral-200/80 bg-white/70 p-5 shadow-sm backdrop-blur sm:p-7">
        <EditRoomForm
          room={room}
          categories={categories.map((category) => ({
            id: category.id,
            name: category.name,
          }))}
        />
      </section>
    </main>
  );
}