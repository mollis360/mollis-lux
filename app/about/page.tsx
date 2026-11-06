
import Image from "next/image";
import Link from "next/link";
import PublicNavbar from "@/src/components/public/public-navbar";
import ScrollReveal from "@/src/components/public/scroll-reveal";

import {
  ArrowDown,
  ArrowRight,
  Dumbbell,
  CarFront,
  Coffee,
  Flower2,
  Waves,
  Users,
  Sparkles,
  Utensils,
} from "lucide-react";

const experiences = [
  {
    number: "01",
    eyebrow: "THE ART OF HOSPITALITY",
    title: "A place where every detail matters.",
    description:
      "At MOLLIS LUX, hospitality is more than welcoming a guest. It is creating an atmosphere where comfort feels natural, service feels personal, and every moment is thoughtfully considered. From the moment you arrive, we want you to feel that you are somewhere special.",
    image: "/images/mollis-introduction.jpg",
    imageAlt: "The MOLLIS LUX hotel experience",
    imageSide: "left" as const,
  },
  {
    number: "02",
    eyebrow: "DESIGNED FOR COMFORT",
    title: "Your own private world of relaxation.",
    description:
      "A memorable stay begins with a space that allows you to unwind. Our accommodation combines elegant interiors, inviting surroundings, and carefully considered comfort to create a welcoming retreat after a busy day.",
    image: "/images/room-category-banner.jpg",
    imageAlt: "Elegant accommodation at MOLLIS LUX",
    imageSide: "right" as const,
  },
  {
    number: "03",
    eyebrow: "MORE THAN A STAY",
    title: "Everything you need, beautifully brought together.",
    description:
      "Whether you are visiting to relax, stay active, enjoy exceptional dining, or bring people together, MOLLIS LUX offers experiences designed to make your time with us more enjoyable. Discover a hotel where leisure, wellness, dining, and hospitality come together.",
    image: "/images/mollis_lux.jpg",
    imageAlt: "The MOLLIS LUX hospitality experience",
    imageSide: "left" as const,
  },
];

const facilities = [
  {
    icon: Waves,
    name: "Swimming Pool",
    description:
      "Take a refreshing swim or enjoy a peaceful moment beside the water.",
  },
  {
    icon: Utensils,
    name: "Restaurant",
    description:
      "Enjoy a welcoming dining experience with delicious food and thoughtful service.",
  },
  {
    icon: Coffee,
    name: "Bar",
    description: "Unwind and enjoy a relaxed atmosphere at our hotel bar.",
  },
  {
    icon: Dumbbell,
    name: "Fitness Centre",
    description:
      "Keep up with your fitness routine in our fully equipped gym.",
  },
  {
    icon: Flower2,
    name: "Spa & Wellness",
    description:
      "Make time for relaxation and personal wellness during your stay.",
  },
  {
    icon: Users,
    name: "Conference Facilities",
    description:
      "Bring people together in spaces designed for meetings and professional gatherings.",
  },
  {
    icon: CarFront,
    name: "Parking",
    description:
      "Enjoy the added convenience of parking facilities during your visit.",
  },
];

const rooms = [
  {
    name: "Classic King Room",
    description:
      "An inviting retreat designed around simplicity, comfort, and understated elegance.",
    image: "/images/rooms/classic-king.jpg",
    slug: "classic-king-room",
  },
  {
    name: "Deluxe King Room",
    description:
      "A refined accommodation experience with an elevated sense of space and comfort.",
    image: "/images/rooms/deluxe-king.jpg",
    slug: "deluxe-king-room",
  },
  {
    name: "Executive King Room",
    description:
      "A sophisticated setting for guests who appreciate additional comfort and refinement.",
    image: "/images/rooms/executive-king.jpg",
    slug: "executive-king-room",
  },
  {
    name: "Presidential Suite",
    description:
      "An exceptional accommodation experience created for an indulgent and memorable stay.",
    image: "/images/rooms/presidential-suite.jpg",
    slug: "presidential-suite",
  },
];

