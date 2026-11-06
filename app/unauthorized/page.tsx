import Link from "next/link";
import Image from "next/image";

export default function UnauthorizedPage() {
  return (
    <main
      className="relative min-h-screen overflow-hidden bg-neutral-950"
      aria-labelledby="unauthorized-title"
      aria-describedby="unauthorized-description"
    >
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/mollis_login.jpg"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="h-full w-full object-cover object-center"
        />

        {/* Light overlay — keeps the background visible */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Glass Card */}
          <div className="rounded-3xl border border-white/25 bg-white/10 shadow-2xl backdrop-blur-sm">
            <div className="px-8 py-12 text-center sm:px-10">
              {/* Access Denied Icon */}
              <div
                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10"
                aria-hidden="true"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white/80"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z"
                  />
                </svg>
              </div>

              {/* Heading */}
              <h1
                id="unauthorized-title"
                className="font-serif text-3xl font-semibold tracking-wide text-white"
              >
                Access Denied
              </h1>

              {/* Description */}
              <p
                id="unauthorized-description"
                className="mt-4 font-serif text-sm leading-6 text-white/75"
              >
                You do not have permission to access this area of{" "}
                <span className="text-white">MOLLIS LUX</span>.
              </p>

              {/* Navigation */}
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/dashboard"
                  className="rounded-xl border border-white/40 bg-white/90 px-6 py-3 font-serif text-sm font-medium text-neutral-900 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-transparent"
                >
                  Go to Dashboard
                </Link>

                <Link
                  href="/"
                  className="rounded-xl border border-white/25 bg-white/10 px-6 py-3 font-serif text-sm font-medium text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
