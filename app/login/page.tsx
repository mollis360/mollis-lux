"use client";

import { useState } from "react";

import Image from "next/image";

import Link from "next/link";

import { useRouter } from "next/navigation";

import {
  loginSchema,
  type LoginInput,
} from "@/src/lib/validations/auth";

import { authClient } from "@/src/lib/auth-client";

type FieldErrors = Partial<Record<keyof LoginInput, string>>;

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<LoginInput>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleChange = (field: keyof LoginInput, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));

    setServerError(null);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setErrors({});
    setServerError(null);

    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: FieldErrors = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (
          typeof field === "string" &&
          field in formData &&
          !fieldErrors[field as keyof LoginInput]
        ) {
          fieldErrors[field as keyof LoginInput] = issue.message;
        }
      });

      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await authClient.signIn.email({
        email: result.data.email,
        password: result.data.password,
      });

      if (error) {
        if (error.message?.toLowerCase().includes("invalid")) {
          setServerError("Incorrect email or password.");
        } else {
          setServerError(
            error.message || "Unable to sign in. Please try again.",
          );
        }

        return;
      }

      const returnTo = new URLSearchParams(window.location.search).get("returnTo");
      if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
        router.replace(returnTo);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setServerError(
        "Something went wrong while signing you in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-950">
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

        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Page Content */}
      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Welcome Text */}
          <div className="mb-8 text-center text-white">
            <p className="font-serif text-sm font-light uppercase tracking-[0.3em] text-white/90">
              Welcome back
            </p>

            <h1 className="mt-2 font-serif text-4xl font-semibold tracking-[0.2em] sm:text-5xl">
              MOLLIS LUX
            </h1>

            <p className="mt-3 font-serif text-sm italic text-white/85">
              Experience refined luxury
            </p>
          </div>

          {/* Glass Card */}
          <div className="rounded-3xl border border-white/25 bg-white/10 shadow-2xl">
            <div className="px-6 py-8 sm:px-9 sm:py-10">
              {/* Card Heading */}
              <div className="mb-8 text-center">
                <h2 className="font-serif text-2xl font-medium tracking-wide text-white">
                  Sign in to your account
                </h2>

                <p className="mt-2 font-serif text-sm text-white/75">
                  Welcome back to MOLLIS LUX
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
                noValidate
              >
                {/* Email */}
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
                    value={formData.email}
                    onChange={(event) =>
                      handleChange("email", event.target.value)
                    }
                    className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 font-serif text-sm text-white outline-none transition placeholder:text-white/50 focus:border-white/60 focus:bg-white/15 focus:ring-1 focus:ring-white/30"
                    placeholder="you@example.com"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={
                      errors.email ? "email-error" : undefined
                    }
                  />

                  {errors.email && (
                    <p
                      id="email-error"
                      className="mt-1.5 font-serif text-xs text-red-200"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block font-serif text-xs font-medium text-white/90"
                    >
                      Password
                    </label>

                    <Link
                      href="/forgot-password"
                      className="font-serif text-xs text-white/70 underline-offset-2 transition hover:text-white hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={(event) =>
                        handleChange("password", event.target.value)
                      }
                      className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 pr-16 font-serif text-sm text-white outline-none transition placeholder:text-white/50 focus:border-white/60 focus:bg-white/15 focus:ring-1 focus:ring-white/30"
                      placeholder="Enter your password"
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={
                        errors.password
                          ? "password-error"
                          : undefined
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => !prev)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 font-serif text-xs font-medium text-white/70 transition hover:text-white"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  {errors.password && (
                    <p
                      id="password-error"
                      className="mt-1.5 font-serif text-xs text-red-200"
                    >
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Server Error */}
                {serverError && (
                  <p
                    role="alert"
                    className="text-center font-serif text-sm text-red-200"
                  >
                    {serverError}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-white/40 bg-white/90 py-3.5 font-serif text-sm font-medium text-neutral-900 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-white/70 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </button>
              </form>

              {/* Signup Link */}
              <p className="mt-8 text-center font-serif text-sm text-white/75">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-white underline underline-offset-4 transition hover:text-white/80"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
