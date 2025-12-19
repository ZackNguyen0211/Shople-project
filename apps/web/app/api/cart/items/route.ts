import { NextRequest, NextResponse } from 'next/server';

import { getAuthCookieName, verifyAuthToken } from '../../../../lib/auth';
import { isRateLimited } from '../../../../lib/rate-limit';
import { getDb } from '../../../../lib/db';

async function requireUser(req: NextRequest) {
  const token = req.cookies.get(getAuthCookieName())?.value;
  const current = token ? verifyAuthToken(token) : null;
  if (!current) throw new Error('UNAUTHORIZED');
  return current;
}

const parseBody = async (req: NextRequest) => {
  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const body = await req.json();
    return { productId: Number(body.productId), quantity: Number(body.quantity ?? 1), json: true };
  }
  const form = await req.formData();
  return {
    productId: Number(form.get('productId')),
    quantity: Number(form.get('quantity') || 1),
    json: false,
  };
};

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited(req, 'cart:post', 60, 10 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    const current = await requireUser(req);
    const supabase = getDb();
    const { productId, quantity, json } = await parseBody(req);
    if (!productId || Number.isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
    }
    const qty = !quantity || Number.isNaN(quantity) || quantity < 1 ? 1 : quantity;

    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', current.id)
      .maybeSingle();
    if (cartError) {
      return NextResponse.json({ error: 'Failed to load cart' }, { status: 500 });
    }
    let cartId = cart?.id;
    if (!cartId) {
      const { data: newCart, error: newCartError } = await supabase
        .from('carts')
        .insert({ user_id: current.id })
        .select('id')
        .single();
      if (newCartError || !newCart) {
        return NextResponse.json({ error: 'Failed to create cart' }, { status: 500 });
      }
      cartId = newCart.id;
    }

    const { data: existing, error: existingError } = await supabase
      .from('cart_items')
      .select('id,quantity')
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .maybeSingle();
    if (existingError) {
      return NextResponse.json({ error: 'Failed to load cart item' }, { status: 500 });
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + qty })
        .eq('id', existing.id);
      if (updateError) {
        return NextResponse.json({ error: 'Failed to update cart item' }, { status: 500 });
      }
    } else {
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert({ cart_id: cartId, product_id: productId, quantity: qty });
      if (insertError) {
        return NextResponse.json({ error: 'Failed to add cart item' }, { status: 500 });
      }
    }

    if (json) return NextResponse.json({ ok: true });
    return NextResponse.redirect(new URL('/cart', req.url));
  } catch (err) {
    if ((err as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (isRateLimited(req, 'cart:patch', 60, 10 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    const current = await requireUser(req);
    const supabase = getDb();
    const { productId, quantity } = await req.json();
    const pid = Number(productId);
    const qty = Number(quantity);
    if (!pid || Number.isNaN(pid)) return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
    if (!Number.isFinite(qty) || qty < 1) return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });

    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', current.id)
      .maybeSingle();
    if (cartError) {
      return NextResponse.json({ error: 'Failed to load cart' }, { status: 500 });
    }
    let cartId = cart?.id;
    if (!cartId) {
      const { data: newCart, error: newCartError } = await supabase
        .from('carts')
        .insert({ user_id: current.id })
        .select('id')
        .single();
      if (newCartError || !newCart) {
        return NextResponse.json({ error: 'Failed to create cart' }, { status: 500 });
      }
      cartId = newCart.id;
    }

    const { data: existing, error: existingError } = await supabase
      .from('cart_items')
      .select('id')
      .eq('cart_id', cartId)
      .eq('product_id', pid)
      .maybeSingle();
    if (existingError) {
      return NextResponse.json({ error: 'Failed to load cart item' }, { status: 500 });
    }
    if (!existing) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    const { error: updateError } = await supabase
      .from('cart_items')
      .update({ quantity: qty })
      .eq('id', existing.id);
    if (updateError) {
      return NextResponse.json({ error: 'Failed to update cart item' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    if ((err as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (isRateLimited(req, 'cart:delete', 60, 10 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    const current = await requireUser(req);
    const supabase = getDb();
    const contentType = req.headers.get('content-type') || '';
    let pid: number | null = null;
    if (contentType.includes('application/json')) {
      const body = await req.json();
      pid = Number(body.productId);
    } else {
      const form = await req.formData();
      pid = Number(form.get('productId'));
    }
    if (!pid || Number.isNaN(pid)) return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });

    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', current.id)
      .maybeSingle();
    if (cartError) {
      return NextResponse.json({ error: 'Failed to load cart' }, { status: 500 });
    }
    if (!cart) return NextResponse.json({ ok: true });
    const { error: deleteError } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id)
      .eq('product_id', pid);
    if (deleteError) {
      return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    if ((err as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}
