import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '../../../lib/prisma';
import { getAuthCookieName, verifyAuthToken } from '../../../lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(getAuthCookieName())?.value;
  const current = token ? verifyAuthToken(token) : null;
  if (!current) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: current.id },
    include: { items: { include: { product: true } } },
  });

  return NextResponse.json(cart ?? { id: 0, items: [] });
}

