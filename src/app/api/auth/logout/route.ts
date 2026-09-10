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

    // 2. Force clear cookies manually to avoid Next.js cookie map overwriting
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    const cookieNames = [
      'better-auth.session_token',
      '__Secure-better-auth.session_token',
      'better-auth.session_data',
      'better-auth.session_data_sig'
    ];

    const domains = ['', 'domain=.chariday.com', 'domain=chariday.com', 'domain=localhost'];

    cookieNames.forEach(name => {
      domains.forEach(domain => {
        response.headers.append(
          'Set-Cookie',
          `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; ${domain}`
        );
      });
    });

    return response;
  } catch (error) {
    console.error('[logout] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to logout' },
      { status: 500 }
    );
  }
}
