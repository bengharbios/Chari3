import { auth } from '@/lib/better-auth';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user || (session.user.role !== 'admin' && session.user.role !== 'super_admin' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const verifications = await prisma.sellerVerification.findMany({
      where,
      include: {
        seller: {
          include: {
            user: { select: { name: true, email: true, phone: true } }
          }
        },
        documents: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: verifications });
  } catch (error) {
    console.error('Error fetching verifications:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
