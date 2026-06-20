const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true }
  });
  
  console.log('All Users:', users);

  const admin = users.find(u => u.role === 'admin' || u.role === 'SUPER_ADMIN');

  if (!admin) {
    console.log('No admin found at all!');
    return;
  }

  const newPassword = 'password123';
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: admin.id },
    data: { password: hashedPassword },
  });

  console.log('--- ADMIN CREDENTIALS ---');
  console.log('Email:', admin.email);
  console.log('Password:', newPassword);
  console.log('Role:', admin.role);
  console.log('-------------------------');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
