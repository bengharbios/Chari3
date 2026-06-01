import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const statuses = await db.orderStatusType.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    return NextResponse.json({ success: true, statuses });
  } catch (error) {
    // If the table doesn't exist yet, return a fallback array so the UI doesn't crash before migration
    console.error('[order-statuses GET]', error);
    return NextResponse.json({ 
      success: true, 
      statuses: [
        { key: 'pending', nameAr: 'معلق', nameEn: 'Pending', color: '#6B7280', sortOrder: 1 },
        { key: 'confirmed', nameAr: 'قيد التجهيز', nameEn: 'Processing', color: '#3B82F6', sortOrder: 2 },
        { key: 'shipped', nameAr: 'تم الشحن', nameEn: 'Shipped', color: '#F59E0B', sortOrder: 3 },
        { key: 'delivered', nameAr: 'تم التوصيل', nameEn: 'Delivered', color: '#10B981', sortOrder: 4 },
        { key: 'cancelled', nameAr: 'ملغي', nameEn: 'Cancelled', color: '#EF4444', sortOrder: 5 },
        { key: 'refunded', nameAr: 'مسترد', nameEn: 'Refunded', color: '#8B5CF6', sortOrder: 6 }
      ] 
    });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const newStatus = await db.orderStatusType.create({ data });
    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const data = await req.json();
    const updated = await db.orderStatusType.update({
      where: { id: data.id },
      data
    });
    return NextResponse.json({ success: true, status: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    
    await db.orderStatusType.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
