'use client';

export default function ShopCTA({ role, lang }: { role: string; lang: 'en' | 'vi' }) {
  if (role === 'USER') {
    return (
      <div
        style={{
          marginTop: 32,
          padding: 24,
          background: '#f0fdf4',
          borderRadius: 12,
          border: '2px solid #22c55e',
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: '#15803d' }}>
          {lang === 'en' ? 'Become a Seller' : 'Trở Thành Người Bán'}
        </h2>
        <p style={{ fontSize: 14, color: '#4b5563', marginBottom: 16, margin: 0 }}>
          {lang === 'en'
            ? 'Want to open your own shop? Submit a request and our team will review it.'
            : 'Muốn mở cửa hàng của riêng bạn? Gửi yêu cầu và đội của chúng tôi sẽ xem xét.'}
        </p>
        <a
          href="/register-shop"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            background: '#22c55e',
            color: 'white',
            borderRadius: 6,
            textDecoration: 'none',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLElement).style.background = '#16a34a';
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLElement).style.background = '#22c55e';
          }}
        >
          {lang === 'en' ? 'Register Shop' : 'Đăng Ký Shop'}
        </a>
      </div>
    );
  }

  if (role === 'SHOP') {
    return (
      <div
        style={{
          marginTop: 32,
          padding: 24,
          background: '#eff6ff',
          borderRadius: 12,
          border: '2px solid #3b82f6',
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: '#1e40af' }}>
          {lang === 'en' ? 'Manage Your Shop' : 'Quản Lý Cửa Hàng'}
        </h2>
        <p style={{ fontSize: 14, color: '#4b5563', marginBottom: 16, margin: 0 }}>
          {lang === 'en'
            ? 'Access your shop dashboard to manage products and orders.'
            : 'Truy cập bảng điều khiển cửa hàng để quản lý sản phẩm và đơn hàng.'}
        </p>
        <a
          href="/shop/manage"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            background: '#3b82f6',
            color: 'white',
            borderRadius: 6,
            textDecoration: 'none',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLElement).style.background = '#2563eb';
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLElement).style.background = '#3b82f6';
          }}
        >
          {lang === 'en' ? 'Go to Shop' : 'Đi Đến Shop'}
        </a>
      </div>
    );
  }

  return null;
}
