import { prisma } from '../../../lib/prisma';
import { getCurrentUser } from '../../../lib/auth';
import { formatVND } from '../../../lib/format';
import { getDict, getLang } from '../../../lib/i18n';

export default async function CartPage() {
  const me = getCurrentUser();
  const items = me
    ? (
        (
          await prisma.cart.findUnique({
            where: { userId: me.id },
            include: { items: { include: { product: true } } },
          })
        )?.items || []
      )
    : [];
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const t = getDict(getLang());
  return (
    <div className="card">
      <h1 className="page-title">{t.cart.title}</h1>
      {items.length === 0 ? (
        <p className="muted">{t.cart.empty}</p>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>{t.cart.product}</th>
                <th>{t.cart.qty}</th>
                <th>{t.cart.price}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.product.title}</td>
                  <td>{item.quantity}</td>
                  <td>{formatVND(item.product.price * item.quantity)}</td>
                  <td>
                    {/* controls */}
                    <CartItemControls productId={item.product.id} quantity={item.quantity} lang={getLang()} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="price">{t.cart.total}: {formatVND(total)}</div>
            <a className="btn" href="/checkout">{t.cart.checkout}</a>
          </div>
        </>
      )}
    </div>
  );
}

import CartItemControls from './CartItemControls';

