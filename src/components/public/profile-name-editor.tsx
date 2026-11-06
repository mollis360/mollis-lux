
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, X } from "lucide-react";

import { updateProfileName } from "@/src/lib/profile/actions";

type ProfileNameEditorProps = {
  initialName: string;
};

export default function ProfileNameEditor({
  initialName,
}: ProfileNameEditorProps) {
  const router = useRouter();

  const [name, setName] = useState(initialName);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    setName(initialName);
    setIsEditing(false);
    setError("");
    setMessage("");
  }

  function handleSave() {
    setError("");
    setMessage("");

    startTransition(async () => {
      try {
        const result = await updateProfileName({ name });

        setName(result.name);
        setIsEditing(false);
        setMessage("Your profile name was updated successfully.");

        router.refresh();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Your profile name could not be updated.",
        );
      }
    });
  }

  return (
    <div className="min-w-0">
      {!isEditing ? (
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-serif text-2xl tracking-tight text-[#29251f] sm:text-3xl">
            {name}
          </h2>

          <button
            type="button"
            onClick={() => {
              setName(initialName);
              setIsEditing(true);
              setMessage("");
              setError("");
            }}
            className="inline-flex items-center gap-2 rounded-full border border-[#e8dcc9] bg-white px-3 py-2 text-xs font-medium text-[#8b7049] transition hover:bg-[#f7f1e8]"
          >
            <Pencil size={13} aria-hidden="true" />
            Edit profile
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <label
            htmlFor="profile-name"
            className="mb-2 block text-xs font-medium text-[#777067]"
          >
            Your full name
          </label>

          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            autoFocus
            disabled={isPending}
            className="w-full rounded-xl border border-[#e5ddd1] bg-white px-4 py-3 text-sm text-[#29251f] outline-none transition focus:border-[#a78655] focus:ring-2 focus:ring-[#a78655]/10 disabled:opacity-60"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending || name.trim().length < 2}
              className="inline-flex items-center gap-2 rounded-full bg-[#a88a60] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#92744c] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check size={14} aria-hidden="true" />
              {isPending ? "Saving..." : "Save changes"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-full border border-[#e5ddd1] bg-white px-4 py-2.5 text-xs font-medium text-[#655b4e] transition hover:bg-[#faf8f4] disabled:opacity-50"
            >
              <X size={14} aria-hidden="true" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {message && (
        <p className="mt-3 text-xs text-green-700" role="status">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-3 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
