import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  dbChecked: boolean;
  dbWorkingUrl: string | undefined;
};

type DbCheckResult = { url: string; ok: boolean; latency: number };

/**
 * Test multiple MySQL host variants and return the first working one.
 * Hostinger MySQL is often accessible via localhost from the app server,
 * even though the connection string says srv2069.hstgr.io.
 */
async function findWorkingDbUrl(originalUrl: string): Promise<DbCheckResult> {
  // Extract credentials from URL
  let user = '';
  let pass = '';
  let host = '';
  let port = '3306';
  let database = '';

  try {
    const u = new URL(originalUrl);
    user = decodeURIComponent(u.username);
    pass = decodeURIComponent(u.password);
    host = u.hostname;
    port = u.port || '3306';
    database = u.pathname.slice(1);
  } catch {
    return { url: originalUrl, ok: false, latency: 0 };
  }

  const hosts = [
    host,
    'localhost',
    '127.0.0.1',
  ];

  // Deduplicate
  const unique = [...new Set(hosts)];

  const mysql = await import('mysql2/promise');

  for (const h of unique) {
    const url = `mysql://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${h}:${port}/${database}?connect_timeout=5&pool_timeout=5&connection_limit=5`;
    try {
      const start = Date.now();
      const conn = await mysql.createConnection({
        uri: url,
        connectTimeout: 5000,
        enableKeepAlive: false,
      });
      await conn.execute('SELECT 1');
      await conn.end();
      const latency = Date.now() - start;
      console.log(`[DB] ✓ Connected to MySQL at ${h} (${latency}ms)`);
      return { url, ok: true, latency };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`[DB] ✗ Failed ${h}: ${msg.substring(0, 100)}`);
    }
  }

  return { url: originalUrl, ok: false, latency: 0 };
}

function createPrisma(url: string) {
  return new PrismaClient({
    log: ['error', 'warn'],
    datasources: { db: { url } },
  });
}

function createDb(): PrismaClient | undefined {
  try {
    let url = process.env.DATABASE_URL;

    if (!url) {
      console.error('[DB] DATABASE_URL is not set');
      return undefined;
    }

    if (!url.startsWith('mysql')) {
      console.error('[DB] DATABASE_URL is not MySQL:', url.substring(0, 20));
      return undefined;
    }

    // Add connection pool params
    if (!url.includes('connect_timeout')) {
      const sep = url.includes('?') ? '&' : '?';
      url = `${url}${sep}connect_timeout=15&pool_timeout=10&connection_limit=5`;
    }

    return createPrisma(url);
  } catch (e) {
    console.error('[DB] PrismaClient creation failed:', e);
    return undefined;
  }
}

const db = new Proxy({} as any, {
  get(_target, prop) {
    if (prop === '__isProxy') return true;
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createDb();
    }
    const instance = globalForPrisma.prisma;
    if (!instance) return undefined;
    const value = instance[prop];
    if (typeof value === 'function') return value.bind(instance);
    return value;
  },
});

/**
 * Call this at app startup to verify DB connection.
 * If original URL fails, tries localhost and caches the working URL.
 * Returns true if DB is reachable.
 */
export async function ensureDbConnection(): Promise<boolean> {
  // Already checked and found working URL
  if (globalForPrisma.dbChecked && globalForPrisma.dbWorkingUrl) {
    return true;
  }

  const originalUrl = process.env.DATABASE_URL;
  if (!originalUrl) return false;

  try {
    // Quick test with current Prisma client
    const existing = globalForPrisma.prisma;
    if (existing) {
      const start = Date.now();
      await existing.$queryRaw`SELECT 1 as ok`;
      console.log(`[DB] Current connection OK (${Date.now() - start}ms)`);
      globalForPrisma.dbChecked = true;
      globalForPrisma.dbWorkingUrl = originalUrl;
      return true;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[DB] Current connection failed: ${msg.substring(0, 150)}`);
  }

  // Try to find a working host
  console.log('[DB] Probing MySQL hosts...');
  const result = await findWorkingDbUrl(originalUrl);

  if (result.ok) {
    // Recreate Prisma with working URL
    try {
      if (globalForPrisma.prisma) {
        await globalForPrisma.prisma.$disconnect();
      }
    } catch { /* ignore */ }

    globalForPrisma.prisma = createPrisma(result.url);
    globalForPrisma.dbChecked = true;
    globalForPrisma.dbWorkingUrl = result.url;

    // Override env for subsequent PrismaClient creations
    process.env.DATABASE_URL = result.url;

    return true;
  }

  globalForPrisma.dbChecked = true;
  console.error('[DB] ❌ No working MySQL host found');
  return false;
}

export { db };
