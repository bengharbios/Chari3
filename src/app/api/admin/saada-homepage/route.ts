import { NextRequest, NextResponse } from 'next/server';
import { db, ensureDbConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await ensureDbConnection();
    const url = new URL(req.url);
    const templateKey = url.searchParams.get('templateKey') || 'saada_homepage_layout';

    const layoutSetting = await db.setting.findUnique({ where: { key: templateKey } });
    
    // Default empty Puck layout
    const defaultLayout = {
      content: [],
      root: {},
      zones: {}
    };

    const data = layoutSetting?.value ? JSON.parse(layoutSetting.value) : defaultLayout;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[admin saada-homepage GET]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDbConnection();
    const url = new URL(req.url);
    const templateKey = url.searchParams.get('templateKey') || 'saada_homepage_layout';
    const body = await req.json();
    
    await db.setting.upsert({
      where: { key: templateKey },
      update: { value: JSON.stringify(body) },
      create: { key: templateKey, value: JSON.stringify(body), type: 'string', group: 'saada_templates' },
    });

    return NextResponse.json({ success: true, message: 'Saved successfully' });
  } catch (error) {
    console.error('[admin saada-homepage POST]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
