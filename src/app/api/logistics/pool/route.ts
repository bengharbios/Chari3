import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { toUniversalStatus } from '@/lib/logistics/carrier-status-map';

export const dynamic = 'force-dynamic';

// Dynamic fallback coordinates map for open pool visualization
const CITY_COORDS_MAP: Record<string, { lat: number; lng: number }> = {
  'الجزائر': { lat: 36.7538, lng: 3.0588 },
  'وهران': { lat: 35.6971, lng: -0.6308 },
  'قسنطينة': { lat: 36.3650, lng: 6.6147 },
  'سطيف': { lat: 36.1901, lng: 5.4137 },
  'عنابة': { lat: 36.9000, lng: 7.7667 },
  'البليدة': { lat: 36.4700, lng: 2.8300 },
  'باتنة': { lat: 35.5500, lng: 6.1667 },
  'تلمسان': { lat: 34.8783, lng: -1.3150 },
  'تيزي وزو': { lat: 36.7167, lng: 4.0500 },
  'بجاية': { lat: 36.7500, lng: 5.0667 },
  'الرياض': { lat: 24.7136, lng: 46.6753 },
  'جدة': { lat: 21.5433, lng: 39.1728 },
  'دبي': { lat: 25.2048, lng: 55.2708 },
  'أبوظبي': { lat: 24.4539, lng: 54.3773 },
  'القاهرة': { lat: 30.0444, lng: 31.2357 },
  'paris': { lat: 48.8566, lng: 2.3522 },
};

function cleanTextField(val: any, defaultText: string): string {
  if (!val || typeof val !== 'string') return defaultText;
  const str = val.trim();
  if (!str || str === 'null' || str === 'undefined') return defaultText;
  if (/^[a-zA-Z0-9_-]{18,}$/.test(str)) return defaultText;
  if (str.includes('{') || str.includes('}') || str.includes('"')) {
    const match = str.match(/"(?:city|street|state|fullName|name)"\s*:\s*"([^"]+)"/i);
    if (match && match[1] && !/^[a-zA-Z0-9_-]{18,}$/.test(match[1])) return match[1];
    return defaultText;
  }
  return str;
}

/**
 * GET /api/logistics/pool
 * =========================================================
 * Open Load Pool Feed.
 * Returns active parcels that are ready for pickup and have
 * not yet been claimed or assigned to any driver.
 * Protects recipient personal contact info until claimed.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cityFilter = searchParams.get('city');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // Fetch confirmed or processing orders that are not assigned to a driver
    const rawOrders = await db.order.findMany({
      where: {
        status: { in: ['confirmed', 'processing', 'pending'] },
        // Ensure not already claimed
        AND: [
          {
            OR: [
              { status: 'confirmed' },
              { status: 'processing' },
              { status: 'pending' }
            ]
          }
        ]
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          select: {
            id: true,
            productName: true,
            quantity: true,
            price: true,
          }
        }
      }
    });

    // Filter out orders with assignedDriverId in js if schema is fresh
    const unassignedOrders = rawOrders.filter((o: any) => !o.assignedDriverId);

    // Format parcels for the Open Load Pool
    const poolParcels = unassignedOrders.map((o) => {
      let rawAddr: any = o.address;
      if (typeof rawAddr === 'string' && rawAddr.startsWith('{')) {
        try { rawAddr = JSON.parse(rawAddr); } catch (e) {}
      }

      const cityRaw = (typeof rawAddr === 'object' && (rawAddr?.city || rawAddr?.state)) 
        ? (rawAddr.city || rawAddr.state) 
        : (typeof o.address === 'string' && !o.address.startsWith('{') ? o.address : 'الجزائر العاصمة');
      const city = cleanTextField(cityRaw, 'الجزائر العاصمة');
      
      const districtRaw = (typeof rawAddr === 'object' && rawAddr?.street)
        ? rawAddr.street
        : 'حي التوصيل السريع';
      const district = cleanTextField(districtRaw, 'حي التوصيل السريع');

      const coords = CITY_COORDS_MAP[city] || CITY_COORDS_MAP[city.toLowerCase()] || { lat: 36.7538, lng: 3.0588 };
      
      // Add slight offset for map separation
      const lat = coords.lat + (Math.random() - 0.5) * 0.04;
      const lng = coords.lng + (Math.random() - 0.5) * 0.04;

      const itemsCount = o.items ? o.items.reduce((sum, i) => sum + i.quantity, 0) : 1;

      return {
        id: o.id,
        orderId: o.id,
        trackingNumber: o.orderNumber || `POOL-${o.id.substring(0, 7).toUpperCase()}`,
        status: 'ready',
        universalStatus: 'ready',
        city,
        district,
        country: (typeof rawAddr === 'object' && rawAddr?.country) ? rawAddr.country : 'DZ',
        codAmount: o.total || 0,
        shippingFee: o.shippingCost || 450,
        itemsCount,
        createdAt: o.createdAt,
        dateFormatted: new Date(o.createdAt).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
        lat,
        lng,
        fulfillmentType: (o as any).fulfillmentType || 'merchant',
        logisticsStage: (o as any).logisticsStage || 'ready_for_pickup',
        // Note: Full customer phone and exact name are intentionally concealed until claim lock is secured
        recipientAlias: `عميل شاري داي - ${city}`,
      };
    });

    // Apply city filtering if requested
    const finalData = cityFilter && cityFilter !== 'all'
      ? poolParcels.filter(p => p.city.toLowerCase().includes(cityFilter.toLowerCase()))
      : poolParcels;

    return NextResponse.json({
      success: true,
      count: finalData.length,
      data: finalData,
    });

  } catch (error: any) {
    console.error('[logistics pool GET] Error:', error);
    return NextResponse.json({ success: false, error: String(error.message || error) }, { status: 500 });
  }
}
