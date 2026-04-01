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

function buildMysqlUrl(user: string, pass: string, host: string, port: string, database: string, extra = '') {
  return `mysql://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/${database}${extra}`;
}

// ============================================
// CONNECTION PROBER
// Key insight: On Hostinger, "localhost" resolves to ::1 (IPv6)
// but MySQL only accepts 127.0.0.1 (IPv4).
// Also try the website hostname as MySQL user might be restricted to it.
// ============================================

async function probeConnection(url: string, label: string, timeoutMs = 5000) {
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
    return { ok: true, url, latency: Date.now() - start };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`[DB] ✗ ${label}: ${msg.substring(0, 120)}`);
    return { ok: false, url, latency: 0, error: msg };
  }
}

async function findWorkingDbUrl(originalUrl: string): Promise<string | null> {
  const creds = parseMysqlUrl(originalUrl);
  if (!creds) {
    console.error('[DB] Cannot parse DATABASE_URL');
    return null;
  }

  const { user, pass, port, database } = creds;
  const poolParams = '?connect_timeout=5&pool_timeout=5&connection_limit=5';

  // Priority order for Hostinger:
  // 1. 127.0.0.1 — IPv4 localhost (avoids ::1 IPv6 issue)
  // 2. Original host from DATABASE_URL
  // 3. srv2069.hstgr.io — external MySQL hostname
  // DO NOT use "localhost" — it resolves to ::1 (IPv6) on Hostinger
  const hosts = [
    { host: '127.0.0.1', label: '127.0.0.1 (IPv4)' },
    { host: creds.host, label: `${creds.host} (original)` },
    { host: 'srv2069.hstgr.io', label: 'srv2069.hstgr.io' },
  ];

  const seen = new Set<string>();
  for (const { host, label } of hosts) {
    if (seen.has(host)) continue;
    seen.add(host);

    const url = buildMysqlUrl(user, pass, host, port, database, poolParams);
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
  // Force IPv4: replace localhost with 127.0.0.1 in the URL
  let finalUrl = url;
  if (finalUrl.includes('@localhost:')) {
    finalUrl = finalUrl.replace('@localhost:', '@127.0.0.1:');
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: { db: { url: finalUrl } },
  });
}

// ============================================
// PROXY-BASED DB CLIENT (lazy init)
// ============================================

const db = new Proxy({} as any, {
  get(_target, prop) {
    if (prop === '__isProxy') return true;

    if (!globalForPrisma.prisma) {
      const url = globalForPrisma.dbWorkingUrl || buildInitialUrl();
      if (url) {
        globalForPrisma.prisma = createPrisma(url);
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
// BUILD INITIAL URL
// ============================================

function buildInitialUrl(): string | undefined {
  let url = process.env.DATABASE_URL;
  if (!url) return undefined;
  if (!url.startsWith('mysql')) return undefined;

  // Force IPv4
  if (url.includes('@localhost:')) {
    url = url.replace('@localhost:', '@127.0.0.1:');
  }

  if (!url.includes('connect_timeout')) {
    const sep = url.includes('?') ? '&' : '?';
    url = `${url}${sep}connect_timeout=15&pool_timeout=10&connection_limit=5`;
  }
  return url;
}

// ============================================
// ENSURE DB CONNECTION
// ============================================

let probePromise: Promise<boolean> | null = null;

export async function ensureDbConnection(): Promise<boolean> {
  if (globalForPrisma.dbWorkingUrl) {
    try {
      const instance = globalForPrisma.prisma;
      if (instance) {
        await instance.$queryRaw`SELECT 1 as ok`;
        return true;
      }
    } catch {
      globalForPrisma.dbWorkingUrl = undefined;
      globalForPrisma.prisma = undefined;
    }
  }

  if (probePromise) return probePromise;

  probePromise = (async () => {
    try {
      const originalUrl = process.env.DATABASE_URL;
      if (!originalUrl) return false;

      // Quick test with existing client
      if (globalForPrisma.prisma) {
        try {
          await globalForPrisma.prisma.$queryRaw`SELECT 1 as ok`;
          globalForPrisma.dbWorkingUrl = originalUrl;
          return true;
        } catch { /* re-probe */ }
      }

      console.log('[DB] Probing MySQL hosts...');
      const workingUrl = await findWorkingDbUrl(originalUrl);

      if (workingUrl) {
        try { if (globalForPrisma.prisma) await globalForPrisma.prisma.$disconnect(); } catch { /* ignore */ }

        globalForPrisma.prisma = createPrisma(workingUrl);
        globalForPrisma.dbWorkingUrl = workingUrl;

        await globalForPrisma.prisma.$queryRaw`SELECT 1 as ok`;
        console.log('[DB] ✓ Prisma client ready');
        return true;
      }

      return false;
    } finally {
      probePromise = null;
    }
  })();

  return probePromise;
}

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
