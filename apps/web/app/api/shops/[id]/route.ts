import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '../../../../lib/prisma';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid shop id' }, { status: 400 });
  }
  const shop = await prisma.shop.findUnique({ where: { id } });
  if (!shop) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(shop);
}
