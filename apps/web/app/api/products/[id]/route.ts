import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '../../../../lib/prisma';
import { getAuthCookieName, verifyAuthToken } from '../../../../lib/auth';
import type { Prisma } from '@prisma/client';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
  }
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  type ProductImageRow = { url: string; sortOrder: number };
  type ProductImageClient = {
    findMany: (args: { where: { productId: number }; orderBy: { sortOrder: 'asc' | 'desc' } }) => Promise<ProductImageRow[]>;
  };
  const productImage = (prisma as unknown as { productImage: ProductImageClient }).productImage;
  const images = await productImage.findMany({ where: { productId: id }, orderBy: { sortOrder: 'asc' } });
  return NextResponse.json({ ...product, images });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const id = Number(params.id);
  if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
  const token = req.cookies.get(getAuthCookieName())?.value;
  const current = token ? verifyAuthToken(token) : null;
  if (!current || current.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  const title = typeof body.title === 'string' ? body.title.trim() : undefined;
  const description = typeof body.description === 'string' ? body.description : undefined;
  const price = body.price != null ? Number(body.price) : undefined;
  const shopId = body.shopId != null ? Number(body.shopId) : undefined;

  const data: Prisma.ProductUpdateInput = {};
  if (title) data.title = title;
  if (description !== undefined) data.description = description;
  if (Number.isFinite(price)) data.price = price as number;
  if (Number.isFinite(shopId)) data.shop = { connect: { id: shopId as number } };

  const updated = await prisma.product.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const id = Number(params.id);
  if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
  const token = req.cookies.get(getAuthCookieName())?.value;
  const current = token ? verifyAuthToken(token) : null;
  if (!current || current.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

