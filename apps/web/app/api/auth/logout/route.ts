import { NextRequest, NextResponse } from 'next/server';

import { authCookieOptions, getAuthCookieName } from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  const redirectUrl = req.nextUrl.searchParams.get('next') || '/login';
  const res = NextResponse.redirect(new URL(redirectUrl, req.url));
  res.cookies.set(getAuthCookieName(), '', { ...authCookieOptions, maxAge: 0 });
  return res;
}
