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
        const { randomUUID } = require('crypto');
        
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
      }
    }

    // Convert NextRequest headers to a native Headers object to avoid Undici symbol errors 
    // but still provide the .get() method that better-auth expects!
    const safeHeaders = new Headers();
    request.headers.forEach((value, key) => {
      safeHeaders.append(key, value);
    });

    const signInResponse = await auth.api.signInEmail({
      body: {
        email: user.email,
        password: password,
      },
      headers: safeHeaders,
      asResponse: true
    });

    if (!signInResponse.ok) {
      return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, user });
    
    // Copy all headers except set-cookie first
    signInResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'set-cookie') {
        response.headers.set(key, value);
      }
    });

    // Copy set-cookie headers properly to avoid comma-joining
    const setCookies = signInResponse.headers.getSetCookie 
      ? signInResponse.headers.getSetCookie() 
      : signInResponse.headers.get('set-cookie')?.split(', ') || [];

    setCookies.forEach((cookieVal) => {
      response.headers.append('set-cookie', cookieVal);
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
