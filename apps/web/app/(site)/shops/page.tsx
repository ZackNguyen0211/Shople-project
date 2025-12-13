import Link from 'next/link';
import type { Route } from 'next';

import { prisma } from '../../../lib/prisma';
import type { Shop } from '../../../lib/types';
import { getDict, getLang } from '../../../lib/i18n';

export default async function ShopsPage() {
  const shops: Shop[] = await prisma.shop.findMany({ orderBy: { id: 'asc' } });

  const t = getDict(getLang());
  return (
    <div>
      <h1 className="page-title">{t.shopsList.title}</h1>
      <div className="card-grid">
        {shops.map((shop) => (
          <Link key={shop.id} className="card" href={`/shop/${shop.id}` as Route}>
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
