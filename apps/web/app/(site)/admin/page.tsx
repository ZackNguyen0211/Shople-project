import Link from 'next/link';
import type { Route } from 'next';
import { redirect } from 'next/navigation';

import { getCurrentUser } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { formatVND, statusLabel } from '../../../lib/format';
import { getDict, getLang } from '../../../lib/i18n';

export default async function AdminPage() {
  const user = getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/');
  }

  const [usersCount, shopsCount, productsCount, orders, revenueAgg] = await Promise.all([
    prisma.user.count(),
    prisma.shop.count(),
    prisma.product.count(),
    prisma.order.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { items: true } }),
    prisma.order.aggregate({ _sum: { totalCents: true }, where: { status: 'PAID' } }),
  ]);

  const revenueVnd = revenueAgg._sum.totalCents || 0;
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
