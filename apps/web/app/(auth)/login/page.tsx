import DemoAutofill from './DemoAutofill';
import { getClientDict } from '../../../lib/i18n-client';
export default function LoginPage({ searchParams }: { searchParams: { error?: string; next?: string } }) {
  const error = searchParams?.error;
  const next = '';
  const t = getClientDict();

  return (
    <div className="auth-wrap">
      <form action="/api/auth/login" method="post" className="card auth-card">
        <input type="hidden" name="next" value={next} />
        <h1 className="page-title">{t.auth.welcome}</h1>
        <p className="muted">{t.auth.signInSubtitle}</p>
        {error ? <p style={{ margin: 0, color: '#dc2626', fontWeight: 500 }}>{error}</p> : null}
        <label style={{ display: 'grid', gap: 4 }}>
          <span>{t.auth.email}</span>
          <input name="email" type="email" required className="input" />
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>{t.auth.password}</span>
          <input name="password" type="password" required className="input" />
        </label>
        <button type="submit" className="btn">{t.auth.continue}</button>
        {/* Demo autofill buttons */}
        <DemoAutofill />
        <a href={next ? `/register?next=${encodeURIComponent(next)}` : '/register'} style={{ color: 'var(--primary)' }}>
          {t.auth.signupPrompt}
        </a>
      </form>
    </div>
  );
}
