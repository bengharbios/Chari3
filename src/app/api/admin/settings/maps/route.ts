import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'SUPER_ADMIN' && session?.user?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await db.setting.findMany({
      where: {
        key: {
          in: ['map_enabled', 'map_provider', 'map_default_lat', 'map_default_lng', 'map_default_zoom']
        }
      }
    });

    const settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as any);

    return NextResponse.json({ success: true, settings: settingsMap });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'SUPER_ADMIN' && session?.user?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { map_enabled, map_provider, map_default_lat, map_default_lng, map_default_zoom } = body;

    const updates = [
      { key: 'map_enabled', value: String(map_enabled) },
      { key: 'map_provider', value: String(map_provider || 'osm') },
      { key: 'map_default_lat', value: String(map_default_lat || '25.2048') }, // Dubai default
      { key: 'map_default_lng', value: String(map_default_lng || '55.2708') },
      { key: 'map_default_zoom', value: String(map_default_zoom || '12') },
    ];

    await db.$transaction(
      updates.map(u => 
        db.setting.upsert({
          where: { key: u.key },
          update: { value: u.value },
          create: { key: u.key, value: u.value }
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
