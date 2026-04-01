import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get('parentId');

  const where: Record<string, unknown> = {
    isActive: true,
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
      _count: { select: { products: true } },
    },
  });

  return NextResponse.json(
    categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      nameEn: cat.nameEn,
      slug: cat.slug,
      icon: cat.icon,
      image: cat.image,
      sortOrder: cat.sortOrder,
      productCount: cat._count.products,
    }))
  );
}
