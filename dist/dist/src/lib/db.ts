import { PrismaClient } from '@prisma/client';

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
// Hostinger shared hosting: MySQL user 'u...@localhost' means Unix socket only.
// TCP connections (127.0.0.1 / ::1) are treated as different hosts in MySQL.
// Try Unix socket first, then TCP as fallback.
// ============================================

async function probeTcpConnection(user: string, pass: string, host: string, port: string, database: string, label: string, timeoutMs = 5000) {
  try {
    const mysql = await import('mysql2/promise');
    const start = Date.now();
    const conn = await mysql.createConnection({
      uri: buildMysqlUrl(user, pass, host, port, database),
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
    const mysql = await import('mysql2/promise');
    const start = Date.now();
    const conn = await mysql.createConnection({
      user,
      password: pass,
      database,
      socketPath,
      connectTimeout: 5000,
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

  const { user, pass, port, database } = creds;

  // ── Phase 1: Try Unix socket paths (Hostinger shared hosting) ──
  const socketPaths = [
    { path: '/tmp/mysql.sock', label: '/tmp/mysql.sock (Hostinger default)' },
    { path: '/var/run/mysqld/mysqld.sock', label: '/var/run/mysqld/mysqld.sock' },
    { path: '/var/lib/mysql/mysql.sock', label: '/var/lib/mysql/mysql.sock' },
    { path: '/tmp/mysqlx.sock', label: '/tmp/mysqlx.sock' },
  ];

  console.log('[DB] Phase 1: Probing Unix socket paths...');
  for (const { path: socketPath, label } of socketPaths) {
    const result = await probeSocketConnection(user, pass, database, socketPath, label);
    if (result.ok) {
      console.log(`[DB] ✓ Connected via ${label} (${result.latency}ms)`);
      // Store the socket path for Prisma connection
      globalForPrisma.dbConnectionMode = 'socket';
      globalForPrisma.dbSocketPath = socketPath;
      return buildMysqlUrl(user, pass, 'localhost', port, database);
    }
  }

  // ── Phase 2: Try TCP connections ──
  const tcpHosts = [
    { host: '127.0.0.1', label: '127.0.0.1 (IPv4 TCP)' },
    { host: creds.host, label: `${creds.host} (original)` },
    { host: 'srv2069.hstgr.io', label: 'srv2069.hstgr.io (external)' },
  ];

  console.log('[DB] Phase 2: Probing TCP hosts...');
  const seen = new Set<string>();
  for (const { host, label } of tcpHosts) {
    if (seen.has(host)) continue;
    seen.add(host);

    const result = await probeTcpConnection(user, pass, host, port, database, label);
    if (result.ok) {
      console.log(`[DB] ✓ Connected to ${label} (${result.latency}ms)`);
      globalForPrisma.dbConnectionMode = 'tcp';
      return buildMysqlUrl(user, pass, host, port, database);
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
    const sep = finalUrl.includes('?') ? '&' : '?';
    finalUrl = `${finalUrl}${sep}socketPath=${encodeURIComponent(socketPath)}`;
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
      globalForPrisma.dbConnectionMode = undefined;
      globalForPrisma.dbSocketPath = undefined;
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

      console.log('[DB] Probing MySQL connection methods...');
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
    connectionMode: globalForPrisma.dbConnectionMode || 'none',
    hasClient: !!globalForPrisma.prisma,
  };
}

export { db };
