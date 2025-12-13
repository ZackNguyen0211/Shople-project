import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '../../../lib/prisma';
import { getAuthCookieName, verifyAuthToken } from '../../../lib/auth';

export async function GET() {
  const shops = await prisma.shop.findMany({
    take: 50,
    orderBy: { id: 'asc' },
  });
  return NextResponse.json(shops);
}

// Creation of shops should be an admin action only (via approval flow)
export async function POST(req: NextRequest) {
  const token = req.cookies.get(getAuthCookieName())?.value;
  const current = token ? verifyAuthToken(token) : null;
  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (current.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const name = String(body?.name || '').trim();
  const ownerId = Number(body?.ownerId);
  if (!name || !Number.isFinite(ownerId)) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  const shop = await prisma.shop.create({ data: { name, ownerId } });
  return NextResponse.json(shop, { status: 201 });
}
