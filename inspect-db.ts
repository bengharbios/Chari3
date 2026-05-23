import fs from 'fs';
import path from 'path';

// Manual env loader for running outside Next.js
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = (match[2] || '').trim();
        if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.warn('Error loading .env file:', e);
}

import { db, ensureDbConnection } from './src/lib/db';

async function main() {
  console.log('Probing working DB URL...');
  const ok = await ensureDbConnection();
  if (!ok) {
    console.error('Failed to establish a working DB connection!');
    return;
  }

  console.log('--- Inspecting Products in Database ---');
  const products = await db.product.findMany({
    select: {
      id: true,
      name: true,
      status: true,
      isFeatured: true,
      createdAt: true,
      storeId: true,
      sellerId: true,
    }
  });

  console.log(`Total products: ${products.length}`);
  products.forEach((p: any) => {
    console.log(`- Product: "${p.name}" | Status: ${p.status} | Featured: ${p.isFeatured} | Store ID: ${p.storeId} | Seller ID: ${p.sellerId}`);
  });

  console.log('\n--- Inspecting Verified Sellers/Stores ---');
  const sellers = await db.sellerProfile.findMany({
    select: {
      id: true,
      storeName: true,
      isVerified: true,
      userId: true,
    }
  });
  console.log(`Total seller profiles: ${sellers.length}`);
  sellers.forEach((s: any) => {
    console.log(`- Seller: "${s.storeName}" | Verified: ${s.isVerified} | User ID: ${s.userId}`);
  });

  const stores = await db.store.findMany({
    select: {
      id: true,
      name: true,
      isActive: true,
      managerId: true,
    }
  });
  console.log(`Total stores: ${stores.length}`);
  stores.forEach((s: any) => {
    console.log(`- Store: "${s.name}" | Active: ${s.isActive} | Manager ID: ${s.managerId}`);
  });

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      role: true,
      accountStatus: true,
    }
  });
  console.log(`Total users: ${users.length}`);
  users.forEach((u: any) => {
    console.log(`- User: "${u.name}" | Role: ${u.role} | Account Status: ${u.accountStatus}`);
  });
}

main()
  .catch(e => console.error(e));
