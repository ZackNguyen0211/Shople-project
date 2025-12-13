"use client";
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function CartItemControls({ productId, quantity, lang = 'vi' }: { productId: number; quantity: number; lang?: 'vi' | 'en' }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [localQty, setLocalQty] = useState(quantity);
  const [toast, setToast] = useState<string | null>(null);

  async function update(qty: number) {
    await fetch('/api/cart/items', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: qty }),
    });
    setLocalQty(qty);
    router.refresh();
    setToast(lang === 'en' ? 'Quantity updated' : 'Đã cập nhật số lượng');
    setTimeout(() => setToast(null), 1200);
  }

  async function remove() {
    if (!confirm(lang === 'en' ? 'Remove this item from your cart?' : 'Xóa sản phẩm này khỏi giỏ hàng?')) return;
    await fetch('/api/cart/items', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });
    router.refresh();
    setToast(lang === 'en' ? 'Item removed' : 'Đã xóa sản phẩm');
    setTimeout(() => setToast(null), 1200);
  }

  return (
    <div style={{ display: 'flex', gap: 6, position: 'relative' }}>
      <button className="btn-outline" type="button" disabled={pending} onClick={() => start(() => (localQty > 1 ? update(localQty - 1) : remove()))}>
        −
      </button>
      <span>{localQty}</span>
      <button className="btn-outline" type="button" disabled={pending} onClick={() => start(() => update(localQty + 1))}>
        +
      </button>
      <button className="btn-outline" type="button" disabled={pending} onClick={() => start(remove)}>
        {lang === 'en' ? 'Remove' : 'Xóa'}
      </button>
      {toast ? (
        <span
          style={{
            position: 'absolute',
            top: -28,
            left: 0,
            background: 'var(--primary)',
            color: '#fff',
            borderRadius: 6,
            padding: '2px 8px',
            fontSize: 12,
          }}
        >
          {toast}
        </span>
      ) : null}
    </div>
  );
}
