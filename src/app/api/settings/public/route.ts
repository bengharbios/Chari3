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
      'theme_storefront',
      'footer_blocks',
    ];

    const settings = await db.systemSetting.findMany({
      where: { key: { in: publicKeys } }
    });

    const mapSettings = await db.setting.findMany({
      where: { key: { in: ['map_enabled', 'map_default_lat', 'map_default_lng', 'map_default_zoom'] } }
    });

    const settingsMap = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    mapSettings.forEach((s: any) => {
      settingsMap[s.key] = s.value;
    });

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
        theme_storefront: settingsMap.theme_storefront || null,
        footer_blocks: settingsMap.footer_blocks || null,
        map_enabled: settingsMap.map_enabled || 'false',
        map_default_lat: settingsMap.map_default_lat || '25.2048',
        map_default_lng: settingsMap.map_default_lng || '55.2708',
        map_default_zoom: settingsMap.map_default_zoom || '12',
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
