import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '../../../../lib/prisma';
import { getAuthCookieName, verifyAuthToken } from '../../../../lib/auth';
import { isRateLimited } from '../../../../lib/rate-limit';

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
    const { productId, quantity, json } = await parseBody(req);
    if (!productId || Number.isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
    }
    const qty = !quantity || Number.isNaN(quantity) || quantity < 1 ? 1 : quantity;

    const cart = await prisma.cart.upsert({
      where: { userId: current.id },
      update: {},
      create: { userId: current.id },
    });

    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + qty },
      });
    } else {
      await prisma.cartItem.create({ data: { cartId: cart.id, productId, quantity: qty } });
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
    const { productId, quantity } = await req.json();
    const pid = Number(productId);
    const qty = Number(quantity);
    if (!pid || Number.isNaN(pid)) return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
    if (!Number.isFinite(qty) || qty < 1) return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });

    const cart = await prisma.cart.upsert({
      where: { userId: current.id },
      update: {},
      create: { userId: current.id },
    });

    const existing = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId: pid } });
    if (!existing) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: qty } });
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

    const cart = await prisma.cart.findUnique({ where: { userId: current.id } });
    if (!cart) return NextResponse.json({ ok: true });
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId: pid } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if ((err as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}
