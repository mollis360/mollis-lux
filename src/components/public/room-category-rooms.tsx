"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import RoomCard from "@/src/components/public/room-card";
import { loadMorePublicRooms } from "@/src/lib/rooms/public-actions";

type Room = Awaited<ReturnType<typeof loadMorePublicRooms>>[number];

type RoomCategoryDetails = {
  name: string;
  shortDescription: string | null;
  description: string | null;
  basePrice: number | string | null;
  maxAdults: number;
  maxChildren: number;
  roomSize: number | string | null;
  bedType: string | null;
  features: {
    id: string;
    name: string;
  }[];
};

type RoomCategoryRoomsProps = {
  categoryId: string;
  categorySlug: string;
  categoryDetails: RoomCategoryDetails;
  initialRooms: Room[];
};

const PAGE_SIZE = 8;

export default function RoomCategoryRooms(props: RoomCategoryRoomsProps) {
  const initialRoomIds = props.initialRooms.map((room) => room.id).join(",");

  return (
    <RoomCategoryRoomsContent
      key={`${props.categoryId}:${initialRoomIds}`}
      {...props}
    />
  );
}

function RoomCategoryRoomsContent({
  categoryId,
  categorySlug,
  categoryDetails,
  initialRooms,
}: RoomCategoryRoomsProps) {
  const [rooms, setRooms] = useState(initialRooms);
  const [hasMore, setHasMore] = useState(initialRooms.length === PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore || !categoryId) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const nextRooms = await loadMorePublicRooms(categoryId, rooms.length);

      setRooms((current) => {
        const existingIds = new Set(current.map((room) => room.id));

        return [
          ...current,
          ...nextRooms.filter((room) => !existingIds.has(room.id)),
        ];
      });

      setHasMore(nextRooms.length === PAGE_SIZE);
    } catch {
      setError("More rooms could not be loaded. Please try again.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [categoryId, hasMore, rooms.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !hasMore || error) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "300px" },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore, error, loadMore]);

  if (rooms.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white px-6 py-12 text-center">
        <p className="font-medium text-stone-800">
          No rooms are currently available in this category.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            categorySlug={categorySlug}
            categoryDetails={categoryDetails}
          />
        ))}
      </div>

      <div
        ref={sentinelRef}
        className="flex min-h-16 items-center justify-center py-6"
      >
        {loading && (
          <p className="text-sm text-stone-500">Loading more rooms...</p>
        )}

        {error && (
          <button
            type="button"
            onClick={() => void loadMore()}
            className="text-sm font-medium text-stone-700 underline underline-offset-4 hover:text-stone-950"
          >
            {error} Retry
          </button>
        )}

        {!loading && !error && !hasMore && (
          <p className="text-sm text-stone-500">
            You’ve reached the end of this collection.
          </p>
        )}
      </div>
    </>
  );
}