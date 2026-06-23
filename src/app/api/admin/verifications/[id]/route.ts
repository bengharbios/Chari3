import { auth } from '@/lib/better-auth';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, status, notes, documentUpdates } = body;

    const verification = await prisma.sellerVerification.findUnique({
      where: { id },
      include: { seller: true }
    });

    if (!verification) {
      return NextResponse.json({ success: false, error: 'Verification not found' }, { status: 404 });
    }

    const oldStatus = verification.status;
    let newStatus = status || oldStatus;

    // Begin Transaction to ensure Audit Log is written
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Documents if provided
      if (documentUpdates && Array.isArray(documentUpdates)) {
        for (const doc of documentUpdates) {
          await tx.verificationDocument.update({
            where: { id: doc.id },
            data: {
              status: doc.status,
              rejectionReason: doc.rejectionReason || null
            }
          });
        }
      }

      // 2. Update Global Status
      const updatedVer = await tx.sellerVerification.update({
        where: { id },
        data: {
          status: newStatus,
          lastReviewedAt: new Date(),
        }
      });

      // 3. Create Audit Log
      await tx.verificationReviewLog.create({
        data: {
          verificationId: id,
          reviewerId: session.user.id,
          reviewerName: session.user.name || 'Admin',
          action: action || 'UPDATED_STATUS',
          oldStatus,
          newStatus,
          notes: notes || null
        }
      });

      // 4. Update SellerProfile isVerified flag if APPROVED
      if (newStatus === 'APPROVED' && oldStatus !== 'APPROVED') {
        await tx.sellerProfile.update({
          where: { id: verification.sellerId },
          data: { isVerified: true }
        });
      } else if (oldStatus === 'APPROVED' && newStatus !== 'APPROVED') {
        await tx.sellerProfile.update({
          where: { id: verification.sellerId },
          data: { isVerified: false }
        });
      }

      return updatedVer;
    });

    return NextResponse.json({ success: true, verification: result });
  } catch (error) {
    console.error('Error updating verification:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    const verification = await prisma.sellerVerification.findUnique({
      where: { id },
      include: {
        seller: {
          include: {
            user: { select: { name: true, email: true, phone: true } }
          }
        },
        documents: true,
        reviewLogs: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!verification) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, verification });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
