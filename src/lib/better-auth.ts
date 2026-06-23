import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";
import { twoFactor } from "better-auth/plugins";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "fallback_secret_please_change_in_production_12345",
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "https://chariday.com",
  database: prismaAdapter(db, {
    provider: "mysql", // ChariDay uses MySQL in the schema
  }),
  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password: string) => {
        const bcrypt = require("bcryptjs");
        return await bcrypt.hash(password, 10);
      },
      verify: async ({ hash, password }: { hash: string; password: string }) => {
        const bcrypt = require("bcryptjs");
        return await bcrypt.compare(password, hash);
      }
    }
  },
  plugins: [
    twoFactor({
      otpOptions: {
        issuer: "ChariDay",
      },
    }),
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "buyer"
      },
      phone: {
        type: "string",
        required: false
      },
      nameEn: {
        type: "string",
        required: false
      },
      avatar: {
        type: "string",
        required: false
      },
      accountStatus: {
        type: "string",
        required: true,
        defaultValue: "incomplete"
      },
      isActive: {
        type: "boolean",
        required: true,
        defaultValue: true
      },
      isVerified: {
        type: "boolean",
        required: true,
        defaultValue: false
      },
      phoneVerified: {
        type: "boolean",
        required: true,
        defaultValue: false
      },
      locale: {
        type: "string",
        required: true,
        defaultValue: "ar"
      }
    }
  }
});

export async function getSession(headersList: any) {
  const safeHeaders = new Headers();
  headersList.forEach((value: string, key: string) => {
    safeHeaders.append(key, value);
  });
  return await auth.api.getSession({ headers: safeHeaders });
}

