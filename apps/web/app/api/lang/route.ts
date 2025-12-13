import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const lang = body?.lang === 'en' ? 'en' : body?.lang === 'vi' ? 'vi' : null;
    if (!lang) return NextResponse.json({ error: 'Invalid lang' }, { status: 400 });
    const res = NextResponse.json({ ok: true });
    res.cookies.set('lang', lang, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
    return res;
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}

