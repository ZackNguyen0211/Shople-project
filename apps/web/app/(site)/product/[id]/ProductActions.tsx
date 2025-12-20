'use client';
import { useState } from 'react';

export default function ProductActions({
  productId,
  addLabel,
}: {
  productId: number;
  addLabel: string;
}) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; success: boolean; message: string }>({
    show: false,
    success: false,
    message: '',
  });

  async function handleAddToCart(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: qty }),
      });

      if (res.ok) {
        setToast({ show: true, success: true, message: `Đã thêm ${qty} sản phẩm vào giỏ hàng!` });
        setQty(1);
        window.dispatchEvent(new Event('cartUpdated'));
        setTimeout(() => setToast({ show: false, success: false, message: '' }), 3000);
      } else {
        const data = await res.json();
        setToast({
          show: true,
          success: false,
          message: data.error || 'Không thể thêm vào giỏ hàng',
        });
      }
    } catch (e) {
      console.error('Failed to add to cart', e);
      setToast({ show: true, success: false, message: 'Có lỗi xảy ra, vui lòng thử lại' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleAddToCart} className="product-actions">
        <div className="qty-control">
          <button
            className="btn-outline"
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={loading}
          >
            -
          </button>
          <span>{qty}</span>
          <button
            className="btn-outline"
            type="button"
            onClick={() => setQty((q) => q + 1)}
            disabled={loading}
          >
            +
          </button>
        </div>
        <button className="btn" type="submit" style={{ minWidth: 160 }} disabled={loading}>
          {loading ? 'Đang thêm...' : addLabel}
        </button>
      </form>

      {/* Toast notification */}
      {toast.show && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 24px',
            borderRadius: 8,
            background: toast.success ? '#22c55e' : '#ef4444',
            color: 'white',
            fontWeight: 500,
            fontSize: 14,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 999,
            animation: 'slideUp 0.3s ease-out',
          }}
        >
          {toast.message}
          <style>{`
            @keyframes slideUp {
              from { 
                opacity: 0;
                transform: translateX(-50%) translateY(20px);
              }
              to { 
                opacity: 1;
                transform: translateX(-50%) translateY(0);
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
