'use client';
import { useMemo, useState, useEffect } from 'react';
import { getClientDict } from '../../../lib/i18n-client';

export default function RegisterShopPage({
  searchParams,
}: {
  searchParams: { error?: string; next?: string };
}) {
  const error = searchParams?.error;
  const next = searchParams?.next || '/shop-management/manage';
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setIsLoggedIn(true);
        }
      })
      .catch(() => {
      });
  }, []);

  function calcStrength(pw: string) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  }

  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const score = useMemo(() => calcStrength(pw), [pw]);
  const pct = (score / 5) * 100;
  const color = score <= 2 ? '#ef4444' : score === 3 ? '#f59e0b' : '#22c55e';

  const t = getClientDict();
  return (
    <div className="auth-wrap">
      <form action="/api/auth/register-shop" method="post" className="card auth-card">
        <input type="hidden" name="next" value={next} />
        <h1 className="page-title">{t.auth.createTitle}</h1>
        <p className="muted">{t.auth.quickSecure}</p>
        {error ? <p style={{ margin: 0, color: '#dc2626', fontWeight: 500 }}>{error}</p> : null}
        <label style={{ display: 'grid', gap: 4 }}>
          <span>Shop Name</span>
          <input name="shop_name" type="text" required className="input" />
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>{t.auth.email}</span>
          <input name="email" type="email" required className="input" />
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>{t.auth.password}</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            onChange={(e) => setPw(e.target.value)}
            className="input"
          />
        </label>
        <div style={{ height: 6, background: '#e5e7eb', borderRadius: 999 }}>
          <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999 }} />
        </div>
        <p className="muted" style={{ fontSize: 12 }}>
          {t.auth.quickSecure}
        </p>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>{t.auth.confirmPassword}</span>
          <input
            name="confirm"
            type="password"
            required
            onChange={(e) => setConfirm(e.target.value)}
            className="input"
          />
        </label>
        {confirm ? (
          <p style={{ margin: 0, fontSize: 12, color: pw === confirm ? '#22c55e' : '#ef4444' }}>
            {pw === confirm ? t.auth.pwMatch : t.auth.pwNoMatch}
          </p>
        ) : null}
        <button type="submit" className="btn">
          {t.auth.signup}
        </button>
        {!isLoggedIn ? (
          <a
            href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'}
            style={{ color: 'var(--primary)' }}
          >
            {t.auth.loginPrompt}
          </a>
        ) : (
          <a href="/" style={{ color: 'var(--primary)' }}>
            ← Quay lại trang chủ
          </a>
        )}
      </form>
    </div>
  );
}
