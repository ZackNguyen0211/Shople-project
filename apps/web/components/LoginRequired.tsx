'use client';

import Link from 'next/link';

type LoginRequiredProps = {
  message?: string;
};

export default function LoginRequired({
  message = 'Bạn cần đăng nhập để sử dụng chức năng này',
}: LoginRequiredProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)',
        zIndex: 9999,
      }}
    >
      <div className="card" style={{ maxWidth: 400, padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
        <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 12px 0' }}>Cần đăng nhập</h2>
        <p className="muted" style={{ marginBottom: 24 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link
            href="/"
            style={{
              flex: 1,
              padding: '10px 16px',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              textAlign: 'center',
              fontWeight: 600,
              color: 'var(--primary)',
              backgroundColor: 'transparent',
            }}
          >
            Trở lại
          </Link>
          <Link
            href="/login"
            style={{
              flex: 1,
              padding: '10px 16px',
              background: 'var(--primary)',
              borderRadius: 8,
              textAlign: 'center',
              fontWeight: 600,
              color: 'white',
              textDecoration: 'none',
            }}
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
