import Link from 'next/link';
import type { Route } from 'next';
import { prisma } from '../../../lib/prisma';
import { getCurrentUser } from '../../../lib/auth';
import { formatVND, statusLabel } from '../../../lib/format';
import { getDict, getLang } from '../../../lib/i18n';

export default async function OrdersPage() {
  const me = getCurrentUser();
  const t = getDict(getLang());
  if (!me) {
    return (
      <div className="card" style={{ maxWidth: 720 }}>
        <h1 className="page-title">{t.orders.title}</h1>
        <p className="muted">Không thể tải đơn hàng.</p>
      </div>
    );
  }
  const orders = await prisma.order.findMany({
    where: { userId: me.id },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });

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
                    <span className={`badge badge--${o.status.toLowerCase()}`}>{statusLabel(o.status, getLang())}</span>
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

