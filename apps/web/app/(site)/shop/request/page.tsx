'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ShopRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = e.currentTarget;
    const formData = new FormData(form);
    const shopName = formData.get('shopName');

    try {
      const res = await fetch('/api/shops/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopName }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/shop/manage'), 2000);
      } else {
        const data = await res.json();
        setError(data.error || 'Gửi yêu cầu thất bại');
      }
    } catch (e) {
      console.warn('Request submission failed', e);
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="card" style={{ maxWidth: 720, textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h1 className="page-title" style={{ color: '#22c55e' }}>
          Yêu cầu đã được gửi!
        </h1>
        <p className="muted">
          Yêu cầu xác thực shop của bạn đã được gửi thành công.
          <br />
          Admin sẽ xem xét và phản hồi sớm nhất có thể.
        </p>
        <p className="muted" style={{ marginTop: 16 }}>
          Đang chuyển hướng...
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 720 }}>
      <h1 className="page-title">Yêu cầu xác thực shop</h1>
      <p className="muted">
        Gửi yêu cầu xác thực để admin phê duyệt và bạn có thể bắt đầu quản lý shop.
      </p>
      {error && (
        <div
          style={{
            padding: 12,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            color: '#dc2626',
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>Tên shop của bạn</span>
          <input className="input" name="shopName" required disabled={loading} />
        </label>
        <p className="muted" style={{ margin: 0, fontSize: 13 }}>
          💡 Yêu cầu sẽ được admin xét duyệt. Bạn sẽ nhận thông báo khi có kết quả.
        </p>
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
        </button>
      </form>
    </div>
  );
}
