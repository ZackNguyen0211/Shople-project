import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { getAuthCookieName, verifyAuthToken } from '../../../../../../lib/auth';

type Params = { params: { id: string } };

export async function POST(req: NextRequest, { params }: Params) {
  const token = req.cookies.get(getAuthCookieName())?.value;
  const current = token ? verifyAuthToken(token) : null;
  if (!current || current.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const id = Number(params.id);
  if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const r = await prisma.shopRequest.findUnique({ where: { id } });
  if (!r || r.status !== 'PENDING') return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  // Find or create shop owner by email, set role SHOP
  let owner = await prisma.user.findUnique({ where: { email: r.shopOwnerEmail } });
  if (!owner) {
    owner = await prisma.user.create({ data: { email: r.shopOwnerEmail, name: r.shopOwnerEmail.split('@')[0], password: 'changeme', role: 'SHOP' } });
  } else if (owner.role !== 'SHOP') {
    owner = await prisma.user.update({ where: { id: owner.id }, data: { role: 'SHOP' } });
  }

  // Create the shop for this owner
  const shop = await prisma.shop.create({ data: { name: r.shopName, ownerId: owner.id } });

  await prisma.shopRequest.update({ where: { id }, data: { status: 'APPROVED' } });
  return NextResponse.json({ ok: true, shop });
}

