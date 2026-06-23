import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    // Lookup user by email or phone
    const user = await db.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier }
        ]
      }
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Temporary fix: If the user has a password in the User table but no Account record (e.g. from seed),
    // we create the Account record for better-auth to use.
    if (user.password) {
      // We must dynamically import bcrypt so it doesn't break edge, but this is a node API route so it's fine
      const bcrypt = require('bcryptjs');
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        const { randomUUID, randomBytes } = require('crypto');
        
        // Ensure Account exists
        const account = await db.account.findFirst({ where: { userId: user.id, providerId: 'credential' } });
        if (!account) {
          await db.account.create({
            data: { 
              id: randomUUID(), 
              accountId: user.email, 
              providerId: 'credential', 
              userId: user.id, 
              password: user.password, 
              createdAt: new Date(), 
              updatedAt: new Date() 
            }
          });
        }

        // Manually create a session to bypass any better-auth internal signInEmail issues
        const sessionToken = randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

        await db.session.create({
          data: {
            id: randomUUID(),
            userId: user.id,
            token: sessionToken,
            expiresAt,
            ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
            userAgent: request.headers.get("user-agent") || "",
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });

        const response = NextResponse.json({ success: true, user });
        // Set the better-auth cookie
        // Note: better-auth uses "better-auth.session_token" by default
        const isProd = process.env.NODE_ENV === 'production';
        response.headers.set(
          'Set-Cookie', 
          `better-auth.session_token=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${isProd ? '; Secure' : ''}`
        );
        return response;
      }
    }

    // Fallback to better-auth if manual check didn't apply
    const plainHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      plainHeaders[key] = value;
    });

    const signInResponse = await auth.api.signInEmail({
      body: {
        email: user.email,
        password: password,
      },
      headers: plainHeaders,
      asResponse: true
    });

    if (!signInResponse.ok) {
      return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, user });
    signInResponse.headers.forEach((value, key) => {
      response.headers.append(key, value);
    });
    return response;

  } catch (error) {
    console.error('[login-password] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
