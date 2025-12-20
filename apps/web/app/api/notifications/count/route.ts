import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookieName, verifyAuthToken } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(getAuthCookieName())?.value;
  const current = token ? verifyAuthToken(token) : null;
  if (!current) return NextResponse.json({ count: 0 }, { status: 200 });

  const supabase = getDb();
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', current.id)
    .eq('is_read', false);

  if (error) return NextResponse.json({ count: 0 }, { status: 200 });
  return NextResponse.json({ count: count || 0 });
}
