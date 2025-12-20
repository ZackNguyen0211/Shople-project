'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { formatVND } from '@/lib/format';

type Item = {
  id: number;
  title: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  shop?: { id: number; name: string } | null;
};

type Labels = { by: string; more: string; loading: string };

export default function HomeFeed({
  initial,
  total,
  labels,
}: {
  initial: Item[];
  total: number;
  labels: Labels;
}) {
  const [items, setItems] = useState<Item[]>(initial);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (loading) return;
    setLoading(true);
    const res = await fetch(`/api/products?skip=${items.length}&take=20`, { cache: 'no-store' });
    const more: Item[] = await res.json();
    setItems((prev) => [...prev, ...more]);
    setLoading(false);
  }

  const hasMore = items.length < total;

  return (
    <>
      <div className="card-grid">
        {items.map((product) => (
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
                <div className="muted">{product.description?.slice(0, 64) || '…'}</div>
                <div className="price">{formatVND(product.price)}</div>
              </div>
            </Link>
            {product.shop ? (
              <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                {labels.by}{' '}
                <Link href={`/shop-management/${product.shop.id}` as Route}>
                  {product.shop.name}
                </Link>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {hasMore ? (
        <div className="section" style={{ display: 'flex', justifyContent: 'center' }}>
          <button className="btn" onClick={loadMore} disabled={loading}>
            {loading ? labels.loading : labels.more}
          </button>
        </div>
      ) : null}
    </>
  );
}
