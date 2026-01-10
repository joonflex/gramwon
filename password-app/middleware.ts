import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth');
  const isAuthenticated = authCookie?.value === 'true';

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
  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is not authenticated, redirect to login (except already on login page)
  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
