# Business Upgrade Flow (ترقية الأعمال)

## Overview
The Business Upgrade allows an individual seller to upgrade their store to a "Business Store," unlocking advanced features such as multiple branches, team staff management, and tax reporting. This process is governed by a dynamic pricing mechanism and requires manual approval from an administrator.

## Models Involved
1. **PlatformSettings (Global)**: Holds configuration such as `isUpgradeFreePromo`.
2. **BillingAddon**: The `business_upgrade` addon holds the `price`.
3. **UpgradeRequest**: Tracks the status of a specific seller's upgrade request (`PENDING`, `AWAITING_PAYMENT`, `READY_FOR_REVIEW`, `APPROVED`, `REJECTED`).
4. **Invoice**: Automatically created if the upgrade is not free.
5. **Store**: Upon approval, the `addonBusinessUpgrade` flag is set to `true` to enable features globally for that store.

## Flow
1. **Request**: The seller visits the Upgrade Page. The frontend fetches global pricing from `GET /api/platform-settings`.
2. **Submission**: The seller clicks "Submit Upgrade Request". `POST /api/upgrade-requests` checks the pricing.
   - If free: The request is set to `READY_FOR_REVIEW`.
   - If paid: An invoice is generated, and the request is set to `AWAITING_PAYMENT`.
3. **Payment**: The seller pays the invoice and uploads proof. The admin confirms payment via `POST /api/admin/invoices/[id]/confirm-payment`, which automatically moves the upgrade request to `READY_FOR_REVIEW`.
4. **Approval**: The admin reviews the request in the queue and approves via `POST /api/admin/upgrade-requests/[id]/approve`. This updates the user's role to `store_manager` and flags the store with `addonBusinessUpgrade = true`.

## Central Permissions
Use `isBusinessAccount(user)` from `@/lib/permissions` to centralize the check across the platform (checking `role === 'business' || role === 'store_manager'`).
