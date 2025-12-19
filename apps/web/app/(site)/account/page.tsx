import { getCurrentUser } from '../../../lib/auth';
import { getDict, getLang } from '../../../lib/i18n';
import LoginRequired from '../LoginRequired';

export default async function AccountPage() {
  const user = getCurrentUser();
  const t = getDict(getLang());
  
  if (!user) {
    return <LoginRequired message="Đăng nhập để xem thông tin tài khoản của bạn" />;
  }

  return (
    <div className="card" style={{ maxWidth: 720 }}>
      <h1 className="page-title">{t.nav.account}</h1>
      <div style={{ display: 'grid', gap: 6 }}>
        <p>
          <strong>{t.orders.view === 'View' ? 'Name:' : 'Họ tên:'}</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>{t.orders.view === 'View' ? 'Role:' : 'Vai trò:'}</strong> {user.role}
        </p>
      </div>
    </div>
  );
}
