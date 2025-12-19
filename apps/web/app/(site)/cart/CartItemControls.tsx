'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function CartItemControls({
  productId,
  quantity,
  lang = 'vi',
}: {
  productId: number;
  quantity: number;
  lang?: 'vi' | 'en';
}) {
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
    if (
      !confirm(
        lang === 'en' ? 'Remove this item from your cart?' : 'Xóa sản phẩm này khỏi giỏ hàng?'
      )
    )
      return;
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button
          type="button"
          disabled={pending}
          onClick={() => start(() => (localQty > 1 ? update(localQty - 1) : remove()))}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: '1.5px solid #e5e7eb',
            background: 'white',
            color: '#059669',
            fontWeight: 700,
            fontSize: 18,
            cursor: pending ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            opacity: pending ? 0.5 : 1,
          }}
        >
          −
        </button>
        <span
          style={{
            minWidth: 32,
            textAlign: 'center',
            fontSize: 15,
            fontWeight: 600,
            color: '#1f2937',
          }}
        >
          {localQty}
        </span>
        <button
          type="button"
          disabled={pending}
          onClick={() => start(() => update(localQty + 1))}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: '1.5px solid #e5e7eb',
            background: 'white',
            color: '#059669',
            fontWeight: 700,
            fontSize: 18,
            cursor: pending ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            opacity: pending ? 0.5 : 1,
          }}
        >
          +
        </button>
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(remove)}
        style={{
          padding: '6px 12px',
          borderRadius: 8,
          border: '1.5px solid #fee2e2',
          background: '#fef2f2',
          color: '#dc2626',
          fontWeight: 600,
          fontSize: 13,
          cursor: pending ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          opacity: pending ? 0.5 : 1,
        }}
      >
        {lang === 'en' ? '🗑️ Remove' : '🗑️ Xóa'}
      </button>
      {toast ? (
        <span
          style={{
            position: 'absolute',
            top: -32,
            right: 0,
            background: '#10b981',
            color: '#fff',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 600,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            whiteSpace: 'nowrap',
          }}
        >
          ✓ {toast}
        </span>
      ) : null}
    </div>
  );
}
