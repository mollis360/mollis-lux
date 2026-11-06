
"use client";

import { useRef, useState, type TouchEvent } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Images,
} from "lucide-react";

type RoomGalleryImage = {
  id: string;
  imageUrl: string;
  altText: string | null;
  isCover: boolean;
};

type RoomImageGalleryProps = {
  roomNumber: string | number;
  roomName: string | null;
  images: RoomGalleryImage[];
};

export default function RoomImageGallery({
  roomNumber,
  roomName,
  images,
}: RoomImageGalleryProps) {
  const initialCoverIndex = images.findIndex((image) => image.isCover);

  const [activeImageId, setActiveImageId] = useState<string | null>(
    images[initialCoverIndex >= 0 ? initialCoverIndex : 0]?.id ?? null,
  );

  const [failedImages, setFailedImages] = useState<string[]>([]);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const imageCount = images.length;
  const visibleImageCount = Math.min(imageCount, 5);

  const requestedActiveIndex =
    activeImageId === null
      ? -1
      : images.findIndex((image) => image.id === activeImageId);

  const coverIndex = images.findIndex((image) => image.isCover);

  const activeIndex =
    requestedActiveIndex >= 0
      ? requestedActiveIndex
      : coverIndex >= 0
        ? coverIndex
        : 0;

  const activeImage = images[activeIndex];

  function getImageKey(image: RoomGalleryImage) {
    return `${image.id}:${image.imageUrl}`;
  }

  function showImage(index: number) {
    if (imageCount === 0) {
      return;
    }

    const nextIndex = (index + imageCount) % imageCount;
    const nextImage = images[nextIndex];

    if (nextImage) {
      setActiveImageId(nextImage.id);
    }
  }

  function markImageFailed(image: RoomGalleryImage) {
    const imageKey = getImageKey(image);

    setFailedImages((current) =>
      current.includes(imageKey) ? current : [...current, imageKey],
    );
  }

  function resetTouchTracking() {
    touchStartX.current = null;
    touchEndX.current = null;
  }

  function onTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    touchEndX.current = null;
  }

  function onTouchMove(event: TouchEvent<HTMLDivElement>) {
    touchEndX.current = event.touches[0]?.clientX ?? null;
  }

  function onTouchEnd() {
    const startX = touchStartX.current;
    const endX = touchEndX.current;

    resetTouchTracking();

    if (startX === null || endX === null) {
      return;
    }

    const distance = startX - endX;

    if (Math.abs(distance) <= 40) {
      return;
    }

    showImage(activeIndex + (distance > 0 ? 1 : -1));
  }

  const activeImageFailed =
    activeImage !== undefined &&
    failedImages.includes(getImageKey(activeImage));

  return (
    <div
      className="group relative isolate aspect-[4/3] touch-pan-y overflow-hidden bg-neutral-100"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={resetTouchTracking}
    >
      {/* Image slides */}
      {images.map((image, index) => {
        const isActive = index === activeIndex;
        const imageFailed = failedImages.includes(getImageKey(image));

        return (
          <div
            key={image.id}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none ${
              isActive
                ? "z-10 scale-100 opacity-100"
                : "pointer-events-none z-0 scale-[1.03] opacity-0"
            }`}
          >
            {!imageFailed ? (
              <Image
                src={image.imageUrl}
                alt={
                  image.altText?.trim() ||
                  `Room ${roomNumber}${
                    roomName ? ` - ${roomName}` : ""
                  }, image ${index + 1}`
                }
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                unoptimized
                priority={isActive}
                draggable={false}
                onError={() => markImageFailed(image)}
                className="select-none object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035] motion-reduce:transform-none motion-reduce:transition-none"
              />
            ) : (
              <ImageFallback />
            )}
          </div>
        );
      })}

      {/* Empty gallery */}
      {imageCount === 0 ? (
        <div className="absolute inset-0 z-10">
          <ImageFallback />
        </div>
      ) : null}

      {/* Contrast overlay */}
      {imageCount > 0 && !activeImageFailed ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/45 via-transparent to-black/10"
        />
      ) : null}

      {/* Top labels */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-3 sm:p-4">
        <span className="max-w-[70%] truncate rounded-full border border-white/30 bg-black/25 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.15em] text-white shadow-sm backdrop-blur-md">
          Room {roomNumber}
        </span>

        {imageCount > 0 ? (
          <span
            aria-live="polite"
            aria-atomic="true"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/30 bg-black/25 px-2.5 py-1.5 text-[10px] font-medium text-white shadow-sm backdrop-blur-md"
          >
            <Images size={12} aria-hidden="true" />
            {activeIndex + 1} / {imageCount}
          </span>
        ) : null}
      </div>

      {/* Previous and next controls */}
      {imageCount > 1 ? (
        <div className="absolute inset-x-0 top-1/2 z-30 flex -translate-y-1/2 items-center justify-between px-2.5 sm:px-3">
          <button
            type="button"
            onClick={() => showImage(activeIndex - 1)}
            aria-label={`Previous image for room ${roomNumber}`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white shadow-sm backdrop-blur-md transition duration-200 hover:scale-105 hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/30 active:scale-95 motion-reduce:transform-none motion-reduce:transition-none"
          >
            <ChevronLeft size={19} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => showImage(activeIndex + 1)}
            aria-label={`Next image for room ${roomNumber}`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white shadow-sm backdrop-blur-md transition duration-200 hover:scale-105 hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/30 active:scale-95 motion-reduce:transform-none motion-reduce:transition-none"
          >
            <ChevronRight size={19} aria-hidden="true" />
          </button>
        </div>
      ) : null}

      {/* Bottom image indicators */}
      {imageCount > 0 ? (
        <div className="absolute inset-x-0 bottom-0 z-30 flex items-end justify-between gap-3 p-3 sm:p-4">
          <div
            role="group"
            aria-label="Choose room image"
            className="flex max-w-[70%] flex-wrap items-center gap-1.5"
          >
            {images.slice(0, visibleImageCount).map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => showImage(index)}
                aria-label={`Show image ${index + 1} of ${imageCount} for room ${roomNumber}`}
                aria-pressed={activeIndex === index}
                className={`h-1.5 rounded-full transition-[width,background-color] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/30 motion-reduce:transition-none ${
                  activeIndex === index
                    ? "w-7 bg-white"
                    : "w-1.5 bg-white/60 hover:bg-white/90"
                }`}
              />
            ))}
          </div>

          {activeImage?.isCover ? (
            <span className="shrink-0 rounded-full border border-white/30 bg-black/25 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-md">
              Cover image
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ImageFallback() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-neutral-100 via-stone-100 to-neutral-200 text-neutral-400">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/80 bg-white/70 shadow-sm">
        <Images size={25} strokeWidth={1.3} aria-hidden="true" />
      </div>

      <span className="text-[10px] font-medium uppercase tracking-[0.18em]">
        Room photography
      </span>
    </div>
  );
}
