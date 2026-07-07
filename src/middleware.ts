import type { auth } from "@/lib/better-auth";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";

const protectedRoutes = ["/admin-secure-internal", "/seller", "/checkout", "/buyer", "/logistics", "/supplier"];

// The primary platform hostname(s) — custom domains will differ from these
const PLATFORM_HOSTS = [
  'chariday.com',
  'www.chariday.com',
  'localhost',
  '127.0.0.1',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  const cleanHost = hostname.split(':')[0]; // strip port if present

  // ─── Custom Domain Routing ─────────────────────────────────────────────────
  // If the request comes from a custom domain (not the main platform), rewrite
  // to the store's storefront page transparently (without changing the URL bar).
  const isMainPlatform = PLATFORM_HOSTS.some(h => cleanHost === h || cleanHost.endsWith(`.${h}`));
  const isApiOrInternal = pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/static');

  if (!isMainPlatform && !isApiOrInternal) {
    // Look up which store owns this custom domain
    try {
      const store = await (db as any).store.findFirst({
        where: { customDomain: cleanHost },
        select: { slug: true, isActive: true },
      });

      if (store && store.isActive && store.slug) {
        // Internally rewrite the request to the store's storefront
        const rewriteUrl = request.nextUrl.clone();
        // Keep the original path suffix (e.g. /products/abc) but prefix with /store/[slug]
        rewriteUrl.pathname = `/store/${store.slug}${pathname === '/' ? '' : pathname}`;
        const response = NextResponse.rewrite(rewriteUrl);
        // Tell browser it's still on the custom domain
        response.headers.set('x-matched-store-slug', store.slug);
        return response;
      }
    } catch (err) {
      // DB not available in edge, fall through gracefully
      console.error('[Middleware] Custom domain lookup failed:', err);
    }
  }

  // ─── Protected Route Guard ─────────────────────────────────────────────────
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isLoginPage = pathname.endsWith('/login') || pathname === '/login';

  if (isProtectedRoute && !isLoginPage) {
    // Check for session cookie instead of doing an internal fetch which fails on Hostinger loopback
    // In production (HTTPS), better-auth uses the __Secure- prefix
    const sessionToken = request.cookies.get("better-auth.session_token")?.value || 
                         request.cookies.get("__Secure-better-auth.session_token")?.value;

    if (!sessionToken) {
      // NOTE: Redirect is disabled because Hostinger's Edge proxy strips or obscures cookies 
      // in middleware. Client-side layout (AdminLayoutWrapper) handles the redirect securely.
      console.log("[Middleware] Unauthenticated access to", pathname);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

