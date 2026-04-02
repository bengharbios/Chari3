import { db } from '@/lib/db';

/**
 * Seeds the database with demo users and pending verification records.
 * Import and call `seedReviewData()` from a server context (e.g. API route or script).
 *
 * Usage:
 *   import { seedReviewData } from '@/lib/seed';
 *   await seedReviewData();
 */
export async function seedReviewData() {
  console.log('🌱 Seeding review demo data...');

  // Clean up existing demo data first (optional — only if you want a fresh seed)
  // We upsert based on email to avoid duplicates

  const now = new Date();

  // ---- 1. Create pending users ----

  // Store merchant (pending 3 days ago — urgent)
  const storeUser = await db.user.upsert({
    where: { email: 'abdulrahman@tech.sa' },
    update: {
      name: 'عبدالرحمن التقنية',
      nameEn: 'Abdulrahman Tech',
      phone: '+966551234567',
      role: 'store',
      accountStatus: 'pending',
      phoneVerified: true,
      emailVerified: false,
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
    create: {
      email: 'abdulrahman@tech.sa',
      name: 'عبدالرحمن التقنية',
      nameEn: 'Abdulrahman Tech',
      phone: '+966551234567',
      role: 'store',
      accountStatus: 'pending',
      phoneVerified: true,
      emailVerified: false,
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  // Freelancer (pending 1 day ago — standard)
  const freelancerUser = await db.user.upsert({
    where: { email: 'sara@design.sa' },
    update: {
      name: 'سارة التصميم',
      nameEn: 'Sara Design',
      phone: '+966559876543',
      role: 'freelancer',
      accountStatus: 'pending',
      phoneVerified: true,
      emailVerified: true,
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    },
    create: {
      email: 'sara@design.sa',
      name: 'سارة التصميم',
      nameEn: 'Sara Design',
      phone: '+966559876543',
      role: 'freelancer',
      accountStatus: 'pending',
      phoneVerified: true,
      emailVerified: true,
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  // Supplier (pending 5 days ago — urgent)
  const supplierUser = await db.user.upsert({
    where: { email: 'fahad@supply.sa' },
    update: {
      name: 'فهد الموردين',
      nameEn: 'Fahad Suppliers',
      phone: '+966553456789',
      role: 'supplier',
      accountStatus: 'pending',
      phoneVerified: true,
      emailVerified: false,
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    },
    create: {
      email: 'fahad@supply.sa',
      name: 'فهد الموردين',
      nameEn: 'Fahad Suppliers',
      phone: '+966553456789',
      role: 'supplier',
      accountStatus: 'pending',
      phoneVerified: true,
      emailVerified: false,
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  // Logistics (pending 2 days ago — standard)
  const logisticsUser = await db.user.upsert({
    where: { email: 'sultan@delivery.sa' },
    update: {
      name: 'سلطان التوصيل',
      nameEn: 'Sultan Delivery',
      phone: '+966557891234',
      role: 'logistics',
      accountStatus: 'pending',
      phoneVerified: true,
      emailVerified: true,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    },
    create: {
      email: 'sultan@delivery.sa',
      name: 'سلطان التوصيل',
      nameEn: 'Sultan Delivery',
      phone: '+966557891234',
      role: 'logistics',
      accountStatus: 'pending',
      phoneVerified: true,
      emailVerified: true,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  // ---- 2. Create verification records ----

  // Store verification
  await db.storeVerification.upsert({
    where: { userId: storeUser.id },
    update: {
      commercialRegisterNumber: 'CR-1234567890',
      commercialRegisterFile: '/uploads/cr_abdulrahman.pdf',
      iban: 'SA0380000000608010167519',
      beneficiaryName: 'عبدالرحمن التقنية',
      bankLetterFile: '/uploads/bank_abdulrahman.pdf',
      managerIdFront: '/uploads/id_front_abdulrahman.jpg',
      managerIdBack: '/uploads/id_back_abdulrahman.jpg',
      verificationStatus: 'pending',
    },
    create: {
      userId: storeUser.id,
      commercialRegisterNumber: 'CR-1234567890',
      commercialRegisterFile: '/uploads/cr_abdulrahman.pdf',
      iban: 'SA0380000000608010167519',
      beneficiaryName: 'عبدالرحمن التقنية',
      bankLetterFile: '/uploads/bank_abdulrahman.pdf',
      managerIdFront: '/uploads/id_front_abdulrahman.jpg',
      managerIdBack: '/uploads/id_back_abdulrahman.jpg',
      verificationStatus: 'pending',
    },
  });

  // Freelancer verification
  await db.freelancerVerification.upsert({
    where: { userId: freelancerUser.id },
    update: {
      freelanceDocFile: '/uploads/freelance_sara.pdf',
      nationalIdFront: '/uploads/nid_front_sara.jpg',
      nationalIdBack: '/uploads/nid_back_sara.jpg',
      selfieUrls: '["/uploads/selfie_sara.jpg"]',
      livenessScore: 0.95,
      iban: 'SA6640000000608010167519',
      verificationStatus: 'pending',
    },
    create: {
      userId: freelancerUser.id,
      freelanceDocFile: '/uploads/freelance_sara.pdf',
      nationalIdFront: '/uploads/nid_front_sara.jpg',
      nationalIdBack: '/uploads/nid_back_sara.jpg',
      selfieUrls: '["/uploads/selfie_sara.jpg"]',
      livenessScore: 0.95,
      iban: 'SA6640000000608010167519',
      verificationStatus: 'pending',
    },
  });

  // Supplier verification
  await db.supplierVerification.upsert({
    where: { userId: supplierUser.id },
    update: {
      commercialLicense: '/uploads/cl_fahad.pdf',
      importLicense: '/uploads/il_fahad.pdf',
      iban: 'SA5020000000608010167519',
      productSamples: '["sample1.jpg","sample2.jpg"]',
      verificationStatus: 'pending',
    },
    create: {
      userId: supplierUser.id,
      commercialLicense: '/uploads/cl_fahad.pdf',
      importLicense: '/uploads/il_fahad.pdf',
      iban: 'SA5020000000608010167519',
      productSamples: '["sample1.jpg","sample2.jpg"]',
      verificationStatus: 'pending',
    },
  });

  // ---- 3. Create seed audit logs ----

  // Clean existing audit logs for demo users
  await db.auditLog.deleteMany({
    where: {
      userId: { in: [storeUser.id, freelancerUser.id, supplierUser.id, logisticsUser.id] },
    },
  });

  // Create submission audit logs
  await db.auditLog.createMany({
    data: [
      {
        userId: storeUser.id,
        adminId: null,
        action: 'submitted',
        details: JSON.stringify({ note: 'تم تقديم طلب إنشاء متجر', noteEn: 'Store creation request submitted' }),
      },
      {
        userId: freelancerUser.id,
        adminId: null,
        action: 'submitted',
        details: JSON.stringify({ note: 'تم تقديم طلب حساب مستقل', noteEn: 'Freelancer account request submitted' }),
      },
      {
        userId: supplierUser.id,
        adminId: null,
        action: 'submitted',
        details: JSON.stringify({ note: 'تم تقديم طلب حساب مورد', noteEn: 'Supplier account request submitted' }),
      },
      {
        userId: logisticsUser.id,
        adminId: null,
        action: 'submitted',
        details: JSON.stringify({ note: 'تم تقديم طلب حساب لوجستي', noteEn: 'Logistics account request submitted' }),
      },
    ],
  });

  // Create some historical approved/rejected audit logs (using generic IDs)
  // These demonstrate the audit trail working
  const existingLogs = await db.auditLog.count({
    where: { adminId: 'admin-001' },
  });

  if (existingLogs === 0) {
    // Create historical logs for demo purposes
    await db.auditLog.createMany({
      data: [
        {
          userId: storeUser.id,
          adminId: 'admin-001',
          action: 'approved',
          details: JSON.stringify({
            reason: 'تم تفعيل حساب سابق - جميع المستندات صالحة',
            reasonEn: 'Previous account approved - all documents valid',
            role: 'store',
          }),
          createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
        },
        {
          userId: freelancerUser.id,
          adminId: 'admin-001',
          action: 'rejected',
          details: JSON.stringify({
            reason: 'مستندات غير واضحة - يرجى إعادة الرفع',
            reasonEn: 'Unclear documents - please re-upload',
            role: 'freelancer',
          }),
          createdAt: new Date(now.getTime() - 36 * 60 * 60 * 1000),
        },
        {
          userId: supplierUser.id,
          adminId: 'admin-001',
          action: 'request_edit',
          details: JSON.stringify({
            reason: 'بيانات الحساب البنكي غير مطابقة',
            reasonEn: 'Bank account info mismatch',
            role: 'supplier',
            editItems: ['vi-iban'],
          }),
          createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        },
      ],
    });
  }

  console.log('✅ Seed data created successfully!');
  console.log(`   - Store user: ${storeUser.id} (${storeUser.email})`);
  console.log(`   - Freelancer user: ${freelancerUser.id} (${freelancerUser.email})`);
  console.log(`   - Supplier user: ${supplierUser.id} (${supplierUser.email})`);
  console.log(`   - Logistics user: ${logisticsUser.id} (${logisticsUser.email})`);
}
