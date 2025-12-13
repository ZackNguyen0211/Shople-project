import Link from 'next/link';
import type { ReactNode } from 'react';
import { getCurrentUser } from '../../lib/auth';
import { getDict, getLang } from '../../lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';
import SearchBar from './SearchBar';

export default function SiteLayout({ children }: { children: ReactNode }) {
  const user = getCurrentUser();
  const lang = getLang();
  const t = getDict(lang);
  return (
    <div>
      <header className="header">
        {/* Top utility row */}
        <div className="container header-top">
          <nav className="top-links">
            <Link href="/shops">{t.nav.shops}</Link>
            <span className="sep">|</span>
            <Link href="/orders">{t.nav.orders}</Link>
            <span className="sep">|</span>
            <Link href="/account">{t.nav.account}</Link>
            {user?.role === 'SHOP' ? (
              <>
                <span className="sep">|</span>
                <Link href="/shop/manage">{t.nav.shopManage}</Link>
              </>
            ) : null}
            {user?.role === 'ADMIN' ? (
              <>
                <span className="sep">|</span>
                <Link href="/admin">{t.nav.admin}</Link>
              </>
            ) : null}
          </nav>
          <div className="top-actions">
            <LanguageSwitcher value={lang} />
            <form action="/api/auth/logout" method="post">
              <button className="btn-outline" type="submit">
                {t.nav.logout}
              </button>
            </form>
          </div>
        </div>
        {/* Main row: logo | search | actions */}
        <div className="container header-main">
          <Link className="logo" href="/">{t.appName}</Link>
          <div className="main-search">
            <SearchBar placeholder={t.search.placeholder} buttonLabel={t.search.button} />
          </div>
          <div className="header-actions">
            <Link href="/cart" className="iconbtn" aria-label={t.nav.cart}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
                <path d="M3 3h2l2 12h10l2-8H6" stroke="currentColor" strokeWidth="1.6"/>
                <circle cx="9" cy="20" r="1.6" fill="currentColor"/>
                <circle cx="17" cy="20" r="1.6" fill="currentColor"/>
              </svg>
            </Link>
          </div>
        </div>
      </header>
      <main className="container" style={{ padding: 16 }}>
        {children}
      </main>
      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <strong style={{ color: 'var(--primary)' }}>{t.appName}</strong>
            <div className="muted">{t.footer.tagline}</div>
          </div>
          <div>
            <div className="muted">{t.footer.links}</div>
            <div style={{ display: 'grid' }}>
              <Link href={{ pathname: '/' }}>{t.footer.home}</Link>
              <Link href="/shops">{t.footer.shops}</Link>
              <Link href="/orders">{t.footer.orders}</Link>
            </div>
          </div>
          <div>
            <div className="muted">{t.footer.contact}</div>
            <div className="muted">support@example.com</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
