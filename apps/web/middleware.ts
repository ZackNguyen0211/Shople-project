import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const AUTH_COOKIE =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || process.env.API_COOKIE_NAME || 'shoople_token';

// Paths that don't require authentication
const PUBLIC_PATHS = ['/login', '/register'];

// Paths that require authentication (redirect to login if not authenticated)
const PROTECTED_PATHS = ['/account', '/cart', '/checkout', '/orders', '/shop/manage', '/admin'];

// Paths that are public (accessible without authentication)
const ALLOWED_PUBLIC_PATHS = ['/', '/product', '/search', '/shops'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect authenticated users away from login/register
  if (PUBLIC_PATHS.includes(pathname)) {
    if (request.cookies.has(AUTH_COOKIE)) {
      const redirectUrl = new URL('/', request.url);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  // Allow static assets and favicon
  const isStaticAsset = pathname.startsWith('/_next') || pathname.startsWith('/static');
  const isFavIcon = pathname === '/favicon.ico';

  if (isStaticAsset || isFavIcon) {
    return NextResponse.next();
  }

  const hasToken = request.cookies.has(AUTH_COOKIE);

  // Check if path requires authentication
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
