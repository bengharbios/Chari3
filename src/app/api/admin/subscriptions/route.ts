import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

// GET /api/admin/subscriptions?status=ACTIVE&search=john&page=1&limit=20
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.SubscriptionWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
        ],
      };
    }

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar: true,
              role: true,
              accountStatus: true,
            },
          },
          package: true,
          invoices: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.subscription.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      subscriptions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('[admin/subscriptions GET]', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
