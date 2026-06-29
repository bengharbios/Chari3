import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";
import { twoFactor } from "better-auth/plugins";
import { headers } from "next/headers";

import { lookupIpLocation, parseUserAgent } from "./ip-lookup";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "fallback_secret_please_change_in_production_12345",
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "https://chariday.com",
  trustedOrigins: [
    "https://chariday.com",
    "https://www.chariday.com"
  ],
  database: prismaAdapter(db, {
    provider: "mysql", // ChariDay uses MySQL in the schema
  }),
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          try {
            const reqHeaders = await headers();
            let country = reqHeaders.get("cf-ipcountry") || reqHeaders.get("x-vercel-ip-country");
            let city = reqHeaders.get("cf-ipcity") || reqHeaders.get("x-vercel-ip-city");
            
            if (city) {
              try {
                city = decodeURIComponent(city);
              } catch {
                // ignore
              }
            }

            // If Cloudflare didn't provide location, lookup from IP
            if (!country || !city) {
              const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || reqHeaders.get("x-real-ip");
              if (ip) {
                const geo = await lookupIpLocation(ip);
                if (geo.countryCode && !country) country = geo.countryCode;
                if (geo.city && !city) city = geo.city;
              }
            }
            
            if (country) {
              (session as any).countryCode = country;
            }
            if (city) {
              (session as any).city = city;
            }
            
            // Parse User Agent to populate OS and Browser for AuthLog & Session
            const userAgent = reqHeaders.get("user-agent");
            if (userAgent) {
              const parsed = parseUserAgent(userAgent);
              (session as any).deviceType = parsed.deviceType;
              (session as any).os = parsed.os;
              (session as any).browser = parsed.browser;
            }
          } catch (e) {
            // Ignore if headers() is called outside of request context
          }
          return { data: session };
        }
      }
    }
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // 1 day
    additionalFields: {
      countryCode: { type: "string", required: false },
      city: { type: "string", required: false },
      browser: { type: "string", required: false },
      os: { type: "string", required: false },
      deviceType: { type: "string", required: false }
    }
  },
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
  advanced: {
    defaultCookieAttributes: {
      domain: process.env.NODE_ENV === "production" ? ".chariday.com" : undefined,
    },
  },
  plugins: [
    twoFactor({
      issuer: "ChariDay",
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

// We must manually add the hooks to the session model using database hooks
// because better-auth doesn't natively expose session.additionalFields yet in this version,
// but the schema has them. Actually wait, let's try adding session: { ... } inside the config

export async function getSession(headersList: any) {
  const safeHeaders = new Headers();
  headersList.forEach((value: string, key: string) => {
    safeHeaders.append(key, value);
  });
  return await auth.api.getSession({ headers: safeHeaders });
}

