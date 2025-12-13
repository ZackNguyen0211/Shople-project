import { getCurrentUser } from '../../../lib/auth';
import { getDict, getLang } from '../../../lib/i18n';

export default async function AccountPage() {
  const user = getCurrentUser();
  const t = getDict(getLang());
  return (
    <div className="card" style={{ maxWidth: 720 }}>
      <h1 className="page-title">{t.nav.account}</h1>
      {user ? (
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
      ) : (
        <p className="muted">{t.orders.view === 'View' ? "We couldn't load your profile." : 'Không thể tải hồ sơ của bạn.'}</p>
      )}
    </div>
  );
}