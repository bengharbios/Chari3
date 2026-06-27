import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sellerId = req.nextUrl.searchParams.get('sellerId');
    if (!sellerId) return NextResponse.json({ success: false, error: 'sellerId required' }, { status: 400 });

    const withdrawals = await db.withdrawalRequest.findMany({
      where: { sellerId },
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
    const { sellerId, amount, method, accountNumber, accountName, bankName } = await req.json();

    if (!sellerId || !amount || !method) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const numAmount = Number(amount);

    // 1. Get Settings
    const minSetting = await db.systemSetting.findUnique({ where: { key: 'withdrawal_min_amount' } });
    const minAmount = minSetting ? Number(minSetting.value) : 5000;

    if (numAmount < minAmount) {
      return NextResponse.json({ success: false, error: `Minimum withdrawal amount is ${minAmount}` }, { status: 400 });
    }

    // 2. Get Seller Wallet & Pending Withdrawals
    const seller = await db.sellerProfile.findUnique({
      where: { id: sellerId },
      select: { userId: true }
    });

    if (!seller) {
      return NextResponse.json({ success: false, error: 'Seller not found' }, { status: 404 });
    }

    // Security check: Check for sensitive changes (email or phone updates) in the past 48 hours
    const recentSensitiveChange = await db.auditLog.findFirst({
      where: {
        userId: seller.userId,
        action: { in: ['email_changed', 'phone_changed'] },
        createdAt: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) }
      }
    });

    if (recentSensitiveChange) {
      return NextResponse.json({
        success: false,
        error: 'تم قفل عمليات سحب الأموال مؤقتاً لمدة 48 ساعة لدواعي أمنية بسبب تعديل البريد الإلكتروني أو رقم الهاتف للحساب مؤخراً.'
      }, { status: 400 });
    }

    const wallet = await db.wallet.findUnique({ where: { userId: seller.userId } });
    if (!wallet) {
      return NextResponse.json({ success: false, error: 'Wallet not found' }, { status: 404 });
    }

    const pendingRequests = await db.withdrawalRequest.findMany({
      where: { sellerId, status: 'pending' },
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
        sellerId,
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
