import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookieName, verifyAuthToken } from '../../../../../../lib/auth';
import { getDb } from '../../../../../../lib/db';

type Params = { params: { id: string } };

export async function POST(req: NextRequest, { params }: Params) {
  const token = req.cookies.get(getAuthCookieName())?.value;
  const current = token ? verifyAuthToken(token) : null;
  if (!current || current.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const id = Number(params.id);
  if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const supabase = getDb();
  const { error } = await supabase
    .from('shop_requests')
    .update({ status: 'REJECTED' })
    .eq('id', id);
  if (error) {
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
