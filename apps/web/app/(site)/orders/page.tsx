import Link from 'next/link';
import type { Route } from 'next';
import { getCurrentUser } from '../../../lib/auth';
import { formatVND, statusLabel } from '../../../lib/format';
import { getDict, getLang } from '../../../lib/i18n';
import { getDb, mapOrderItem } from '../../../lib/db';
import LoginRequired from '../LoginRequired';

export default async function OrdersPage() {
  const me = getCurrentUser();
  const t = getDict(getLang());

  if (!me) {
    return <LoginRequired message="Đăng nhập để xem lịch sử đơn hàng" />;
  }

  const supabase = getDb();
  const { data, error } = await supabase
    .from('orders')
    .select('id,status,created_at,items:order_items(id,product_id,price,quantity)')
    .eq('user_id', me.id)
    .order('created_at', { ascending: false });
  if (error) {
    throw new Error('Failed to load orders');
  }
  const orders = (data || []).map((row) => ({
    id: row.id,
    status: row.status,
    items: (row.items || []).map(mapOrderItem),
  }));

  return (
    <div className="card" style={{ maxWidth: 900 }}>
      <h1 className="page-title">{t.orders.title}</h1>
      {orders.length === 0 ? (
        <p className="muted">{t.orders.none}</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{t.orders.status}</th>
              <th>{t.orders.total}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const total = o.items.reduce((s, it) => s + it.price * it.quantity, 0);
              return (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>
                    <span className={`badge badge--${o.status.toLowerCase()}`}>
                      {statusLabel(o.status, getLang())}
                    </span>
                  </td>
                  <td>{formatVND(total)}</td>
                  <td>
                    <Link className="btn-outline" href={`/orders/${o.id}` as Route}>
                      {t.orders.view}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
