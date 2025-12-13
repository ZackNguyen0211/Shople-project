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
  await prisma.shopRequest.update({ where: { id }, data: { status: 'REJECTED' } });
  return NextResponse.json({ ok: true });
}

