const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultStatuses = [
  { key: 'pending', nameAr: 'معلق', nameEn: 'Pending', color: '#6B7280', sortOrder: 1 },
  { key: 'confirmed', nameAr: 'قيد التجهيز', nameEn: 'Processing', color: '#3B82F6', sortOrder: 2 },
  { key: 'shipped', nameAr: 'تم الشحن', nameEn: 'Shipped', color: '#F59E0B', sortOrder: 3 },
  { key: 'delivered', nameAr: 'تم التوصيل', nameEn: 'Delivered', color: '#10B981', sortOrder: 4 },
  { key: 'cancelled', nameAr: 'ملغي', nameEn: 'Cancelled', color: '#EF4444', sortOrder: 5 },
  { key: 'refunded', nameAr: 'مسترد', nameEn: 'Refunded', color: '#8B5CF6', sortOrder: 6 }
];

async function main() {
  for (const status of defaultStatuses) {
    await prisma.orderStatusType.upsert({
      where: { key: status.key },
      update: status,
      create: status
    });
  }
  console.log('Successfully seeded order statuses');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
