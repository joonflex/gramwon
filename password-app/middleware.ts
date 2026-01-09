import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth');

  // basePath를 제외한 실제 pathname 확인
  const pathname = request.nextUrl.pathname.replace('/passwords', '');
  const isLoginPage = pathname === '/login';
  const isRootPage = pathname === '/' || pathname === '';
  const isApiRoute = pathname.startsWith('/api');

  // Allow API routes to pass through
  if (isApiRoute) {
    return NextResponse.next();
  }

  // If user is authenticated and trying to access login page, redirect to home
  if (authCookie?.value === 'true' && isLoginPage) {
    return NextResponse.redirect(new URL('/passwords/', request.url));
  }

  // If user is not authenticated and trying to access protected pages, redirect to login
  if (!authCookie?.value && !isLoginPage && !isRootPage) {
    return NextResponse.redirect(new URL('/passwords/login', request.url));
  }

  // If user is not authenticated and on root page, redirect to login
  if (!authCookie?.value && isRootPage) {
    return NextResponse.redirect(new URL('/passwords/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/passwords/:path*'],
};
