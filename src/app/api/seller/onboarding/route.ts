import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const url = new URL(req.url);
    const userId = session?.user?.id || url.searchParams.get('userId') || body.userId;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized or missing userId' }, { status: 401 });
    }

    // The body should contain the current step data or complete data
    // Example: { step: 'legal', data: { entityType: 'legal', companyName: 'XYZ' } }
    
    // We will do an upsert on StoreVerification
    const existing = await db.storeVerification.findUnique({
      where: { userId }
    });

    const dataToSave = body.data || {};

    const updated = await db.storeVerification.upsert({
      where: { userId },
      update: {
        ...dataToSave,
        updatedAt: new Date(),
      },
      create: {
        userId,
        ...dataToSave
      }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Onboarding POST error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const url = new URL(req.url);
    const userId = session?.user?.id || url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized or missing userId' }, { status: 401 });
    }
    const verification = await db.storeVerification.findUnique({
      where: { userId }
    });

    return NextResponse.json({ success: true, data: verification });
  } catch (error: any) {
    console.error('Onboarding GET error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
