import { getCurrentUser } from '../../../lib/auth';
import { getLang } from '../../../lib/i18n';
import LoginRequired from '../LoginRequired';
import AvatarUpload from './AvatarUpload';

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

      {/* Shop Registration CTA */}
      {user.role === 'USER' && (
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
      )}

      {user.role === 'SHOP' && (
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
      )}
    </div>
  );
}
