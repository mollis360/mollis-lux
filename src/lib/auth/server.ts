import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/src/lib/auth";

const OPERATIONAL_ROLES = ["admin", "manager", "staff"] as const;
const MANAGEMENT_ROLES = ["admin", "manager"] as const;

export async function getCurrentSession(options?: {
  disableCookieCache?: boolean;
}) {
  return auth.api.getSession({
    headers: await headers(),
    query: options?.disableCookieCache
      ? { disableCookieCache: true }
      : undefined,
  });
}

export async function requireAuthenticatedUser(options?: {
  disableCookieCache?: boolean;
  redirectTo?: string;
}) {
  const session = await getCurrentSession({
    disableCookieCache: options?.disableCookieCache,
  });

  if (!session) {
    redirect(options?.redirectTo ?? "/login");
  }

  return session;
}

export async function requireAdmin() {
  const session = await getCurrentSession({
    disableCookieCache: true,
  });

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/unauthorized");
  }

  return session;
}

export async function requireStaff() {
  const session = await getCurrentSession({
    disableCookieCache: true,
  });

  if (!session) {
    redirect("/login");
  }

  if (!OPERATIONAL_ROLES.includes(session.user.role as (typeof OPERATIONAL_ROLES)[number])) {
    redirect("/unauthorized");
  }

  return session;
}

export async function requireManagerOrAdmin() {
  const session = await getCurrentSession({
    disableCookieCache: true,
  });

  if (!session) {
    redirect("/login");
  }

  if (!MANAGEMENT_ROLES.includes(session.user.role as (typeof MANAGEMENT_ROLES)[number])) {
    redirect("/unauthorized");
  }

  return session;
}
