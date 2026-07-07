import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from 'better-auth/crypto';

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

    // Hash the password using Better Auth's own crypto (scrypt) — same format used internally
    const passwordHash = await hashPassword('password123');

    // Update the User table
    await db.user.update({
      where: { email },
      data: { password: passwordHash }
    });

    // Update the Account table record (Better Auth credential provider)
    await db.account.updateMany({
      where: { accountId: email, providerId: 'credential' },
      data: { password: passwordHash }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Password successfully reset!',
      hashSample: passwordHash.slice(0, 20) + '...'
    });
  } catch (error) {
    console.error('Password reset failed:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
