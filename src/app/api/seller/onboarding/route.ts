import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();

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
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const verification = await db.storeVerification.findUnique({
      where: { userId }
    });

    return NextResponse.json({ success: true, data: verification });
  } catch (error: any) {
    console.error('Onboarding GET error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
