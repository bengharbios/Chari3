const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const newPassword = 'password123';
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const admins = await prisma.user.findMany({
    where: { role: 'admin' }
  });

  for (const admin of admins) {
    await prisma.user.update({
      where: { id: admin.id },
      data: { password: hashedPassword }
    });
    console.log(`Updated: ${admin.email}`);
  }
}

main()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());
