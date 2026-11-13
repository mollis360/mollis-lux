
import { betterAuth } from "better-auth";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";

import { db } from "../db";
import * as schema from "../db/schema/auth-schema";
import { sendEmail } from "./email";

function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    password.length <= 128 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9\s]/.test(password)
  );
}

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

    resetPasswordTokenExpiresIn: 60 * 60,

    sendResetPassword: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Reset Your MOLLIS LUX Password",
        text: [
          "Hello,",
          "",
          "We received a request to reset your MOLLIS LUX account password.",
          "",
          `Use this link to reset your password: ${url}`,
          "",
          "This link expires in 60 minutes.",
          "",
          "If you did not request this reset, you can ignore this email.",
          "",
          "MOLLIS LUX",
        ].join("\n"),
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 32px; color: #292524;">
            <h1 style="font-family: Georgia, serif; letter-spacing: 4px;">
              MOLLIS LUX
            </h1>
            <h2>Password Reset Request</h2>
            <p>Hello,</p>
            <p>
              We received a request to reset your MOLLIS LUX account password.
            </p>
            <p style="margin: 30px 0;">
              <a
                href="${url}"
                style="background: #292524; color: white; padding: 14px 24px; text-decoration: none; border-radius: 8px;"
              >
                Reset My Password
              </a>
            </p>
            <p>This link expires in 60 minutes.</p>
            <p>
              If you did not request this reset, you can safely ignore this email.
            </p>
            <p style="margin-top: 32px;">
              MOLLIS LUX
            </p>
          </div>
        `,
      }).catch((error: unknown) => {
        console.error("Failed to send password reset email:", error);
      });
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/reset-password") {
        return;
      }

      const body = ctx.body as
        | { newPassword?: unknown }
        | undefined;

      const newPassword = body?.newPassword;

      if (
        typeof newPassword !== "string" ||
        !isStrongPassword(newPassword)
      ) {
        throw new APIError("BAD_REQUEST", {
          message:
            "Password must be 8–128 characters and include an uppercase letter, a lowercase letter, a number, and a special character.",
        });
      }
    }),
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
