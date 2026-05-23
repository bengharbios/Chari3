import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// ============================================
// BUILD PRISMA URL
// ============================================

function getPrismaUrl(): string | undefined {
  let url = process.env.DATABASE_URL;
  if (!url) return undefined;

  // Strip any query params to avoid connect_timeout warning if present
  const idx = url.indexOf('?');
  if (idx !== -1) {
    url = url.substring(0, idx);
  }

  // Force IPv4 for TCP connections because Hostinger shared hosting
  // often fails with localhost due to IPv6/socket confusion
  if (url.includes('@localhost:')) {
    url = url.replace('@localhost:', '@127.0.0.1:');
  }

  return url;
}

// ============================================
// PRISMA CLIENT FACTORY
// ============================================

function createPrisma() {
  const url = getPrismaUrl();
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: url ? { db: { url } } : undefined,
  });
}

// ============================================
// EXPORT DB CLIENT
// ============================================

export const db = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

// ============================================
// DB UTILS
// ============================================

export async function ensureDbConnection(): Promise<boolean> {
  try {
    await db.$queryRaw`SELECT 1 as ok`;
    return true;
  } catch (error) {
    console.error('[DB] Connection failed:', error);
    return false;
  }
}

export function getDbInfo() {
  const url = getPrismaUrl();
  const host = url ? new URL(url).hostname : 'unknown';
  return {
    originalHost: process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).hostname : 'unknown',
    workingHost: host,
    connectionMode: host === '127.0.0.1' ? 'tcp' : 'unknown',
    hasClient: !!db,
  };
}

export function getWorkingSocketPath(): string | null {
  return null;
}
