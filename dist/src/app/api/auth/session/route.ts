import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // For demo purposes, accept userId as query param.
    // In production, this would use session cookies / JWT tokens.
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // ── Look up user in database ──
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        nameEn: true,
        avatar: true,
        role: true,
        accountStatus: true,
        isActive: true,
        isVerified: true,
        phoneVerified: true,
        emailVerified: true,
        locale: true,
        createdAt: true,
        updatedAt: true,
        sellerProfile: {
          select: {
            id: true,
            storeName: true,
            storeNameEn: true,
            isVerified: true,
            rating: true,
            totalSales: true,
          },
        },
        logisticsProfile: {
          select: {
            id: true,
            vehicleType: true,
            isOnline: true,
            rating: true,
            totalDeliveries: true,
          },
        },
        buyerProfile: {
          select: {
            id: true,
            totalOrders: true,
            totalSpent: true,
            loyaltyPoints: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            slug: true,
            isActive: true,
            rating: true,
          },
        },
        wallet: {
          select: {
            id: true,
            balance: true,
            totalEarned: true,
            totalSpent: true,
            currency: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
      accountStatus: user.accountStatus,
    });
  } catch (error) {
    console.error('[session] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
