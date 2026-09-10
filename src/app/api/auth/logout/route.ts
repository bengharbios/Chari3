import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth } from '@/lib/better-auth';

export async function POST(req: Request) {
  try {
    // 1. Invalidate session in DB if possible
    try {
      const headersList = await req.headers;
      await auth.api.signOut({ headers: headersList });
    } catch (e) {
      console.warn('[logout] better-auth signOut failed on server:', e);
    }

    // 2. Force clear cookies
    const cookieStore = await cookies();
    const cookieNames = [
      'better-auth.session_token',
      '__Secure-better-auth.session_token',
      'better-auth.session_data',
      'better-auth.session_data_sig'
    ];

    cookieNames.forEach(name => {
      cookieStore.delete(name);
      cookieStore.delete({ name, domain: '.chariday.com', path: '/' });
      cookieStore.delete({ name, domain: 'chariday.com', path: '/' });
      cookieStore.delete({ name, domain: 'localhost', path: '/' });
    });

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('[logout] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to logout' },
      { status: 500 }
    );
  }
}
