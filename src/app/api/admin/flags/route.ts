import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const flags = await db.setting.findMany({
      where: { key: { startsWith: 'flag_' } },
    });

    const flagsObj = flags.reduce((acc, flag) => {
      acc[flag.key] = flag.value === 'true';
      return acc;
    }, {} as Record<string, boolean>);

    // Default values if not set
    const defaultFlags = {
      flag_maintenance_mode: false,
      flag_disable_registration: false,
      flag_disable_cod: false,
      flag_disable_auctions: false,
    };

    return NextResponse.json({
      success: true,
      flags: { ...defaultFlags, ...flagsObj },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { flags } = await req.json();

    if (!flags || typeof flags !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid flags data' }, { status: 400 });
    }

    const updates = [];
    for (const [key, value] of Object.entries(flags)) {
      updates.push(
        db.setting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value), type: 'boolean', group: 'flags' },
        })
      );
    }

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: 'Feature flags updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
