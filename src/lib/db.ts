import { PrismaClient } from '@prisma/client';
import mysql from 'mysql2/promise';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  dbWorkingUrl: string | undefined;
  dbConnectionMode: string | undefined;
  dbSocketPath: string | undefined;
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
      rawPass: u.password,
      host: u.hostname,
      port: u.port || '3306',
      database: u.pathname.slice(1),
    };
  } catch {
    return null;
  }
}

function buildMysqlUrl(user: string, pass: string, host: string, port: string, database: string, isAlreadyEncoded = false) {
  const encPass = isAlreadyEncoded ? pass : encodeURIComponent(pass);
  return `mysql://${encodeURIComponent(user)}:${encPass}@${host}:${port}/${database}`;
}

// ============================================
// CONNECTION PROBER
// Hostinger shared hosting: MySQL user 'u...@localhost' means Unix socket only.
// TCP connections (127.0.0.1 / ::1) are treated as different hosts in MySQL.
// Try Unix socket first, then TCP as fallback.
// ============================================

async function probeTcpConnection(user: string, pass: string, host: string, port: string, database: string, label: string, timeoutMs = 3500) {
  try {
    const start = Date.now();
    const conn = await mysql.createConnection({
      host,
      port: Number(port),
      user,
      password: pass,
      database,
      connectTimeout: timeoutMs,
      enableKeepAlive: false,
    });
    await conn.execute('SELECT 1');
    await conn.end();
    return { ok: true as const, mode: 'tcp', host, label, latency: Date.now() - start };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`[DB] ✗ TCP ${label}: ${msg.substring(0, 120)}`);
    return { ok: false as const, mode: 'tcp', host, label, error: msg };
  }
}

async function probeSocketConnection(user: string, pass: string, database: string, socketPath: string, label: string) {
  try {
    const start = Date.now();
    const conn = await mysql.createConnection({
      user,
      password: pass,
      database,
      socketPath,
      connectTimeout: 3500,
      enableKeepAlive: false,
    });
    await conn.execute('SELECT 1');
    await conn.end();
    return { ok: true as const, mode: 'socket', socketPath, label, latency: Date.now() - start };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`[DB] ✗ Socket ${label}: ${msg.substring(0, 120)}`);
    return { ok: false as const, mode: 'socket', socketPath, label, error: msg };
  }
}

async function findWorkingDbUrl(originalUrl: string): Promise<string | null> {
  const creds = parseMysqlUrl(originalUrl);
  if (!creds) {
    console.error('[DB] Cannot parse DATABASE_URL');
    return null;
  }

  const { user, pass, rawPass, port, database } = creds;
  const passwordsToTest = [
    { p: pass, encoded: false, label: 'decoded' },
    { p: rawPass, encoded: true, label: 'raw/encoded' },
  ];

  // ── Phase 1: Try Unix socket paths (Hostinger internal shared hosting fallback) ──
  const socketPaths = [
    { path: '/tmp/mysql.sock', label: '/tmp/mysql.sock (Hostinger default)' },
    { path: '/var/run/mysqld/mysqld.sock', label: '/var/run/mysqld/mysqld.sock' },
    { path: '/var/lib/mysql/mysql.sock', label: '/var/lib/mysql/mysql.sock' },
    { path: '/tmp/mysqlx.sock', label: '/tmp/mysqlx.sock' },
  ];

  console.log('[DB] Phase 1: Probing Unix socket paths...');
  for (const { path: socketPath, label } of socketPaths) {
    for (const { p, encoded, label: pLabel } of passwordsToTest) {
      const result = await probeSocketConnection(user, p, database, socketPath, `${label} [pass:${pLabel}]`);
      if (result.ok) {
        console.log(`[DB] ✓ Connected via ${label} [pass:${pLabel}] (${result.latency}ms)`);
        globalForPrisma.dbConnectionMode = 'socket';
        globalForPrisma.dbSocketPath = socketPath;
        return buildMysqlUrl(user, p, 'localhost', port, database, encoded);
      }
    }
  }

  // ── Phase 2: Try TCP connections (fastest on remote host) ──
  const tcpHosts = [
    { host: creds.host, label: `${creds.host} (original)` },
    { host: '127.0.0.1', label: '127.0.0.1 (IPv4 TCP)' },
    { host: 'localhost', label: 'localhost (TCP)' },
    { host: 'srv2069.hstgr.io', label: 'srv2069.hstgr.io (external)' },
  ];

  console.log('[DB] Phase 2: Probing TCP hosts...');
  const seen = new Set<string>();
  for (const { host, label } of tcpHosts) {
    if (seen.has(host)) continue;
    seen.add(host);

    for (const { p, encoded, label: pLabel } of passwordsToTest) {
      const result = await probeTcpConnection(user, p, host, port, database, `${label} [pass:${pLabel}]`, 3500);
      if (result.ok) {
        console.log(`[DB] ✓ Connected to ${label} [pass:${pLabel}] (${result.latency}ms)`);
        globalForPrisma.dbConnectionMode = 'tcp';
        return buildMysqlUrl(user, p, host, port, database, encoded);
      }
    }
  }

  console.error('[DB] ❌ All MySQL connection methods failed');
  return null;
}

