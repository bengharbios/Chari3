import { NextResponse } from 'next/server';

/**
 * GET /api/debug/db?token=chari3-debug
 *
 * Diagnoses MySQL database connectivity on Hostinger.
 * Tests multiple host combinations and returns detailed results.
 *
 * Call: GET /api/debug/db?token=chari3-debug
 *       GET /api/debug/db?token=chari3-debug&action=push-schema  (run prisma db push)
 */
const DEBUG_TOKEN = 'chari3-debug';

function extractCreds(url: string) {
  try {
    const u = new URL(url);
    return {
      user: decodeURIComponent(u.username),
      pass: decodeURIComponent(u.password),
      host: u.hostname,
      port: u.port || '3306',
      db: u.pathname.slice(1),
    };
  } catch {
    return null;
  }
}

function makeUrl(url: string, host: string) {
  const creds = extractCreds(url);
  if (!creds) return url;
  return `mysql://${encodeURIComponent(creds.user)}:${encodeURIComponent(creds.pass)}@${host}:${creds.port}/${creds.db}`;
}

async function testConnection(connectionString: string, label: string, timeoutMs = 8000) {
  const start = Date.now();
  try {
    const mysql = await import('mysql2/promise');
    const conn = await mysql.createConnection({
      uri: connectionString,
      connectTimeout: timeoutMs,
      enableKeepAlive: false,
    });
    const [rows] = await conn.execute('SELECT 1 as ok, NOW() as now, DATABASE() as db, VERSION() as ver');
    await conn.end();
    return {
      label,
      status: '✅ Connected',
      latency: `${Date.now() - start}ms`,
      data: (rows as Record<string, unknown>[])[0],
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      label,
      status: '❌ Failed',
      latency: `${Date.now() - start}ms`,
      error: msg.substring(0, 300),
    };
  }
}

async function testTableList(connectionString: string) {
  try {
    const mysql = await import('mysql2/promise');
    const conn = await mysql.createConnection({
      uri: connectionString,
      connectTimeout: 8000,
      enableKeepAlive: false,
    });
    const [rows] = await conn.execute('SHOW TABLES');
    const tables = (rows as Record<string, unknown>[]).map((r) => Object.values(r)[0]);
    await conn.end();
    return { status: 'ok', tables, count: tables.length };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { status: 'error', error: msg.substring(0, 200) };
  }
}

async function pushSchema(connectionString: string) {
  try {
    const { execSync } = await import('child_process');
    // Set DATABASE_URL for prisma to use
    const result = execSync('npx prisma db push --skip-generate --accept-data-loss 2>&1', {
      env: { ...process.env, DATABASE_URL: connectionString },
      timeout: 60000,
      encoding: 'utf-8',
    });
    return { status: 'ok', output: result.substring(0, 500) };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { status: 'error', output: msg.substring(0, 500) };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const action = searchParams.get('action');

  if (token !== DEBUG_TOKEN) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
  }

  const originalUrl = process.env.DATABASE_URL || '';
  const creds = extractCreds(originalUrl);

  // ── Action: push schema ──
  if (action === 'push-schema') {
    // First find working connection
    const hosts = [
      { url: originalUrl, label: `Original: ${creds?.host}` },
    ];

    if (creds) {
      // Hostinger MySQL is often on localhost or 127.0.0.1 from the app server
      hosts.push(
        { url: makeUrl(originalUrl, 'localhost'), label: 'localhost' },
        { url: makeUrl(originalUrl, '127.0.0.1'), label: '127.0.0.1' },
        { url: makeUrl(originalUrl, `${creds.host}`), label: `Direct: ${creds.host}` },
      );
    }

    let workingUrl = originalUrl;
    for (const h of hosts) {
      const test = await testConnection(h.url, h.label, 5000);
      if (test.status.startsWith('✅')) {
        workingUrl = h.url;
        break;
      }
    }

    const result = await pushSchema(workingUrl);
    return NextResponse.json({ action: 'push-schema', connectionString: workingUrl, ...result });
  }

  // ── Default: diagnose ──
  const results: Record<string, unknown>[] = [];

  // System info
  results.push({
    step: 'System Info',
    platform: process.platform,
    node: process.version,
    DATABASE_URL_set: !!originalUrl,
    url_starts_with: originalUrl ? originalUrl.substring(0, 15) + '...' : 'NOT SET',
    ...(creds && {
      db_user: creds.user,
      db_host: creds.host,
      db_port: creds.port,
      db_name: creds.db,
      db_pass_len: creds.pass.length,
      db_pass_has_at: creds.pass.includes('@'),
    }),
  });

  // Test different hosts
  if (creds) {
    const hosts = [
      { url: originalUrl, label: `Original (${creds.host})` },
      { url: makeUrl(originalUrl, 'localhost'), label: 'localhost' },
      { url: makeUrl(originalUrl, '127.0.0.1'), label: '127.0.0.1' },
    ];

    for (const h of hosts) {
      const test = await testConnection(h.url, h.label);
      results.push(test as Record<string, unknown>);

      // If connected, also show tables
      if (test.status?.startsWith('✅')) {
        const tables = await testTableList(h.url);
        results.push({ step: `Tables via ${h.label}`, ...tables });

        // Only need one successful connection
        break;
      }
    }
  } else {
    results.push({
      step: 'Error',
      error: 'Could not parse DATABASE_URL',
      raw_url_prefix: originalUrl.substring(0, 30),
    });
  }

  // Prisma direct test
  try {
    const { PrismaClient } = await import('@prisma/client');
    const start = Date.now();
    const pc = new PrismaClient({
      log: [],
      datasources: { db: { url: originalUrl } },
    });
    await pc.$connect();
    const userCount = await pc.user.count().catch(() => 'ERROR');
    await pc.$disconnect();
    results.push({
      step: 'Prisma Direct Test',
      status: '✅ Connected',
      latency: `${Date.now() - start}ms`,
      userCount,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({
      step: 'Prisma Direct Test',
      status: '❌ Failed',
      error: msg.substring(0, 400),
    });
  }

  return NextResponse.json({ debug: 'Chari3 DB Diagnostic', timestamp: new Date().toISOString(), results });
}
