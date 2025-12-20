'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatVND } from '../../../../lib/format';

type ProductCardProps = {
  id: number;
  title: string;
  price: number;
  imageUrl: string | null;
  shopName: string;
  editLabel: string;
};

export default function ProductCard({
  id,
  title,
  price,
  imageUrl,
  shopName,
  editLabel,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        overflow: 'hidden',
        transition: 'all 0.2s',
        background: 'white',
        boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div
        style={{
          width: '100%',
          height: 200,
          background: '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <span style={{ fontSize: 48, opacity: 0.3 }}>📷</span>
        )}
      </div>

      {/* Product Info */}
      <div style={{ padding: 16 }}>
        <div
          style={{
            fontSize: 11,
            color: '#64748b',
            marginBottom: 4,
            fontWeight: 500,
          }}
        >
          #{id} • {shopName}
        </div>
        <h3
          style={{
            fontSize: 16,
            fontWeight: 600,
            margin: '0 0 8px 0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </h3>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--primary)',
            marginBottom: 12,
          }}
        >
          {formatVND(price)}
        </div>
        <Link
          className="btn-outline"
          href={`/shop-management/manage/products/${id}`}
          style={{
            display: 'block',
            textAlign: 'center',
            width: '100%',
            padding: '8px 16px',
          }}
        >
          {editLabel}
        </Link>
      </div>
    </div>
  );
}
