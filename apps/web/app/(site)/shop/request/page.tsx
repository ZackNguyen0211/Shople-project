import { redirect } from 'next/navigation';
import { getCurrentUser } from '../../../../lib/auth';

export default function ShopRequestPage() {
  const me = getCurrentUser();
  if (!me) redirect('/login');
  return (
    <div className="card" style={{ maxWidth: 720 }}>
      <h1 className="page-title">Yêu cầu tạo shop</h1>
      <form action="/api/shops/requests" method="post" style={{ display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>Tên shop</span>
          <input className="input" name="shopName" required />
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>Tài khoản shop (email)</span>
          <input className="input" name="shopOwnerEmail" type="email" required />
        </label>
        <p className="muted" style={{ margin: 0 }}>Yêu cầu sẽ được admin xét duyệt.</p>
        <button className="btn" type="submit">Gửi yêu cầu</button>
      </form>
    </div>
  );
}

