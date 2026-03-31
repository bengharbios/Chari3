/**
 * In-memory rate limiter using a sliding window algorithm.
 * Only for server-side use.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Cleanup interval: every 60 seconds, remove expired entries
const CLEANUP_INTERVAL_MS = 60_000;

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      // Remove timestamps older than 5 minutes (safety margin beyond any window)
      entry.timestamps = entry.timestamps.filter((ts) => now - ts < 300_000);
      if (entry.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);
}

startCleanup();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs: number;
  remaining: number;
}

/**
 * Check if a request is allowed under the rate limit.
 * Uses a sliding window approach: tracks timestamps of all requests
 * within the window and prunes expired ones on each check.
 *
 * @param key - Unique identifier for the rate limit bucket (e.g., IP, phone, email)
 * @param limit - Maximum number of requests allowed within the window
 * @param windowMs - Time window in milliseconds
 * @returns RateLimitResult with allowed status and metadata
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  let entry = store.get(key);

  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Prune timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

  if (entry.timestamps.length >= limit) {
    // Find the oldest timestamp in the window to calculate retry-after
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = oldestInWindow + windowMs - now;

    return {
      allowed: false,
      retryAfterMs: Math.max(0, Math.ceil(retryAfterMs)),
      remaining: 0,
    };
  }

  // Record this request
  entry.timestamps.push(now);
  const remaining = limit - entry.timestamps.length;

  return {
    allowed: true,
    retryAfterMs: 0,
    remaining,
  };
}

/**
 * Reset the rate limit for a given key (e.g., after successful verification).
 */
export function resetRateLimit(key: string): void {
  store.delete(key);
}

/**
 * Get the current count of requests in the window for a key.
 */
export function getCurrentCount(key: string, windowMs: number): number {
  const entry = store.get(key);
  if (!entry) return 0;

  const windowStart = Date.now() - windowMs;
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);
  return entry.timestamps.length;
}