export default function AboutPage() {
  return (
    <main className="overflow-x-clip bg-[#faf8f4] text-[#29251f]">
      <PublicNavbar />

      {/* 1. ARRIVAL */}
      <section className="relative flex min-h-[680px] items-center overflow-hidden bg-[#29251f] md:min-h-[780px]">
        <Image
          src="/images/mollis-hero.jpg"
          alt="Welcome to MOLLIS LUX"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#171511]/88 via-[#171511]/55 to-[#171511]/18" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#171511]/55 via-transparent to-[#171511]/15" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-32 md:px-12 lg:px-16">
          <ScrollReveal direction="up" delay={150}>
            <div className="max-w-3xl">
              <div className="mb-7 flex items-center gap-3">
                <span className="h-px w-12 bg-[#d8bd91]" />

                <p className="text-xs font-medium tracking-[0.35em] text-[#e6d3b4]">
                  THE MOLLIS LUX EXPERIENCE
                </p>
              </div>

              <h1 className="font-serif text-5xl leading-[1.1] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
                A stay beyond
                <span className="mt-2 block italic text-[#e4c99f]">
                  expectations.
                </span>
              </h1>

              <p className="mt-8 max-w-xl text-base leading-8 text-white/80 md:text-lg">
                This is where arrival becomes quieter, details become
                intentional, and hospitality begins to feel personal. Welcome
                to MOLLIS LUX.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-5">
                <Link
                  href="/#rooms"
                  className="group inline-flex min-h-14 items-center gap-3 rounded-full bg-[#ead9bc] px-7 py-4 text-xs font-semibold tracking-[0.16em] text-[#4f3d24] transition duration-300 hover:-translate-y-1 hover:bg-[#e2cdaa] hover:shadow-xl"
                >
                  EXPLORE OUR ROOMS
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  href="/#contact"
                  className="text-xs font-medium tracking-[0.16em] text-white transition hover:text-[#e4c99f]"
                >
                  GET IN TOUCH
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <div className="absolute bottom-9 right-8 z-10 hidden items-center gap-3 text-[10px] tracking-[0.25em] text-white/70 md:flex">
          <span>CONTINUE THE STORY</span>
          <ArrowDown
            aria-hidden="true"
            className="h-4 w-4 animate-bounce"
          />
        </div>
      </section>

      {/* 2. PHILOSOPHY */}
      <section className="px-6 py-24 md:px-12 md:py-32 lg:px-16">
        <ScrollReveal>
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <p className="mb-5 text-xs font-semibold tracking-[0.3em] text-[#a1845c]">
                WELCOME TO MOLLIS LUX
              </p>

              <h2 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl md:text-6xl">
                Hospitality with
                <span className="italic text-[#a1845c]"> purpose.</span>
              </h2>
            </div>

            <div className="max-w-2xl lg:pb-2">
              <p className="text-base leading-8 text-[#70685d] md:text-lg">
                We believe a hotel should do more than provide a room. It
                should create rhythm, quiet, and a sense of belonging. At
                MOLLIS LUX, every space and service is shaped around that idea
                — from the way you arrive to the way you rest.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 3. LIVING THE EXPERIENCE */}
      <section className="space-y-20 px-6 pb-24 md:space-y-28 md:px-12 md:pb-32 lg:px-16">
        {experiences.map((experience, index) => (
          <ScrollReveal
            key={experience.number}
            direction={index % 2 === 0 ? "left" : "right"}
          >
            <article className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-20">
              <div
                className={`group relative aspect-[4/3] overflow-hidden rounded-[1.5rem] ${
                  experience.imageSide === "right"
                    ? "lg:order-2"
                    : "lg:order-1"
                }`}
              >
                <Image
                  src={experience.image}
                  alt={experience.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition duration-1000 group-hover:scale-105"
                />

                <div className="absolute inset-0 border border-white/20" />
              </div>

              <div
                className={`flex flex-col justify-center ${
                  experience.imageSide === "right"
                    ? "lg:order-1"
                    : "lg:order-2"
                }`}
              >
                <div className="mb-7 flex items-center gap-4">
                  <span className="font-serif text-3xl italic text-[#c3a477]">
                    {experience.number}
                  </span>

                  <span className="h-px w-12 bg-[#c3a477]" />

                  <p className="text-[10px] font-semibold tracking-[0.25em] text-[#a1845c]">
                    {experience.eyebrow}
                  </p>
                </div>

                <h2 className="max-w-xl font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
                  {experience.title}
                </h2>

                <p className="mt-7 max-w-xl text-sm leading-8 text-[#746c61] md:text-base">
                  {experience.description}
                </p>

                <div className="mt-9 h-px w-20 bg-[#c3a477]" />
              </div>
            </article>
          </ScrollReveal>
        ))}
      </section>

      {/* 4. FACILITIES */}
      <section className="bg-[#29251f] px-6 py-24 text-white md:px-12 md:py-32 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-5 text-xs font-semibold tracking-[0.3em] text-[#d5b98d]">
                THE ART OF LIVING WELL
              </p>

              <h2 className="font-serif text-4xl leading-tight sm:text-5xl md:text-6xl">
                A stay shaped by
                <span className="block italic text-[#d5b98d]">
                  more than the room.
                </span>
              </h2>

              <p className="mt-7 text-sm leading-8 text-white/60 md:text-base">
                Dining, wellness, movement, and gathering spaces complete the
                rhythm of your visit — each designed to feel considered, not
                crowded.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-16 grid gap-px overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {facilities.map((facility, index) => {
              const Icon = facility.icon;

              return (
                <ScrollReveal
                  key={facility.name}
                  delay={(index % 3) * 100}
                  className="h-full"
                >
                  <div className="group h-full bg-[#302b24] p-8 transition duration-300 hover:bg-[#3b3328] md:p-10">
                    <Icon
                      aria-hidden="true"
                      className="h-7 w-7 text-[#d5b98d] transition-transform duration-300 group-hover:-translate-y-1"
                    />

                    <h3 className="mt-7 font-serif text-2xl">
                      {facility.name}
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-white/55">
                      {facility.description}
                    </p>

                    <div className="mt-7 h-px w-10 bg-[#c3a477] transition-all duration-300 group-hover:w-16" />
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. ACCOMMODATION */}
      <section className="px-6 py-24 md:px-12 md:py-32 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <p className="mb-5 text-xs font-semibold tracking-[0.3em] text-[#a1845c]">
                  FIND YOUR PERFECT SPACE
                </p>

                <h2 className="font-serif text-4xl leading-tight sm:text-5xl md:text-6xl">
                  Rooms made for
                  <span className="italic text-[#a1845c]"> unwinding.</span>
                </h2>

                <p className="mt-6 max-w-xl text-sm leading-8 text-[#746c61] md:text-base">
                  Each collection is a different chapter of the same idea: a
                  room that feels calm, intentional, and ready for rest.
                </p>
              </div>

              <Link
                href="/#rooms"
                className="group inline-flex shrink-0 items-center gap-3 text-xs font-semibold tracking-[0.15em] text-[#92734a] transition hover:text-[#5c4930]"
              >
                VIEW ALL ROOMS
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </ScrollReveal>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {rooms.map((room, index) => (
              <ScrollReveal
                key={room.slug}
                delay={index * 100}
                className="h-full"
              >
                <Link href={`/rooms/${room.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-[#e8e0d4]">
                    <Image
                      src={room.image}
                      alt={room.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-80" />

                    <span className="absolute bottom-5 left-5 font-serif text-3xl italic text-white/90">
                      0{index + 1}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3 pt-5">
                    <div>
                      <h3 className="font-serif text-xl transition-colors group-hover:text-[#a1845c]">
                        {room.name}
                      </h3>

                      <p className="mt-3 text-sm leading-7 text-[#81786c]">
                        {room.description}
                      </p>
                    </div>

                    <ArrowRight
                      aria-hidden="true"
                      className="mt-1 h-5 w-5 shrink-0 text-[#a1845c] transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6. OUR PROMISE */}
      <section className="relative overflow-hidden bg-[#eee7dc] px-6 py-24 md:px-12 md:py-32 lg:px-16">
        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full border border-[#c5ae8c]/30" />

        <div className="pointer-events-none absolute -right-10 -top-14 h-60 w-60 rounded-full border border-[#c5ae8c]/30" />

        <ScrollReveal>
          <div className="relative mx-auto max-w-4xl text-center">
            <Sparkles
              aria-hidden="true"
              className="mx-auto h-7 w-7 text-[#a1845c]"
            />

            <p className="mt-7 text-xs font-semibold tracking-[0.3em] text-[#a1845c]">
              OUR PROMISE
            </p>

            <h2 className="mt-6 font-serif text-4xl leading-tight sm:text-5xl md:text-6xl">
              More than a destination.
              <span className="block italic text-[#a1845c]">
                A feeling worth returning to.
              </span>
            </h2>

            <p className="mx-auto mt-8 max-w-2xl text-sm leading-8 text-[#746c61] md:text-base">
              The best stays linger. That is why we shape comfort,
              hospitality, and atmosphere carefully — so the experience
              remains with you long after checkout.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* 7. FINAL INVITATION */}
      <section className="relative overflow-hidden bg-[#211e19] px-6 py-24 text-center text-white md:px-12 md:py-32">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/images/mollis_lux.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <div className="absolute inset-0 bg-[#211e19]/82" />

        <ScrollReveal>
          <div className="relative z-10 mx-auto max-w-3xl">
            <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-[#d5b98d]">
              YOUR EXPERIENCE BEGINS HERE
            </p>

            <h2 className="font-serif text-4xl leading-tight sm:text-5xl md:text-7xl">
              Your next memorable stay
              <span className="block italic text-[#d5b98d]">
                starts at MOLLIS LUX.
              </span>
            </h2>

            <p className="mx-auto mt-7 max-w-xl text-sm leading-8 text-white/65 md:text-base">
              Choose the room that feels right, and let the rest of the stay
              unfold with intention.
            </p>

            <Link
              href="/#rooms"
              className="group mt-10 inline-flex min-h-14 items-center gap-4 rounded-full bg-[#ead9bc] px-8 py-5 text-xs font-semibold tracking-[0.17em] text-[#4f3d24] transition duration-300 hover:-translate-y-1 hover:bg-[#e2cdaa] hover:shadow-xl"
            >
              DISCOVER YOUR STAY
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}
