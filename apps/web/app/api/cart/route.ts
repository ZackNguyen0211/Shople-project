import { NextRequest, NextResponse } from 'next/server';

import { getAuthCookieName, verifyAuthToken } from '../../../lib/auth';
import { getDb, mapProduct } from '../../../lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(getAuthCookieName())?.value;
  const current = token ? verifyAuthToken(token) : null;
  if (!current) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getDb();
  const { data: cart, error } = await supabase
    .from('carts')
    .select('id,items:cart_items(id,quantity,product:products(id,title,description,price,image_url,shop_id))')
    .eq('user_id', current.id)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: 'Failed to load cart' }, { status: 500 });
  }
  if (!cart) {
    return NextResponse.json({ id: 0, items: [] });
  }
  const items = (cart.items || []).map((item: { id: number; quantity: number; product: unknown }) => ({
    id: item.id,
    quantity: item.quantity,
    product: item.product ? mapProduct(item.product as Parameters<typeof mapProduct>[0]) : null,
  }));
  return NextResponse.json({ id: cart.id, items });
}
