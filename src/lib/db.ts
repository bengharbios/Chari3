/**
 * CRASH-SAFE DATABASE CLIENT
 *
 * Problem: On Hostinger, PrismaClient can crash the entire Node.js process
 * (missing engine binary, MySQL unavailable, etc.) causing 503 on ALL requests
 * including static files (CSS, JS, fonts).
 *
 * Solution: Lazy initialization + full try-catch at every level.
 * If Prisma fails, db will be null and API routes will handle gracefully.
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null | undefined
}

let _db: PrismaClient | null = null
let _initFailed = false
let _initAttempted = false

function initDb(): PrismaClient | null {
  // Already initialized
  if (_initAttempted) return _db

  _initAttempted = true

  try {
    let url = process.env.DATABASE_URL

    // On Hostinger (MySQL), add connection params for reliability
    if (url && url.startsWith('mysql') && !url.includes('connect_timeout')) {
      const sep = url.includes('?') ? '&' : '?';
      url = `${url}${sep}connect_timeout=10&pool_timeout=5&connection_limit=3`;
    }

    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'production' ? ['error'] : ['query'],
      ...(url && { datasources: { db: { url } } }),
    })

    // DO NOT call $connect() eagerly — let Prisma connect on first query.
    // Eager connect can crash the process if MySQL is unreachable.

    _db = client
    console.log('[DB] PrismaClient initialized successfully')

    // Set up error handler to prevent process crash
    client.$on('error', (err: Error) => {
      console.error('[DB] Prisma error:', err.message)
    })

    return _db
  } catch (err) {
    _initFailed = true
    _db = null
    console.error('[DB] CRITICAL: PrismaClient failed to initialize:', err instanceof Error ? err.message : String(err))
    return null
  }
}

/**
 * Get database client. Returns null if DB is unavailable.
 * API routes MUST check for null before using.
 */
export function getDb(): PrismaClient | null {
  // In production, reuse the cached singleton
  if (process.env.NODE_ENV === 'production') {
    if (globalForPrisma.prisma !== undefined) return globalForPrisma.prisma
    const db = initDb()
    globalForPrisma.prisma = db
    return db
  }
  // In development, always create fresh (pick up schema changes)
  return initDb()
}

/**
 * Legacy export for backward compatibility.
 * Returns the db client or throws a descriptive error.
 *
 * IMPORTANT: New code should use getDb() and handle null.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getDb()
    if (!client) {
      console.error(`[DB] Attempted to use db.${String(prop)} but DB is unavailable`)
      throw new Error('Database is currently unavailable. Please try again later.')
    }
    const value = (client as Record<string | symbol, unknown>)[prop]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})

/**
 * Check if database is available. Safe to call anytime.
 */
export function isDbAvailable(): boolean {
  return getDb() !== null
}

// Dev hot-reload persistence
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = undefined
}
