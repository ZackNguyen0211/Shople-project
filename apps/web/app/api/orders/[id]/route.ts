import { NextRequest, NextResponse } from 'next/server';

import { getAuthCookieName, verifyAuthToken } from '../../../../lib/auth';
import { isRateLimited } from '../../../../lib/rate-limit';
import { getDb, mapOrderItem } from '../../../../lib/db';

type Params = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Params) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });
  }
  const supabase = getDb();
  const { data: order, error } = await supabase
    .from('orders')
    .select('id,status,user_id,shop_id,created_at,items:order_items(id,product_id,price,quantity),payment:payments(id,provider,status,ref)')
    .eq('id', id)
    .maybeSingle();
  if (error || !order) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const token = req.cookies.get(getAuthCookieName())?.value;
  const current = token ? verifyAuthToken(token) : null;
  if (current && current.role !== 'ADMIN' && current.id !== order.user_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return NextResponse.json({
    id: order.id,
    status: order.status,
    userId: order.user_id,
    shopId: order.shop_id,
    createdAt: order.created_at,
    items: (order.items || []).map(mapOrderItem),
    payment: order.payment || null,
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });
  }
  if (isRateLimited(req, 'orders:patch', 30, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  const token = req.cookies.get(getAuthCookieName())?.value;
  const current = token ? verifyAuthToken(token) : null;
  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Allow ADMIN always; allow SHOP only for orders of shops they own
  const supabase = getDb();
  if (current.role !== 'ADMIN') {
    if (current.role !== 'SHOP') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { data: ownable, error: ownableError } = await supabase
      .from('orders')
      .select('id,shop:shops(owner_id)')
      .eq('id', id)
      .maybeSingle();
    if (ownableError || !ownable || ownable.shop?.owner_id !== current.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }
  const body = await req.json();
  const status = String(body.status || '').trim();
  if (!status) {
    return NextResponse.json({ error: 'Status is required' }, { status: 400 });
  }
  const { data: order, error: updateError } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select('id,status,user_id,shop_id,created_at')
    .single();
  if (updateError || !order) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
  return NextResponse.json({
    id: order.id,
    status: order.status,
    userId: order.user_id,
    shopId: order.shop_id,
    createdAt: order.created_at,
  });
}
