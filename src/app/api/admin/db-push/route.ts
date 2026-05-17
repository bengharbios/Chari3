import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (token !== 'chari3-push-2026') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results = [];

    // 1. Add coverImage and logo to SellerProfile if they don't exist
    try {
      await db.$executeRawUnsafe(`ALTER TABLE SellerProfile ADD COLUMN coverImage VARCHAR(191) NULL;`);
      results.push('Added coverImage to SellerProfile');
    } catch (e: any) {
      if (e.message && e.message.includes('Duplicate column name')) {
        results.push('coverImage already exists in SellerProfile');
      } else {
        results.push(`Error adding coverImage: ${e.message}`);
      }
    }

    const newColumns = [
      "socialLinks VARCHAR(191) DEFAULT '{}'",
      "returnPolicy VARCHAR(191) NULL",
      "shippingPolicy VARCHAR(191) NULL",
      "rating DOUBLE NOT NULL DEFAULT 0",
      "totalSales INTEGER NOT NULL DEFAULT 0",
      "totalCustomers INTEGER NOT NULL DEFAULT 0",
      "totalEarnings DOUBLE NOT NULL DEFAULT 0",
      "commissionPaid DOUBLE NOT NULL DEFAULT 0",
      "completionRate DOUBLE NOT NULL DEFAULT 100",
      "responseRate DOUBLE NOT NULL DEFAULT 100",
      "avgResponseHours DOUBLE NOT NULL DEFAULT 24",
      "challengePoints INTEGER NOT NULL DEFAULT 0",
      "level INTEGER NOT NULL DEFAULT 1",
      "levelUpdatedAt DATETIME(3) NULL",
      "levelGraceUntil DATETIME(3) NULL",
      "packageId VARCHAR(191) NULL",
      "isVerified BOOLEAN NOT NULL DEFAULT false",
      "wantsUpgrade BOOLEAN NOT NULL DEFAULT false",
      "upgradeRequestedAt DATETIME(3) NULL"
    ];

    for (const col of newColumns) {
      try {
        await db.$executeRawUnsafe(`ALTER TABLE SellerProfile ADD COLUMN ${col};`);
        results.push(`Added ${col.split(' ')[0]} to SellerProfile`);
      } catch (e: any) {
        if (!e.message?.includes('Duplicate column name')) {
          results.push(`Error adding ${col.split(' ')[0]}: ${e.message}`);
        }
      }
    }

    const storeColumns = [
      "level INTEGER NOT NULL DEFAULT 1",
      "totalCustomers INTEGER NOT NULL DEFAULT 0",
      "totalEarnings DOUBLE NOT NULL DEFAULT 0",
      "completionRate DOUBLE NOT NULL DEFAULT 100",
      "packageId VARCHAR(191) NULL"
    ];

    for (const col of storeColumns) {
      try {
        await db.$executeRawUnsafe(`ALTER TABLE Store ADD COLUMN ${col};`);
        results.push(`Added ${col.split(' ')[0]} to Store`);
      } catch (e: any) {
        if (!e.message?.includes('Duplicate column name')) {
          results.push(`Error adding ${col.split(' ')[0]} to Store: ${e.message}`);
        }
      }
    }

    // 2. Create Advertisement table if it doesn't exist
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS Advertisement (
          id VARCHAR(191) NOT NULL,
          title VARCHAR(191) NOT NULL,
          titleEn VARCHAR(191) NULL,
          imageUrl VARCHAR(191) NOT NULL,
          linkUrl VARCHAR(191) NULL,
          zone VARCHAR(191) NOT NULL,
          targetRole VARCHAR(191) NOT NULL DEFAULT 'all',
          isActive BOOLEAN NOT NULL DEFAULT true,
          startsAt DATETIME(3) NULL,
          endsAt DATETIME(3) NULL,
          clicks INTEGER NOT NULL DEFAULT 0,
          impressions INTEGER NOT NULL DEFAULT 0,
          sortOrder INTEGER NOT NULL DEFAULT 0,
          createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          updatedAt DATETIME(3) NOT NULL,
          PRIMARY KEY (id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      results.push('Ensured Advertisement table exists');
    } catch (e: any) {
      results.push(`Error creating Advertisement table: ${e.message}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database schema sync executed',
      details: results 
    });

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
