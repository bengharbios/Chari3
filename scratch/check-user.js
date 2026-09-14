const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findUnique({ where: { email: 'alsalam.institute.ae@gmail.com' }});
  console.log('User:', user?.id, user?.email, user?.role, 'TourVersion:', user?.sellerTourVersion);
}

run().finally(() => prisma.$disconnect());
