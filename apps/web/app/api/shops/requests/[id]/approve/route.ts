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
  const { data: request, error: requestError } = await supabase
    .from('shop_requests')
    .select('id,shop_name,shop_owner_email,status')
    .eq('id', id)
    .maybeSingle();
  if (requestError || !request || request.status !== 'PENDING') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Find or create shop owner by email, set role SHOP
  const { data: existingOwner, error: ownerError } = await supabase
    .from('users')
    .select('id,email,role')
    .eq('email', request.shop_owner_email)
    .maybeSingle();
  if (ownerError) {
    return NextResponse.json({ error: 'Failed to load owner' }, { status: 500 });
  }

  let ownerId: number;
  if (!existingOwner) {
    const { data: newOwner, error: newOwnerError } = await supabase
      .from('users')
      .insert({
        email: request.shop_owner_email,
        name: request.shop_owner_email.split('@')[0],
        password: 'changeme',
        role: 'SHOP',
      })
      .select('id')
      .single();
    if (newOwnerError || !newOwner) {
      return NextResponse.json({ error: 'Failed to create owner' }, { status: 500 });
    }
    ownerId = newOwner.id;
  } else if (existingOwner.role !== 'SHOP') {
    const { data: updatedOwner, error: updateError } = await supabase
      .from('users')
      .update({ role: 'SHOP' })
      .eq('id', existingOwner.id)
      .select('id')
      .single();
    if (updateError || !updatedOwner) {
      return NextResponse.json({ error: 'Failed to update owner' }, { status: 500 });
    }
    ownerId = updatedOwner.id;
  } else {
    ownerId = existingOwner.id;
  }

  // Create the shop for this owner
  const { data: shop, error: shopError } = await supabase
    .from('shops')
    .insert({ name: request.shop_name, owner_id: ownerId })
    .select('id,name,owner_id')
    .single();
  if (shopError || !shop) {
    return NextResponse.json({ error: 'Failed to create shop' }, { status: 500 });
  }

  const { error: updateRequestError } = await supabase
    .from('shop_requests')
    .update({ status: 'APPROVED' })
    .eq('id', id);
  if (updateRequestError) {
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, shop: { id: shop.id, name: shop.name, ownerId: shop.owner_id } });
}
