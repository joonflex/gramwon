import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth');
  const isAuthenticated = authCookie?.value === 'true';

  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === '/';
  const isApiRoute = pathname.startsWith('/api');

  // Allow API routes to pass through
  if (isApiRoute) {
    return NextResponse.next();
  }

  // If user is authenticated and trying to access login page, redirect to dashboard
  if (isAuthenticated && isLoginPage) {
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
    if (callbackUrl) {
      return NextResponse.redirect(new URL(callbackUrl, request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is not authenticated, redirect to login (except already on login page)
  if (!isAuthenticated && !isLoginPage) {
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
