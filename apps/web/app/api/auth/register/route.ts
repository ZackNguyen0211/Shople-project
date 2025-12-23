import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

import { authCookieOptions, getAuthCookieName, signAuthToken } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

const attempts = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function getClientIp(req: NextRequest) {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]?.trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return '0.0.0.0';
}

function isRateLimited(req: NextRequest) {
  const ip = getClientIp(req);
  const now = Date.now();
  const bucket = attempts.get(ip) || [];
  const recent = bucket.filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > MAX_ATTEMPTS;
}

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

export async function POST(req: NextRequest) {
  if (isRateLimited(req)) {
    const url = new URL('/register', req.url);
    url.searchParams.set('error', 'Too many attempts, please try later');
    return NextResponse.redirect(url);
  }

  const form = await req.formData();
  const name = String(form.get('name') || '').trim();
  const email = String(form.get('email') || '')
    .trim()
    .toLowerCase();
  const password = String(form.get('password') || '');
  const confirm = String(form.get('confirm') || '');
  const nextParam = String(form.get('next') || '') || req.nextUrl.searchParams.get('next') || '/';

  const redirectWithError = (message: string) => {
    const url = new URL('/register', req.url);
    url.searchParams.set('error', message);
    if (nextParam) url.searchParams.set('next', nextParam);
    return NextResponse.redirect(url);
  };

  if (!name || !email || !password || !confirm) {
    return redirectWithError('All fields are required');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return redirectWithError('Invalid email format');
  }

  if (password !== confirm) {
    return redirectWithError('Passwords do not match');
  }

  const strength = passwordStrength(password);
  if (!(password.length >= 8 && strength >= 4)) {
    return redirectWithError('Password too weak (8+ chars, upper, lower, number/symbol)');
  }

  try {
    const supabase = getDb();
    const { data: existing, error: existingError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    if (existingError) {
      return redirectWithError('Registration failed, please try again');
    }
    if (existing) {
      return redirectWithError('Registration failed, please try again');
    }

    const hash = await bcrypt.hash(password, 10);

    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert({ name, email, password: hash, role: 'USER' })
      .select('id,email,name,role,avatar_url')
      .single();
    if (insertError || !user) {
      return redirectWithError('Registration failed, please try again');
    }

    try {
      await supabase.from('carts').insert({ user_id: user.id });
    } catch (err) {
      console.warn('Failed to create cart for user', user.id, err);
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
  } catch {
    return redirectWithError('Registration failed, please try again');
  }
}
