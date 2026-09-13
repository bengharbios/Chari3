const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting migration for sellerTourVersion...');
  try {
    // We update all users who have role 'seller' and were created before this script runs.
    // They get sellerTourVersion = 1 so they don't see the onboarding tour.
    const result = await prisma.$executeRaw`
      UPDATE User 
      SET sellerTourVersion = 1 
      WHERE role = 'seller' 
      AND sellerTourVersion = 0
    `;
    console.log(`Migration successful. Updated ${result} existing sellers to sellerTourVersion = 1.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
