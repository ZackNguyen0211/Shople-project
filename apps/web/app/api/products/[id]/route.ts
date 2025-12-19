import { NextRequest, NextResponse } from 'next/server';

import { getAuthCookieName, verifyAuthToken } from '../../../../lib/auth';
import { getDb, mapProduct, mapProductImage } from '../../../../lib/db';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
  }
  const supabase = getDb();
  const { data: product, error } = await supabase
    .from('products')
    .select('id,title,description,price,image_url,shop_id,shop:shops(owner_id)')
    .eq('id', id)
    .maybeSingle();
  if (error || !product) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const { data: images, error: imagesError } = await supabase
    .from('product_images')
    .select('url,sort_order')
    .eq('product_id', id)
    .order('sort_order', { ascending: true });
  if (imagesError) {
    return NextResponse.json({ error: 'Failed to load images' }, { status: 500 });
  }
  return NextResponse.json({
    ...mapProduct(product),
    shop: product.shop ? { ownerId: product.shop.owner_id } : null,
    images: (images || []).map(mapProductImage),
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const id = Number(params.id);
  if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
  const token = req.cookies.get(getAuthCookieName())?.value;
  const current = token ? verifyAuthToken(token) : null;

  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getDb();
  if (current.role !== 'ADMIN') {
    const { data: prod, error: prodError } = await supabase
      .from('products')
      .select('id,shop:shops(owner_id)')
      .eq('id', id)
      .maybeSingle();
    if (prodError || !prod || prod.shop?.owner_id !== current.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const body = await req.json();
  const title = typeof body.title === 'string' ? body.title.trim() : undefined;
  const description = typeof body.description === 'string' ? body.description : undefined;
  const price = body.price != null ? Number(body.price) : undefined;
  const shopId = body.shopId != null ? Number(body.shopId) : undefined;
  const hasImageUrls = body.imageUrls !== undefined;
  const imageUrls: string[] = Array.isArray(body.imageUrls)
    ? body.imageUrls.map((s: unknown) => String(s || '').trim()).filter(Boolean)
    : typeof body.imageUrls === 'string'
      ? String(body.imageUrls)
          .split(/\n|,/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  const updates: Record<string, unknown> = {};
  if (title) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (Number.isFinite(price)) updates.price = price as number;
  // Note: shopId cannot be changed to prevent moving products between shops
  if (hasImageUrls) {
    updates.image_url = imageUrls[0] || null;
  }

  const { data: updated, error: updateError } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select('id,title,description,price,image_url,shop_id')
    .single();
  if (updateError || !updated) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }

  if (hasImageUrls) {
    const { error: deleteError } = await supabase
      .from('product_images')
      .delete()
      .eq('product_id', id);
    if (deleteError) {
      return NextResponse.json({ error: 'Failed to update images' }, { status: 500 });
    }
    if (imageUrls.length) {
      const rows = imageUrls.map((url: string, i: number) => ({
        product_id: id,
        url,
        sort_order: i,
      }));
      const { error: insertError } = await supabase.from('product_images').insert(rows);
      if (insertError) {
        return NextResponse.json({ error: 'Failed to update images' }, { status: 500 });
      }
    }
  }

  return NextResponse.json(mapProduct(updated));
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const id = Number(params.id);
  if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
  const token = req.cookies.get(getAuthCookieName())?.value;
  const current = token ? verifyAuthToken(token) : null;

  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getDb();
  if (current.role !== 'ADMIN') {
    const { data: prod, error: prodError } = await supabase
      .from('products')
      .select('id,shop:shops(owner_id)')
      .eq('id', id)
      .maybeSingle();
    if (prodError || !prod || prod.shop?.owner_id !== current.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
