import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '../../../../lib/prisma';
import { getAuthCookieName, verifyAuthToken } from '../../../../lib/auth';
import { isRateLimited } from '../../../../lib/rate-limit';

type Params = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Params) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });
  }
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, payment: true },
  });
  if (!order) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const token = req.cookies.get(getAuthCookieName())?.value;
  const current = token ? verifyAuthToken(token) : null;
  if (current && current.role !== 'ADMIN' && current.id !== order.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return NextResponse.json(order);
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
  if (current.role !== 'ADMIN') {
    if (current.role !== 'SHOP') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const ownable = await prisma.order.findUnique({
      where: { id },
      include: { shop: { select: { ownerId: true } } },
    });
    if (!ownable || ownable.shop.ownerId !== current.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }
  const body = await req.json();
  const status = String(body.status || '').trim();
  if (!status) {
    return NextResponse.json({ error: 'Status is required' }, { status: 400 });
  }
  const order = await prisma.order.update({ where: { id }, data: { status } });
  return NextResponse.json(order);
}
