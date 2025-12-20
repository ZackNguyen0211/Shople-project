import { getCurrentUser } from '../../../lib/auth';
import { getLang } from '../../../lib/i18n';
import LoginRequired from '../LoginRequired';
import AvatarUpload from './AvatarUpload';
import ShopCTA from './ShopCTA';

export default async function AccountPage() {
  const user = getCurrentUser();
  const lang = getLang();

  if (!user) {
    return <LoginRequired message="Đăng nhập để xem thông tin tài khoản của bạn" />;
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Header with Avatar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          marginBottom: 32,
          padding: 24,
          background: 'linear-gradient(135deg, #2f6d54 0%, #1e4d3a 100%)',
          borderRadius: 12,
          color: 'white',
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: user.avatar_url ? `url('${user.avatar_url}')` : 'rgba(255, 255, 255, 0.2)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            fontWeight: 700,
            border: '4px solid rgba(255, 255, 255, 0.3)',
            flexShrink: 0,
          }}
        >
          {!user.avatar_url && initials}
        </div>

        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0' }}>
            {lang === 'en' ? 'Account' : 'Tài Khoản'}
          </h1>
          <p style={{ fontSize: 16, opacity: 0.9, margin: '0 0 16px 0' }}>{user.name}</p>
          <p style={{ fontSize: 14, opacity: 0.8, margin: 0 }}>📧 {user.email}</p>
        </div>
      </div>

      {/* Avatar Upload Section */}
      <AvatarUpload
        currentAvatarUrl={user.avatar_url}
        userName={user.name}
        uploadLabel={lang === 'en' ? 'Change Avatar' : 'Thay Đổi Avatar'}
        uploadingLabel={lang === 'en' ? 'Uploading...' : 'Đang Tải...'}
        uploadingSuccess={
          lang === 'en' ? 'Avatar updated successfully!' : 'Avatar cập nhật thành công!'
        }
        uploadingError={
          lang === 'en' ? 'Upload failed. Please try again.' : 'Tải lên thất bại. Vui lòng thử lại.'
        }
      />

      {/* Account Info */}
      <div
        style={{
          marginTop: 32,
          padding: 24,
          background: 'white',
          borderRadius: 12,
          border: '1px solid #e5e7eb',
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#1f2937' }}>
          {lang === 'en' ? 'Account Information' : 'Thông Tin Tài Khoản'}
        </h2>

        <div style={{ display: 'grid', gap: 12 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr',
              gap: 12,
              paddingBottom: 12,
              borderBottom: '1px solid #f3f4f6',
            }}
          >
            <strong style={{ color: '#6b7280' }}>{lang === 'en' ? 'Name:' : 'Họ tên:'}</strong>
            <span style={{ color: '#374151' }}>{user.name}</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr',
              gap: 12,
              paddingBottom: 12,
              borderBottom: '1px solid #f3f4f6',
            }}
          >
            <strong style={{ color: '#6b7280' }}>Email:</strong>
            <span style={{ color: '#374151' }}>{user.email}</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr',
              gap: 12,
            }}
          >
            <strong style={{ color: '#6b7280' }}>{lang === 'en' ? 'Role:' : 'Vai trò:'}</strong>
            <span
              style={{
                color: 'white',
                background:
                  user.role === 'ADMIN' ? '#dc2626' : user.role === 'SHOP' ? '#2563eb' : '#059669',
                padding: '4px 12px',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                display: 'inline-block',
                width: 'fit-content',
              }}
            >
              {user.role === 'ADMIN'
                ? lang === 'en'
                  ? 'Administrator'
                  : 'Quản Trị Viên'
                : user.role === 'SHOP'
                  ? lang === 'en'
                    ? 'Shop Owner'
                    : 'Chủ Cửa Hàng'
                  : lang === 'en'
                    ? 'Customer'
                    : 'Khách Hàng'}
            </span>
          </div>
        </div>
      </div>

      {/* Shop CTA Section */}
      <ShopCTA role={user.role} lang={lang} />
    </div>
  );
}
