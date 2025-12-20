import Link from 'next/link';
import type { Route } from 'next';

import type { Shop } from '../../../lib/types';
import { getDict, getLang } from '../../../lib/i18n';
import { getDb, mapShop } from '../../../lib/db';

export default async function ShopsPage() {
  const supabase = getDb();
  const { data, error } = await supabase
    .from('shops')
    .select('id,name')
    .order('id', { ascending: true });
  if (error) {
    throw new Error('Failed to load shops');
  }
  const shops: Shop[] = (data || []).map(mapShop);

  const t = getDict(getLang());
  return (
    <div>
      <h1 className="page-title">{t.shopsList.title}</h1>
      <div className="card-grid">
        {shops.map((shop) => (
          <Link key={shop.id} className="card" href={`/shop-management/${shop.id}` as Route}>
            <div style={{ display: 'grid', gap: 6 }}>
              <div style={{ fontWeight: 700 }}>{shop.name}</div>
              <div className="muted">{t.shopsList.viewProducts}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
