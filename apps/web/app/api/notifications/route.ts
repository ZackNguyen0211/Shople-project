import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookieName, verifyAuthToken } from '../../../lib/auth';
import { getDb } from '../../../lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(getAuthCookieName())?.value;
  const current = token ? verifyAuthToken(token) : null;
  if (!current) return NextResponse.json([], { status: 200 });
  const supabase = getDb();
  const { data, error } = await supabase
    .from('notifications')
    .select('id,title,body,is_read,created_at')
    .eq('user_id', current.id)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) return NextResponse.json([], { status: 200 });
  const items = (data || []).map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body ?? '',
    isRead: n.is_read,
    createdAt: n.created_at,
  }));
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(getAuthCookieName())?.value;
  const current = token ? verifyAuthToken(token) : null;
  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const action = String(body?.action || '');
  const supabase = getDb();
  if (action === 'markAllRead') {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', current.id);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
}
