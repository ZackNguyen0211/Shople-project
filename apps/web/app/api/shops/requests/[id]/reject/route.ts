import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookieName, verifyAuthToken } from '../../../../../../lib/auth';
import { getDb } from '../../../../../../lib/db';

type Params = { params: { id: string } };

export async function POST(req: NextRequest, { params }: Params) {
  const token = req.cookies.get(getAuthCookieName())?.value;
  const current = token ? verifyAuthToken(token) : null;
  if (!current || current.role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const id = Number(params.id);
  if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const supabase = getDb();
  const { data: reqRow, error: loadError } = await supabase
    .from('shop_requests')
    .select('id,requester_id,shop_name,shop_owner_email,status')
    .eq('id', id)
    .maybeSingle();
  if (loadError || !reqRow) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }

  const { error } = await supabase
    .from('shop_requests')
    .update({ status: 'REJECTED' })
    .eq('id', id);
  if (error) {
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
  // Create a notification for the requester
  try {
    await supabase.from('notifications').insert({
      user_id: reqRow.requester_id,
      title: 'Shop verification rejected',
      body: `Your shop "${reqRow.shop_name}" verification was rejected. Please review and resubmit.`,
      is_read: false,
    });
  } catch (e) {
    console.warn('Failed to insert notification', e);
  }

  // Return success response for client to handle redirect
  return NextResponse.json({ ok: true, message: 'Shop request rejected' });
}
