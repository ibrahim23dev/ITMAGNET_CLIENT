import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define protected routes
  const protectedRoutes = ['/dashboard', '/tickets', '/ai', '/settings'];
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    // Get token from cookies or localStorage equivalent
    const token = request.cookies.get('itmagnet_access_token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // Redirect to login if not authenticated
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/tickets/:path*',
    '/ai/:path*',
    '/settings/:path*',
    '/auth/login',
    '/auth/register'
  ],
};