import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookieName, verifyAuthToken } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

export async function GET(req: NextRequest) {
  // Admin list (optional usage)
  const token = req.cookies.get(getAuthCookieName())?.value;
  const current = token ? verifyAuthToken(token) : null;
  if (!current || current.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const supabase = getDb();
  const { data, error } = await supabase
    .from('shop_requests')
    .select('id,requester_id,shop_name,shop_owner_email,status,created_at')
    .order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ error: 'Failed to load requests' }, { status: 500 });
  }
  const items = (data || []).map((row) => ({
    id: row.id,
    requesterId: row.requester_id,
    shopName: row.shop_name,
    shopOwnerEmail: row.shop_owner_email,
    status: row.status,
    createdAt: row.created_at,
  }));
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(getAuthCookieName())?.value;
  const current = token ? verifyAuthToken(token) : null;
  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const shopName = String(body?.shopName || '').trim();
  const shopOwnerEmail = String(body?.shopOwnerEmail || '').trim().toLowerCase();
  if (!shopName || !shopOwnerEmail) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  const supabase = getDb();
  const { data: saved, error } = await supabase
    .from('shop_requests')
    .insert({
      requester_id: current.id,
      shop_name: shopName,
      shop_owner_email: shopOwnerEmail,
    })
    .select('id,requester_id,shop_name,shop_owner_email,status,created_at')
    .single();
  if (error || !saved) {
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
  return NextResponse.json(
    {
      id: saved.id,
      requesterId: saved.requester_id,
      shopName: saved.shop_name,
      shopOwnerEmail: saved.shop_owner_email,
      status: saved.status,
      createdAt: saved.created_at,
    },
    { status: 201 }
  );
}
