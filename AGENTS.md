# ChariDay Platform - AI Agents Guidelines

Welcome! If you are an AI Coding Assistant or Agent working on this repository, please read these guidelines carefully before making any changes.

## 🏗️ Project Overview
ChariDay is a custom-built, multi-vendor B2B/B2C marketplace platform. It allows merchants to create stores, manage products, and sell to buyers. The platform includes a complex billing and subscription system.

## 🛠️ Technology Stack
- **Framework:** Next.js (App Router)
- **Database ORM:** Prisma
- **Database Engine:** PostgreSQL
- **Styling:** Tailwind CSS + Shadcn UI
- **Authentication:** NextAuth.js
- **Languages:** TypeScript (Strict Mode)
- **Localization:** Custom i18n implementation (Arabic / English)

## 📁 Repository Structure
- `/src/app/` - Next.js App Router pages and API routes.
  - `/api/` - Backend API routes (RESTful).
  - `/admin-secure-internal/` - Super Admin dashboard.
  - `/seller/` - Merchant/Seller dashboard.
  - `/buyer/` - Customer dashboard.
  - `/store/` - Public storefronts for merchants.
- `/src/components/` - Reusable React components.
  - `/ui/` - Generic UI components (Shadcn).
  - `/admin/`, `/seller/`, `/buyer/` - Role-specific components.
- `/src/lib/` - Core utilities, db instances, and business logic.
- `/prisma/` - Prisma schema and migrations.

## 🧑‍💻 Architecture & Business Rules
1. **Roles & Permissions:**
   - **SUPER_ADMIN**: Full access to platform settings, billing overrides, and global approval.
   - **SELLER**: Primary merchant role. Manages their subscription, wallets, and stores.
   - **STORE_MANAGER**: Manages a specific store under a seller's umbrella.
   - **BUYER**: End customer.
2. **Billing System (Critical):**
   - Located primarily in `/src/lib/billing.ts` and `/api/billing/`.
   - Subscriptions have statuses: `TRIAL`, `ACTIVE`, `EXPIRED`, `SUSPENDED`, `CANCELLED`.
   - When a subscription expires, `checkAndUpdateExpiredSubscriptions` automatically downgrades it to a default "Beginner" plan (which has a `null` endDate).
   - Invoices map to Subscription periods. When modifying subscription dates, invoice `periodStart` and `periodEnd` must be synchronized.
3. **Database Rules:**
   - Never run raw SQL unless absolutely necessary; always use Prisma Client.
   - Run `npx prisma generate` if you modify `schema.prisma`.

## 🤖 AI Agent Coding Guidelines
- **Always verify the context:** Use `grep_search` or `view_file` to understand existing implementations before writing new code.
- **Do not guess imports:** Check existing files in `/src/components/ui/` for available UI components.
- **Localization:** Always use the translation function `t(locale, 'Arabic', 'English')` when adding new UI text.
- **Error Handling:** API routes must catch errors and return `{ success: false, error: String(error) }` with appropriate HTTP status codes.
- **Specific Tools:** Do not use `sed` or `cat` for file modifications; use the provided AST or precise replacement tools.

## 🚀 Execution Checklist
- Before finalizing a task, ensure the Next.js build passes.
- Validate that the changes do not break the Arabic UI layout (RTL support is critical).

## 🔒 Security & Session Management (Recent Updates)
- **Session Duration:** Sessions are configured via `better-auth.ts` to expire in 30 days (`expiresIn: 60 * 60 * 24 * 30`) with an `updateAge` of 1 day to prevent sudden idle logouts.
- **Geo-Location & IPs:** The `Session` model parses `x-forwarded-for` to obtain clean IPs, falling back safely to unassigned values instead of hardcoding "Alger, DZ".
- **Language Routing:** `currentPage` is persisted in `useAppStore`'s `partialize`. Changing the language relies on `window.location.reload()`, which retains the active dashboard without falling back to `/`.
- **UI Localization:** When localizing long components without dedicated JSON keys, ensure that the ternary (`isAr ? ar : en`) is avoided. Use `t(ar, en, fr)` or standard dictionary keys.
