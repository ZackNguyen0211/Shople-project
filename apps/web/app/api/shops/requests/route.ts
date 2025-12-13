import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getAuthCookieName, verifyAuthToken } from '../../../../lib/auth';

export async function GET(req: NextRequest) {
  // Admin list (optional usage)
  const token = req.cookies.get(getAuthCookieName())?.value;
  const current = token ? verifyAuthToken(token) : null;
  if (!current || current.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const items = await prisma.shopRequest.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(getAuthCookieName())?.value;
  const current = token ? verifyAuthToken(token) : null;
  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const shopName = String(body?.shopName || '').trim();
  const shopOwnerEmail = String(body?.shopOwnerEmail || '').trim().toLowerCase();
  if (!shopName || !shopOwnerEmail) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  const saved = await prisma.shopRequest.create({ data: { requesterId: current.id, shopName, shopOwnerEmail } });
  return NextResponse.json(saved, { status: 201 });
}

