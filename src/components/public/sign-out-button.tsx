"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/src/lib/auth-client";

export default function SignOutButton() {
  const router = useRouter();

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setError(null);

    try {
      const { error } = await authClient.signOut();

      if (error) {
        setError(
          error.message || "Unable to sign out. Please try again.",
        );
        setIsSigningOut(false);
        return;
      }

      router.push("/login");
    } catch {
      setError(
        "Something went wrong while signing you out. Please try again.",
      );
      setIsSigningOut(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSigningOut ? "Signing out..." : "Sign out"}
      </button>

      {error && (
        <p
          role="alert"
          className="text-right text-xs text-red-300"
        >
          {error}
        </p>
      )}
    </div>
  );
}