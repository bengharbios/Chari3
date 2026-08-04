import { NextRequest, NextResponse } from 'next/server';
import { db, ensureDbConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await ensureDbConnection();

    const [layoutSetting, pinnedSetting, countdownSetting, heroSlidesSetting, featuresSetting, trendingSearchesSetting, ctaSetting, testimonialsSetting, adsResult] = await Promise.all([
      db.setting.findUnique({ where: { key: 'homepage_layout' } }),
      db.setting.findUnique({ where: { key: 'homepage_pinned_items' } }),
      db.setting.findUnique({ where: { key: 'homepage_countdown' } }),
      db.setting.findUnique({ where: { key: 'homepage_hero_slides' } }),
      db.setting.findUnique({ where: { key: 'homepage_features' } }),
      db.setting.findUnique({ where: { key: 'homepage_trending_searches' } }),
      db.setting.findUnique({ where: { key: 'homepage_cta' } }),
      db.setting.findUnique({ where: { key: 'homepage_testimonials' } }),
      db.advertisement.findMany({ orderBy: [{ zone: 'asc' }, { sortOrder: 'asc' }] }),
    ]);

    const defaultLayout = ['hero', 'features', 'categories', 'mega_offers_timer', 'featured_products', 'top_sellers', 'testimonials', 'cta'];
    const layout = layoutSetting?.value ? JSON.parse(layoutSetting.value) : defaultLayout;
    const pinned = pinnedSetting?.value ? JSON.parse(pinnedSetting.value) : { products: [], stores: [], sellers: [] };
    const countdown = countdownSetting?.value ? JSON.parse(countdownSetting.value) : { enabled: false, endDate: '', titleAr: '', titleEn: '' };
    const heroSlides = heroSlidesSetting?.value ? JSON.parse(heroSlidesSetting.value) : [];
    const features = featuresSetting?.value ? JSON.parse(featuresSetting.value) : [];
    const trendingSearches = trendingSearchesSetting?.value ? JSON.parse(trendingSearchesSetting.value) : { ar: [], en: [], fr: [] };
    const cta = ctaSetting?.value ? JSON.parse(ctaSetting.value) : {};
    const testimonials = testimonialsSetting?.value ? JSON.parse(testimonialsSetting.value) : [];

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
      features,
      trendingSearches,
      cta,
      testimonials,
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
    const { layout, pinned, countdown, heroSlides, features, trendingSearches, cta, testimonials } = body;

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

    if (features) {
      upsertQueries.push(
        db.setting.upsert({
          where: { key: 'homepage_features' },
          update: { value: JSON.stringify(features) },
          create: { key: 'homepage_features', value: JSON.stringify(features), type: 'json', group: 'homepage' },
        })
      );
    }

    if (trendingSearches) {
      upsertQueries.push(
        db.setting.upsert({
          where: { key: 'homepage_trending_searches' },
          update: { value: JSON.stringify(trendingSearches) },
          create: { key: 'homepage_trending_searches', value: JSON.stringify(trendingSearches), type: 'json', group: 'homepage' },
        })
      );
    }

    if (cta) {
      upsertQueries.push(
        db.setting.upsert({
          where: { key: 'homepage_cta' },
          update: { value: JSON.stringify(cta) },
          create: { key: 'homepage_cta', value: JSON.stringify(cta), type: 'json', group: 'homepage' },
        })
      );
    }

    if (testimonials) {
      upsertQueries.push(
        db.setting.upsert({
          where: { key: 'homepage_testimonials' },
          update: { value: JSON.stringify(testimonials) },
          create: { key: 'homepage_testimonials', value: JSON.stringify(testimonials), type: 'json', group: 'homepage' },
        })
      );
    }

    // Always set active template back to legacy when saving from this old settings page
    upsertQueries.push(
      db.setting.upsert({
        where: { key: 'active_homepage_template' },
        update: { value: 'homepage_layout' },
        create: { key: 'active_homepage_template', value: 'homepage_layout', type: 'string', group: 'homepage' },
      })
    );

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
