import { auth } from '@/lib/better-auth';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const userIdParam = req.nextUrl.searchParams.get('userId');
    
    let userId = session?.user?.id;
    let role = session?.user?.role;

    if (!userId && userIdParam) {
      // Fallback for OTP users who don't have NextAuth cookie
      const dbUser = await prisma.user.findUnique({ where: { id: userIdParam } });
      if (dbUser) {
        userId = dbUser.id;
        role = dbUser.role;
      }
    }

    if (!userId || !['seller', 'store_manager'].includes(role || '')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId },
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
        verification: { status: 'NOT_SUBMITTED', documents: [] },
        merchantType: sellerProfile.merchantType
      });
    }

    return NextResponse.json({ success: true, verification: sellerProfile.verification, merchantType: sellerProfile.merchantType });
  } catch (error) {
    console.error('Error fetching seller verification:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const body = await req.json().catch(() => ({})); // Parse body safely
    
    let userId = session?.user?.id;
    let role = session?.user?.role;

    if (!userId && body.userId) {
      const dbUser = await prisma.user.findUnique({ where: { id: body.userId } });
      if (dbUser) {
        userId = dbUser.id;
        role = dbUser.role;
      }
    }

    if (!userId || !['seller', 'store_manager'].includes(role || '')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId }
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

    const superAdmins = await prisma.user.findMany({
      where: { role: { in: ['admin', 'SUPER_ADMIN', 'super_admin'] } },
      select: { id: true }
    });
    
    const adminNotifications = superAdmins.map(admin => ({
      userId: admin.id,
      type: 'NEW_VERIFICATION_SUBMISSION',
      title: 'طلب توثيق جديد (KYC/KYB)',
      titleEn: 'New Verification Request (KYC/KYB)',
      body: `تم تقديم طلب توثيق قانوني جديد بواسطة ${session.user.name}. يرجى مراجعته.`,
      bodyEn: `A new legal verification request has been submitted by ${session.user.name}. Please review it.`,
    }));

    if (adminNotifications.length > 0) {
      await prisma.notification.createMany({
        data: adminNotifications
      });
    }

    return NextResponse.json({ success: true, verification });
  } catch (error) {
    console.error('Error submitting seller verification:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
