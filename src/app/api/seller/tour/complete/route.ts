import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user || session.user.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { version } = await req.json();

    if (typeof version !== 'number') {
      return NextResponse.json({ error: 'Invalid version number' }, { status: 400 });
    }

    // Securely update ONLY the authenticated user
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: { sellerTourVersion: version }
    });

    return NextResponse.json({ success: true, version: updatedUser.sellerTourVersion });
  } catch (error) {
    console.error('[TOUR_COMPLETE_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
