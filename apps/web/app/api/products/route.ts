import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '../../../lib/prisma';
import type { Prisma } from '@prisma/client';
import { getAuthCookieName, verifyAuthToken } from '../../../lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || undefined;
  const skipParam = Number(searchParams.get('skip') || 0);
  const takeParam = Number(searchParams.get('take') || 50);
  const includeTotal = searchParams.get('includeTotal') === '1';

  const skip = Number.isNaN(skipParam) ? 0 : Math.max(0, skipParam);
  const take = Number.isNaN(takeParam) ? 50 : Math.max(1, Math.min(200, takeParam));

  const where = q ? { title: { contains: q } } : undefined;

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: { id: 'desc' },
      include: { shop: { select: { id: true, name: true } } },
    }),
    includeTotal ? prisma.product.count({ where }) : Promise.resolve(0),
  ]);

  if (includeTotal) return NextResponse.json({ items, total });
  return NextResponse.json(items);
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
      ? String(body.imageUrls).split(/\n|,/).map((s) => s.trim()).filter(Boolean)
      : [];
  if (!title || !Number.isFinite(price) || !Number.isFinite(shopId)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  const data = {
    title,
    price,
    shopId,
    description,
    imageUrl: imageUrls[0] || undefined,
    ...(imageUrls.length
      ? { images: { create: imageUrls.map((url: string, i: number) => ({ url, sortOrder: i })) } }
      : {}),
  } as unknown as Prisma.ProductUncheckedCreateInput;
  const product = await prisma.product.create({ data });
  return NextResponse.json(product, { status: 201 });
}
