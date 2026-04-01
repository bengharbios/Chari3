import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  dbWorkingUrl: string | undefined;
};

// ============================================
// URL PARSER
// ============================================

function parseMysqlUrl(url: string) {
  try {
    const u = new URL(url);
    return {
      user: decodeURIComponent(u.username),
      pass: decodeURIComponent(u.password),
      host: u.hostname,
      port: u.port || '3306',
      database: u.pathname.slice(1),
    };
  } catch {
    return null;
  }
}

function buildMysqlUrl(user: string, pass: string, host: string, port: string, database: string) {
  return `mysql://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/${database}`;
}

// ============================================
// CONNECTION PROBER
// Hostinger Node.js apps share the same server as MySQL.
// Always try localhost first — it's ~10x faster and always works.
// ============================================

async function probeConnection(url: string, label: string, timeoutMs = 5000): Promise<{ ok: boolean; url: string; latency: number; error?: string }> {
  try {
    const mysql = await import('mysql2/promise');
    const start = Date.now();
    const conn = await mysql.createConnection({
      uri: url,
      connectTimeout: timeoutMs,
      enableKeepAlive: false,
    });
    await conn.execute('SELECT 1');
    await conn.end();
    const latency = Date.now() - start;
    return { ok: true, url, latency };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`[DB] ✗ ${label}: ${msg.substring(0, 120)}`);
    return { ok: false, url, latency: 0, error: msg.substring(0, 200) };
  }
}

async function findWorkingDbUrl(originalUrl: string) {
  const creds = parseMysqlUrl(originalUrl);
  if (!creds) {
    console.error('[DB] Cannot parse DATABASE_URL');
    return null;
  }

  const { user, pass, host, port, database } = creds;

  // On Hostinger: Node.js and MySQL are on the SAME server.
  // localhost is always faster and more reliable than the external hostname.
  // Priority: localhost → 127.0.0.1 → original host
  const hostsToTry = [
    { host: 'localhost', label: 'localhost' },
    { host: '127.0.0.1', label: '127.0.0.1' },
    { host, label: host },
  ];

  // Deduplicate
  const seen = new Set<string>();
  const unique = hostsToTry.filter(h => {
    if (seen.has(h.host)) return false;
    seen.add(h.host);
    return true;
  });

  for (const { host: h, label } of unique) {
    const url = buildMysqlUrl(user, pass, h, port, database);
    console.log(`[DB] Probing ${label}...`);
    const result = await probeConnection(url, label);

    if (result.ok) {
      console.log(`[DB] ✓ Connected to ${label} (${result.latency}ms)`);
      return url;
    }
  }

  console.error('[DB] ❌ All MySQL hosts failed');
  return null;
}

// ============================================
// PRISMA CLIENT FACTORY
// ============================================

function createPrisma(url: string) {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: { db: { url } },
  });
}

function buildInitialUrl(): string | undefined {
  let url = process.env.DATABASE_URL;
  if (!url) return undefined;
  if (!url.startsWith('mysql')) return undefined;

  // Add pool params
  if (!url.includes('connect_timeout')) {
    const sep = url.includes('?') ? '&' : '?';
    url = `${url}${sep}connect_timeout=15&pool_timeout=10&connection_limit=5`;
  }
  return url;
}

// ============================================
// PROXY-BASED DB CLIENT (lazy init)
// ============================================

const db = new Proxy({} as any, {
  get(_target, prop) {
    if (prop === '__isProxy') return true;

    // If we already found a working URL, create Prisma with it
    if (!globalForPrisma.prisma) {
      const workingUrl = globalForPrisma.dbWorkingUrl || buildInitialUrl();
      if (workingUrl) {
        globalForPrisma.prisma = createPrisma(workingUrl);
      }
    }

    const instance = globalForPrisma.prisma;
    if (!instance) return undefined;
    const value = instance[prop];
    if (typeof value === 'function') return value.bind(instance);
    return value;
  },
});

// ============================================
// ENSURE DB CONNECTION (call before any DB query)
// ============================================

let probePromise: Promise<boolean> | null = null;

export async function ensureDbConnection(): Promise<boolean> {
  // If we already have a working URL, quick-check it's still alive
  if (globalForPrisma.dbWorkingUrl) {
    try {
      const instance = globalForPrisma.prisma;
      if (instance) {
        await instance.$queryRaw`SELECT 1 as ok`;
        return true;
      }
    } catch {
      // Connection lost — will re-probe below
      globalForPrisma.dbWorkingUrl = undefined;
      globalForPrisma.prisma = undefined;
    }
  }

  // Re-use in-flight probe to avoid multiple concurrent probes
  if (probePromise) return probePromise;

  probePromise = (async () => {
    try {
      const originalUrl = process.env.DATABASE_URL;
      if (!originalUrl) {
        console.error('[DB] DATABASE_URL is not set');
        return false;
      }

      // Quick test with existing Prisma client first
      if (globalForPrisma.prisma) {
        try {
          await globalForPrisma.prisma.$queryRaw`SELECT 1 as ok`;
          globalForPrisma.dbWorkingUrl = originalUrl;
          return true;
        } catch {
          // Current client is broken — re-probe
        }
      }

      // Probe all hosts (localhost first)
      console.log('[DB] Probing MySQL hosts...');
      const workingUrl = await findWorkingDbUrl(originalUrl);

      if (workingUrl) {
        // Disconnect old broken client
        try {
          if (globalForPrisma.prisma) {
            await globalForPrisma.prisma.$disconnect();
          }
        } catch { /* ignore */ }

        // Create new Prisma client with working URL
        globalForPrisma.prisma = createPrisma(workingUrl);
        globalForPrisma.dbWorkingUrl = workingUrl;
        process.env.DATABASE_URL = workingUrl;

        // Verify the new client actually works
        try {
          await globalForPrisma.prisma.$queryRaw`SELECT 1 as ok`;
          console.log('[DB] ✓ Prisma client ready');
          return true;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`[DB] Prisma verification failed: ${msg.substring(0, 150)}`);
          globalForPrisma.prisma = undefined;
          globalForPrisma.dbWorkingUrl = undefined;
          return false;
        }
      }

      return false;
    } finally {
      probePromise = null;
    }
  })();

  return probePromise;
}

/**
 * Get current working DB URL for diagnostics
 */
export function getDbInfo() {
  const originalUrl = process.env.DATABASE_URL || '';
  const creds = parseMysqlUrl(originalUrl);
  return {
    originalHost: creds?.host || 'unknown',
    workingHost: globalForPrisma.dbWorkingUrl
      ? parseMysqlUrl(globalForPrisma.dbWorkingUrl)?.host || 'unknown'
      : 'none',
    hasClient: !!globalForPrisma.prisma,
  };
}

export { db };
