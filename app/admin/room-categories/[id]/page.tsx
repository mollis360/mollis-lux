import { notFound } from "next/navigation";

import ClassicKingRoomCategory from "@/src/components/admin/room-categories/classic-king-room-category";
import DeluxeKingRoomCategory from "@/src/components/admin/room-categories/deluxe-king-room-category";
import ExecutiveKingRoomCategory from "@/src/components/admin/room-categories/executive-king-room-category";
import PresidentialSuiteCategory from "@/src/components/admin/room-categories/presidential-suite-category";
import { getRoomCategoryDetails } from "@/src/lib/rooms/queries";

export default async function RoomCategoryAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const category = await getRoomCategoryDetails(id);

  if (!category) {
    notFound();
  }

  switch (category.slug) {
    case "classic-king-room":
      return (
        <ClassicKingRoomCategory
          category={category}
          rooms={category.rooms}
        />
      );

    case "deluxe-king-room":
      return (
        <DeluxeKingRoomCategory
          category={category}
          rooms={category.rooms}
        />
      );

    case "executive-king-room":
      return (
        <ExecutiveKingRoomCategory
          category={category}
          rooms={category.rooms}
        />
      );

    case "presidential-suite":
      return (
        <PresidentialSuiteCategory
          category={category}
          rooms={category.rooms}
        />
      );

    default:
      notFound();
  }
}
