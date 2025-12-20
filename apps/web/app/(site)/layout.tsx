import Link from 'next/link';
import type { ReactNode } from 'react';
import { getCurrentUser } from '../../lib/auth';
import { getDict, getLang } from '../../lib/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import NotificationBell from '@/components/NotificationBell';
import SearchBar from '@/components/SearchBar';
import UserAvatar from '@/components/UserAvatar';
import CartIcon from '@/components/CartIcon';

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
            <Link href="/shop-lists">{t.nav.shops}</Link>
            <span className="sep">|</span>
            <Link href="/orders">{t.nav.orders}</Link>
            {user?.role === 'SHOP' ? (
              <>
                <span className="sep">|</span>
                <Link href="/shop-management/manage">{t.nav.shopManage}</Link>
              </>
            ) : null}
            {user?.role === 'ADMIN' ? (
              <>
                <span className="sep">|</span>
                <Link href="/admin">{t.nav.admin}</Link>
              </>
            ) : null}
          </nav>
          <div className="top-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LanguageSwitcher value={lang} />
            <NotificationBell />
            {user ? (
              <UserAvatar
                name={user.name}
                avatarUrl={user.avatar_url}
                loginLabel={t.nav.login}
                logoutLabel={t.nav.logout}
                accountLabel={t.nav.account}
              />
            ) : (
              <a href="/login" className="btn-outline">
                {t.nav.login}
              </a>
            )}
          </div>
        </div>
        {/* Main row: logo | search | actions */}
        <div className="container header-main">
          <Link className="logo" href="/">
            {t.appName}
          </Link>
          <div className="main-search">
            <SearchBar placeholder={t.search.placeholder} buttonLabel={t.search.button} />
          </div>
          <div className="header-actions">
            <CartIcon label={t.nav.cart} />
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
              <Link href="/shop-lists">{t.footer.shops}</Link>
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
