// ============================================
// SEED ROLES — CharyDay Platform
// ============================================
// Upserts all 6 default system roles into the Role table.
// Safe to run multiple times (idempotent via upsert).

import { db } from '@/lib/db';
import { DEFAULT_ROLE_PERMISSIONS, TOTAL_PERMISSIONS } from '@/lib/permissions';

interface RoleSeedEntry {
  key: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  color: string;
  icon: string;
  sortOrder: number;
}

const ROLE_SEEDS: RoleSeedEntry[] = [
  {
    key: 'admin',
    nameAr: 'مدير النظام',
    nameEn: 'System Administrator',
    descriptionAr: 'وصول كامل لجميع وظائف وإعدادات المنصة. دور مدير النظام له صلاحيات غير محدودة.',
    descriptionEn: 'Full access to all platform functions and settings. The system administrator role has unrestricted permissions.',
    color: '#7C3AED',
    icon: 'Shield',
    sortOrder: 0,
  },
  {
    key: 'store_manager',
    nameAr: 'مدير متجر',
    nameEn: 'Store Manager',
    descriptionAr: 'إدارة متجر كامل مع المنتجات والطلبات والموظفين والتحليلات. لديه صلاحيات شاملة على متجره.',
    descriptionEn: 'Full store management including products, orders, staff, and analytics. Has comprehensive permissions for their store.',
    color: '#2563EB',
    icon: 'Store',
    sortOrder: 1,
  },
  {
    key: 'seller',
    nameAr: 'تاجر مستقل',
    nameEn: 'Independent Seller',
    descriptionAr: 'تاجر مستقل يمكنه بيع المنتجات مباشرة مع إدارة منتجاته وطلباته. يمكنه الترقية إلى مدير متجر.',
    descriptionEn: 'Independent seller who can list products and manage orders. Can upgrade to store manager.',
    color: '#D97706',
    icon: 'UserCircle',
    sortOrder: 2,
  },
  {
    key: 'supplier',
    nameAr: 'مورد',
    nameEn: 'Supplier',
    descriptionAr: 'مورد منتجات بالجملة يدير المخزون والمنتجات والطلبات الخاصة به.',
    descriptionEn: 'Wholesale product supplier managing inventory, products, and own orders.',
    color: '#0D9488',
    icon: 'Package',
    sortOrder: 3,
  },
  {
    key: 'logistics',
    nameAr: 'مندوب شحن',
    nameEn: 'Courier / Logistics',
    descriptionAr: 'مندوب شحن وتوصيل يدير الشحنات والتسليمات وأرباحه.',
    descriptionEn: 'Delivery courier managing shipments, deliveries, and earnings.',
    color: '#0891B2',
    icon: 'Truck',
    sortOrder: 4,
  },
  {
    key: 'buyer',
    nameAr: 'مشتري',
    nameEn: 'Buyer',
    descriptionAr: 'مشتري يمكنه تصفح المنتجات وطلب الشراء وإدارة الطلبات والمحفظة والتقييمات.',
    descriptionEn: 'Buyer who can browse products, place orders, manage wallet, and write reviews.',
    color: '#16A34A',
    icon: 'ShoppingBag',
    sortOrder: 5,
  },
];

/**
 * Seeds all default system roles into the database.
 * Uses upsert to be idempotent — safe to call multiple times.
 *
 * @returns Object with count of roles created/updated
 */
export async function seedRoles(): Promise<{ created: number; updated: number; total: number }> {
  let created = 0;
  let updated = 0;

  for (const seed of ROLE_SEEDS) {
    const permissions = DEFAULT_ROLE_PERMISSIONS[seed.key] || [];

    const result = await db.role.upsert({
      where: { key: seed.key },
      update: {
        nameAr: seed.nameAr,
        nameEn: seed.nameEn,
        descriptionAr: seed.descriptionAr,
        descriptionEn: seed.descriptionEn,
        color: seed.color,
        icon: seed.icon,
        permissions: JSON.stringify(permissions),
        isSystem: true,
        sortOrder: seed.sortOrder,
        isActive: true,
      },
      create: {
        key: seed.key,
        nameAr: seed.nameAr,
        nameEn: seed.nameEn,
        descriptionAr: seed.descriptionAr,
        descriptionEn: seed.descriptionEn,
        color: seed.color,
        icon: seed.icon,
        permissions: JSON.stringify(permissions),
        isSystem: true,
        sortOrder: seed.sortOrder,
        isActive: true,
      },
    });

    // Check if this was a create or update by comparing creation timestamps
    // Since upsert always returns the record, we check if it was just created
    // by looking at whether it existed before
    if (result.createdAt.getTime() === result.updatedAt.getTime()) {
      created++;
    } else {
      updated++;
    }
  }

  console.log(
    `[seedRoles] Done: ${created} created, ${updated} updated, ${TOTAL_PERMISSIONS} total permissions defined`
  );

  return { created, updated, total: created + updated };
}
