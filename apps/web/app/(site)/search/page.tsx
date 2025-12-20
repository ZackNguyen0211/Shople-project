import Link from 'next/link';
import type { Route } from 'next';
import type { Product, Shop } from '../../../lib/types';
import { formatVND } from '../../../lib/format';
import { getDict, getLang } from '../../../lib/i18n';
import { getDb, mapProduct, mapShop } from '../../../lib/db';

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim() ?? '';
  const supabase = getDb();
  let productQuery = supabase
    .from('products')
    .select('id,title,description,price,image_url,shop_id')
    .order('id', { ascending: false })
    .range(0, 49);
  if (q) {
    productQuery = productQuery.ilike('title', `%${q}%`);
  }
  const { data: productRows, error: productError } = await productQuery;
  if (productError) {
    throw new Error('Failed to load products');
  }
  const products: Product[] = (productRows || []).map(mapProduct);
  const shopIds = Array.from(new Set(products.map((p) => p.shopId).filter(Boolean))) as number[];
  const shops: Shop[] = shopIds.length
    ? ((await supabase.from('shops').select('id,name').in('id', shopIds)).data || []).map(mapShop)
    : [];
  const shopMap = new Map(shops.map((s) => [s.id, s.name]));

  const t = getDict(getLang());
  return (
    <div>
      <h1 className="page-title">
        {t.searchPage.title}: {q}
      </h1>
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
                <Link href={`/shop-management/${product.shopId}` as Route}>
                  {shopMap.get(product.shopId) || 'Shop'}
                </Link>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