// ============================================
// PRISMA CLIENT FACTORY
// ============================================

function createPrisma(url: string) {
  const connectionMode = globalForPrisma.dbConnectionMode;
  let finalUrl = url;

  // If socket mode worked, we need to pass socket path via directUrl
  // Prisma doesn't support Unix socket in the main URL well,
  // but we can set it in the datasource URL
  if (connectionMode === 'socket') {
    // For Prisma with Unix socket, use the discovered socket path in URL
    const socketPath = globalForPrisma.dbSocketPath || '/tmp/mysql.sock';
    // Remove :3306 or any port from finalUrl for socket connections
    finalUrl = finalUrl.replace(/@localhost:\d+\//, '@localhost/');
    const sep = finalUrl.includes('?') ? '&' : '?';
    finalUrl = `${finalUrl}${sep}socket=${encodeURIComponent(socketPath)}`;
  }

  // Force IPv4 for TCP connections
  if (connectionMode !== 'socket' && finalUrl.includes('@localhost:')) {
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

  // Strip any query params to avoid connect_timeout warning
  const idx = url.indexOf('?');
  if (idx !== -1) {
    url = url.substring(0, idx);
  }

  return url;
}

// ============================================
// GET SOCKET PATH
// ============================================

export function getWorkingSocketPath(): string | null {
  if (globalForPrisma.dbConnectionMode === 'socket') {
    return globalForPrisma.dbSocketPath || '/tmp/mysql.sock';
  }
  return null;
}

// ============================================
// ENSURE DB CONNECTION
// ============================================

let probePromise: Promise<boolean> | null = null;

export async function ensureDbConnection(): Promise<boolean> {
  if (globalForPrisma.dbWorkingUrl && globalForPrisma.prisma) {
    return true;
  }

  if (probePromise) return probePromise;

  probePromise = (async () => {
    try {
      const originalUrl = process.env.DATABASE_URL;
      if (!originalUrl) return false;

      console.log('[DB] Probing MySQL connection methods...');
      const workingUrl = await findWorkingDbUrl(originalUrl);

      if (workingUrl) {
        try { if (globalForPrisma.prisma) await globalForPrisma.prisma.$disconnect(); } catch { /* ignore */ }

        globalForPrisma.prisma = createPrisma(workingUrl);
        globalForPrisma.dbWorkingUrl = workingUrl;

        console.log('[DB] ✓ Prisma client ready on discovered URL');
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
    connectionMode: globalForPrisma.dbConnectionMode || 'none',
    hasClient: !!globalForPrisma.prisma,
  };
}

export { db };
