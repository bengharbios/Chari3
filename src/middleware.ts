import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // The secret URL slug from environment variables (defaults to 'super-admin' if not set)
  const adminSlug = process.env.ADMIN_PORTAL_SLUG || 'super-admin';
  const { pathname } = request.nextUrl;

  // 1. Block direct access to the internal routing folder
  // We check the original browser requested URL to avoid blocking Next.js rewrites
  const originalUrl = new URL(request.url);
  if (originalUrl.pathname.startsWith('/admin-secure-internal')) {
    return new Response('Not Found', { status: 404 });
  }

  // 2. Rewrite the secret slug to our internal admin folder
  if (pathname === `/${adminSlug}` || pathname.startsWith(`/${adminSlug}/`)) {
    const internalPath = pathname.replace(`/${adminSlug}`, '/admin-secure-internal');
    return NextResponse.rewrite(new URL(internalPath, request.url));
  }

  // Continue normally for all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
