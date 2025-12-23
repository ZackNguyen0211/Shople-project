import { NextRequest, NextResponse } from 'next/server';

import { getDb, mapProduct } from '@/lib/db';
import { getAuthCookieName, verifyAuthToken } from '@/lib/auth';

interface ShopData {
  id: number;
  name: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || undefined;
  const skipParam = Number(searchParams.get('skip') || 0);
  const takeParam = Number(searchParams.get('take') || 50);
  const includeTotal = searchParams.get('includeTotal') === '1';

  const skip = Number.isNaN(skipParam) ? 0 : Math.max(0, skipParam);
  const take = Number.isNaN(takeParam) ? 50 : Math.max(1, Math.min(200, takeParam));

  const supabase = getDb();
  const rangeStart = skip;
  const rangeEnd = skip + take - 1;
  const selectColumns = 'id,title,description,price,image_url,shop_id,shop:shops(id,name)';
  const selectOpts = includeTotal ? { count: 'exact' as const } : undefined;
  let query = supabase
    .from('products')
    .select(selectColumns, selectOpts)
    .order('id', { ascending: false })
    .range(rangeStart, rangeEnd);
  if (q) {
    query = query.ilike('title', `%${q}%`);
  }
  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
  const items = (data || []).map((row) => {
    const shop = Array.isArray(row.shop) ? row.shop[0] : row.shop;
    return {
      ...mapProduct(row),
      shop: shop ? { id: (shop as ShopData).id, name: (shop as ShopData).name } : null,
    };
  });
  const total = includeTotal ? count || 0 : 0;

  const response = includeTotal ? NextResponse.json({ items, total }) : NextResponse.json(items);

  response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  return response;
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(getAuthCookieName())?.value;
  const current = token ? verifyAuthToken(token) : null;
  if (!current || current.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await req.json();
  const title = String(body.title || '').trim();
  const price = Number(body.price);
  const shopId = Number(body.shopId);
  const description = typeof body.description === 'string' ? body.description : undefined;
  const imageUrls: string[] = Array.isArray(body.imageUrls)
    ? body.imageUrls.map((s: unknown) => String(s || '').trim()).filter(Boolean)
    : typeof body.imageUrls === 'string'
      ? String(body.imageUrls)
          .split(/\n|,/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  if (!title || !Number.isFinite(price) || !Number.isFinite(shopId)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  const supabase = getDb();
  const { data: product, error } = await supabase
    .from('products')
    .insert({
      title,
      price,
      shop_id: shopId,
      description,
      image_url: imageUrls[0] || null,
    })
    .select('id,title,description,price,image_url,shop_id')
    .single();
  if (error || !product) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
  if (imageUrls.length) {
    const images = imageUrls.map((url: string, i: number) => ({
      product_id: product.id,
      url,
      sort_order: i,
    }));
    const { error: imageError } = await supabase.from('product_images').insert(images);
    if (imageError) {
      return NextResponse.json({ error: 'Failed to attach images' }, { status: 500 });
    }
  }
  return NextResponse.json(mapProduct(product), { status: 201 });
}
