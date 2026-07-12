- `[x]` **1. Backend API for Listing Requests**
  - `[x]` Create `GET /api/admin/upgrade-requests/route.ts`
- `[x]` **2. Connect the Admin UI**
  - `[x]` Update `AdminUpgradeQueue.tsx` data fetching
  - `[x]` Wire up Approve/Reject buttons
- `[x]` **3. Backend API for Rejection**
  - `[x]` Create `POST /api/admin/upgrade-requests/reject/route.ts`

- `[x]` **4. Correct Paths and Layout Issues**
  - `[x]` Create `src/app/seller/verification/page.tsx` rendering `VerificationStatusPage`
  - `[x]` Update path redirects in standard `Sidebar.tsx` and `GentelellaSidebar.tsx` to point to `/seller/verification`
  - `[x]` Update `Header.tsx` and `GentelellaHeader.tsx` dropdown paths to point to `/seller/verification`
  - `[x]` Fix double layout rendering in `src/app/seller/onboarding/page.tsx`
  - `[x]` Fix upgrade invoice redirect in `UpgradePage.tsx`

- `[x]` **5. Define Dynamic Tax Settings in Admin**
  - `[x]` Add "tax_rate_auto_entrepreneur" field in `src/app/admin-secure-internal/settings/page.tsx`
  - `[x]` Allow public fetch of `tax_rate_auto_entrepreneur` in `src/app/api/settings/public/route.ts`

- `[x]` **6. Add i18n Translation Keys**
  - `[x]` Add compliance terminology keys in `ar.json`, `en.json`, `fr.json`

- `[x]` **7. Separate Independent Merchant vs Business Store Onboarding**
  - `[x]` Modify `OnboardingWizard.tsx` to conditionalize step lists
  - `[x]` Adapt steps to use the localized keys from i18n
