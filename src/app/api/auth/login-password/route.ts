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

    // Call better-auth's signInEmail directly with the user's email
    // This allows phone number logins to work seamlessly with Better Auth's email/password provider
    const signInResponse = await auth.api.signInEmail({
      body: {
        email: user.email,
        password: password,
      },
      headers: headers(),
      asResponse: true
    });

    // Check if sign in was successful
    if (!signInResponse.ok) {
      return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 });
    }

    // Return the response headers (which contain the set-cookie for the session)
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
