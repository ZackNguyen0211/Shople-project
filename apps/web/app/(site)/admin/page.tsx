import Link from 'next/link';
import type { Route } from 'next';
import { redirect } from 'next/navigation';

import { getCurrentUser } from '../../../lib/auth';
import { formatVND, statusLabel } from '../../../lib/format';
import { getDict, getLang } from '../../../lib/i18n';
import { getDb, mapOrderItem } from '../../../lib/db';

export default async function AdminPage() {
  const user = getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/');
  }

  const supabase = getDb();
  const [
    usersCountRes,
    shopsCountRes,
    productsCountRes,
    ordersRes,
    revenueRes,
  ] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('shops').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase
      .from('orders')
      .select('id,status,created_at,items:order_items(id,product_id,price,quantity)')
      .order('created_at', { ascending: false })
      .range(0, 4),
    supabase.from('orders').select('total_cents').eq('status', 'PAID'),
  ]);

  const usersCount = usersCountRes.count || 0;
  const shopsCount = shopsCountRes.count || 0;
  const productsCount = productsCountRes.count || 0;
  const orders = (ordersRes.data || []).map((row) => ({
    id: row.id,
    status: row.status,
    items: (row.items || []).map(mapOrderItem),
  }));
  const revenueVnd = (revenueRes.data || []).reduce(
    (sum, row) => sum + (row.total_cents || 0),
    0
  );

  const lang = getLang();
  const t = getDict(lang);

  return (
    <div className="container" style={{ padding: 0 }}>
      <h1 className="page-title">{t.adminPage.title}</h1>

      <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        <div className="card">
          <div className="muted">{t.adminPage.revenue}</div>
          <div className="price">{formatVND(revenueVnd)}</div>
        </div>
        <div className="card">
          <div className="muted">{t.adminPage.users}</div>
          <div className="price">{usersCount}</div>
        </div>
        <div className="card">
          <div className="muted">{t.adminPage.shops}</div>
          <div className="price">{shopsCount}</div>
        </div>
        <div className="card">
          <div className="muted">{t.adminPage.products}</div>
          <div className="price">{productsCount}</div>
        </div>
      </div>

      <div className="section" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Link className="btn" href={`/admin/users` as Route}>{t.adminButtons.users}</Link>
        <Link className="btn" href={`/admin/shops` as Route}>{t.adminButtons.shops}</Link>
        <Link className="btn" href={`/admin/products` as Route}>{t.adminButtons.products}</Link>
        <Link className="btn" href={`/admin/orders` as Route}>{t.adminButtons.orders}</Link>
      </div>

      <div className="card section" style={{ overflowX: 'auto' }}>
        <h2 className="page-title" style={{ fontSize: 18 }}>{t.adminPage.recentOrders}</h2>
        {orders.length === 0 ? (
          <p className="muted">{t.adminPage.noRecent}</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>{t.tables.id}</th>
                <th>{t.tables.items}</th>
                <th>{t.tables.total}</th>
                <th>{t.tables.status}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const total = o.items.reduce((s, it) => s + it.price * it.quantity, 0);
                return (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{o.items.length}</td>
                    <td>{formatVND(total)}</td>
                    <td>{statusLabel(o.status, lang)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
