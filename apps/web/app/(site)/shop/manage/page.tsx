import Link from 'next/link';
import type { Route } from 'next';
import { redirect } from 'next/navigation';
import type { Prisma } from '@prisma/client';

import { getCurrentUser } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import StatusSelect from './status/StatusSelect';
import { formatVND, statusLabel } from '../../../../lib/format';
import NewProductForm from './NewProductForm';
import { getDict, getLang } from '../../../../lib/i18n';
import NewShopForm from './NewShopForm';

export default async function ShopManagePage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string };
}) {
  const me = getCurrentUser();
  if (!me || me.role !== 'SHOP') redirect('/');

  const page = Math.max(1, Number(searchParams.page || 1));
  const pageSize = 20;
  const skip = (page - 1) * pageSize;
  const status = searchParams.status?.toUpperCase();

  const myShops = await prisma.shop.findMany({
    where: { ownerId: me.id },
    select: { id: true, name: true },
  });
  const shopIds = myShops.map((s) => s.id);
  const lang = getLang();
  const t = getDict(lang);

  if (shopIds.length === 0) {
    return (
      <div className="card">
        <h1 className="page-title">{t.shopManage.title}</h1>
        <p className="muted">Bạn chưa có shop nào.</p>
        <NewShopForm />
      </div>
    );
  }

  const where: Prisma.OrderWhereInput = { shopId: { in: shopIds } };
  if (status) where.status = status;

  const [orders, total, products] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: { items: true, shop: true, user: true },
    }),
    prisma.order.count({ where }),
    prisma.product.findMany({
      where: { shopId: { in: shopIds } },
      orderBy: { id: 'desc' },
      include: { shop: { select: { name: true } } },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <h1 className="page-title">{t.shopManage.title}</h1>
      <div className="card" style={{ marginBottom: 16 }}>
        <h2 className="page-title" style={{ fontSize: 18 }}>
          {t.shopManage.yourShops}
        </h2>
        <ul>
          {myShops.map((s) => (
            <li key={s.id}>{s.name}</li>
          ))}
        </ul>
      </div>
      <div className="card" style={{ marginBottom: 16, maxWidth: 720 }}>
        <h2 className="page-title" style={{ fontSize: 18 }}>
          {t.shopManage.addProduct}
        </h2>
        <NewProductForm shops={myShops} lang={lang} />
      </div>
      <div className="card" style={{ marginBottom: 16, maxWidth: 1100 }}>
        <h2 className="page-title" style={{ fontSize: 18 }}>
          {t.adminPage.products}
        </h2>
        {products.length === 0 ? (
          <p className="muted">{t.shopManage.none}</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{t.tables.title}</th>
                <th>{t.tables.shop}</th>
                <th>{t.tables.price}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>#{p.id}</td>
                  <td>{p.title}</td>
                  <td>{p.shop.name}</td>
                  <td>{formatVND(p.price)}</td>
                  <td>
                    <Link className="btn-outline" href={`/shop/manage/products/${p.id}`}>
                      {t.orders.view === 'View' ? 'Edit' : 'Sửa'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="card" style={{ maxWidth: 1100 }}>
        <h2 className="page-title" style={{ fontSize: 18 }}>
          {t.shopManage.orders}
        </h2>
        <form style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <select
            name="status"
            defaultValue={status || ''}
            className="input"
            style={{ maxWidth: 200 }}
          >
            <option value="">{t.filters.allStatuses}</option>
            <option value="PENDING">PENDING</option>
            <option value="PAID">PAID</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
          <button className="btn" type="submit">
            {t.filters.apply}
          </button>
        </form>
        {orders.length === 0 ? (
          <p className="muted">{t.shopManage.none}</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>{t.tables.id}</th>
                <th>{t.tables.user}</th>
                <th>{t.tables.shop}</th>
                <th>{t.tables.status}</th>
                <th>{t.tables.total}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const totalAmount = o.items.reduce((s, it) => s + it.price * it.quantity, 0);
                return (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{o.user.email}</td>
                    <td>{o.shop.name}</td>
                    <td>
                      <StatusSelect id={o.id} value={o.status} lang={lang} />
                      <span
                        style={{ marginLeft: 8 }}
                        className={`badge badge--${o.status.toLowerCase()}`}
                      >
                        {statusLabel(o.status, lang)}
                      </span>
                    </td>
                    <td>{formatVND(totalAmount)}</td>
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
        <div className="section" style={{ display: 'flex', gap: 8 }}>
          <Link
            className="btn-outline"
            href={
              `?${new URLSearchParams({ status: status || '', page: String(Math.max(1, page - 1)) })}` as Route
            }
          >
            {t.prev}
          </Link>
          <span className="muted">{t.pagination.page(page, totalPages)}</span>
          <Link
            className="btn-outline"
            href={
              `?${new URLSearchParams({ status: status || '', page: String(Math.min(totalPages, page + 1)) })}` as Route
            }
          >
            {t.next}
          </Link>
        </div>
      </div>
    </div>
  );
}
