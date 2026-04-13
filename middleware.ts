import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/tickets', '/ai', '/settings', '/admin'];
const PUBLIC_ROUTES = ['/auth/login', '/auth/register'];

/**
 * Enhanced middleware with proper token validation and route protection
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  if (!isProtectedRoute && !isPublicRoute) {
    // Route doesn't require special handling
    return NextResponse.next();
  }

  // Get tokens from cookies and headers
  const accessToken = request.cookies.get('itmagnet_access_token')?.value || request.headers.get('Authorization')?.replace('Bearer ', '');
  const refreshToken = request.cookies.get('itmagnet_refresh_token')?.value;

  // Handle protected routes
  if (isProtectedRoute) {
    // No access token - redirect to login
    if (!accessToken) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/auth/login';
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Access token exists, allow the request
    const response = NextResponse.next();

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    return response;
  }

  // Handle public routes (login, register)
  if (isPublicRoute) {
    // If already authenticated, redirect to dashboard
    if (accessToken) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = '/dashboard';
      return NextResponse.redirect(dashboardUrl);
    }
  }

  const response = NextResponse.next();

  // Add security headers to all responses
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

/**
 * Configure which paths the middleware should run on
 */
export const config = {
  matcher: [
    // Protected routes
    '/dashboard/:path*',
    '/tickets/:path*',
    '/ai/:path*',
    '/settings/:path*',
    '/admin/:path*',
    // Public auth routes
    '/auth/login',
    '/auth/register',
    // Exclude static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)',
  ],
};
