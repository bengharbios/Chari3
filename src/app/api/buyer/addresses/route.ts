import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const addresses = await db.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
    });

    return NextResponse.json({ success: true, data: addresses });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { label, fullName, phone, street, city, state, zipCode, country, lat, lng, isDefault } = body;

    // If this is set as default, unset others
    if (isDefault) {
      await db.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false }
      });
    }

    const address = await db.address.create({
      data: {
        userId: session.user.id,
        label,
        fullName,
        phone,
        street,
        city,
        state,
        zipCode,
        country: country || 'DZ',
        lat,
        lng,
        isDefault: isDefault || false
      }
    });

    return NextResponse.json({ success: true, data: address });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
