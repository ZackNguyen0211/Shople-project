import { NextRequest, NextResponse } from 'next/server';

import { getAuthCookieName, verifyAuthToken } from '../../../../lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(getAuthCookieName())?.value;
  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  const user = verifyAuthToken(token);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  return NextResponse.json({ user }, { status: 200 });
}
