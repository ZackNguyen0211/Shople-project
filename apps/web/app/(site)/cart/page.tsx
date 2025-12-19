import { getCurrentUser } from '../../../lib/auth';
import { formatVND } from '../../../lib/format';
import { getDict, getLang } from '../../../lib/i18n';
import { getDb, mapProduct } from '../../../lib/db';
import LoginRequired from '../LoginRequired';

export default async function CartPage() {
  const me = getCurrentUser();
  const t = getDict(getLang());

  if (!me) {
    return <LoginRequired message="Đăng nhập để xem giỏ hàng của bạn" />;
  }

  const supabase = getDb();
  const items = me
    ? (
        await supabase
          .from('carts')
          .select(
            'id,items:cart_items(id,quantity,product:products(id,title,description,price,image_url,shop_id))'
          )
          .eq('user_id', me.id)
          .maybeSingle()
      ).data?.items || []
    : [];
  const mappedItems = items.map((item: { id: number; quantity: number; product: unknown }) => ({
    id: item.id,
    quantity: item.quantity,
    product: item.product ? mapProduct(item.product as Parameters<typeof mapProduct>[0]) : null,
  }));
  const total = mappedItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  return (
    <div className="card">
      <h1 className="page-title">{t.cart.title}</h1>
      {mappedItems.length === 0 ? (
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
              {mappedItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.product.title}</td>
                  <td>{item.quantity}</td>
                  <td>{formatVND(item.product.price * item.quantity)}</td>
                  <td>
                    {/* controls */}
                    <CartItemControls
                      productId={item.product.id}
                      quantity={item.quantity}
                      lang={getLang()}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div
            className="section"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div className="price">
              {t.cart.total}: {formatVND(total)}
            </div>
            <a className="btn" href="/checkout">
              {t.cart.checkout}
            </a>
          </div>
        </>
      )}
    </div>
  );
}

import CartItemControls from './CartItemControls';
