import { NextResponse } from 'next/server';
import { db, ensureDbConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureDbConnection();
    // Fetch only specific settings that are safe to be public
    const publicKeys = [
      'upload_max_size_mb',
      'upload_recommended_width',
      'upload_recommended_height',
      'currency',
      'platform_payment_model',
      'seller_dashboard_template',
      'theme_seller_dashboard',
    ];

    const settings = await db.systemSetting.findMany({
      where: { key: { in: publicKeys } }
    });

    const settingsMap = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    // Provide safe defaults if not configured
    return NextResponse.json({
      success: true,
      settings: {
        upload_max_size_mb: settingsMap.upload_max_size_mb || '5',
        upload_recommended_width: settingsMap.upload_recommended_width || '800',
        upload_recommended_height: settingsMap.upload_recommended_height || '800',
        currency: settingsMap.currency || 'DZD',
        platform_payment_model: settingsMap.platform_payment_model || 'mixed',
        seller_dashboard_template: settingsMap.seller_dashboard_template || 'default',
        theme_seller_dashboard: settingsMap.theme_seller_dashboard || null,
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
