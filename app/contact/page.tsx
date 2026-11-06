
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Send,
  Sparkles,
} from "lucide-react";

import PublicNavbar from "@/src/components/public/public-navbar";
import ScrollReveal from "@/src/components/public/scroll-reveal";

const contactDetails = [
  {
    icon: Phone,
    label: "Call our team",
    value: "+1 (213) 555-0148",
    href: "tel:+12135550148",
    description: "Available daily, 24 hours",
  },
  {
    icon: Mail,
    label: "Email us",
    value: "hello@mollislux.com",
    href: "mailto:hello@mollislux.com",
    description: "We aim to respond within 24 hours",
  },
  {
    icon: MapPin,
    label: "Visit us",
    value: "Los Angeles, California, USA",
    href: "https://www.google.com/maps/search/?api=1&query=Los+Angeles+California",
    description: "We look forward to welcoming you",
  },
];

const enquiryTypes = [
  "General enquiry",
  "Reservation assistance",
  "Special requests",
  "Events and meetings",
  "Feedback",
  "Other",
];

export default function ContactPage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-[#fbfaf7] text-[#29251f]">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative flex min-h-[580px] items-center overflow-hidden bg-[#25231f]">
        <Image
          src="/images/mollis-hero.jpg"
          alt="Welcome to MOLLIS LUX"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-45"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#171612]/90 via-[#171612]/60 to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-32 sm:px-10 lg:px-16">
          <ScrollReveal direction="up" delay={150}>
            <div className="max-w-3xl">
              <span className="mb-7 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#d6bd91]">
                <Sparkles size={14} />
                We're here for you
              </span>

              <h1 className="font-serif text-5xl leading-[1.1] text-white sm:text-6xl lg:text-7xl">
                Every great stay
                <br />
                begins with a
                <span className="italic text-[#d6bd91]"> conversation.</span>
              </h1>

              <p className="mt-8 max-w-xl text-base leading-8 text-white/75 sm:text-lg">
                Whether you are planning your next stay, making a special
                request or simply have a question, our team is always happy
                to hear from you.
              </p>

              <Link
                href="#contact-details"
                className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#c4a779] px-7 py-4 text-sm font-semibold text-[#211d17] transition-all duration-300 hover:-translate-y-1 hover:bg-[#d6bd91]"
              >
                Get in touch
                <ArrowRight size={17} />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Introduction */}
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 sm:px-10 lg:grid-cols-2 lg:gap-24 lg:px-16 lg:py-32">
        <ScrollReveal direction="left">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
            <Image
              src="/images/mollis-introduction.jpg"
              alt="The welcoming atmosphere of MOLLIS LUX"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#a1845c]">
              A personal welcome
            </span>

            <h2 className="mt-6 font-serif text-4xl leading-tight text-[#302a22] sm:text-5xl">
              Hospitality begins with listening.
            </h2>

            <p className="mt-7 text-base leading-8 text-[#777064]">
              At MOLLIS LUX, we believe that exceptional hospitality goes
              beyond beautiful spaces. It is about understanding what matters
              to every guest and making every interaction feel effortless.
            </p>

            <p className="mt-5 text-base leading-8 text-[#777064]">
              Our team is ready to assist with reservations, accommodation
              questions, special arrangements and anything that can make
              your experience more memorable.
            </p>

            <div className="mt-9 h-px w-24 bg-[#c4a779]" />
            <p className="mt-5 font-serif text-xl italic text-[#9b8058]">
              Your comfort is always worth a conversation.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Contact details */}
      <section
        id="contact-details"
        className="bg-[#f2eee6] px-6 py-24 sm:px-10 lg:px-16 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#a1845c]">
                Reach out
              </span>

              <h2 className="mt-5 font-serif text-4xl text-[#302a22] sm:text-5xl">
                We'd love to hear from you.
              </h2>

              <p className="mt-5 leading-8 text-[#777064]">
                Choose the most convenient way to reach our team. We're
                always happy to help.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-3">
            {contactDetails.map((item, index) => {
              const Icon = item.icon;

              return (
                <ScrollReveal
                  key={item.label}
                  delay={index * 100}
                  className="h-full"
                >
                  <a
                    href={item.href}
                    target={item.href.startsWith("https") ? "_blank" : undefined}
                    rel={item.href.startsWith("https") ? "noreferrer" : undefined}
                    className="group flex h-full flex-col rounded-[1.75rem] border border-[#e5ded2] bg-white/75 p-8 transition-all duration-300 hover:-translate-y-2 hover:border-[#c4a779] hover:shadow-xl hover:shadow-[#6d5633]/5"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f3eee5] text-[#a1845c] transition-colors group-hover:bg-[#c4a779] group-hover:text-white">
                      <Icon size={23} strokeWidth={1.5} />
                    </div>

                    <h3 className="mt-7 font-serif text-2xl text-[#302a22]">
                      {item.label}
                    </h3>

                    <p className="mt-3 break-words text-base font-medium text-[#9b8058]">
                      {item.value}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-[#898174]">
                      {item.description}
                    </p>

                    <span className="mt-7 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6e6252]">
                      Connect with us
                      <ArrowUpRight
                        size={15}
                        className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                      />
                    </span>
                  </a>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enquiry form */}
      <section className="mx-auto grid max-w-7xl items-start gap-16 px-6 py-24 sm:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24 lg:px-16 lg:py-32">
        <ScrollReveal direction="left">
          <div className="lg:sticky lg:top-32">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#a1845c]">
              Send us a message
            </span>

            <h2 className="mt-6 font-serif text-4xl leading-tight text-[#302a22] sm:text-5xl">
              How can we make your experience better?
            </h2>

            <p className="mt-7 leading-8 text-[#777064]">
              Tell us what you have in mind. Whether it is a question about
              your stay or a request for additional information, we'd be
              delighted to assist.
            </p>

            <div className="mt-12 space-y-7 border-t border-[#e5ded2] pt-8">
              <div className="flex items-start gap-4">
                <Clock3 className="mt-1 shrink-0 text-[#a1845c]" size={20} />
                <div>
                  <h3 className="font-medium text-[#302a22]">
                    We're available
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#898174]">
                    Our guest assistance team is available around the clock.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Sparkles className="mt-1 shrink-0 text-[#a1845c]" size={20} />
                <div>
                  <h3 className="font-medium text-[#302a22]">
                    Thoughtful assistance
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#898174]">
                    Every enquiry deserves care, attention and a personal touch.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right">
          <div className="rounded-[2rem] border border-[#e9e1d5] bg-white p-7 shadow-[0_25px_80px_rgba(75,58,34,0.06)] sm:p-10 lg:p-12">
            <h3 className="font-serif text-3xl text-[#302a22]">
              Send an enquiry
            </h3>

            <p className="mt-3 text-sm leading-6 text-[#898174]">
              Complete the form below and our team will be happy to assist.
            </p>

            <form
              action="mailto:hello@mollislux.com"
              method="post"
              encType="text/plain"
              className="mt-9 space-y-6"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-medium text-[#554d42]"
                  >
                    Full name
                  </label>
                  <input
                    id="fullName"
                    name="Full name"
                    type="text"
                    placeholder="Your full name"
                    required
                    className="w-full rounded-xl border border-[#e5ded2] bg-[#fbfaf7] px-4 py-4 text-sm outline-none transition focus:border-[#b4976c] focus:ring-2 focus:ring-[#b4976c]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-[#554d42]"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="Email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-xl border border-[#e5ded2] bg-[#fbfaf7] px-4 py-4 text-sm outline-none transition focus:border-[#b4976c] focus:ring-2 focus:ring-[#b4976c]/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-medium text-[#554d42]"
                >
                  What is your enquiry about?
                </label>
                <select
                  id="subject"
                  name="Enquiry type"
                  required
                  defaultValue=""
                  className="w-full rounded-xl border border-[#e5ded2] bg-[#fbfaf7] px-4 py-4 text-sm text-[#554d42] outline-none transition focus:border-[#b4976c] focus:ring-2 focus:ring-[#b4976c]/10"
                >
                  <option value="" disabled>
                    Select an enquiry type
                  </option>
                  {enquiryTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-[#554d42]"
                >
                  Your message
                </label>
                <textarea
                  id="message"
                  name="Message"
                  rows={6}
                  placeholder="Tell us how we can help..."
                  required
                  className="w-full resize-y rounded-xl border border-[#e5ded2] bg-[#fbfaf7] px-4 py-4 text-sm outline-none transition focus:border-[#b4976c] focus:ring-2 focus:ring-[#b4976c]/10"
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#302a22] px-7 py-4 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#9b8058] sm:w-auto"
              >
                Send your enquiry
                <Send size={16} />
              </button>

              <p className="text-xs leading-6 text-[#a09789]">
                Submitting this form opens your default email application.
                Online form submission will require a server-side integration.
              </p>
            </form>
          </div>
        </ScrollReveal>
      </section>

      {/* Location */}
      <section className="bg-[#292720] px-6 py-24 text-white sm:px-10 lg:px-16 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <ScrollReveal direction="left">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d6bd91]">
              Find your way to us
            </span>

            <h2 className="mt-6 font-serif text-4xl leading-tight sm:text-5xl">
              Your next memorable stay awaits.
            </h2>

            <p className="mt-7 max-w-lg leading-8 text-white/65">
              MOLLIS LUX welcomes guests to Los Angeles, California. We look
              forward to making your visit comfortable, relaxing and memorable.
            </p>

            <div className="mt-9 flex items-start gap-4">
              <MapPin className="mt-1 shrink-0 text-[#d6bd91]" size={22} />
              <div>
                <p className="font-medium">MOLLIS LUX</p>
                <p className="mt-2 text-sm text-white/60">
                  Los Angeles, California, USA
                </p>
              </div>
            </div>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Los+Angeles+California"
              target="_blank"
              rel="noreferrer"
              className="mt-9 inline-flex items-center gap-3 rounded-full border border-white/20 px-7 py-4 text-sm font-medium transition hover:border-[#d6bd91] hover:bg-white/5"
            >
              Get directions
              <ArrowUpRight size={17} />
            </a>
          </ScrollReveal>

          <ScrollReveal direction="right">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/10">
              <Image
                src="/images/mollis_lux.jpg"
                alt="MOLLIS LUX hotel"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Final invitation */}
      <section className="px-6 py-24 text-center sm:px-10 lg:py-32">
        <ScrollReveal>
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#a1845c]">
            We look forward to welcoming you
          </span>

          <h2 className="mx-auto mt-6 max-w-3xl font-serif text-4xl leading-tight text-[#302a22] sm:text-5xl">
            Make room for an experience worth remembering.
          </h2>

          <p className="mx-auto mt-6 max-w-xl leading-8 text-[#777064]">
            Discover the comfort, thoughtful service and refined hospitality
            waiting for you at MOLLIS LUX.
          </p>

          <Link
            href="/#rooms"
            className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#c4a779] px-8 py-4 text-sm font-semibold text-[#211d17] transition-all duration-300 hover:-translate-y-1 hover:bg-[#d6bd91]"
          >
            Explore our rooms
            <ArrowRight size={17} />
          </Link>
        </ScrollReveal>
      </section>

      <footer className="border-t border-[#e9e1d5] px-6 py-8 text-center text-xs tracking-wide text-[#898174]">
        © {new Date().getFullYear()} MOLLIS LUX. All rights reserved.
      </footer>
    </main>
  );
}
