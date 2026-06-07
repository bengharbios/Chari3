---
## Task ID: 3 - i18n-system-upgrade
### Agent: antigravity
### Work Task
Expand the translation system (i18n) of the ChariDay platform to Arabic, English, and French, redesign the Translations Manager UI, resolve Windows browser flag rendering issues, decouple admin locales from storefront locales, and add language editing features.

### Files Modified
1. `src/lib/i18n/config.ts` — Added `isAdminPath` dynamic slug detection helper.
2. `src/lib/i18n/useTranslation.ts` — Updated to resolve active locale based on `isAdminPath`.
3. `src/components/providers/LocaleProvider.tsx` — Dynamic locale synchronization using `isAdminPath`.
4. `src/components/ui/language-switcher.tsx` — Replaced flag emojis with circular SVG flags from HatScripts CDN, removed globe icon, and integrated `isAdminPath`.
5. `src/app/admin-secure-internal/settings/translations/page.tsx` — Redesigned translations manager with categorized tabs, mobile responsive layout, searchable circular flags picker, and active language editing features.
6. `src/app/admin-secure-internal/_components/AdminLayoutWrapper.tsx` — Decoupled storefront locale sync from admin auth locale.
7. `src/components/layout/Header.tsx` — Routed hardcoded strings through dynamic dictionary translations.
8. `src/components/layout/Footer.tsx` — Routed hardcoded footer strings through dynamic translations.
9. `src/components/layout/Sidebar.tsx` — Connected all menu item labels dynamically to the translations.
10. `src/components/storefront/HomepagePage.tsx` — Fully translated marketing blocks, filters, slides, testimonials, and added French dictionary fallbacks.
11. `src/lib/i18n/dictionaries/ar.json`, `en.json`, `fr.json` — Completed dictionaries with missing keys and full French translation structures.

### Key Decisions
- **Dynamic Admin Slug Detection (`isAdminPath`)**: Because Next.js middleware rewrites the dynamic secret admin slug (e.g., `/super-admin`) internally to `/admin-secure-internal`, client-side `usePathname()` checks using `/admin-secure-internal` prefix fail. To solve this, `isAdminPath` was implemented to extract the first path segment and check it against storefront/merchant routes, allowing robust identification of any custom admin path.
- **circular SVG Flags workarounds**: Windows browsers display flag emojis (e.g. `🇩🇿`) as text letters. To keep flag selectors premium, we integrated HatScripts circular flags CDN (`https://hatscripts.github.io/circle-flags/flags/{code}.svg`) and wrote a unicode converter `flagEmojiToCode`.
- **Edit Language Feature**: Added a fully responsive Edit Language dialog allowing administrators to update name, English name, flag, and direction of any active language. Accessible via hover actions on desktop and next to the selection dropdown on mobile.
- **Categorized Tabs**: Grouped translation keys into six tabs (General, Sidebar, Admin, Header/Footer, Homepage, Notifications) to prevent long vertical lists and make key search straightforward.

### Integration Point
- All layouts and storefront pages now utilize `useTranslation()` which handles localized text rendering.
- Custom language settings (including updated flags and directions) are saved database-wide in the `i18n_languages` JSON record.

### Lint Status
- `cmd /c npx tsc --noEmit` compiles successfully with zero errors.
