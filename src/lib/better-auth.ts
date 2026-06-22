import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";
import { twoFactor } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "mysql", // ChariDay uses MySQL in the schema
  }),
  emailAndPassword: {
    enabled: true,
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
