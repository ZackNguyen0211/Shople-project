import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

import { authCookieOptions, getAuthCookieName, signAuthToken } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-5
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const shopName = String(form.get('shop_name') || '').trim();
  const email = String(form.get('email') || '')
    .trim()
    .toLowerCase();
  const password = String(form.get('password') || '');
  const confirm = String(form.get('confirm') || '');
  const nextParam =
    String(form.get('next') || '') || req.nextUrl.searchParams.get('next') || '/shop/manage';

  const redirectWithError = (message: string) => {
    const url = new URL('/register-shop', req.url);
    url.searchParams.set('error', message);
    if (nextParam) url.searchParams.set('next', nextParam);
    return NextResponse.redirect(url);
  };

  if (!shopName || !email || !password || !confirm) {
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
    // Ensure email not used
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

    // Create SHOP user
    const { data: user, error: insertUserError } = await supabase
      .from('users')
      .insert({ name: shopName, email, password: hash, role: 'SHOP' })
      .select('id,email,name,role,avatar_url')
      .single();
    if (insertUserError || !user) {
      return redirectWithError('Registration failed, please try again');
    }

    // Create shop (unverified by default)
    const { data: shop, error: insertShopError } = await supabase
      .from('shops')
      .insert({ name: shopName, owner_id: user.id, verified: false })
      .select('id')
      .single();
    if (insertShopError || !shop) {
      return redirectWithError('Registration failed, please try again');
    }

    // Auto-create verification request
    try {
      await supabase.from('shop_requests').insert({
        requester_id: user.id,
        shop_name: shopName,
        shop_owner_email: email,
        status: 'PENDING',
      });
    } catch (e) {
      console.warn('Failed to auto-create verification request', e);
    }

    const token = signAuthToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar_url: user.avatar_url,
    });
    const destination = nextParam.startsWith('/') ? nextParam : '/shop/manage';
    const redirect = NextResponse.redirect(new URL(destination, req.url));
    redirect.cookies.set(getAuthCookieName(), token, authCookieOptions);
    return redirect;
  } catch {
    return redirectWithError('Registration failed, please try again');
  }
}
