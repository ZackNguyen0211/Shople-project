import { NextRequest, NextResponse } from 'next/server';

import { getAuthCookieName, verifyAuthToken } from '../../../lib/auth';
import { getDb, mapShop } from '../../../lib/db';

export async function GET() {
  const supabase = getDb();
  const { data, error } = await supabase
    .from('shops')
    .select('id,name,owner_id')
    .order('id', { ascending: true })
    .limit(50);
  if (error) {
    return NextResponse.json({ error: 'Failed to load shops' }, { status: 500 });
  }
  return NextResponse.json((data || []).map(mapShop));
}

// Creation of shops should be an admin action only (via approval flow)
export async function POST(req: NextRequest) {
  const token = req.cookies.get(getAuthCookieName())?.value;
  const current = token ? verifyAuthToken(token) : null;
  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (current.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const name = String(body?.name || '').trim();
  const ownerId = Number(body?.ownerId);
  if (!name || !Number.isFinite(ownerId)) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  const supabase = getDb();
  const { data: shop, error } = await supabase
    .from('shops')
    .insert({ name, owner_id: ownerId })
    .select('id,name,owner_id')
    .single();
  if (error || !shop) {
    return NextResponse.json({ error: 'Failed to create shop' }, { status: 500 });
  }
  return NextResponse.json(mapShop(shop), { status: 201 });
}
