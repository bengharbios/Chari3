# Authentication Strategy: Dual-Mode (OTP & Password)

This document describes the dual-mode login strategy implemented in ChariDay, explaining when OTP verification is used, when passwords are required, and how password recovery functions.

## 1. Login Modes

ChariDay supports two primary login paths:
1. **Password Login (Credentials):** Required for all users who have established a password on their account.
2. **OTP Login (One-Time Password):** Utilized for new registrations and passwordless accounts (e.g., quick mobile/email onboarding).

---

## 2. Password Check Logic (Bypassing OTP)

To save on transactional cost overheads (SMS / WhatsApp gateway charges) and ensure proper security, any account that has a password established **must** log in via password.

### How it works:
1. The user inputs their identifier (Email or Phone) on the login screen.
2. The UI sends a request to `/api/auth/send-otp`.
3. The server inspects if the user exists and has a credential password set up by checking:
   - The `User.password` field.
   - The `Account` table for records where `providerId = 'credential'` and a `password` hash is present.
4. If a password exists, the server returns `{ success: true, userExistsWithPassword: true }` and does **not** send an OTP.
5. The frontend immediately redirects the user to the **Password Login** screen.

---

## 3. Account Password Recovery (Forgot Password)

If a user with a password cannot remember it, they can recover their account using the recovery flow:

1. On the password entry screen, the user clicks **"Forgot Password?"** (`auth.forgot_password`).
2. This triggers a request to `/api/auth/send-otp` with `forceOtp: true`.
3. The server bypasses the password check constraint, generates a secure 6-digit OTP, and transmits it via the user's active channel (Email SMTP or SMS/WhatsApp gateway).
4. Upon successful OTP verification, the user logs in and can reset their password in their Account Settings.
