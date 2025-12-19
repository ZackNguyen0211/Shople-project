import { getCurrentUser } from '../../../lib/auth';
import { getDict, getLang } from '../../../lib/i18n';
import LoginRequired from '../LoginRequired';

export default function CheckoutPage() {
  const user = getCurrentUser();
  const t = getDict(getLang());

  if (!user) {
    return <LoginRequired message="Đăng nhập để tiếp tục thanh toán" />;
  }

  return (
    <div className="card" style={{ maxWidth: 720 }}>
      <h1 className="page-title">{t.checkout.title}</h1>
      <p className="muted">{t.checkout.note}</p>
      <div className="section" style={{ display: 'flex', gap: 8 }}>
        <button className="btn">{t.checkout.payNow}</button>
        <a className="btn-outline" href="/cart">
          {t.checkout.backToCart}
        </a>
      </div>
    </div>
  );
}
