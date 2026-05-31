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

    // 3. Create SystemSetting table if it doesn't exist
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS SystemSetting (
          \`key\` VARCHAR(191) NOT NULL,
          \`value\` JSON NOT NULL,
          \`updatedBy\` VARCHAR(191) NOT NULL,
          \`updatedAt\` DATETIME(3) NOT NULL,
          PRIMARY KEY (\`key\`)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      results.push('Ensured SystemSetting table exists');
    } catch (e: any) {
      results.push(`Error creating SystemSetting table: ${e.message}`);
    }

    // 4. Create AdminAuditLog table if it doesn't exist
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS AdminAuditLog (
          id VARCHAR(191) NOT NULL,
          adminId VARCHAR(191) NOT NULL,
          action VARCHAR(191) NOT NULL,
          targetId VARCHAR(191) NULL,
          details JSON NULL,
          ipAddress VARCHAR(191) NULL,
          createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          PRIMARY KEY (id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      results.push('Ensured AdminAuditLog table exists');
    } catch (e: any) {
      results.push(`Error creating AdminAuditLog table: ${e.message}`);
    }

    // 5. Create SellerLevel table if it doesn't exist
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS SellerLevel (
          id VARCHAR(191) NOT NULL,
          level INTEGER NOT NULL,
          nameAr VARCHAR(191) NOT NULL,
          nameEn VARCHAR(191) NOT NULL,
          badge VARCHAR(191) NOT NULL,
          badgeColor VARCHAR(191) NOT NULL DEFAULT '#6B7280',
          minCustomers INTEGER NOT NULL DEFAULT 0,
          minRating DOUBLE NOT NULL DEFAULT 0,
          minCompletionRate DOUBLE NOT NULL DEFAULT 0,
          minResponseRate DOUBLE NOT NULL DEFAULT 0,
          maxResponseHours INTEGER NOT NULL DEFAULT 48,
          maxProducts INTEGER NOT NULL DEFAULT 5,
          commissionDiscount DOUBLE NOT NULL DEFAULT 0,
          bonusFeatures VARCHAR(191) NOT NULL DEFAULT '[]',
          gracePeriodDays INTEGER NOT NULL DEFAULT 180,
          searchBoost DOUBLE NOT NULL DEFAULT 1.0,
          isActive BOOLEAN NOT NULL DEFAULT true,
          createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          updatedAt DATETIME(3) NOT NULL,
          PRIMARY KEY (id),
          UNIQUE KEY SellerLevel_level_key (level)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      results.push('Ensured SellerLevel table exists');
    } catch (e: any) {
      results.push(`Error creating SellerLevel table: ${e.message}`);
    }

    // 6. Create SellerReview table if it doesn't exist
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS SellerReview (
          id VARCHAR(191) NOT NULL,
          rating INTEGER NOT NULL,
          speedRating INTEGER NULL,
          qualityRating INTEGER NULL,
          commRating INTEGER NULL,
          comment VARCHAR(191) NULL,
          sellerReply VARCHAR(191) NULL,
          replyAt DATETIME(3) NULL,
          isApproved BOOLEAN NOT NULL DEFAULT true,
          sellerId VARCHAR(191) NOT NULL,
          buyerId VARCHAR(191) NOT NULL,
          orderId VARCHAR(191) NULL,
          createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          updatedAt DATETIME(3) NOT NULL,
          PRIMARY KEY (id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      results.push('Ensured SellerReview table exists');
    } catch (e: any) {
      results.push(`Error creating SellerReview table: ${e.message}`);
    }

    // 7. Create WithdrawalRequest table if it doesn't exist
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS WithdrawalRequest (
          id VARCHAR(191) NOT NULL,
          amount DOUBLE NOT NULL,
          method VARCHAR(191) NOT NULL,
          status VARCHAR(191) NOT NULL DEFAULT 'pending',
          accountNumber VARCHAR(191) NULL,
          accountName VARCHAR(191) NULL,
          bankName VARCHAR(191) NULL,
          note VARCHAR(191) NULL,
          adminNote VARCHAR(191) NULL,
          processedAt DATETIME(3) NULL,
          createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          updatedAt DATETIME(3) NOT NULL,
          sellerId VARCHAR(191) NOT NULL,
          PRIMARY KEY (id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      results.push('Ensured WithdrawalRequest table exists');
    } catch (e: any) {
      results.push(`Error creating WithdrawalRequest table: ${e.message}`);
    }

    // 8. Create Challenge table if it doesn't exist
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS Challenge (
          id VARCHAR(191) NOT NULL,
          title VARCHAR(191) NOT NULL,
          titleEn VARCHAR(191) NULL,
          description VARCHAR(191) NULL,
          type VARCHAR(191) NOT NULL,
          targetValue DOUBLE NOT NULL,
          rewardType VARCHAR(191) NOT NULL DEFAULT 'badge',
          rewardValue VARCHAR(191) NOT NULL,
          startsAt DATETIME(3) NOT NULL,
          endsAt DATETIME(3) NOT NULL,
          isActive BOOLEAN NOT NULL DEFAULT true,
          createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          updatedAt DATETIME(3) NOT NULL,
          PRIMARY KEY (id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      results.push('Ensured Challenge table exists');
    } catch (e: any) {
      results.push(`Error creating Challenge table: ${e.message}`);
    }

    // 9. Create Wallet table if it doesn't exist
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS Wallet (
          id VARCHAR(191) NOT NULL,
          balance DOUBLE NOT NULL DEFAULT 0,
          totalEarned DOUBLE NOT NULL DEFAULT 0,
          totalSpent DOUBLE NOT NULL DEFAULT 0,
          currency VARCHAR(191) NOT NULL DEFAULT 'SAR',
          createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          updatedAt DATETIME(3) NOT NULL,
          userId VARCHAR(191) NOT NULL,
          PRIMARY KEY (id),
          UNIQUE KEY Wallet_userId_key (userId)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      results.push('Ensured Wallet table exists');
    } catch (e: any) {
      results.push(`Error creating Wallet table: ${e.message}`);
    }

    // 10. Create WalletTransaction table if it doesn't exist
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS WalletTransaction (
          id VARCHAR(191) NOT NULL,
          type VARCHAR(191) NOT NULL,
          amount DOUBLE NOT NULL,
          balance DOUBLE NOT NULL,
          description VARCHAR(191) NULL,
          referenceId VARCHAR(191) NULL,
          createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          walletId VARCHAR(191) NOT NULL,
          PRIMARY KEY (id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      results.push('Ensured WalletTransaction table exists');
    } catch (e: any) {
      results.push(`Error creating WalletTransaction table: ${e.message}`);
    }

    // 11. Create ProductVariant table if it doesn't exist
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS ProductVariant (
          id VARCHAR(191) NOT NULL,
          name VARCHAR(191) NOT NULL,
          value VARCHAR(191) NOT NULL,
          sku VARCHAR(191) NULL,
          price DOUBLE NULL,
          comparePrice DOUBLE NULL,
          stock INTEGER NOT NULL DEFAULT 0,
          image VARCHAR(191) NULL,
          sortOrder INTEGER NOT NULL DEFAULT 0,
          isActive BOOLEAN NOT NULL DEFAULT true,
          createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          productId VARCHAR(191) NOT NULL,
          PRIMARY KEY (id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      results.push('Ensured ProductVariant table exists');
    } catch (e: any) {
      results.push(`Error creating ProductVariant table: ${e.message}`);
    }

    // 12. Ensure comparePrice column exists in ProductVariant table
    try {
      await db.$executeRawUnsafe(`
        ALTER TABLE ProductVariant ADD COLUMN comparePrice DOUBLE NULL;
      `);
      results.push('Added comparePrice column to ProductVariant table');
    } catch (e: any) {
      if (e.message?.includes('1060') || e.message?.includes('Duplicate column')) {
        results.push('comparePrice column already exists in ProductVariant');
      } else {
        results.push(`Error adding comparePrice column: ${e.message}`);
      }
    }

    // 13. Ensure categoryId column exists in Store and SellerProfile
    try {
      await db.$executeRawUnsafe(`ALTER TABLE Store ADD COLUMN categoryId VARCHAR(191) NULL;`);
      results.push('Added categoryId column to Store table');
    } catch (e: any) {
      if (!e.message?.includes('Duplicate column')) {
        results.push(`Error adding categoryId to Store: ${e.message}`);
      }
    }
    try {
      await db.$executeRawUnsafe(`ALTER TABLE SellerProfile ADD COLUMN categoryId VARCHAR(191) NULL;`);
      results.push('Added categoryId column to SellerProfile table');
    } catch (e: any) {
      if (!e.message?.includes('Duplicate column')) {
        results.push(`Error adding categoryId to SellerProfile: ${e.message}`);
      }
    }

    // 14. Ensure Category parentId and type columns exist
    try {
      await db.$executeRawUnsafe(`ALTER TABLE Category ADD COLUMN type VARCHAR(191) NOT NULL DEFAULT 'product';`);
      results.push('Added type column to Category table');
    } catch (e: any) {
      if (!e.message?.includes('Duplicate column')) {
        results.push(`Error adding type to Category: ${e.message}`);
      }
    }
    try {
      await db.$executeRawUnsafe(`ALTER TABLE Category ADD COLUMN parentId VARCHAR(191) NULL;`);
      results.push('Added parentId column to Category table');
    } catch (e: any) {
      if (!e.message?.includes('Duplicate column')) {
        results.push(`Error adding parentId to Category: ${e.message}`);
      }
    }

    // 15. Ensure Product brandId column exists
    try {
      await db.$executeRawUnsafe(`ALTER TABLE Product ADD COLUMN brandId VARCHAR(191) NULL;`);
      results.push('Added brandId column to Product table');
    } catch (e: any) {
      if (!e.message?.includes('Duplicate column')) {
        results.push(`Error adding brandId to Product: ${e.message}`);
      }
    }

    // 16. Create Brand table if it doesn't exist
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS Brand (
          id VARCHAR(191) NOT NULL,
          name VARCHAR(191) NOT NULL,
          nameEn VARCHAR(191) NULL,
          logo VARCHAR(191) NULL,
          isActive BOOLEAN NOT NULL DEFAULT true,
          createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          PRIMARY KEY (id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      results.push('Ensured Brand table exists');
    } catch (e: any) {
      results.push(`Error creating Brand table: ${e.message}`);
    }

    // 17. Create CategoryRequest table if it doesn't exist
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS CategoryRequest (
          id VARCHAR(191) NOT NULL,
          nameAr VARCHAR(191) NOT NULL,
          nameEn VARCHAR(191) NULL,
          description VARCHAR(191) NULL,
          type VARCHAR(191) NOT NULL DEFAULT 'product',
          status VARCHAR(191) NOT NULL DEFAULT 'pending',
          adminNote VARCHAR(191) NULL,
          createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          userId VARCHAR(191) NOT NULL,
          PRIMARY KEY (id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      results.push('Ensured CategoryRequest table exists');
    } catch (e: any) {
      results.push(`Error creating CategoryRequest table: ${e.message}`);
    }

    // 18. Create Geolocation tables: Country, State, City
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS Country (
          id VARCHAR(191) NOT NULL,
          code VARCHAR(191) NOT NULL,
          nameAr VARCHAR(191) NOT NULL,
          nameEn VARCHAR(191) NOT NULL,
          currency VARCHAR(191) NOT NULL DEFAULT 'DZD',
          phonePrefix VARCHAR(191) NOT NULL DEFAULT '+213',
          isActive BOOLEAN NOT NULL DEFAULT true,
          createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          PRIMARY KEY (id),
          UNIQUE KEY Country_code_key (code)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      results.push('Ensured Country table exists');
    } catch (e: any) {
      results.push(`Error creating Country table: ${e.message}`);
    }

    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS State (
          id VARCHAR(191) NOT NULL,
          code VARCHAR(191) NOT NULL,
          nameAr VARCHAR(191) NOT NULL,
          nameEn VARCHAR(191) NOT NULL,
          defaultPrice DOUBLE NOT NULL DEFAULT 500,
          isActive BOOLEAN NOT NULL DEFAULT true,
          createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          countryId VARCHAR(191) NOT NULL,
          PRIMARY KEY (id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      results.push('Ensured State table exists');
    } catch (e: any) {
      results.push(`Error creating State table: ${e.message}`);
    }

    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS City (
          id VARCHAR(191) NOT NULL,
          nameAr VARCHAR(191) NOT NULL,
          nameEn VARCHAR(191) NOT NULL,
          isActive BOOLEAN NOT NULL DEFAULT true,
          createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          stateId VARCHAR(191) NOT NULL,
          PRIMARY KEY (id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      results.push('Ensured City table exists');
    } catch (e: any) {
      results.push(`Error creating City table: ${e.message}`);
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
