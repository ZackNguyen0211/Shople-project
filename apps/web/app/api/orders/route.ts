import { NextRequest, NextResponse } from 'next/server';

import { getAuthCookieName, verifyAuthToken } from '../../../lib/auth';
import { getDb, mapOrderItem } from '../../../lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(getAuthCookieName())?.value;
  const current = token ? verifyAuthToken(token) : null;
  if (!current) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getDb();
  const { data, error } = await supabase
    .from('orders')
    .select('id,status,user_id,shop_id,created_at,items:order_items(id,product_id,price,quantity),payment:payments(id,provider,status,ref)')
    .eq('user_id', current.id)
    .order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 });
  }
  const orders = (data || []).map((row) => ({
    id: row.id,
    status: row.status,
    userId: row.user_id,
    shopId: row.shop_id,
    createdAt: row.created_at,
    items: (row.items || []).map(mapOrderItem),
    payment: row.payment || null,
  }));
  return NextResponse.json(orders);
}
