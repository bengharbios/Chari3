import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/admin/packages
export async function GET() {
  try {
    const packages = await db.sellerPackage.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { sellers: true, stores: true } },
      },
    });
    return NextResponse.json({ success: true, packages });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

// POST /api/admin/packages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pkg = await db.sellerPackage.create({ data: body });
    return NextResponse.json({ success: true, package: pkg });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

// PATCH /api/admin/packages  (id in body)
export async function PATCH(req: NextRequest) {
  try {
    const { id, ...data } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
    const pkg = await db.sellerPackage.update({ where: { id }, data });
    return NextResponse.json({ success: true, package: pkg });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

// DELETE /api/admin/packages?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
    await db.sellerPackage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
