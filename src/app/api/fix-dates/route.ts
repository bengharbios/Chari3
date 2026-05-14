import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Tables known to have timestamp columns
const TABLES = [
  'Role', 'User', 'Store', 'SellerProfile', 'Product', 'Category',
  'Order', 'OrderItem', 'Wallet', 'WalletTransaction', 'Coupon',
  'Setting', 'Notification', 'Review', 'Shipment', 'StoreStaff',
  'StoreVerification', 'FreelancerVerification', 'SupplierVerification',
  'LogisticsVerification', 'AuditLog', 'Address',
];

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (token !== 'chari3-fix-2026') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const results: Record<string, string> = {};

  for (const table of TABLES) {
    try {
      const updated1 = await db.$executeRawUnsafe(
        `UPDATE \`${table}\` SET \`updatedAt\` = NOW() WHERE \`updatedAt\` = '0000-00-00 00:00:00'`
      );
      const updated2 = await db.$executeRawUnsafe(
        `UPDATE \`${table}\` SET \`createdAt\` = NOW() WHERE \`createdAt\` = '0000-00-00 00:00:00'`
      );
      results[table] = `✅ fixed ${Number(updated1) + Number(updated2)} rows`;
    } catch (err: unknown) {
      // Some tables may not have these columns — skip gracefully
      const msg = err instanceof Error ? err.message : String(err);
      results[table] = msg.includes('Unknown column') ? '⏭ skipped (no column)' : `⚠ ${msg.slice(0, 80)}`;
    }
  }

  return NextResponse.json({ success: true, results });
}
