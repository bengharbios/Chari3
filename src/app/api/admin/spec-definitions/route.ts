import { NextResponse } from 'next/server';
import { db, ensureDbConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET — Fetch all spec definitions (optionally filtered by categoryId)
export async function GET(request: Request) {
  try {
    await ensureDbConnection();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    const specs = await db.productSpecDefinition.findMany({
      where: {
        isActive: true,
        ...(categoryId
          ? { OR: [{ categoryId }, { categoryId: null }] }
          : {}),
      },
      include: { category: { select: { id: true, name: true, nameEn: true } } },
      orderBy: [{ categoryId: 'asc' }, { sortOrder: 'asc' }],
    });

    return NextResponse.json({ success: true, specs });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST — Create a new spec definition
export async function POST(request: Request) {
  try {
    await ensureDbConnection();
    const body = await request.json();
    const { key, labelAr, labelEn, labelFr, type, options, isRequired, sortOrder, categoryId } = body;

    if (!key || !labelAr || !labelEn) {
      return NextResponse.json({ success: false, error: 'key, labelAr and labelEn are required' }, { status: 400 });
    }

    const spec = await db.productSpecDefinition.create({
      data: {
        key: key.trim().toLowerCase().replace(/\s+/g, '_'),
        labelAr,
        labelEn,
        labelFr: labelFr || null,
        type: type || 'text',
        options: options
          ? JSON.stringify(String(options).split(/[,;\n]/).map((s: string) => s.trim()).filter(Boolean))
          : null,
        isRequired: !!isRequired,
        sortOrder: Number(sortOrder) || 0,
        categoryId: categoryId || null,
      },
    });

    return NextResponse.json({ success: true, spec }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
