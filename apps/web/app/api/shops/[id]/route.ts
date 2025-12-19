import { NextRequest, NextResponse } from 'next/server';

import { getDb, mapShop } from '../../../../lib/db';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid shop id' }, { status: 400 });
  }
  const supabase = getDb();
  const { data: shop, error } = await supabase
    .from('shops')
    .select('id,name,owner_id')
    .eq('id', id)
    .maybeSingle();
  if (error || !shop) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(mapShop(shop));
}
