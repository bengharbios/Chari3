/**
 * In-memory OTP store for verification codes.
 * Server-side only — stores OTP codes with expiry and attempt tracking.
 *
 * Demo code: 123456 always works for any identifier.
 */

interface OTPEntry {
  code: string;
  expiresAt: number; // Unix timestamp in ms
  attempts: number;
  verified: boolean;
  createdAt: number;
}

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 3;
const DEMO_CODE = '123456';

// In-memory storage keyed by normalized identifier (phone or email)
const otpStore = new Map<string, OTPEntry>();

// Track which identifiers have been verified (for registration check)
const verifiedIdentifiers = new Map<string, { verifiedAt: number; method: string }>();

// Cleanup timer
const CLEANUP_INTERVAL_MS = 60_000;

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of otpStore.entries()) {
      if (now > entry.expiresAt) {
        otpStore.delete(key);
      }
    }
    // Clean up old verified entries (older than 30 minutes)
    for (const [key, entry] of verifiedIdentifiers.entries()) {
      if (now - entry.verifiedAt > 30 * 60 * 1000) {
        verifiedIdentifiers.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);
}

startCleanup();

/**
 * Generate a 6-digit OTP code and store it for the given identifier.
 * If a code already exists for this identifier and hasn't expired, it returns
 * the existing code (prevents spamming).
 *
 * @param identifier - Phone number or email address
 * @param method - 'phone' or 'email'
 * @returns The generated/stored 6-digit OTP code
 */
export function generateOTP(identifier: string, method: string): string {
  const now = Date.now();
  const key = `${method}:${identifier}`;

  const existing = otpStore.get(key);

  // If an existing OTP hasn't expired yet, return it (rate limiting at caller)
  if (existing && now < existing.expiresAt) {
    return existing.code;
  }

  // Generate a new 6-digit code
  const code = String(Math.floor(100000 + Math.random() * 900000));

  otpStore.set(key, {
    code,
    expiresAt: now + OTP_TTL_MS,
    attempts: 0,
    verified: false,
    createdAt: now,
  });

  return code;
}

/**
 * Verify an OTP code against the stored value for the given identifier.
 * Demo code 123456 always succeeds.
 * Max 3 attempts per OTP — after that, a new OTP must be generated.
 *
 * @param identifier - Phone number or email address
 * @param code - The OTP code to verify
 * @param method - 'phone' or 'email'
 * @returns true if the code is valid and within attempt limit
 */
export function verifyOTP(identifier: string, code: string, method: string): boolean {
  const now = Date.now();
  const key = `${method}:${identifier}`;

  // Demo code always works
  if (code === DEMO_CODE) {
    // Mark as verified even if no entry exists
    verifiedIdentifiers.set(identifier, { verifiedAt: now, method });
    const entry = otpStore.get(key);
    if (entry) {
      entry.verified = true;
    }
    return true;
  }

  const entry = otpStore.get(key);

  if (!entry) {
    return false; // No OTP was generated for this identifier
  }

  if (now > entry.expiresAt) {
    otpStore.delete(key);
    return false; // OTP expired
  }

  if (entry.verified) {
    return true; // Already verified
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    return false; // Max attempts reached
  }

  entry.attempts += 1;

  if (entry.code === code) {
    entry.verified = true;
    verifiedIdentifiers.set(identifier, { verifiedAt: now, method });
    return true;
  }

  return false; // Wrong code
}

/**
 * Check if an identifier has been OTP-verified recently.
 */
export function isVerified(identifier: string): boolean {
  const entry = verifiedIdentifiers.get(identifier);
  if (!entry) return false;

  // Verified entries are valid for 30 minutes
  const now = Date.now();
  if (now - entry.verifiedAt > 30 * 60 * 1000) {
    verifiedIdentifiers.delete(identifier);
    return false;
  }

  return true;
}

/**
 * Get the remaining attempts for a given identifier.
 * Returns -1 if no OTP exists or it has expired.
 */
export function getRemainingAttempts(identifier: string, method: string): number {
  const now = Date.now();
  const key = `${method}:${identifier}`;
  const entry = otpStore.get(key);

  if (!entry || now > entry.expiresAt) {
    return -1; // No active OTP
  }

  return MAX_ATTEMPTS - entry.attempts;
}

/**
 * Check if an OTP exists and is still valid for the given identifier.
 */
export function hasActiveOTP(identifier: string, method: string): boolean {
  const now = Date.now();
  const key = `${method}:${identifier}`;
  const entry = otpStore.get(key);

  return !!entry && now < entry.expiresAt;
}

/**
 * Clear OTP and verification state for an identifier.
 */
export function clearOTP(identifier: string, method?: string): void {
  if (method) {
    otpStore.delete(`${method}:${identifier}`);
  } else {
    // Clear all OTPs for this identifier regardless of method
    for (const key of otpStore.keys()) {
      if (key.endsWith(`:${identifier}`)) {
        otpStore.delete(key);
      }
    }
  }
  verifiedIdentifiers.delete(identifier);
}

/**
 * Clear the verified state after successful registration.
 */
export function clearVerified(identifier: string): void {
  verifiedIdentifiers.delete(identifier);
}

export { OTP_TTL_MS, MAX_ATTEMPTS, DEMO_CODE };
