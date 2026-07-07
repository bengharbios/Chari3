const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { hashPassword } = require('better-auth/crypto'); // Maybe we can just use simple bcrypt or better auth? Let's bypass password and use OTP if possible, or just insert a simple bcrypt hash.

// A known hash for "password123" (bcrypt)
const PASSWORD_HASH = '$2a$10$3sFXYV78yH1W9I/TfI4Q4O2l3c7pG0M5sM5qjR2Y5tI0V/y/tYgA.'; 

async function main() {
  const ts = Date.now();
  const storeId = `test-store-${ts}`;
  const ownerId = `test-owner-${ts}`;
  const managerId = `test-manager-${ts}`;

  console.log('Skipping cleanup...');

  console.log('Creating Owner (Seller)...');
  await prisma.user.create({
    data: {
      id: ownerId,
      email: `owner${ts}@test.com`,
      phone: `05${String(ts).slice(-8)}`,
      name: 'Owner Tester',
      role: 'seller',
      password: PASSWORD_HASH,
      accountStatus: 'active',
      isActive: true,
      wallet: { create: { balance: 0, currency: 'DZD' } },
      sellerProfile: { create: { storeName: 'Test Store (Owner)' } }
    }
  });

  console.log('Creating Manager...');
  await prisma.user.create({
    data: {
      id: managerId,
      email: `manager${ts}@test.com`,
      phone: `06${String(ts).slice(-8)}`,
      name: 'Manager Tester',
      role: 'store_manager',
      password: PASSWORD_HASH,
      accountStatus: 'active',
      isActive: true,
      wallet: { create: { balance: 0, currency: 'DZD' } },
      sellerProfile: { create: { storeName: 'Test Store (Manager)' } }
    }
  });

  console.log('Linking Manager to Owner Store...');
  // Ensure the store exists
  await prisma.store.create({
    data: {
      id: storeId,
      name: 'Test Store Official',
      slug: `test-store-official-${ts}`,
      manager: { connect: { id: ownerId } },
      isActive: true,
    }
  });

  await prisma.storeStaff.create({
    data: {
      storeId: storeId,
      userId: managerId,
      role: 'store_manager'
    }
  });

  console.log('Accounts created successfully!');
  console.log('Owner -> Email: owner@test.com | Pass: password123');
  console.log('Manager -> Email: manager@test.com | Pass: password123');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
