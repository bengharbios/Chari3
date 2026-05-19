import { NextResponse } from 'next/server';
import { db, ensureDbConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureDbConnection();
    const [layout, heroSlides, testimonials] = await Promise.all([
      db.setting.findUnique({ where: { key: 'homepage_layout' } }),
      db.setting.findUnique({ where: { key: 'homepage_hero_slides' } }),
      db.setting.findUnique({ where: { key: 'homepage_testimonials' } }),
    ]);

    return NextResponse.json({
      success: true,
      layout: layout?.value ? JSON.parse(layout.value) : ['hero', 'features', 'categories', 'featured_products', 'top_sellers', 'testimonials', 'cta'],
      heroSlides: heroSlides?.value ? JSON.parse(heroSlides.value) : [],
      testimonials: testimonials?.value ? JSON.parse(testimonials.value) : [],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureDbConnection();
    const { layout, heroSlides, testimonials } = await req.json();

    const updates = [];

    if (layout) {
      updates.push(
        db.setting.upsert({
          where: { key: 'homepage_layout' },
          update: { value: JSON.stringify(layout) },
          create: { key: 'homepage_layout', value: JSON.stringify(layout), type: 'json', group: 'homepage' },
        })
      );
    }

    if (heroSlides) {
      updates.push(
        db.setting.upsert({
          where: { key: 'homepage_hero_slides' },
          update: { value: JSON.stringify(heroSlides) },
          create: { key: 'homepage_hero_slides', value: JSON.stringify(heroSlides), type: 'json', group: 'homepage' },
        })
      );
    }

    if (testimonials) {
      updates.push(
        db.setting.upsert({
          where: { key: 'homepage_testimonials' },
          update: { value: JSON.stringify(testimonials) },
          create: { key: 'homepage_testimonials', value: JSON.stringify(testimonials), type: 'json', group: 'homepage' },
        })
      );
    }

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: 'CMS settings saved successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
