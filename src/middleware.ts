import type { auth } from "@/lib/better-auth";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/admin-secure-internal", "/seller", "/checkout", "/buyer", "/logistics", "/supplier"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Check for session cookie instead of doing an internal fetch which fails on Hostinger loopback
    const sessionToken = request.cookies.get("better-auth.session_token")?.value;

    if (!sessionToken) {
      // NOTE: Redirect is temporarily disabled to prevent breaking Zustand Demo Logins.
      // Once you migrate all login forms to use `better-auth`, uncomment this line:
      // return NextResponse.redirect(new URL("/?login=true", request.url));
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
