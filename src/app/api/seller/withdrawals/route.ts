import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const isAdmin = session.user.role === 'admin' || (session.user as any).role === 'SUPER_ADMIN';

    // If admin, they can pass sellerId to view. If seller, force their own profile.
    let seller = null;
    const requestedSellerId = req.nextUrl.searchParams.get('sellerId');

    if (isAdmin && requestedSellerId) {
      seller = await db.sellerProfile.findFirst({
        where: {
          OR: [
            { id: requestedSellerId },
            { userId: requestedSellerId }
          ]
        }
      });
    } else {
      // Strictly resolve to authenticated user's own profile
      seller = await db.sellerProfile.findUnique({
        where: { userId: session.user.id }
      });
    }

    if (!seller) {
      return NextResponse.json({ success: false, error: 'Seller profile not found' }, { status: 404 });
    }

    const withdrawals = await db.withdrawalRequest.findMany({
      where: { sellerId: seller.id },
      orderBy: { createdAt: 'desc' },
    });

    const settings = await db.systemSetting.findMany({
      where: { key: { in: ['withdrawal_min_amount', 'withdrawal_methods'] } }
    });

    const settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({ 
      success: true, 
      withdrawals,
      settings: {
        minAmount: Number(settingsMap['withdrawal_min_amount']) || 5000,
        methods: settingsMap['withdrawal_methods'] ? JSON.parse(settingsMap['withdrawal_methods']) : ['ccp']
      }
    });
  } catch (error) {
    console.error('[seller/withdrawals GET]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const { amount, method, accountNumber, accountName, bankName } = await req.json();

    if (!amount || !method) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const numAmount = Number(amount);

    // 1. Get Settings
    const minSetting = await db.systemSetting.findUnique({ where: { key: 'withdrawal_min_amount' } });
    const minAmount = minSetting ? Number(minSetting.value) : 5000;

    if (numAmount < minAmount) {
      return NextResponse.json({ success: false, error: `Minimum withdrawal amount is ${minAmount}` }, { status: 400 });
    }

    // 2. Get Authenticated Seller Wallet & Pending Withdrawals
    const seller = await db.sellerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, userId: true }
    });

    if (!seller) {
      return NextResponse.json({ success: false, error: 'Forbidden: You do not have an active seller profile' }, { status: 403 });
    }

    // Security check: Check for sensitive changes dynamically using admin-configured hold hours
    const holdSetting = await db.systemSetting.findUnique({ where: { key: 'security_withdrawal_hold_hours' } });
    const holdHours = holdSetting ? Number(holdSetting.value) : 48;

    const recentSensitiveChange = await db.auditLog.findFirst({
      where: {
        userId: seller.userId,
        action: { in: ['email_changed', 'phone_changed', 'rib_changed'] },
        createdAt: { gte: new Date(Date.now() - holdHours * 60 * 60 * 1000) }
      }
    });

    if (recentSensitiveChange) {
      return NextResponse.json({
        success: false,
        error: `تم قفل عمليات سحب الأموال مؤقتاً لمدة ${holdHours} ساعة لدواعي أمنية بسبب تعديل البريد الإلكتروني، رقم الهاتف، أو الحساب البنكي (RIB) مؤخراً.`,
        holdHours
      }, { status: 400 });
    }

    const wallet = await db.wallet.findUnique({ where: { userId: seller.userId } });
    if (!wallet) {
      return NextResponse.json({ success: false, error: 'Wallet not found' }, { status: 404 });
    }

    const pendingRequests = await db.withdrawalRequest.findMany({
      where: { sellerId: seller.id, status: 'pending' },
    });

    const totalPending = pendingRequests.reduce((sum, req) => sum + req.amount, 0);
    const availableBalance = wallet.balance - totalPending;

    if (numAmount > availableBalance) {
      return NextResponse.json({ 
        success: false, 
        error: `Insufficient available balance. You have ${wallet.balance} but ${totalPending} is pending.` 
      }, { status: 400 });
    }

    // 3. Create Request
    const request = await db.withdrawalRequest.create({
      data: {
        sellerId: seller.id,
        amount: numAmount,
        method,
        accountNumber,
        accountName,
        bankName,
        status: 'pending'
      }
    });

    return NextResponse.json({ success: true, request });
  } catch (error) {
    console.error('[seller/withdrawals POST]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
