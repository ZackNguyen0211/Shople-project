import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

import { authCookieOptions, getAuthCookieName, signAuthToken } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';
import { isRateLimited } from '../../../../lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited(req, 'login', 10, 10 * 60 * 1000)) {
      const url = new URL('/login', req.url);
      url.searchParams.set('error', 'Too many attempts, please try later');
      return NextResponse.redirect(url);
    }
    const form = await req.formData();
    const email = String(form.get('email') || '')
      .trim()
      .toLowerCase();
    const password = String(form.get('password') || '');
    const nextParam = String(form.get('next') || '') || req.nextUrl.searchParams.get('next') || '/';

    if (!email || !password) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('error', 'Email and password are required');
      if (nextParam) loginUrl.searchParams.set('next', nextParam);
      return NextResponse.redirect(loginUrl);
    }

    const supabase = getDb();
    const { data: user, error } = await supabase
      .from('users')
      .select('id,email,name,role,password,avatar_url')
      .eq('email', email)
      .maybeSingle();
    const invalidUrl = new URL('/login', req.url);
    invalidUrl.searchParams.set('error', 'Invalid credentials');
    if (nextParam) invalidUrl.searchParams.set('next', nextParam);

    if (error || !user) {
      return NextResponse.redirect(invalidUrl);
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.redirect(invalidUrl);
    }

    const token = signAuthToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar_url: user.avatar_url,
    });
    const destination = nextParam.startsWith('/') ? nextParam : '/';
    const redirect = NextResponse.redirect(new URL(destination, req.url));
    redirect.cookies.set(getAuthCookieName(), token, authCookieOptions);
    return redirect;
  } catch (e) {
    console.error('Login error:', e);
    const url = new URL('/login', req.url);
    url.searchParams.set('error', 'Login failed, please try again');
    return NextResponse.redirect(url);
  }
}
