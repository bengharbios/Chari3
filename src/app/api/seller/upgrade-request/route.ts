import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/better-auth';
import { db } from '@/lib/db';
import { headers } from 'next/headers';

// POST /api/seller/upgrade-request
// Submit business upgrade details and documents
export async function POST(req: NextRequest) {
  try {
    const session = await getSession(await headers());
    if (!session || !session.user || (session.user as any).role !== 'seller') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { sellerProfile: true }
    });

    if (!user || !user.sellerProfile) {
      return NextResponse.json({ success: false, error: 'Seller profile not found' }, { status: 404 });
    }

    // Guard 1: Must be active (fully verified freelancer)
    if (user.accountStatus !== 'active') {
      return NextResponse.json({ 
        success: false, 
        error: 'Please complete your freelancer verification first.' 
      }, { status: 400 });
    }

    // Guard 2: Must not have a pending or awaiting payment request
    const existingActiveRequest = await db.upgradeRequest.findFirst({
      where: {
        userId: user.id,
        isActive: true,
        status: { in: ['PENDING', 'AWAITING_PAYMENT', 'PAYMENT_SUBMITTED'] }
      }
    });

    if (existingActiveRequest) {
      return NextResponse.json({ 
        success: false, 
        error: 'An active upgrade request already exists.' 
      }, { status: 400 });
    }

    // Parse request body
    const body = await req.json();
    const {
      businessRegisterNumber,
      businessRegisterFile,
      businessNisNumber,
      businessIban,
      businessBankName,
      businessBankLetterFile,
      businessManagerIdFront,
      businessManagerIdBack
    } = body;

    // Validation
    if (!businessRegisterNumber || !businessRegisterFile || !businessManagerIdFront || !businessManagerIdBack) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required documents (Commercial Register and ID proofs).' 
      }, { status: 400 });
    }

    if (businessIban && !/^DZ\d{22}$/.test(businessIban.replace(/\s+/g, ''))) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid IBAN format. Must start with DZ and contain 24 characters.' 
      }, { status: 400 });
    }

    // Deactivate any previous requests
    await db.upgradeRequest.updateMany({
      where: { userId: user.id, isActive: true },
      data: { isActive: false }
    });

    // Fetch dynamic fee
    const billingAddon = await db.billingAddon.findUnique({
      where: { key: 'business_upgrade' }
    });
    const feeSnapshot = billingAddon?.price ?? 500;

    // Create new request
    const upgradeReq = await db.upgradeRequest.create({
      data: {
        userId: user.id,
        status: 'PENDING',
        feeSnapshot: feeSnapshot,
        isActive: true,
        businessRegisterNumber,
        businessRegisterFile,
        businessNisNumber,
        businessIban,
        businessBankName,
        businessBankLetterFile,
        businessManagerIdFront,
        businessManagerIdBack
      }
    });

    // Set wantsUpgrade = true in profile for compatibility
    await db.sellerProfile.update({
      where: { id: user.sellerProfile.id },
      data: {
        wantsUpgrade: true,
        upgradeRequestedAt: new Date()
      }
    });

    // Notify admins about new upgrade request
    const admins = await db.user.findMany({
      where: { role: { in: ['admin', 'SUPER_ADMIN', 'super_admin'] } },
      select: { id: true }
    });

    const adminNotifications = admins.map((admin) => ({
      userId: admin.id,
      type: 'UPGRADE_REQUEST',
      title: 'طلب ترقية جديد لمستندات متجر أعمال',
      titleEn: 'New Business Upgrade Request',
      body: `قدم التاجر ${user.name || user.email} طلب ترقية جديد بمستندات متجره وهو قيد المراجعة.`,
      bodyEn: `Merchant ${user.name || user.email} submitted a new business upgrade request.`,
    }));

    if (adminNotifications.length > 0) {
      await db.notification.createMany({
        data: adminNotifications
      });
    }

    return NextResponse.json({ success: true, data: upgradeReq });
  } catch (error: any) {
    console.error('[POST /api/seller/upgrade-request] error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// PUT /api/seller/upgrade-request
// Upload payment receipt for upgrade fee
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession(await headers());
    if (!session || !session.user || (session.user as any).role !== 'seller') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentReceiptFile, paymentReceiptNote } = await req.json();

    if (!paymentReceiptFile) {
      return NextResponse.json({ success: false, error: 'Payment receipt file is required.' }, { status: 400 });
    }

    // Find the active awaiting payment request
    const activeRequest = await db.upgradeRequest.findFirst({
      where: {
        userId: session.user.id,
        isActive: true,
        status: 'AWAITING_PAYMENT'
      }
    });

    if (!activeRequest) {
      return NextResponse.json({ 
        success: false, 
        error: 'No active upgrade request awaiting payment was found.' 
      }, { status: 404 });
    }

    // Update status to PAYMENT_SUBMITTED
    const updatedRequest = await db.upgradeRequest.update({
      where: { id: activeRequest.id },
      data: {
        status: 'PAYMENT_SUBMITTED',
        paymentReceiptFile,
        paymentReceiptNote,
        paymentRejectionReason: null // Reset any previous receipt rejection note
      }
    });

    // Notify admins about receipt submission
    const admins = await db.user.findMany({
      where: { role: { in: ['admin', 'SUPER_ADMIN', 'super_admin'] } },
      select: { id: true }
    });

    const adminNotifications = admins.map((admin) => ({
      userId: admin.id,
      type: 'UPGRADE_REQUEST_PAYMENT',
      title: 'رفع وصل سداد ترقية متجر أعمال',
      titleEn: 'Business Upgrade Receipt Submitted',
      body: `قام التاجر ${session.user.name || session.user.email} برفع وصل دفع لرسوم الترقية للتحقق منه.`,
      bodyEn: `Merchant ${session.user.name || session.user.email} uploaded a payment receipt for verification.`,
    }));

    if (adminNotifications.length > 0) {
      await db.notification.createMany({
        data: adminNotifications
      });
    }

    return NextResponse.json({ success: true, data: updatedRequest });
  } catch (error: any) {
    console.error('[PUT /api/seller/upgrade-request] error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

