
import Image from "next/image";
import Link from "next/link";
import { CldImage } from "next-cloudinary";
import {
  ArrowDown,
  ArrowRight,
  BedDouble,
  CheckCircle2,
  Images,
  Sparkles,
} from "lucide-react";

import { getCloudinaryPublicConfig } from "@/src/lib/cloudinary/server";
import { getPublicRoomsByCategoryId } from "@/src/lib/rooms/queries";
import RoomCategoryRooms from "@/src/components/public/room-category-rooms";

type RoomCategorySectionProps = {
  category: {
    id: string;
    name: string;
    slug: string;
    shortDescription: string | null;
    description: string | null;
    coverImageUrl: string | null;
    coverImagePublicId: string | null;
    coverImageAltText: string | null;
    basePrice: number | string;
    maxAdults: number;
    maxChildren: number;
    roomSize: number | string | null;
    bedType: string | null;
    features: {
      id: string;
      name: string;
    }[];
  };
  priority?: boolean;
};

// Change these paths to control the homepage banner for each category.
// Place the corresponding image files inside public/images/rooms/.
const categoryBanners: Record<string, string> = {
  "classic-king-room": "/images/rooms/classic-king.jpg",
  "deluxe-king-room": "/images/rooms/deluxe-king.jpg",
  "executive-king-room": "/images/rooms/executive-king.jpg",
  "presidential-suite": "/images/rooms/presidential-suite.jpg",
};

