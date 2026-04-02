---
## Task ID: 2 - auth-system-rebuild
### Agent: auth-architect
### Work Task
Rebuild the entire authentication system for ChariDay — replacing the monolithic OtpLogin.tsx with a modular, state-machine-driven architecture.

### Files Created
1. `src/lib/store/auth-flow.ts` — Zustand state machine (ephemeral, no persist)
2. `src/app/api/auth/verify-otp/route.ts` — Unified auth gateway with security checks
3. `src/app/api/auth/register/route.ts` — Atomic registration with single DB round-trip
4. `src/components/auth/ContactStep.tsx` — Phone/Email entry with country code picker
5. `src/components/auth/OtpStep.tsx` — 6-digit OTP with auto-advance and paste support
6. `src/components/auth/RegisterStep.tsx` — Name + role selection + store name
7. `src/components/auth/AuthPage.tsx` — Main container with step indicator and branding

### Key Decisions
- State machine: `contact → otp → register → success` (clean type union, not string index)
- Server-driven: `verify-otp` returns `{ isNewUser }` to determine flow direction
- Security: Contact mismatch detection on both verify and register endpoints
- No persist: Auth flow is ephemeral to prevent stale state on page reload
- Existing code untouched: `onboardingStore`, `useAuthStore`, `page.tsx`, `layout.tsx`

### Integration Point
- `AuthPage` is exported as default from `src/components/auth/AuthPage.tsx`
- Import it in `page.tsx` as: `import AuthPage from '@/components/auth/AuthPage'`
- The `useAuthFlowStore` auto-calls `useAuthStore.loginWithUser()` on success
- After login, the existing `page.tsx` routing logic will handle navigation

### Lint Status
- `bun run lint` passes cleanly with zero errors
