import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const AUTH_COOKIE =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || process.env.API_COOKIE_NAME || 'shoople_token';

const PUBLIC_PATHS = ['/login', '/register'];

const PROTECTED_PATHS = [
  '/account',
  '/cart',
  '/checkout',
  '/orders',
  '/shop-management/manage',
  '/admin',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.includes(pathname)) {
    if (request.cookies.has(AUTH_COOKIE)) {
      const redirectUrl = new URL('/', request.url);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  const isStaticAsset = pathname.startsWith('/_next') || pathname.startsWith('/static');
  const isFavIcon = pathname === '/favicon.ico';

  if (isStaticAsset || isFavIcon) {
    return NextResponse.next();
  }

  const hasToken = request.cookies.has(AUTH_COOKIE);

  const requiresAuth = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  if (requiresAuth && !hasToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/).*)'],
};
