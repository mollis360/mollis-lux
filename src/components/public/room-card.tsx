"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Building2,
  Check,
  ChevronRight,
  Images,
  Maximize2,
  Sparkles,
  Users,
  X,
} from "lucide-react";

type RoomImage = {
  id: string;
  imageUrl: string;
  publicId: string | null;
  altText: string | null;
  isCover: boolean;
  sortOrder: number;
};

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

type RoomCardProps = {
  room: {
    id: string;
    roomNumber: string;
    name: string | null;
    description: string | null;
    floor: string | null;
    images: RoomImage[];
  };
  categorySlug: string;
  categoryDetails: RoomCategoryDetails;
};

const FADE_MS = 220;
const AUTOPLAY_MS = 4500;

function getImageSrc(image: RoomImage) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (image.publicId && cloudName) {
    return `https://res.cloudinary.com/${cloudName}/image/upload/${image.publicId}`;
  }

  return image.imageUrl;
}

function getImageAlt(image: RoomImage, fallback: string) {
  return image.altText?.trim() || fallback;
}

function formatImageCount(index: number, total: number) {
  return `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
}

function formatStartingPrice(price: number | string | null) {
  if (price === null || price === "") {
    return null;
  }

  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice) || numericPrice < 0) {
    return null;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(numericPrice);
}

function displayValue(value: string | number | null) {
  if (value === null || String(value).trim() === "") {
    return null;
  }

  return String(value).trim();
}

export default function RoomCard(props: RoomCardProps) {
  return <RoomCardContent key={props.room.id} {...props} />;
}

function RoomCardContent({
  room,
  categorySlug,
  categoryDetails,
}: RoomCardProps) {
  const titleId = useId();

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoplayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const activeImageRef = useRef(0);
  const imageSignatureRef = useRef("");

  const images = [...room.images]
    .sort((a, b) => {
      if (a.isCover !== b.isCover) {
        return a.isCover ? -1 : 1;
      }

      return a.sortOrder - b.sortOrder;
    })
    .slice(0, 5);

  const imageCount = images.length;
  const imageSignature = images.map((image) => image.id).join("|");

  const [activeImage, setActiveImage] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [imageVisible, setImageVisible] = useState(true);
  const [autoplayPaused, setAutoplayPaused] = useState(false);

  const effectiveImageIndex =
    imageCount > 0 ? Math.min(activeImage, imageCount - 1) : 0;

  const currentImage = images[effectiveImageIndex];
  const roomTitle = room.name?.trim() || `Room ${room.roomNumber}`;
  const startingPrice = formatStartingPrice(categoryDetails.basePrice);
  const roomSize = displayValue(categoryDetails.roomSize);
  const bedType = displayValue(categoryDetails.bedType);

  const bookingHref = `/booking?room=${encodeURIComponent(
    categorySlug,
  )}&roomId=${encodeURIComponent(room.id)}`;

  const clearFade = useCallback(() => {
    if (fadeTimeoutRef.current !== null) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }
  }, []);

  const clearAutoplay = useCallback(() => {
    if (autoplayTimeoutRef.current !== null) {
      clearTimeout(autoplayTimeoutRef.current);
      autoplayTimeoutRef.current = null;
    }
  }, []);

  const goToImage = useCallback(
    (nextIndex: number) => {
      if (imageCount <= 1) return;

      const safeIndex = ((nextIndex % imageCount) + imageCount) % imageCount;

      if (safeIndex === activeImageRef.current) {
        return;
      }

      clearFade();
      clearAutoplay();

      activeImageRef.current = safeIndex;
      setImageVisible(false);

      fadeTimeoutRef.current = setTimeout(() => {
        setActiveImage(safeIndex);
        setImageVisible(true);
        fadeTimeoutRef.current = null;
      }, FADE_MS);
    },
    [clearAutoplay, clearFade, imageCount],
  );

  // Reset the gallery when its image list changes.
  useEffect(() => {
    if (imageSignatureRef.current === imageSignature) {
      return;
    }

    clearFade();
    clearAutoplay();

    imageSignatureRef.current = imageSignature;
    activeImageRef.current = 0;

    const resetTimeout = setTimeout(() => {
      setActiveImage(0);
      setImageVisible(true);
    }, 0);

    return () => {
      clearTimeout(resetTimeout);
      clearFade();
      clearAutoplay();
    };
  }, [imageSignature, clearFade, clearAutoplay]);

  // Clean up timers when the component unmounts.
  useEffect(() => {
    return () => {
      clearFade();
      clearAutoplay();
    };
  }, [clearFade, clearAutoplay]);

  // Advance the gallery only when it is idle.
  useEffect(() => {
    if (imageCount <= 1 || detailsOpen || autoplayPaused) {
      return;
    }

    autoplayTimeoutRef.current = setTimeout(() => {
      autoplayTimeoutRef.current = null;

      const nextIndex = (activeImageRef.current + 1) % imageCount;
      goToImage(nextIndex);
    }, AUTOPLAY_MS);

    return clearAutoplay;
  }, [
    activeImage,
    autoplayPaused,
    detailsOpen,
    imageCount,
    goToImage,
    clearAutoplay,
  ]);

  // Manage drawer focus, keyboard navigation, and page scrolling.
  useEffect(() => {
    if (!detailsOpen) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDetailsOpen(false);
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) return;

      const focusableElements =
        drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );

      const elements = Array.from(focusableElements).filter(
        (element) => element.getClientRects().length > 0,
      );

      if (elements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];

      if (
        event.shiftKey &&
        (document.activeElement === firstElement ||
          !drawerRef.current.contains(document.activeElement))
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === lastElement ||
          !drawerRef.current.contains(document.activeElement))
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    };
  }, [detailsOpen]);

  function showPreviousImage(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    const current = activeImageRef.current;
    const previousIndex = current === 0 ? imageCount - 1 : current - 1;

    goToImage(previousIndex);
  }

  function showNextImage(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    const nextIndex = (activeImageRef.current + 1) % imageCount;

    goToImage(nextIndex);
  }

  function openDetails() {
    setAutoplayPaused(true);
    setDetailsOpen(true);
  }

  function closeDetails() {
    setDetailsOpen(false);
  }

  const lightButton =
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#e4d5bd] bg-[#f8f3ea] px-4 py-2.5 text-xs font-medium text-[#715638] transition-colors duration-300 hover:border-[#c6a777] hover:bg-[#efe3cf] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b99a69] focus-visible:ring-offset-2 motion-reduce:transition-none";

  const bookingButton =
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#d9c09a] bg-[#ead9bc] px-4 py-2.5 text-xs font-semibold text-[#634b2d] transition-colors duration-300 hover:border-[#c5a16c] hover:bg-[#dfc69e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b99a69] focus-visible:ring-offset-2 motion-reduce:transition-none";

  return (
    <>
      <article
        className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-[#e9e0d2] bg-[#fffefa] shadow-[0_8px_30px_rgba(83,64,39,0.055)] transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1 hover:border-[#d5bd96] hover:shadow-[0_22px_48px_rgba(83,64,39,0.12)] motion-reduce:transform-none motion-reduce:transition-none"
        onMouseEnter={() => setAutoplayPaused(true)}
        onMouseLeave={() => setAutoplayPaused(false)}
        onFocusCapture={() => setAutoplayPaused(true)}
        onBlurCapture={(event) => {
          const nextTarget = event.relatedTarget;

          if (
            !(nextTarget instanceof Node) ||
            !event.currentTarget.contains(nextTarget)
          ) {
            setAutoplayPaused(false);
          }
        }}
      >
        {/* Room image gallery */}
        <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-[#eee7dc] sm:aspect-[5/4] lg:aspect-[4/3]">
          {currentImage ? (
            <Image
              key={currentImage.id}
              src={getImageSrc(currentImage)}
              alt={getImageAlt(currentImage, `${roomTitle} at MOLLIS LUX`)}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className={`object-cover transition-[opacity,transform] duration-700 ease-out group-hover:scale-[1.045] motion-reduce:transform-none motion-reduce:transition-none ${
                imageVisible ? "opacity-100" : "opacity-0"
              }`}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-stone-500">
              <BedDouble
                className="h-10 w-10 text-[#a78655]"
                aria-hidden="true"
              />
              <span className="text-sm">Room photography coming soon</span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-950/35 via-transparent to-stone-950/10" />

          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/70 bg-[#fffdf8]/95 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-[#715638] shadow-sm backdrop-blur-xl sm:text-[11px]">
            <BedDouble
              className="h-3.5 w-3.5 text-[#a78655]"
              aria-hidden="true"
            />
            Room {room.roomNumber}
          </div>

          {imageCount > 0 && (
            <div
              className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-white/40 bg-stone-950/30 px-3 py-2 text-[10px] font-medium tracking-[0.12em] text-white backdrop-blur-xl"
              aria-label={`Image ${effectiveImageIndex + 1} of ${imageCount}`}
            >
              <Images className="h-3.5 w-3.5" aria-hidden="true" />
              {formatImageCount(effectiveImageIndex, imageCount)}
            </div>
          )}

          {imageCount > 1 && (
            <>
              <button
                type="button"
                onClick={showPreviousImage}
                aria-label="Previous room image"
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-[#fffdf8]/95 text-[#715638] shadow-md backdrop-blur-xl transition duration-300 hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b99a69] motion-reduce:transform-none motion-reduce:transition-none sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={showNextImage}
                aria-label="Next room image"
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-[#fffdf8]/95 text-[#715638] shadow-md backdrop-blur-xl transition duration-300 hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b99a69] motion-reduce:transform-none motion-reduce:transition-none sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
              >
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>

              <div
                className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5"
                role="group"
                aria-label="Room image navigation"
              >
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => goToImage(index)}
                    aria-label={`Show image ${index + 1}`}
                    aria-current={
                      effectiveImageIndex === index ? "true" : undefined
                    }
                    className={`h-1.5 rounded-full transition-[width,background-color] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none ${
                      effectiveImageIndex === index
                        ? "w-7 bg-white"
                        : "w-1.5 bg-white/65 hover:bg-white"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Room information */}
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[#967448] sm:text-[11px]">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                MOLLIS LUX
              </p>

              <h3 className="line-clamp-2 min-h-[3.5rem] font-serif text-[1.65rem] leading-tight tracking-tight text-stone-950">
                {roomTitle}
              </h3>
            </div>

            <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e8dcc8] bg-[#fbf7ef] text-[#967448] transition duration-300 group-hover:border-[#d8c5a5] group-hover:bg-[#f1e5d1]">
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </div>

          <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-stone-600">
            {room.description?.trim() || "Discover this room at MOLLIS LUX."}
          </p>

          {startingPrice && (
            <div className="mt-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-stone-500">
                Starting from
              </p>
              <p className="mt-1 font-serif text-2xl text-[#715638]">
                {startingPrice}
              </p>
              <p className="mt-1 text-[11px] text-stone-500">
                Final price depends on your booking details.
              </p>
            </div>
          )}

          <div className="mt-5 flex min-h-10 flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#eee7dc] pt-4">
            <div className="inline-flex items-center gap-2 text-xs text-stone-500">
              <BedDouble
                className="h-4 w-4 text-[#a78655]"
                aria-hidden="true"
              />
              <span>Room {room.roomNumber}</span>
            </div>

            {room.floor && (
              <div className="inline-flex items-center gap-2 text-xs text-stone-500">
                <Building2
                  className="h-4 w-4 text-[#a78655]"
                  aria-hidden="true"
                />
                <span>Floor {room.floor}</span>
              </div>
            )}
          </div>

          <div className="mt-auto grid grid-cols-1 gap-3 pt-6 sm:grid-cols-2">
            <button
              type="button"
              onClick={openDetails}
              className={lightButton}
            >
              View Details
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>

            <Link href={bookingHref} className={bookingButton}>
              Book Now
              <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </article>

      {/* Room details drawer */}
      {detailsOpen && (
        <div
          className="fixed inset-0 z-[100] flex justify-end"
          role="presentation"
        >
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close room details"
            onClick={closeDetails}
            className="absolute inset-0 cursor-default bg-stone-950/45 backdrop-blur-sm"
          />

          <aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-white/60 bg-[#fbfaf7] shadow-2xl motion-reduce:transition-none"
          >
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-stone-200/80 bg-[#fbfaf7]/95 px-5 py-4 backdrop-blur-xl sm:px-7">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#967448]">
                  MOLLIS LUX
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  Room {room.roomNumber}
                </p>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeDetails}
                aria-label="Close room details"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e4d5bd] bg-[#f8f3ea] text-[#715638] transition duration-300 hover:border-[#c6a777] hover:bg-[#efe3cf] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b99a69] motion-reduce:transition-none"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="p-5 sm:p-7">
              {/* Physical room gallery */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-[#eee7dc] shadow-[0_15px_35px_rgba(65,49,30,0.10)]">
                {currentImage ? (
                  <Image
                    key={currentImage.id}
                    src={getImageSrc(currentImage)}
                    alt={getImageAlt(
                      currentImage,
                      `${roomTitle} at MOLLIS LUX`,
                    )}
                    fill
                    sizes="(max-width: 640px) 100vw, 576px"
                    className={`object-cover transition-opacity duration-500 ease-in-out motion-reduce:transition-none ${
                      imageVisible ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-stone-500">
                    <BedDouble
                      className="h-12 w-12 text-[#a78655]"
                      aria-hidden="true"
                    />
                    <span className="text-sm">
                      Room photography coming soon
                    </span>
                  </div>
                )}

                {imageCount > 0 && (
                  <div className="absolute bottom-3 right-3 rounded-full border border-white/40 bg-stone-950/30 px-3 py-1.5 text-[10px] tracking-[0.15em] text-white backdrop-blur-xl">
                    {formatImageCount(effectiveImageIndex, imageCount)}
                  </div>
                )}
              </div>

              {imageCount > 1 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => goToImage(index)}
                      aria-label={`View room image ${index + 1}`}
                      aria-pressed={effectiveImageIndex === index}
                      className={`relative h-[4.5rem] w-20 shrink-0 overflow-hidden rounded-xl border-2 transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b99a69] focus-visible:ring-offset-2 motion-reduce:transition-none ${
                        effectiveImageIndex === index
                          ? "border-[#b99a69] shadow-md"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={getImageSrc(image)}
                        alt={getImageAlt(
                          image,
                          `${roomTitle} image ${index + 1}`,
                        )}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />

                      {effectiveImageIndex === index && (
                        <span className="absolute inset-0 flex items-center justify-center bg-stone-950/10">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fffdf8] text-[#80613b] shadow">
                            <Check
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                          </span>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Physical room details */}
              <div className="mt-8">
                <p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.24em] text-[#967448] sm:text-[11px]">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Your room at MOLLIS LUX
                </p>

                <h2
                  id={titleId}
                  className="mt-3 font-serif text-4xl leading-tight tracking-tight text-stone-950 sm:text-5xl"
                >
                  {roomTitle}
                </h2>

                <p className="mt-4 text-sm leading-7 text-stone-600">
                  {room.description?.trim() ||
                    "Contact the hotel for more details about this room."}
                </p>
              </div>

              <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-stone-200/80 bg-white p-4 transition-colors hover:border-[#d8c5a5]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5eee3] text-[#967448]">
                    <BedDouble className="h-4 w-4" aria-hidden="true" />
                  </div>

                  <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.14em] text-stone-500">
                    Room number
                  </p>

                  <p className="mt-1.5 font-medium text-stone-900">
                    {room.roomNumber}
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-200/80 bg-white p-4 transition-colors hover:border-[#d8c5a5]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5eee3] text-[#967448]">
                    <Building2 className="h-4 w-4" aria-hidden="true" />
                  </div>

                  <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.14em] text-stone-500">
                    Floor
                  </p>

                  <p className="mt-1.5 font-medium text-stone-900">
                    {room.floor || "Not specified"}
                  </p>
                </div>
              </div>

              {/* Room category information */}
              <section className="mt-9 border-t border-stone-200 pt-7">
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#967448]">
                  Room category
                </p>

                <h3 className="mt-2 font-serif text-2xl leading-tight text-stone-950">
                  {categoryDetails.name}
                </h3>

                {categoryDetails.shortDescription?.trim() && (
                  <p className="mt-3 text-sm leading-7 text-stone-600">
                    {categoryDetails.shortDescription}
                  </p>
                )}

                {categoryDetails.description?.trim() && (
                  <p className="mt-3 text-sm leading-7 text-stone-600">
                    {categoryDetails.description}
                  </p>
                )}
              </section>

              {/* Starting price */}
              <section className="mt-6 rounded-2xl border border-[#e5d8c3] bg-[#f6f0e6] p-5">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#80613b]">
                  Starting price
                </p>

                {startingPrice ? (
                  <p className="mt-2 font-serif text-3xl text-stone-950">
                    {startingPrice}
                  </p>
                ) : (
                  <p className="mt-2 text-sm font-medium text-stone-800">
                    Price available during booking
                  </p>
                )}

                <p className="mt-2 text-xs leading-6 text-stone-600">
                  This is the category base price. Your final booking price
                  and availability are confirmed for your selected dates.
                </p>
              </section>

              {/* Category specifications */}
              <section className="mt-7">
                <h3 className="font-serif text-xl text-stone-950">
                  Room specifications
                </h3>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {bedType && (
                    <div className="rounded-2xl border border-stone-200/80 bg-white p-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5eee3] text-[#967448]">
                        <BedDouble className="h-4 w-4" aria-hidden="true" />
                      </div>

                      <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.14em] text-stone-500">
                        Bed type
                      </p>

                      <p className="mt-1.5 text-sm font-medium text-stone-900">
                        {bedType}
                      </p>
                    </div>
                  )}

                  {roomSize && (
                    <div className="rounded-2xl border border-stone-200/80 bg-white p-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5eee3] text-[#967448]">
                        <Maximize2
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      </div>

                      <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.14em] text-stone-500">
                        Room size
                      </p>

                      <p className="mt-1.5 text-sm font-medium text-stone-900">
                        {roomSize}
                      </p>
                    </div>
                  )}

                  <div className="rounded-2xl border border-stone-200/80 bg-white p-4 sm:col-span-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5eee3] text-[#967448]">
                      <Users className="h-4 w-4" aria-hidden="true" />
                    </div>

                    <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.14em] text-stone-500">
                      Guest capacity
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full border border-[#e5d8c3] bg-[#fbf7ef] px-3 py-1.5 text-xs text-stone-700">
                        {categoryDetails.maxAdults}{" "}
                        {categoryDetails.maxAdults === 1 ? "adult" : "adults"}
                      </span>

                      <span className="rounded-full border border-[#e5d8c3] bg-[#fbf7ef] px-3 py-1.5 text-xs text-stone-700">
                        {categoryDetails.maxChildren}{" "}
                        {categoryDetails.maxChildren === 1
                          ? "child"
                          : "children"}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Category features */}
              {categoryDetails.features.length > 0 && (
                <section className="mt-8">
                  <h3 className="font-serif text-xl text-stone-950">
                    Room features
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    Features listed for the {categoryDetails.name} category.
                  </p>

                  <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {categoryDetails.features.map((feature) => (
                      <li
                        key={feature.id}
                        className="flex items-start gap-3 rounded-xl border border-stone-200/80 bg-white p-3.5"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f5eee3] text-[#80613b]">
                          <Check className="h-3 w-3" aria-hidden="true" />
                        </span>

                        <span className="text-sm leading-6 text-stone-700">
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <div className="mt-7 flex items-start gap-3 rounded-2xl border border-[#e5d8c3] bg-[#f6f0e6] p-4">
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#80613b]"
                  aria-hidden="true"
                />

                <p className="text-xs leading-6 text-stone-700">
                  This drawer combines information about the physical room
                  with specifications and features from its room category.
                  Availability and the final price are checked during booking
                  for your selected dates.
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 mt-auto border-t border-stone-200/80 bg-[#fbfaf7]/95 p-5 backdrop-blur-xl sm:px-7">
              <Link
                href={bookingHref}
                className="group flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#d9c09a] bg-[#ead9bc] px-5 py-3 text-sm font-semibold text-[#634b2d] transition-colors duration-300 hover:border-[#c5a16c] hover:bg-[#dfc69e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b99a69] focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                Continue to Booking
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>

              <p className="mt-3 text-center text-[10px] tracking-wide text-stone-500">
                A refined stay begins with the right room.
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}