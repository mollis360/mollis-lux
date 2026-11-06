import RoomCard from "@/src/components/admin/rooms/room-card";
import type {
  RoomCategory,
  RoomWithImages,
} from "@/src/lib/rooms/types";

type RoomCategoryDetails = {
  shortDescription?: string | null;
  description?: string | null;
  maxAdults?: number | null;
  maxChildren?: number | null;
  roomSize?: string | number | null;
  bedType?: string | null;
  basePrice?: string | number | null;
};

type RoomGridProps = {
  rooms: RoomWithImages[];
  fallbackName: string;
  label?: string;
  category?: RoomCategory;
  categorySlug?: string;
  categoryDetails?: RoomCategoryDetails;
};

export default function RoomGrid({
  rooms,
  fallbackName,
  label = "Room",
  category,
  categorySlug: categorySlugProp,
  categoryDetails: categoryDetailsProp,
}: RoomGridProps) {
  const categorySlug = categorySlugProp ?? category?.slug;

  const categoryDetails =
    categoryDetailsProp ??
    (category
      ? {
          shortDescription: category.shortDescription,
          description: category.description,
          maxAdults: category.maxAdults,
          maxChildren: category.maxChildren,
          roomSize: category.roomSize,
          bedType: category.bedType,
          basePrice: category.basePrice,
        }
      : undefined);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          fallbackName={fallbackName}
          label={label}
          categorySlug={categorySlug}
          categoryDetails={categoryDetails}
        />
      ))}
    </div>
  );
}