export default async function RoomCategorySection({
  category,
  priority = false,
}: RoomCategorySectionProps) {
  const [initialRooms, cloudinaryConfig] = await Promise.all([
    getPublicRoomsByCategoryId(category.id, 8, 0),
    Promise.resolve(getCloudinaryPublicConfig()),
  ]);

  const description =
    category.shortDescription?.trim() ||
    category.description?.trim() ||
    `Discover the ${category.name} collection at MOLLIS LUX, thoughtfully presented for a more considered hotel stay.`;

  const bannerAlt =
    category.coverImageAltText?.trim() ||
    `${category.name} at MOLLIS LUX`;

  const localBanner = categoryBanners[category.slug];

  const cloudinaryPublicId = category.coverImagePublicId?.trim();
  const uploadedImageUrl = category.coverImageUrl?.trim();
  const cloudName = cloudinaryConfig?.cloudName;

  const hasCloudinaryImage = Boolean(cloudinaryPublicId && cloudName);
  const hasUploadedImage = Boolean(uploadedImageUrl);

  return (
    <section
      id={category.slug}
      aria-labelledby={`${category.slug}-heading`}
      className="relative overflow-hidden border-b border-stone-200/80 bg-[#fbfaf7] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-24"
    >
      <div className="mx-auto max-w-[1440px]">
        {/* Collection introduction */}
        <div className="mb-6 flex items-center gap-3 sm:mb-8">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#e7d9c3] bg-[#f5eee3] text-[#967344]"
            aria-hidden="true"
          >
            <Sparkles size={18} strokeWidth={1.5} />
          </span>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#967344]">
              The MOLLIS LUX collection
            </p>

            <p className="mt-1 text-xs text-stone-500">
              A space designed around your stay
            </p>
          </div>
        </div>

        {/* Cinematic category banner */}
        <div className="group/banner relative isolate min-h-[400px] overflow-hidden rounded-[1.5rem] border border-stone-900/10 bg-stone-900 shadow-[0_24px_70px_rgba(41,37,36,0.12)] sm:min-h-[460px] sm:rounded-[2rem] lg:min-h-[560px]">
          {localBanner ? (
            <Image
              src={localBanner}
              alt={bannerAlt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1440px) 95vw, 1440px"
              priority={priority}
              className="object-cover transition-transform duration-1000 ease-out group-hover/banner:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none"
            />
          ) : hasCloudinaryImage && cloudinaryPublicId && cloudName ? (
            <CldImage
              src={cloudinaryPublicId}
              config={{
                cloud: {
                  cloudName,
                },
              }}
              alt={bannerAlt}
              fill
              crop="fill"
              gravity="auto"
              sizes="(max-width: 640px) 100vw, (max-width: 1440px) 95vw, 1440px"
              priority={priority}
              className="object-cover transition-transform duration-1000 ease-out group-hover/banner:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none"
            />
          ) : hasUploadedImage && uploadedImageUrl ? (
            <Image
              src={uploadedImageUrl}
              alt={bannerAlt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1440px) 95vw, 1440px"
              priority={priority}
              className="object-cover transition-transform duration-1000 ease-out group-hover/banner:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none"
            />
          ) : (
            <Image
              src="/images/room-category-banner.jpg"
              alt={bannerAlt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1440px) 95vw, 1440px"
              priority={priority}
              className="object-cover transition-transform duration-1000 ease-out group-hover/banner:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none"
            />
          )}

          {/* Image readability overlays */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/5"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10"
          />

          {/* Decorative corner detail */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-5 top-5 hidden h-20 w-20 rounded-full border border-white/25 sm:right-8 sm:top-8 sm:block sm:h-28 sm:w-28"
          >
            <div className="absolute inset-3 rounded-full border border-white/15" />
          </div>

          {/* Banner content */}
          <div className="relative z-10 flex min-h-[400px] flex-col justify-end p-6 text-white sm:min-h-[460px] sm:p-10 lg:min-h-[560px] lg:p-14">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/20 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-md sm:text-[10px]">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-[#d8b987]"
                  aria-hidden="true"
                />
                Room collection
              </div>

              <h2
                id={`${category.slug}-heading`}
                className="mt-5 max-w-3xl break-words font-serif text-4xl leading-[1.05] tracking-tight text-white sm:mt-6 sm:text-5xl lg:text-7xl"
              >
                {category.name}

                <span className="mt-2 block font-serif text-2xl italic text-[#ead7b8] sm:text-3xl lg:text-4xl">
                  Your space to unwind.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-white/80 sm:mt-6 sm:text-base sm:leading-8">
                {description}
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  href={`/rooms/${category.slug}`}
                  className="group/explore inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#f6efe4] px-5 py-3 text-xs font-semibold text-stone-900 shadow-lg transition duration-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900 motion-reduce:transition-none sm:px-6"
                >
                  Explore this collection

                  <ArrowRight
                    size={15}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover/explore:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none"
                  />
                </Link>

                <Link
                  href="/#rooms"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/30 bg-black/15 px-5 py-3 text-xs font-medium text-white backdrop-blur-md transition duration-300 hover:border-white/60 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none"
                >
                  <Images size={15} aria-hidden="true" />
                  All collections
                </Link>
              </div>
            </div>

            {/* Banner footer */}
            <div className="mt-10 flex items-center justify-between gap-4 border-t border-white/25 pt-5 sm:mt-12 sm:pt-6">
              <div className="flex items-center gap-2 text-[9px] font-medium uppercase tracking-[0.17em] text-white/70 sm:text-[10px]">
                <BedDouble size={15} aria-hidden="true" />
                MOLLIS LUX · Considered comfort
              </div>

              <a
                href={`#${category.slug}-rooms`}
                aria-label={`Scroll to ${category.name} rooms`}
                className="group/scroll inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/30 text-white transition duration-300 hover:bg-white hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none"
              >
                <ArrowDown
                  size={16}
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover/scroll:translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Available rooms heading */}
        <div
          id={`${category.slug}-rooms`}
          className="scroll-mt-28 pb-1 pt-10 sm:scroll-mt-32 sm:pt-14 lg:pt-16"
        >
          <div className="flex flex-col gap-5 border-b border-stone-200 pb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8 sm:pb-8">
            <div className="max-w-2xl">
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#967344]">
                <span
                  className="h-px w-7 bg-[#b99a6a]"
                  aria-hidden="true"
                />
                Discover your stay
              </p>

              <h3 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-stone-950 sm:text-4xl lg:text-5xl">
                Find your place to pause.
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-7 text-stone-500 sm:text-base">
                Explore the rooms in our {category.name} collection and find
                the space that feels right for your visit.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3 self-start rounded-2xl border border-stone-200 bg-white/70 px-4 py-3 sm:self-auto">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4ecdf] text-[#967344]">
                <CheckCircle2
                  size={19}
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              </span>

              <div>
                <p className="text-xs font-semibold text-stone-800">
                  Room availability
                </p>

                <p className="mt-1 text-[10px] text-stone-500">
                  Browse the rooms below
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 sm:pt-8">
            <RoomCategoryRooms
              categoryId={category.id}
              categorySlug={category.slug}
              initialRooms={initialRooms}
              categoryDetails={{
                name: category.name,
                shortDescription: category.shortDescription,
                description: category.description,
                basePrice: category.basePrice,
                maxAdults: category.maxAdults,
                maxChildren: category.maxChildren,
                roomSize: category.roomSize,
                bedType: category.bedType,
                features: category.features.map((feature) => ({
                  id: feature.id,
                  name: feature.name,
                })),
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
