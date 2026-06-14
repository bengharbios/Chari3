import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

// GET all payment methods
export async function GET(request: Request) {
  try {
    const methods = await db.globalPaymentMethod.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ success: true, methods });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch payment methods' }, { status: 500 });
  }
}

// POST a new payment method
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const newMethod = await db.globalPaymentMethod.create({
      data: {
        name: data.name,
        nameEn: data.nameEn || null,
        description: data.description || null,
        type: data.type,
        icon: data.icon || 'CreditCard',
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder || 0,
        fee: parseFloat(data.fee) || 0,
        configSchema: data.configSchema || null,
      },
    });

    return NextResponse.json({ success: true, method: newMethod });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// PUT to update a payment method
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    if (updateData.fee !== undefined) updateData.fee = parseFloat(updateData.fee) || 0;

    const updatedMethod = await db.globalPaymentMethod.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, method: updatedMethod });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// DELETE a payment method
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    await db.globalPaymentMethod.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
