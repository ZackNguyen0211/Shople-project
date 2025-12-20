import Link from 'next/link';
import type { Route } from 'next';
import { formatVND } from '../../../../lib/format';
import { notFound } from 'next/navigation';

import type { Product, Shop } from '../../../../lib/types';
import { getDb, mapProduct, mapShop } from '../../../../lib/db';

type Params = { params: { id: string } };

export default async function ShopPage({ params }: Params) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    notFound();
  }

  const supabase = getDb();
  const [shopRes, productsRes] = await Promise.all([
    supabase.from('shops').select('id,name').eq('id', id).maybeSingle(),
    supabase.from('products').select('id,title,description,price,image_url,shop_id').eq('shop_id', id),
  ]);
  const shop = shopRes.data ? (mapShop(shopRes.data) as Shop) : null;
  const products = (productsRes.data || []).map(mapProduct) as Product[];

  if (!shop) {
    notFound();
  }

  return (
    <div>
      <h1 className="page-title">{shop.name}</h1>
      <div className="card-grid">
        {products.map((product) => (
          <Link key={product.id} className="card" href={`/product/${product.id}` as Route}>
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
        ))}
      </div>
    </div>
  );
}
