import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !['seller', 'store_manager'].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        verification: {
          include: { documents: true, reviewLogs: true }
        }
      }
    });

    if (!sellerProfile) {
      return NextResponse.json({ success: false, error: 'Seller profile not found' }, { status: 404 });
    }

    if (!sellerProfile.verification) {
      // Return a default NOT_SUBMITTED payload
      return NextResponse.json({ 
        success: true, 
        verification: { status: 'NOT_SUBMITTED', documents: [] } 
      });
    }

    return NextResponse.json({ success: true, verification: sellerProfile.verification });
  } catch (error) {
    console.error('Error fetching seller verification:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !['seller', 'store_manager'].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!sellerProfile) {
      return NextResponse.json({ success: false, error: 'Seller profile not found' }, { status: 404 });
    }

    // Upsert the verification to PENDING_REVIEW
    const verification = await prisma.sellerVerification.upsert({
      where: { sellerId: sellerProfile.id },
      update: {
        status: 'PENDING_REVIEW',
        submittedAt: new Date(),
      },
      create: {
        sellerId: sellerProfile.id,
        status: 'PENDING_REVIEW',
        submittedAt: new Date(),
      }
    });

    return NextResponse.json({ success: true, verification });
  } catch (error) {
    console.error('Error submitting seller verification:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
