"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { updateHotel } from "@/src/lib/hotel/actions";

type HotelStatus = "active" | "inactive" | "maintenance";

type HotelSettings = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  city: string;
  country: string;
  timezone: string;
  currency: string;
  contactEmail: string;
  contactPhone: string | null;
  starRating: string | number | null;
  checkInTime: string;
  checkOutTime: string;
  status: HotelStatus;
};

type HotelSettingsFormProps = {
  hotel: HotelSettings;
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isHotelStatus(value: string): value is HotelStatus {
  return (
    value === "active" ||
    value === "inactive" ||
    value === "maintenance"
  );
}

function isValidTimezone(value: string) {
  try {
    Intl.DateTimeFormat(undefined, {
      timeZone: value,
    });

    return true;
  } catch {
    return false;
  }
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export default function HotelSettingsForm({
  hotel,
}: HotelSettingsFormProps) {
  const router = useRouter();

  const [name, setName] = useState(hotel.name);
  const [slug, setSlug] = useState(hotel.slug);
  const [description, setDescription] = useState(
    hotel.description ?? "",
  );
  const [address, setAddress] = useState(hotel.address);
  const [city, setCity] = useState(hotel.city);
  const [country, setCountry] = useState(hotel.country);
  const [timezone, setTimezone] = useState(hotel.timezone);
  const [currency, setCurrency] = useState(hotel.currency);
  const [contactEmail, setContactEmail] = useState(
    hotel.contactEmail,
  );
  const [contactPhone, setContactPhone] = useState(
    hotel.contactPhone ?? "",
  );
  const [starRating, setStarRating] = useState(
    hotel.starRating === null ? "" : String(hotel.starRating),
  );
  const [checkInTime, setCheckInTime] = useState(
    hotel.checkInTime,
  );
  const [checkOutTime, setCheckOutTime] = useState(
    hotel.checkOutTime,
  );
  const [status, setStatus] = useState<HotelStatus>(
    isHotelStatus(hotel.status) ? hotel.status : "active",
  );

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    setError(null);
    setIsSaved(false);

    const cleanedName = name.trim();
    const cleanedSlug = toSlug(slug);
    const cleanedDescription = description.trim();
    const cleanedAddress = address.trim();
    const cleanedCity = city.trim();
    const cleanedCountry = country.trim();
    const cleanedTimezone = timezone.trim();
    const cleanedCurrency = currency.trim().toUpperCase();
    const cleanedEmail = contactEmail.trim().toLowerCase();
    const cleanedPhone = contactPhone.trim();
    const cleanedCheckInTime = checkInTime.trim();
    const cleanedCheckOutTime = checkOutTime.trim();

    if (!cleanedName) {
      setError("Hotel name is required.");
      return;
    }

    if (!cleanedSlug) {
      setError("Enter a valid hotel slug.");
      return;
    }

    if (!cleanedAddress) {
      setError("Hotel address is required.");
      return;
    }

    if (!cleanedCity) {
      setError("City is required.");
      return;
    }

    if (!cleanedCountry) {
      setError("Country is required.");
      return;
    }

    if (
      !cleanedTimezone ||
      !isValidTimezone(cleanedTimezone)
    ) {
      setError(
        "Enter a valid timezone like America/Los_Angeles.",
      );
      return;
    }

    if (!/^[A-Z]{3}$/.test(cleanedCurrency)) {
      setError(
        "Currency must be a valid 3-letter uppercase code.",
      );
      return;
    }

    if (
      !cleanedEmail ||
      !isValidEmail(cleanedEmail)
    ) {
      setError("Enter a valid contact email.");
      return;
    }

    const parsedStarRating =
      starRating.trim() === ""
        ? undefined
        : Number(starRating);

    if (
      parsedStarRating !== undefined &&
      (!Number.isFinite(parsedStarRating) ||
        parsedStarRating < 1 ||
        parsedStarRating > 5)
    ) {
      setError("Star rating must be between 1 and 5.");
      return;
    }

    if (!isValidTime(cleanedCheckInTime)) {
      setError("Enter a valid check-in time.");
      return;
    }

    if (!isValidTime(cleanedCheckOutTime)) {
      setError("Enter a valid check-out time.");
      return;
    }

    if (cleanedCheckInTime === cleanedCheckOutTime) {
      setError(
        "Check-in and check-out times should not be the same.",
      );
      return;
    }

    setIsSaving(true);

    try {
      await updateHotel({
        name: cleanedName,
        slug: cleanedSlug,
        description: cleanedDescription || undefined,
        address: cleanedAddress,
        city: cleanedCity,
        country: cleanedCountry,
        timezone: cleanedTimezone,
        currency: cleanedCurrency,
        contactEmail: cleanedEmail,
        contactPhone: cleanedPhone || undefined,
        starRating: parsedStarRating,
        checkInTime: cleanedCheckInTime,
        checkOutTime: cleanedCheckOutTime,
        status,
      });

      setIsSaved(true);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The hotel could not be updated.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
      aria-busy={isSaving}
    >
      {/* General */}
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-xl text-neutral-900">
            General Information
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Basic information displayed throughout the MOLLIS LUX
            system.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="hotel-name"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              Hotel name
            </label>

            <input
              id="hotel-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={255}
              disabled={isSaving}
              className="w-full rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="hotel-slug"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              Slug
            </label>

            <input
              id="hotel-slug"
              type="text"
              value={slug}
              onChange={(event) =>
                setSlug(toSlug(event.target.value))
              }
              required
              maxLength={255}
              disabled={isSaving}
              className="w-full rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 disabled:opacity-60"
            />

            <p className="mt-2 text-xs leading-5 text-neutral-400">
              Lowercase letters, numbers, and hyphens only.
            </p>
          </div>

          <div>
            <label
              htmlFor="hotel-status"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              Status
            </label>

            <select
              id="hotel-status"
              value={status}
              onChange={(event) => {
                const value = event.target.value;

                if (isHotelStatus(value)) {
                  setStatus(value);
                }
              }}
              disabled={isSaving}
              className="w-full rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 disabled:opacity-60"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">
                Maintenance
              </option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="hotel-description"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              Description
            </label>

            <textarea
              id="hotel-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              maxLength={5000}
              rows={5}
              disabled={isSaving}
              className="w-full resize-y rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 text-sm leading-6 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 disabled:opacity-60"
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="border-t border-neutral-200/70 pt-8">
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-xl text-neutral-900">
              Location
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              The hotel&apos;s physical location and timezone.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="hotel-address"
                className="mb-2 block text-sm font-medium text-neutral-800"
              >
                Address
              </label>

              <textarea
                id="hotel-address"
                value={address}
                onChange={(event) =>
                  setAddress(event.target.value)
                }
                required
                maxLength={500}
                rows={3}
                disabled={isSaving}
                className="w-full resize-none rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 text-sm leading-6 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="hotel-city"
                className="mb-2 block text-sm font-medium text-neutral-800"
              >
                City
              </label>

              <input
                id="hotel-city"
                type="text"
                value={city}
                onChange={(event) =>
                  setCity(event.target.value)
                }
                required
                maxLength={100}
                disabled={isSaving}
                className="w-full rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="hotel-country"
                className="mb-2 block text-sm font-medium text-neutral-800"
              >
                Country
              </label>

              <input
                id="hotel-country"
                type="text"
                value={country}
                onChange={(event) =>
                  setCountry(event.target.value)
                }
                required
                maxLength={100}
                disabled={isSaving}
                className="w-full rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 disabled:opacity-60"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="hotel-timezone"
                className="mb-2 block text-sm font-medium text-neutral-800"
              >
                Timezone
              </label>

              <input
                id="hotel-timezone"
                type="text"
                value={timezone}
                onChange={(event) =>
                  setTimezone(event.target.value)
                }
                required
                maxLength={100}
                placeholder="America/Los_Angeles"
                disabled={isSaving}
                className="w-full rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 disabled:opacity-60"
              />

              <p className="mt-2 text-xs text-neutral-400">
                Use an IANA timezone such as Africa/Lagos or
                America/New_York.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact & Pricing */}
      <div className="border-t border-neutral-200/70 pt-8">
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-xl text-neutral-900">
              Contact &amp; Pricing
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Contact details and the hotel&apos;s operating
              currency.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="hotel-email"
                className="mb-2 block text-sm font-medium text-neutral-800"
              >
                Contact email
              </label>

              <input
                id="hotel-email"
                type="email"
                value={contactEmail}
                onChange={(event) =>
                  setContactEmail(event.target.value)
                }
                required
                maxLength={255}
                disabled={isSaving}
                className="w-full rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="hotel-phone"
                className="mb-2 block text-sm font-medium text-neutral-800"
              >
                Contact phone
              </label>

              <input
                id="hotel-phone"
                type="tel"
                value={contactPhone}
                onChange={(event) =>
                  setContactPhone(event.target.value)
                }
                maxLength={50}
                disabled={isSaving}
                className="w-full rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="hotel-currency"
                className="mb-2 block text-sm font-medium text-neutral-800"
              >
                Currency
              </label>

              <input
                id="hotel-currency"
                type="text"
                value={currency}
                onChange={(event) =>
                  setCurrency(
                    event.target.value.toUpperCase(),
                  )
                }
                required
                maxLength={3}
                minLength={3}
                placeholder="USD"
                disabled={isSaving}
                className="w-full rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 text-sm uppercase text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="hotel-rating"
                className="mb-2 block text-sm font-medium text-neutral-800"
              >
                Star rating
              </label>

              <input
                id="hotel-rating"
                type="number"
                min="1"
                max="5"
                step="0.5"
                value={starRating}
                onChange={(event) =>
                  setStarRating(event.target.value)
                }
                placeholder="5"
                disabled={isSaving}
                className="w-full rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 disabled:opacity-60"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hours */}
      <div className="border-t border-neutral-200/70 pt-8">
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-xl text-neutral-900">
              Hotel Hours
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Default guest check-in and check-out times.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="hotel-check-in"
                className="mb-2 block text-sm font-medium text-neutral-800"
              >
                Check-in time
              </label>

              <input
                id="hotel-check-in"
                type="time"
                value={checkInTime}
                onChange={(event) =>
                  setCheckInTime(event.target.value)
                }
                required
                disabled={isSaving}
                className="w-full rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="hotel-check-out"
                className="mb-2 block text-sm font-medium text-neutral-800"
              >
                Check-out time
              </label>

              <input
                id="hotel-check-out"
                type="time"
                value={checkOutTime}
                onChange={(event) =>
                  setCheckOutTime(event.target.value)
                }
                required
                disabled={isSaving}
                className="w-full rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 disabled:opacity-60"
              />
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm leading-6 text-red-700"
        >
          {error}
        </div>
      ) : null}

      {isSaved ? (
        <div
          role="status"
          className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700"
        >
          Hotel settings updated successfully.
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-3 border-t border-neutral-200/70 pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.push("/admin")}
          disabled={isSaving}
          className="rounded-2xl border border-neutral-200 bg-white/70 px-5 py-3 text-sm text-neutral-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-2xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
