import { NextRequest, NextResponse } from 'next/server';

import { getDb, mapProduct } from '../../../../../lib/db';
import { getAuthCookieName, verifyAuthToken } from '../../../../../lib/auth';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid shop id' }, { status: 400 });
  }
  const supabase = getDb();
  const { data, error } = await supabase
    .from('products')
    .select('id,title,description,price,image_url,shop_id')
    .eq('shop_id', id)
    .order('id', { ascending: true });
  if (error) {
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
  return NextResponse.json((data || []).map(mapProduct));
}

export async function POST(req: NextRequest, { params }: Params) {
  const shopId = Number(params.id);
  if (Number.isNaN(shopId)) {
    return NextResponse.json({ error: 'Invalid shop id' }, { status: 400 });
  }

  const token = req.cookies.get(getAuthCookieName())?.value;
  const current = token ? verifyAuthToken(token) : null;
  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getDb();
  if (current.role !== 'ADMIN') {
    if (current.role !== 'SHOP') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('owner_id')
      .eq('id', shopId)
      .maybeSingle();
    if (shopError || !shop || shop.owner_id !== current.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const body = await req.json();
  const title = String(body.title || '').trim();
  const price = Number(body.price);
  const description = typeof body.description === 'string' ? body.description : undefined;
  const imageUrls: string[] = Array.isArray(body.imageUrls)
    ? body.imageUrls.map((s: unknown) => String(s || '').trim()).filter(Boolean)
    : typeof body.imageUrls === 'string'
      ? String(body.imageUrls)
          .split(/\n|,/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  if (!title || !Number.isFinite(price)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      title,
      price,
      description,
      shop_id: shopId,
      image_url: imageUrls[0] || null,
    })
    .select('id,title,description,price,image_url,shop_id')
    .single();
  if (error || !product) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
  if (imageUrls.length) {
    const rows = imageUrls.map((url: string, i: number) => ({
      product_id: product.id,
      url,
      sort_order: i,
    }));
    const { error: imageError } = await supabase.from('product_images').insert(rows);
    if (imageError) {
      return NextResponse.json({ error: 'Failed to attach images' }, { status: 500 });
    }
  }
  return NextResponse.json(mapProduct(product), { status: 201 });
}
