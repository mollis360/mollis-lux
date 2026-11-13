
"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/src/lib/auth-client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordRules = [
    {
      label: "Between 8 and 128 characters",
      valid: password.length >= 8 && password.length <= 128,
    },
    {
      label: "At least one uppercase letter (A–Z)",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "At least one lowercase letter (a–z)",
      valid: /[a-z]/.test(password),
    },
    {
      label: "At least one number (0–9)",
      valid: /[0-9]/.test(password),
    },
    {
      label: "At least one special character",
      valid: /[^A-Za-z0-9\s]/.test(password),
    },
  ];

  const isPasswordValid = passwordRules.every((rule) => rule.valid);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError(
        "This password reset link is invalid or missing its token.",
      );
      return;
    }

    if (!isPasswordValid) {
      setError(
        "Your password does not meet all the security requirements.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (resetError) {
        setError(
          resetError.message ||
            "Unable to reset your password. The link may have expired.",
        );
        return;
      }

      router.replace("/login?passwordReset=success");
    } catch {
      setError(
        "Something went wrong. Please request a new reset link and try again.",
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
              Account security
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
                  Create a new password
                </h2>

                <p className="mt-3 font-serif text-sm leading-6 text-white/75">
                  Choose a new password to secure your MOLLIS LUX
                  account.
                </p>
              </div>

              {!token ? (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200/30 bg-red-950/30 p-5 text-center"
                >
                  <p className="font-serif text-sm leading-6 text-red-100">
                    This reset link is invalid or incomplete.
                    Please request a new password reset link.
                  </p>

                  <Link
                    href="/forgot-password"
                    className="mt-4 inline-block font-serif text-sm text-white underline underline-offset-4"
                  >
                    Request a new link
                  </Link>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  noValidate
                >
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-1.5 block font-serif text-xs font-medium text-white/90"
                    >
                      New password
                    </label>

                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={password}
                        onChange={(event) => {
                          setPassword(event.target.value);
                          setError(null);
                        }}
                        placeholder="Enter your new password"
                        maxLength={128}
                        className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 pr-16 font-serif text-sm text-white outline-none transition placeholder:text-white/50 focus:border-white/60 focus:bg-white/15 focus:ring-1 focus:ring-white/30"
                        required
                        aria-describedby="password-requirements"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((previous) => !previous)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 font-serif text-xs text-white/70 hover:text-white"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>

                    <div
                      id="password-requirements"
                      className="mt-4 rounded-xl border border-white/15 bg-black/15 p-4"
                    >
                      <p className="mb-3 font-serif text-xs font-medium text-white/90">
                        Password requirements
                      </p>

                      <ul className="space-y-2">
                        {passwordRules.map((rule) => (
                          <li
                            key={rule.label}
                            className={`flex items-center gap-2 font-serif text-xs ${
                              rule.valid
                                ? "text-emerald-200"
                                : "text-white/65"
                            }`}
                          >
                            <span aria-hidden="true">
                              {rule.valid ? "✓" : "○"}
                            </span>
                            {rule.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-1.5 block font-serif text-xs font-medium text-white/90"
                    >
                      Confirm new password
                    </label>

                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={
                          showConfirmPassword ? "text" : "password"
                        }
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(event) => {
                          setConfirmPassword(event.target.value);
                          setError(null);
                        }}
                        placeholder="Confirm your new password"
                        maxLength={128}
                        className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 pr-16 font-serif text-sm text-white outline-none transition placeholder:text-white/50 focus:border-white/60 focus:bg-white/15 focus:ring-1 focus:ring-white/30"
                        required
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (previous) => !previous,
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 font-serif text-xs text-white/70 hover:text-white"
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </button>
                    </div>

                    {confirmPassword.length > 0 && (
                      <p
                        className={`mt-2 font-serif text-xs ${
                          password === confirmPassword
                            ? "text-emerald-200"
                            : "text-red-200"
                        }`}
                      >
                        {password === confirmPassword
                          ? "Passwords match."
                          : "Passwords do not match."}
                      </p>
                    )}
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
                    disabled={isSubmitting || !isPasswordValid}
                    className="w-full rounded-xl border border-white/40 bg-white/90 py-3.5 font-serif text-sm font-medium text-neutral-900 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-white/70 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting
                      ? "Updating password..."
                      : "Reset password"}
                  </button>
                </form>
              )}

              <p className="mt-8 text-center font-serif text-sm text-white/75">
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
          Loading...
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
