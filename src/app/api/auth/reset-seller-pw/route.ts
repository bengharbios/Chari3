import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const email = 'seller@charyday.com';
    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Hash the password using Better Auth's own crypto provider with the current secret/pepper
    const passwordHash = await auth.api.hashPassword({
      password: 'password123'
    });

    // Update the User table
    await db.user.update({
      where: { email },
      data: { password: passwordHash }
    });

    // Update or create the Account table record
    await db.account.updateMany({
      where: { accountId: email, providerId: 'credential' },
      data: { password: passwordHash }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Password successfully reset using Better Auth instance!',
      hashSample: passwordHash.slice(0, 15) + '...'
    });
  } catch (error) {
    console.error('Password reset failed:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
