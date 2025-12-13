import Link from 'next/link';
import type { Route } from 'next';
import { formatVND } from '../../../../lib/format';
import { notFound } from 'next/navigation';

import type { Product, Shop } from '../../../../lib/types';
import { prisma } from '../../../../lib/prisma';

type Params = { params: { id: string } };

export default async function ShopPage({ params }: Params) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    notFound();
  }

  const [shop, products] = await Promise.all([
    prisma.shop.findUnique({ where: { id } }) as Promise<Shop | null>,
    prisma.product.findMany({ where: { shopId: id } }) as Promise<Product[]>,
  ]);

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
