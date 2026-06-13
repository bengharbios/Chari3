import { NextRequest, NextResponse } from 'next/server';
import { db, ensureDbConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await ensureDbConnection();

    const [layoutSetting, pinnedSetting, countdownSetting, heroSlidesSetting, adsResult] = await Promise.all([
      db.setting.findUnique({ where: { key: 'homepage_layout' } }),
      db.setting.findUnique({ where: { key: 'homepage_pinned_items' } }),
      db.setting.findUnique({ where: { key: 'homepage_countdown' } }),
      db.setting.findUnique({ where: { key: 'homepage_hero_slides' } }),
      db.advertisement.findMany({ orderBy: [{ zone: 'asc' }, { sortOrder: 'asc' }] }),
    ]);

    const defaultLayout = ['hero', 'features', 'categories', 'mega_offers_timer', 'featured_products', 'top_sellers', 'testimonials', 'cta'];
    const layout = layoutSetting?.value ? JSON.parse(layoutSetting.value) : defaultLayout;
    const pinned = pinnedSetting?.value ? JSON.parse(pinnedSetting.value) : { products: [], stores: [], sellers: [] };
    const countdown = countdownSetting?.value ? JSON.parse(countdownSetting.value) : { enabled: false, endDate: '', titleAr: '', titleEn: '' };
    const heroSlides = heroSlidesSetting?.value ? JSON.parse(heroSlidesSetting.value) : [];

    const adsByZone: Record<string, any[]> = {};
    if (adsResult) {
      for (const ad of adsResult) {
        if (!adsByZone[ad.zone]) adsByZone[ad.zone] = [];
        adsByZone[ad.zone].push(ad);
      }
    }


    return NextResponse.json({
      success: true,
      layout,
      pinned,
      countdown,
      heroSlides,
      advertisements: adsByZone,
    });
  } catch (error) {
    console.error('[admin homepage GET]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDbConnection();
    const body = await req.json();
    const { layout, pinned, countdown, heroSlides } = body;

    const upsertQueries: any[] = [];

    if (layout) {
      upsertQueries.push(
        db.setting.upsert({
          where: { key: 'homepage_layout' },
          update: { value: JSON.stringify(layout) },
          create: { key: 'homepage_layout', value: JSON.stringify(layout), type: 'string', group: 'homepage' },
        })
      );
    }

    if (pinned) {
      upsertQueries.push(
        db.setting.upsert({
          where: { key: 'homepage_pinned_items' },
          update: { value: JSON.stringify(pinned) },
          create: { key: 'homepage_pinned_items', value: JSON.stringify(pinned), type: 'string', group: 'homepage' },
        })
      );
    }

    if (countdown) {
      upsertQueries.push(
        db.setting.upsert({
          where: { key: 'homepage_countdown' },
          update: { value: JSON.stringify(countdown) },
          create: { key: 'homepage_countdown', value: JSON.stringify(countdown), type: 'string', group: 'homepage' },
        })
      );
    }

    if (heroSlides) {
      upsertQueries.push(
        db.setting.upsert({
          where: { key: 'homepage_hero_slides' },
          update: { value: JSON.stringify(heroSlides) },
          create: { key: 'homepage_hero_slides', value: JSON.stringify(heroSlides), type: 'string', group: 'homepage' },
        })
      );
    }

    await Promise.all(upsertQueries);

    return NextResponse.json({
      success: true,
      message: 'Homepage settings updated successfully',
    });
  } catch (error) {
    console.error('[admin homepage POST]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
