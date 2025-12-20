'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type CartItem = {
  quantity: number;
};

type CartResponse = {
  items?: CartItem[];
};

export default function CartIcon({ label }: { label: string }) {
  const [itemCount, setItemCount] = useState(0);

  const loadCart = async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = (await res.json()) as CartResponse;
        const count = (data.items || []).reduce(
          (sum: number, item: CartItem) => sum + (item.quantity || 0),
          0
        );
        setItemCount(count);
      }
    } catch {
      // Ignore errors
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    const handleCartUpdate = () => {
      loadCart();
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  return (
    <Link href="/cart" className="iconbtn" aria-label={label} style={{ position: 'relative' }}>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
        <path d="M3 3h2l2 12h10l2-8H6" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="9" cy="20" r="1.6" fill="currentColor" />
        <circle cx="17" cy="20" r="1.6" fill="currentColor" />
      </svg>
      {itemCount > 0 ? (
        <span
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            background: '#ef4444',
            color: 'white',
            borderRadius: 999,
            fontSize: 10,
            padding: '0 6px',
            fontWeight: 600,
            minWidth: 18,
            textAlign: 'center',
          }}
        >
          {itemCount}
        </span>
      ) : null}
    </Link>
  );
}
