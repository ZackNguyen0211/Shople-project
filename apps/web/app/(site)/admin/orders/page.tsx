import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { getCurrentUser } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { formatVND, statusLabel } from '../../../../lib/format';
import { getDict, getLang } from '../../../../lib/i18n';
import StatusSelect from './StatusSelect';

export default async function AdminOrdersPage({ searchParams }: { searchParams: { status?: string; page?: string; sort?: string } }) {
  const user = getCurrentUser();
  if (!user || user.role !== 'ADMIN') redirect('/');

  const status = searchParams.status?.toUpperCase();
  const page = Math.max(1, Number(searchParams.page || 1));
  const sort = searchParams.sort === 'asc' ? 'asc' : 'desc';
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const where = status ? { status } : {};
  const lang = getLang();
  const t = getDict(lang);
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: sort },
      skip,
      take: pageSize,
      include: { items: true, user: { select: { id: true, email: true } }, shop: { select: { id: true, name: true } } },
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="card" style={{ maxWidth: 1100 }}>
      <h1 className="page-title">{t.orders.title}</h1>

      <form style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <select name="status" defaultValue={status || ''} className="input" style={{ maxWidth: 200 }}>
          <option value="">{t.filters.allStatuses}</option>
          <option value="PENDING">PENDING</option>
          <option value="PAID">PAID</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <select name="sort" defaultValue={sort} className="input" style={{ maxWidth: 160 }}>
          <option value="desc">{t.filters.newest}</option>
          <option value="asc">{t.filters.oldest}</option>
        </select>
        <button className="btn" type="submit">{t.filters.apply}</button>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>{t.tables.user}</th>
            <th>{t.tables.shop}</th>
            <th>{t.tables.status}</th>
            <th>{t.tables.total}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const total = o.items.reduce((s, it) => s + it.price * it.quantity, 0);
            return (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{o.user.email}</td>
                <td>{o.shop.name}</td>
                <td>
                  <StatusSelect id={o.id} value={o.status} lang={lang} />
                  <span style={{ marginLeft: 8 }} className={`badge badge--${o.status.toLowerCase()}`}>{statusLabel(o.status, lang)}</span>
                </td>
                <td>{formatVND(total)}</td>
                <td>
                  <Link className="btn-outline" href={`/orders/${o.id}` as Route}>{t.orders.view}</Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="section" style={{ display: 'flex', gap: 8 }}>
        <Link className="btn-outline" href={`?${new URLSearchParams({ status: status || '', sort, page: String(Math.max(1, page - 1)) })}` as Route}>
          {t.prev}
        </Link>
        <span className="muted">{t.pagination.page(page, totalPages)}</span>
        <Link className="btn-outline" href={`?${new URLSearchParams({ status: status || '', sort, page: String(Math.min(totalPages, page + 1)) })}` as Route}>
          {t.next}
        </Link>
      </div>
    </div>
  );
}
