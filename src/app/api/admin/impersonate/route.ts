import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/better-auth';
import { cookies, headers } from 'next/headers';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const session = await getSession(await headers());
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const targetUser = await db.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Generate a secure token for the session
    const token = crypto.randomBytes(32).toString('hex');
    const sessionId = crypto.randomBytes(16).toString('hex');
    
    // Create session directly in DB (1 hour expiration for impersonation)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    
    // Using Prisma to bypass password checks
    await db.session.create({
      data: {
        id: sessionId,
        userId: targetUser.id,
        token: token,
        expiresAt: expiresAt,
        ipAddress: '127.0.0.1', 
        userAgent: 'Admin-Impersonation'
      }
    });

    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === "production";
    const cookieName = isProduction ? "__Secure-better-auth.session_token" : "better-auth.session_token";
    
    const secret = process.env.BETTER_AUTH_SECRET || "fallback_secret_please_change_in_production_12345";
    const signature = crypto.createHmac('sha256', secret).update(token).digest('base64');
    const signedToken = `${token}.${signature}`;

    // Overwrite the current session cookie with the new one
    cookieStore.set({
      name: cookieName,
      value: signedToken,
      expires: expiresAt,
      httpOnly: true,
      path: '/',
      secure: isProduction,
      sameSite: 'lax',
    });

    // Store the original admin ID so they can "Return to Admin" later
    cookieStore.set({
      name: 'chari_impersonator_id',
      value: session.user.id,
      expires: expiresAt,
      httpOnly: false, // Allow client side to read it for UI banner
      path: '/'
    });

    let redirectUrl = '/buyer';
    if (targetUser.role === 'seller' || targetUser.role === 'store_manager') redirectUrl = '/seller/dashboard';
    else if (targetUser.role === 'logistics') redirectUrl = '/logistics';
    else if (targetUser.role === 'supplier') redirectUrl = '/supplier';

    return NextResponse.json({ success: true, redirectUrl });

  } catch (error: any) {
    console.error('Impersonation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
