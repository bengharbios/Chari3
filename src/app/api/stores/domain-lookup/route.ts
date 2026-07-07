import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');

  if (!domain) {
    return NextResponse.json({ success: false, error: 'Domain is required' }, { status: 400 });
  }

  try {
    const store = await db.store.findFirst({
      where: { customDomain: domain },
      select: { slug: true, isActive: true },
    });

    return NextResponse.json({ success: true, store });
  } catch (error) {
    console.error('[Domain Lookup API] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
