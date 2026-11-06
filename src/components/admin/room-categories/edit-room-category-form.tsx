"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { updateRoomCategory } from "@/src/lib/rooms/actions";

type RoomCategory = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  maxAdults: number;
  maxChildren: number;
  roomSize: string | number | null;
  bedType: string | null;
  basePrice: string | number;
  status: "active" | "inactive" | "draft";
};

type EditRoomCategoryFormProps = {
  category: RoomCategory;
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function EditRoomCategoryForm({
  category,
}: EditRoomCategoryFormProps) {
  const router = useRouter();
  const redirectTimeoutRef = useRef<number | null>(null);

  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);
  const [shortDescription, setShortDescription] = useState(
    category.shortDescription ?? "",
  );
  const [description, setDescription] = useState(
    category.description ?? "",
  );
  const [maxAdults, setMaxAdults] = useState(
    String(category.maxAdults),
  );
  const [maxChildren, setMaxChildren] = useState(
    String(category.maxChildren),
  );
  const [roomSize, setRoomSize] = useState(
    category.roomSize === null ? "" : String(category.roomSize),
  );
  const [bedType, setBedType] = useState(category.bedType ?? "");
  const [basePrice, setBasePrice] = useState(
    String(category.basePrice),
  );
  const [status, setStatus] = useState(category.status);

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setIsSaved(false);

    const cleanedName = name.trim();
    const cleanedSlug = toSlug(slug);
    const cleanedShortDescription = shortDescription.trim();
    const cleanedDescription = description.trim();
    const cleanedBedType = bedType.trim();

    if (!cleanedName) {
      setError("Room category name is required.");
      return;
    }

    if (!cleanedSlug) {
      setError("Enter a valid slug.");
      return;
    }

    const parsedAdults = Number(maxAdults);
    const parsedChildren = Number(maxChildren);
    const parsedPrice = Number(basePrice);

    const parsedSize =
      roomSize.trim() === "" ? undefined : Number(roomSize);

    if (!Number.isInteger(parsedAdults) || parsedAdults < 1) {
      setError("Maximum adults must be at least 1.");
      return;
    }

    if (parsedAdults > 10) {
      setError("Maximum adults cannot exceed 10.");
      return;
    }

    if (
      !Number.isInteger(parsedChildren) ||
      parsedChildren < 0
    ) {
      setError("Maximum children cannot be negative.");
      return;
    }

    if (parsedChildren > 8) {
      setError("Maximum children cannot exceed 8.");
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError("Base price must be greater than 0.");
      return;
    }

    if (
      parsedSize !== undefined &&
      (!Number.isFinite(parsedSize) || parsedSize <= 0)
    ) {
      setError("Room size must be greater than 0.");
      return;
    }

    setIsSaving(true);

    try {
      await updateRoomCategory(category.id, {
        name: cleanedName,
        slug: cleanedSlug,
        shortDescription: cleanedShortDescription,
        description: cleanedDescription,
        maxAdults: parsedAdults,
        maxChildren: parsedChildren,
        roomSize: parsedSize,
        bedType: cleanedBedType,
        basePrice: parsedPrice,
        status,
      });

      setIsSaved(true);

      router.refresh();

      redirectTimeoutRef.current = window.setTimeout(() => {
        router.push(`/admin/room-categories/${category.id}`);
      }, 700);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The room category could not be updated.",
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
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-neutral-800"
          >
            Category name
          </label>

          <input
            id="name"
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
            htmlFor="slug"
            className="mb-2 block text-sm font-medium text-neutral-800"
          >
            Slug
          </label>

          <input
            id="slug"
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
            Use lowercase letters, numbers, and hyphens only.
          </p>
        </div>

        <div>
          <label
            htmlFor="status"
            className="mb-2 block text-sm font-medium text-neutral-800"
          >
            Status
          </label>

          <select
            id="status"
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value as
                  | "active"
                  | "inactive"
                  | "draft",
              )
            }
            disabled={isSaving}
            className="w-full rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 disabled:opacity-60"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="shortDescription"
            className="mb-2 block text-sm font-medium text-neutral-800"
          >
            Short description
          </label>

          <textarea
            id="shortDescription"
            value={shortDescription}
            onChange={(event) =>
              setShortDescription(event.target.value)
            }
            maxLength={500}
            rows={3}
            disabled={isSaving}
            className="w-full resize-none rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 text-sm leading-6 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 disabled:opacity-60"
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-neutral-800"
          >
            Full description
          </label>

          <textarea
            id="description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            rows={6}
            disabled={isSaving}
            className="w-full resize-y rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 text-sm leading-6 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 disabled:opacity-60"
          />
        </div>

        <div>
          <label
            htmlFor="maxAdults"
            className="mb-2 block text-sm font-medium text-neutral-800"
          >
            Maximum adults
          </label>

          <input
            id="maxAdults"
            type="number"
            min={1}
            max={10}
            step={1}
            value={maxAdults}
            onChange={(event) =>
              setMaxAdults(event.target.value)
            }
            required
            disabled={isSaving}
            className="w-full rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 disabled:opacity-60"
          />
        </div>

        <div>
          <label
            htmlFor="maxChildren"
            className="mb-2 block text-sm font-medium text-neutral-800"
          >
            Maximum children
          </label>

          <input
            id="maxChildren"
            type="number"
            min={0}
            max={8}
            step={1}
            value={maxChildren}
            onChange={(event) =>
              setMaxChildren(event.target.value)
            }
            required
            disabled={isSaving}
            className="w-full rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 disabled:opacity-60"
          />
        </div>

        <div>
          <label
            htmlFor="roomSize"
            className="mb-2 block text-sm font-medium text-neutral-800"
          >
            Room size (m²)
          </label>

          <input
            id="roomSize"
            type="number"
            min="0.01"
            step="0.01"
            value={roomSize}
            onChange={(event) =>
              setRoomSize(event.target.value)
            }
            placeholder="e.g. 42"
            disabled={isSaving}
            className="w-full rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 disabled:opacity-60"
          />
        </div>

        <div>
          <label
            htmlFor="bedType"
            className="mb-2 block text-sm font-medium text-neutral-800"
          >
            Bed type
          </label>

          <input
            id="bedType"
            type="text"
            value={bedType}
            onChange={(event) =>
              setBedType(event.target.value)
            }
            maxLength={100}
            placeholder="e.g. King Bed"
            disabled={isSaving}
            className="w-full rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 disabled:opacity-60"
          />
        </div>

        <div>
          <label
            htmlFor="basePrice"
            className="mb-2 block text-sm font-medium text-neutral-800"
          >
            Base price
          </label>

          <input
            id="basePrice"
            type="number"
            min="0.01"
            step="0.01"
            value={basePrice}
            onChange={(event) =>
              setBasePrice(event.target.value)
            }
            required
            disabled={isSaving}
            className="w-full rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 disabled:opacity-60"
          />

          <p className="mt-2 text-xs text-neutral-400">
            Base nightly price in USD.
          </p>
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
          Room category updated successfully.
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-3 border-t border-neutral-200/70 pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() =>
            router.push(`/admin/room-categories/${category.id}`)
          }
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