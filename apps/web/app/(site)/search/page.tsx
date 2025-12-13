import Link from 'next/link';
import type { Route } from 'next';
import type { Product, Shop } from '../../../lib/types';
import { prisma } from '../../../lib/prisma';
import { formatVND } from '../../../lib/format';
import { getDict, getLang } from '../../../lib/i18n';

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim() ?? '';
  const products: Product[] = await prisma.product.findMany({
    where: q ? { title: { contains: q } } : undefined,
    take: 50,
    orderBy: { id: 'desc' },
  });
  const shopIds = Array.from(new Set(products.map((p) => p.shopId).filter(Boolean))) as number[];
  const shops: Shop[] = shopIds.length
    ? await prisma.shop.findMany({ where: { id: { in: shopIds } } })
    : [];
  const shopMap = new Map(shops.map((s) => [s.id, s.name]));

  const t = getDict(getLang());
  return (
    <div>
      <h1 className="page-title">{t.searchPage.title}: {q}</h1>
      <div className="card-grid">
        {products.map((product) => (
          <div key={product.id} className="card">
            <Link href={`/product/${product.id}` as Route}>
              <div style={{ display: 'grid', gap: 8 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.imageUrl || '/placeholder-product.png'}
                  alt={product.title}
                  style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 6 }}
                />
                <div style={{ fontWeight: 600 }}>{product.title}</div>
                <div className="muted">{formatVND(product.price)}</div>
              </div>
            </Link>
            {product.shopId ? (
              <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                <Link href={`/shop/${product.shopId}` as Route}>{shopMap.get(product.shopId) || 'Shop'}</Link>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
