import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
};

function createDb() {
  let url = process.env.DATABASE_URL;

  if (url && url.startsWith('mysql') && !url.includes('connect_timeout')) {
    const sep = url.includes('?') ? '&' : '?';
    url = `${url}${sep}connect_timeout=15&pool_timeout=10&connection_limit=5`;
  }

  try {
    const client = new PrismaClient({
      log: ['error'],
      ...(url && { datasources: { db: { url } } }),
    });
    return client;
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
  }
});

export { db };
