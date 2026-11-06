import { betterAuth } from "better-auth";

import { drizzleAdapter } from "@better-auth/drizzle-adapter";

import { db } from "../db";

import * as schema from "../db/schema/auth-schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  secret: process.env.BETTER_AUTH_SECRET,

  baseURL: process.env.BETTER_AUTH_URL,

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,

    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: false,
      },
    },
  },

  trustedOrigins: [
    process.env.BETTER_AUTH_URL!,
  ],

  rateLimit: {
    enabled: true,
    window: 60,
    max: 10,
  },
});