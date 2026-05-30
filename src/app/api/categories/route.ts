import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get('parentId');

  const type = searchParams.get('type') || 'product';

  const where: Record<string, unknown> = {
    isActive: true,
    type,
  };
  
  if (parentId === 'null' || !parentId) {
    where.parentId = null;
  } else {
    where.parentId = parentId;
  }

  const categories = await db.category.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: { select: { products: true, stores: true, sellerProfiles: true } },
    },
  });

  return NextResponse.json(
    categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      nameEn: cat.nameEn,
      slug: cat.slug,
      type: cat.type,
      icon: cat.icon,
      image: cat.image,
      sortOrder: cat.sortOrder,
      productCount: cat._count.products,
      storeCount: (cat as any)._count?.stores,
      sellerCount: (cat as any)._count?.sellerProfiles,
    }))
  );
}
