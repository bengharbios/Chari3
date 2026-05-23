const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Inspecting Products in Database ---');
  const products = await prisma.product.findMany({
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
  products.forEach(p => {
    console.log(`- Product: "${p.name}" | Status: ${p.status} | Featured: ${p.isFeatured} | Store ID: ${p.storeId} | Seller ID: ${p.sellerId}`);
  });

  console.log('\n--- Inspecting Verified Sellers/Stores ---');
  const sellers = await prisma.sellerProfile.findMany({
    select: {
      id: true,
      storeName: true,
      isVerified: true,
      userId: true,
    }
  });
  console.log(`Total seller profiles: ${sellers.length}`);
  sellers.forEach(s => {
    console.log(`- Seller: "${s.storeName}" | Verified: ${s.isVerified} | User ID: ${s.userId}`);
  });

  const stores = await prisma.store.findMany({
    select: {
      id: true,
      name: true,
      isActive: true,
      managerId: true,
    }
  });
  console.log(`Total stores: ${stores.length}`);
  stores.forEach(s => {
    console.log(`- Store: "${s.name}" | Active: ${s.isActive} | Manager ID: ${s.managerId}`);
  });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      role: true,
      accountStatus: true,
    }
  });
  console.log(`Total users: ${users.length}`);
  users.forEach(u => {
    console.log(`- User: "${u.name}" | Role: ${u.role} | Account Status: ${u.accountStatus}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
