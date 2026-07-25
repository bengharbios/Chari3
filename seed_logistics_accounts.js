const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seedLogisticsAccounts() {
  console.log('Seeding Actual Shipping Company & Delivery Driver Accounts...');

  const passwordRaw = 'Nabila141729';
  const hashedPassword = await bcrypt.hash(passwordRaw, 10);

  // 1. SHIPPING COMPANY ACCOUNT (شركة شحن)
  const logisticsCompanyEmail = 'logistics@chariday.com';
  const logisticsCompanyPhone = '+213550000001';

  const companyUser = await prisma.user.upsert({
    where: { email: logisticsCompanyEmail },
    update: {
      password: hashedPassword,
      name: 'شركة شاري إكسبريس اللوجستية (ChariDay Logistics Express)',
      nameEn: 'ChariDay Logistics Express Co.',
      phone: logisticsCompanyPhone,
      role: 'logistics',
      accountStatus: 'active',
      isActive: true,
      isVerified: true,
      phoneVerified: true,
      emailVerified: true,
    },
    create: {
      email: logisticsCompanyEmail,
      password: hashedPassword,
      name: 'شركة شاري إكسبريس اللوجستية (ChariDay Logistics Express)',
      nameEn: 'ChariDay Logistics Express Co.',
      phone: logisticsCompanyPhone,
      role: 'logistics',
      accountStatus: 'active',
      isActive: true,
      isVerified: true,
      phoneVerified: true,
      emailVerified: true,
    },
  });

  // Ensure Wallet for Shipping Company
  await prisma.wallet.upsert({
    where: { userId: companyUser.id },
    update: {
      balance: 150000,
      currency: 'DZD',
    },
    create: {
      userId: companyUser.id,
      balance: 150000,
      currency: 'DZD',
    },
  });

  // 2. DELIVERY DRIVER / AGENT ACCOUNT (مندوب شحن وتوصيل)
  const driverEmail = 'driver@chariday.com';
  const driverPhone = '+213550000002';

  const driverUser = await prisma.user.upsert({
    where: { email: driverEmail },
    update: {
      password: hashedPassword,
      name: 'حمزة بن زاهي (مندوب توصيل سريح - Driver)',
      nameEn: 'Hamza Benzahi (Express Delivery Agent)',
      phone: driverPhone,
      role: 'logistics',
      accountStatus: 'active',
      isActive: true,
      isVerified: true,
      phoneVerified: true,
      emailVerified: true,
    },
    create: {
      email: driverEmail,
      password: hashedPassword,
      name: 'حمزة بن زاهي (مندوب توصيل سريح - Driver)',
      nameEn: 'Hamza Benzahi (Express Delivery Agent)',
      phone: driverPhone,
      role: 'logistics',
      accountStatus: 'active',
      isActive: true,
      isVerified: true,
      phoneVerified: true,
      emailVerified: true,
    },
  });

  // Ensure Wallet for Driver
  await prisma.wallet.upsert({
    where: { userId: driverUser.id },
    update: {
      balance: 28500,
      currency: 'DZD',
    },
    create: {
      userId: driverUser.id,
      balance: 28500,
      currency: 'DZD',
    },
  });

  console.log('====================================================');
  console.log('✅ ACCOUNTS CREATED SUCCESSFULLY!');
  console.log('====================================================');
  console.log('1️⃣ SHIPPING COMPANY ACCOUNT (شركة شحن):');
  console.log(`   Email:    ${logisticsCompanyEmail}`);
  console.log(`   Phone:    ${logisticsCompanyPhone}`);
  console.log(`   Password: ${passwordRaw}`);
  console.log(`   Role:     logistics`);
  console.log('----------------------------------------------------');
  console.log('2️⃣ DELIVERY DRIVER / COURIER AGENT (مندوب توصيل):');
  console.log(`   Email:    ${driverEmail}`);
  console.log(`   Phone:    ${driverPhone}`);
  console.log(`   Password: ${passwordRaw}`);
  console.log(`   Role:     logistics`);
  console.log('====================================================');
}

seedLogisticsAccounts()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
