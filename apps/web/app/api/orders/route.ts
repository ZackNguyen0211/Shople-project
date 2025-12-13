import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '../../../lib/prisma';
import { getAuthCookieName, verifyAuthToken } from '../../../lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(getAuthCookieName())?.value;
  const current = token ? verifyAuthToken(token) : null;
  if (!current) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: current.id },
    include: { items: true, payment: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(orders);
}

