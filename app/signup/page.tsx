"use client";

import { useState } from "react";

import Image from "next/image";

import Link from "next/link";

import { useRouter } from "next/navigation";

import {
  signUpSchema,
  type SignUpInput,
} from "@/src/lib/validations/auth";

import { authClient } from "@/src/lib/auth-client";

type FieldErrors = Partial<Record<keyof SignUpInput, string>>;

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<SignUpInput>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleChange = (
    field: keyof SignUpInput,
    value: string,
  ) => {
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

    const result = signUpSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: FieldErrors = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (
          typeof field === "string" &&
          field in formData &&
          !fieldErrors[field as keyof SignUpInput]
        ) {
          fieldErrors[field as keyof SignUpInput] =
            issue.message;
        }
      });

      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await authClient.signUp.email({
        name: `${result.data.firstName.trim()} ${result.data.lastName.trim()}`,
        email: result.data.email.trim().toLowerCase(),
        password: result.data.password,
      });

      if (error) {
        const errorMessage = error.message?.toLowerCase() ?? "";

        if (
          errorMessage.includes("already exists") ||
          errorMessage.includes("unique")
        ) {
          setServerError(
            "An account with this email already exists.",
          );
        } else {
          setServerError(
            error.message ||
              "Unable to create your account. Please try again.",
          );
        }

        return;
      }

      router.replace("/");
    } catch {
      setServerError(
        "Something went wrong while creating your account. Please try again.",
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
              Welcome to
            </p>

            <h1 className="mt-2 font-serif text-4xl font-semibold tracking-[0.2em] sm:text-5xl">
              MOLLIS LUX
            </h1>

            <p className="mt-3 font-serif text-sm italic text-white/85">
              Experience refined luxury
            </p>
          </div>

          <div className="rounded-3xl border border-white/25 bg-white/10 shadow-2xl">
            <div className="px-6 py-8 sm:px-9 sm:py-10">
              <div className="mb-8 text-center">
                <h2 className="font-serif text-2xl font-medium tracking-wide text-white">
                  Create your account
                </h2>

                <p className="mt-2 font-serif text-sm text-white/75">
                  Join MOLLIS LUX
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
                noValidate
              >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="mb-1.5 block font-serif text-xs font-medium text-white/90"
                    >
                      First name
                    </label>

                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      value={formData.firstName}
                      onChange={(event) =>
                        handleChange(
                          "firstName",
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 font-serif text-sm text-white outline-none transition placeholder:text-white/50 focus:border-white/60 focus:bg-white/15 focus:ring-1 focus:ring-white/30"
                      placeholder="First name"
                      aria-invalid={Boolean(errors.firstName)}
                    />

                    {errors.firstName && (
                      <p className="mt-1.5 font-serif text-xs text-red-200">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="mb-1.5 block font-serif text-xs font-medium text-white/90"
                    >
                      Last name
                    </label>

                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      value={formData.lastName}
                      onChange={(event) =>
                        handleChange(
                          "lastName",
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 font-serif text-sm text-white outline-none transition placeholder:text-white/50 focus:border-white/60 focus:bg-white/15 focus:ring-1 focus:ring-white/30"
                      placeholder="Last name"
                      aria-invalid={Boolean(errors.lastName)}
                    />

                    {errors.lastName && (
                      <p className="mt-1.5 font-serif text-xs text-red-200">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

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
                      handleChange(
                        "email",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 font-serif text-sm text-white outline-none transition placeholder:text-white/50 focus:border-white/60 focus:bg-white/15 focus:ring-1 focus:ring-white/30"
                    placeholder="you@example.com"
                    aria-invalid={Boolean(errors.email)}
                  />

                  {errors.email && (
                    <p className="mt-1.5 font-serif text-xs text-red-200">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block font-serif text-xs font-medium text-white/90"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={(event) =>
                        handleChange(
                          "password",
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 pr-16 font-serif text-sm text-white outline-none transition placeholder:text-white/50 focus:border-white/60 focus:bg-white/15 focus:ring-1 focus:ring-white/30"
                      placeholder="Create a password"
                      aria-invalid={Boolean(errors.password)}
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
                    <p className="mt-1.5 font-serif text-xs text-red-200">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1.5 block font-serif text-xs font-medium text-white/90"
                  >
                    Confirm password
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={(event) =>
                        handleChange(
                          "confirmPassword",
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 pr-16 font-serif text-sm text-white outline-none transition placeholder:text-white/50 focus:border-white/60 focus:bg-white/15 focus:ring-1 focus:ring-white/30"
                      placeholder="Confirm your password"
                      aria-invalid={Boolean(
                        errors.confirmPassword,
                      )}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (prev) => !prev,
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 font-serif text-xs font-medium text-white/70 transition hover:text-white"
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showConfirmPassword
                        ? "Hide"
                        : "Show"}
                    </button>
                  </div>

                  {errors.confirmPassword && (
                    <p className="mt-1.5 font-serif text-xs text-red-200">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {serverError && (
                  <p
                    role="alert"
                    className="text-center font-serif text-sm text-red-200"
                  >
                    {serverError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-white/40 bg-white/90 py-3.5 font-serif text-sm font-medium text-neutral-900 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-white/70 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Creating account..."
                    : "Create account"}
                </button>
              </form>

              <p className="mt-8 text-center font-serif text-sm text-white/75">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-white underline underline-offset-4 transition hover:text-white/80"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
