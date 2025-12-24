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
  const { data: request, error: requestError } = await supabase
    .from('shop_requests')
    .select('id,shop_name,shop_owner_email,status,requester_id')
    .eq('id', id)
    .maybeSingle();
  if (requestError || !request || request.status !== 'PENDING') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { data: owner, error: ownerError } = await supabase
    .from('users')
    .select('id,email,role')
    .eq('email', request.shop_owner_email)
    .maybeSingle();
  if (ownerError || !owner || owner.role !== 'SHOP') {
    return NextResponse.json({ error: 'Owner not found or not a shop' }, { status: 400 });
  }

  const { data: shopRow, error: shopFindError } = await supabase
    .from('shops')
    .select('id,name,owner_id,verified')
    .eq('owner_id', owner.id)
    .maybeSingle();
  if (shopFindError || !shopRow) {
    return NextResponse.json({ error: 'Shop not found for owner' }, { status: 400 });
  }

  const { data: verifiedShop, error: verifyError } = await supabase
    .from('shops')
    .update({ verified: true })
    .eq('id', shopRow.id)
    .select('id,name,owner_id,verified')
    .single();
  if (verifyError || !verifiedShop) {
    return NextResponse.json({ error: 'Failed to verify shop' }, { status: 500 });
  }

  const { error: updateRequestError } = await supabase
    .from('shop_requests')
    .update({ status: 'APPROVED' })
    .eq('id', id);
  if (updateRequestError) {
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }

  try {
    await supabase.from('notifications').insert({
      user_id: request.requester_id,
      title: 'Shop verification approved',
      body: `Congratulations! Your shop "${request.shop_name}" has been verified. You can now manage your shop.`,
      is_read: false,
    });
  } catch (e) {
    console.warn('Failed to insert notification', e);
  }

  return NextResponse.json({ ok: true, message: 'Shop verified successfully' });
}
