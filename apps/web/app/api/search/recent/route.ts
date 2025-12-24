import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentUser } from '../../../../lib/auth';

const MAX_ITEMS = 7;

function cookieName() {
  const u = getCurrentUser();
  return u ? `recent_searches_uid_${u.id}` : 'recent_searches_guest';
}

function readList() {
  const raw = cookies().get(cookieName())?.value;
  if (!raw) return [] as string[];
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) ? (list as string[]) : [];
  } catch {
    return [];
  }
}

function writeList(items: string[]) {
  const res = NextResponse.json({ ok: true, items });
  res.cookies.set(cookieName(), JSON.stringify(items.slice(0, MAX_ITEMS)), {
    path: '/',
    maxAge: 60 * 60 * 24 * 180,
    sameSite: 'lax',
  });
  return res;
}

export async function GET() {
  const items = readList();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const q = String(body?.q || '').trim();
    if (!q) return NextResponse.json({ error: 'Empty' }, { status: 400 });
    const list = readList();
    const next = [q, ...list.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, MAX_ITEMS);
    return writeList(next);
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    let q = req.nextUrl.searchParams.get('q');
    if (!q) {
      try {
        const body = await req.json();
        q = typeof body?.q === 'string' ? body.q : '';
      } catch {
        // ignore
      }
    }
    if (!q) {
      return writeList([]);
    }
    const v = String(q).trim();
    const list = readList();
    const next = list.filter((x) => x.toLowerCase() !== v.toLowerCase());
    return writeList(next);
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
