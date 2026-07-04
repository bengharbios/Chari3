import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const adminIdCookie = cookieStore.get('chari_impersonator_id');
    const currentSessionCookie = cookieStore.get(
      process.env.NODE_ENV === "production" ? "__Secure-better-auth.session_token" : "better-auth.session_token"
    );

    if (!adminIdCookie?.value) {
      return NextResponse.json({ success: false, error: 'Not currently impersonating' }, { status: 400 });
    }

    const adminUser = await db.user.findUnique({ where: { id: adminIdCookie.value } });
    if (!adminUser || adminUser.role !== 'admin') {
      // Security check failed, just clear cookies
      cookieStore.delete('chari_impersonator_id');
      cookieStore.delete(process.env.NODE_ENV === "production" ? "__Secure-better-auth.session_token" : "better-auth.session_token");
      return NextResponse.json({ success: false, error: 'Invalid admin' }, { status: 403 });
    }

    // Clean up the temporary impersonation session if it exists
    if (currentSessionCookie?.value) {
      await db.session.deleteMany({
        where: { token: currentSessionCookie.value }
      });
    }

    // Generate a secure token to log the admin back in
    const token = crypto.randomBytes(32).toString('hex');
    const sessionId = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days for normal admin session

    await db.session.create({
      data: {
        id: sessionId,
        userId: adminUser.id,
        token: token,
        expiresAt: expiresAt,
        ipAddress: '127.0.0.1', 
        userAgent: 'Admin-Returned'
      }
    });

    const isProduction = process.env.NODE_ENV === "production";
    const cookieName = isProduction ? "__Secure-better-auth.session_token" : "better-auth.session_token";

    cookieStore.set({
      name: cookieName,
      value: token,
      expires: expiresAt,
      httpOnly: true,
      path: '/',
      secure: isProduction,
      sameSite: 'lax',
    });

    // Clear the impersonator flag
    cookieStore.delete('chari_impersonator_id');

    return NextResponse.json({ success: true, redirectUrl: '/super-admin' });

  } catch (error: any) {
    console.error('Revert impersonation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
