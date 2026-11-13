
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { authClient } from "@/src/lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError(null);
    setSuccess(false);

    const normalizedEmail = email.trim().toLowerCase();

    if (
      !normalizedEmail ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: requestError } =
        await authClient.requestPasswordReset({
          email: normalizedEmail,
          redirectTo: `${window.location.origin}/reset-password`,
        });

      if (requestError) {
        setError(
          requestError.message ||
            "Unable to process your request. Please try again.",
        );
        return;
      }

      setSuccess(true);
    } catch {
      setError(
        "Something went wrong. Please try again later.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-950">
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

        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center text-white">
            <p className="font-serif text-sm font-light uppercase tracking-[0.3em] text-white/90">
              Account recovery
            </p>

            <h1 className="mt-2 font-serif text-4xl font-semibold tracking-[0.2em] sm:text-5xl">
              MOLLIS LUX
            </h1>

            <p className="mt-3 font-serif text-sm italic text-white/85">
              Experience refined luxury
            </p>
          </div>

          <div className="rounded-3xl border border-white/25 bg-white/10 shadow-2xl backdrop-blur-xl">
            <div className="px-6 py-8 sm:px-9 sm:py-10">
              <div className="mb-8 text-center">
                <h2 className="font-serif text-2xl font-medium tracking-wide text-white">
                  Forgot your password?
                </h2>

                <p className="mt-3 font-serif text-sm leading-6 text-white/75">
                  Enter the email address associated with your
                  account. We&apos;ll send you a secure link to
                  reset your password.
                </p>
              </div>

              {success ? (
                <div
                  role="status"
                  className="rounded-xl border border-white/20 bg-white/10 p-5 text-center"
                >
                  <p className="font-serif text-sm leading-6 text-white">
                    If an account exists with that email address,
                    you&apos;ll receive a password reset link
                    shortly. Please check your inbox.
                  </p>

                  <p className="mt-3 font-serif text-xs text-white/60">
                    Also check your spam or junk folder.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  noValidate
                >
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block font-serif text-xs font-medium text-white/90"
                    >
                      Email address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setError(null);
                      }}
                      className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 font-serif text-sm text-white outline-none transition placeholder:text-white/50 focus:border-white/60 focus:bg-white/15 focus:ring-1 focus:ring-white/30"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  {error && (
                    <p
                      role="alert"
                      className="text-center font-serif text-sm text-red-200"
                    >
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-white/40 bg-white/90 py-3.5 font-serif text-sm font-medium text-neutral-900 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-white/70 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting
                      ? "Sending reset link..."
                      : "Send reset link"}
                  </button>
                </form>
              )}

              <p className="mt-8 text-center font-serif text-sm text-white/75">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="font-medium text-white underline underline-offset-4 transition hover:text-white/80"
                >
                  Back to sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
