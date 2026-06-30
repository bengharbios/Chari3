import type { auth } from "@/lib/better-auth";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/admin-secure-internal", "/seller", "/checkout", "/buyer", "/logistics", "/supplier"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
      // const url = new URL(pathname.startsWith('/admin-secure-internal') ? '/admin-secure-internal/login' : '/?login=true', request.url);
      // return NextResponse.redirect(url);
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
