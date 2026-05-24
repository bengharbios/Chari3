import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding admin user...');
  
  const hashedPassword = await bcrypt.hash('admin1234', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'bengharbios@gmail.com' },
    update: {
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      isVerified: true,
      accountStatus: 'active',
    },
    create: {
      email: 'bengharbios@gmail.com',
      password: hashedPassword,
      name: 'عبدالقادر',
      nameEn: 'Abd El-Kader',
      role: 'admin',
      isActive: true,
      isVerified: true,
      accountStatus: 'active',
      locale: 'ar',
    },
  });

  console.log('Admin user seeded successfully:', admin.email);
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
