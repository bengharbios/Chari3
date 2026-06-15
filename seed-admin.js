const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@chariday.com';
  const password = 'adminpassword123';
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      isVerified: true
    },
    create: {
      email,
      name: 'Super Admin',
      nameEn: 'Super Admin',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      isVerified: true,
      accountStatus: 'active'
    }
  });

  console.log(`Admin user created/updated successfully!`);
  console.log(`Email: ${user.email}`);
  console.log(`Password: ${password}`);
  console.log(`Role: ${user.role}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
