
"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/src/lib/auth";
import { requireAuthenticatedUser } from "@/src/lib/auth/server";
import { runSafeAction } from "@/src/lib/errors";

const updateProfileNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Your name must contain at least 2 characters.")
    .max(80, "Your name cannot exceed 80 characters."),
});

export async function updateProfileName(input: unknown) {
  await requireAuthenticatedUser({ disableCookieCache: true });

  return runSafeAction(
    "update profile name",
    async () => {
      const data = updateProfileNameSchema.parse(input);

      await auth.api.updateUser({
        body: {
          name: data.name,
        },
        headers: await headers(),
      });

      return {
        name: data.name,
      };
    },
    "Your profile name could not be updated.",
  );
}
