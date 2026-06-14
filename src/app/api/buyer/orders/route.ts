import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || '3months';

    let dateFilter = new Date();
    if (filter === '3months') {
      dateFilter.setMonth(dateFilter.getMonth() - 3);
    } else if (filter === '6months') {
      dateFilter.setMonth(dateFilter.getMonth() - 6);
    } else {
      dateFilter.setFullYear(2000); // effectively all time
    }

    const orders = await db.order.findMany({
      where: {
        buyerId: session.user.id,
        createdAt: { gte: dateFilter }
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
