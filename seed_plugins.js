const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding base platform plugins...');

  const pluginsToSeed = [
    {
      id: 'chargily',
      type: 'PAYMENT',
      name: 'Chargily Pay',
      description: 'بوابة الدفع الإلكتروني شارجيلي (الجزائر)',
      author: 'ChariDay',
      version: '1.0.0',
      isActive: true,
      configSchema: JSON.stringify([
        {
          key: 'publicKey',
          labelAr: 'المفتاح العام (Public Key)',
          labelEn: 'Public Key',
          type: 'string',
          required: true,
          descriptionAr: 'تجده في إعدادات API في حساب Chargily',
          descriptionEn: 'Found in API Settings of your Chargily account'
        },
        {
          key: 'secretKey',
          labelAr: 'المفتاح السري (Secret Key)',
          labelEn: 'Secret Key',
          type: 'password',
          required: true,
          descriptionAr: 'يجب أن يبقى سرياً',
          descriptionEn: 'Keep it secret'
        }
      ])
    },
    {
      id: 'cod',
      type: 'PAYMENT',
      name: 'Cash on Delivery (COD)',
      description: 'الدفع عند الاستلام',
      author: 'ChariDay',
      version: '1.0.0',
      isActive: true,
      configSchema: JSON.stringify([]) // No specific config required for COD globally
    },
    {
      id: 'bank_transfer',
      type: 'PAYMENT',
      name: 'Bank Transfer',
      description: 'تحويل بنكي / بريدي',
      author: 'ChariDay',
      version: '1.0.0',
      isActive: true,
      configSchema: JSON.stringify([
        {
          key: 'bankName',
          labelAr: 'اسم البنك / البريد',
          labelEn: 'Bank / Postal Service Name',
          type: 'string',
          required: true
        },
        {
          key: 'accountNumber',
          labelAr: 'رقم الحساب',
          labelEn: 'Account Number',
          type: 'string',
          required: true
        }
      ])
    }
  ];

  for (const p of pluginsToSeed) {
    const existing = await prisma.platformPlugin.findUnique({
      where: { id: p.id }
    });

    if (existing) {
      await prisma.platformPlugin.update({
        where: { id: p.id },
        data: p
      });
      console.log(`Updated plugin: ${p.id}`);
    } else {
      await prisma.platformPlugin.create({
        data: p
      });
      console.log(`Created plugin: ${p.id}`);
    }
  }

  console.log('Done seeding plugins.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
