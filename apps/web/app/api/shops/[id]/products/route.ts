import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '../../../../../lib/prisma';
import type { Prisma } from '@prisma/client';
import { getAuthCookieName, verifyAuthToken } from '../../../../../lib/auth';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid shop id' }, { status: 400 });
  }
  const products = await prisma.product.findMany({ where: { shopId: id } });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest, { params }: Params) {
  const shopId = Number(params.id);
  if (Number.isNaN(shopId)) {
    return NextResponse.json({ error: 'Invalid shop id' }, { status: 400 });
  }

  const token = req.cookies.get(getAuthCookieName())?.value;
  const current = token ? verifyAuthToken(token) : null;
  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (current.role !== 'ADMIN') {
    if (current.role !== 'SHOP') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const shop = await prisma.shop.findUnique({ where: { id: shopId }, select: { ownerId: true } });
    if (!shop || shop.ownerId !== current.id) {
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
      ? String(body.imageUrls).split(/\n|,/).map((s) => s.trim()).filter(Boolean)
      : [];

  if (!title || !Number.isFinite(price)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const data = {
    title,
    price,
    description,
    shopId,
    imageUrl: imageUrls[0] || undefined,
    ...(imageUrls.length
      ? { images: { create: imageUrls.map((url: string, i: number) => ({ url, sortOrder: i })) } }
      : {}),
  } as unknown as Prisma.ProductUncheckedCreateInput;
  const product = await prisma.product.create({ data });
  return NextResponse.json(product, { status: 201 });
}
