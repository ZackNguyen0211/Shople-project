import Link from 'next/link';
import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { getDict, getLang } from '../../../../lib/i18n';

export default async function AdminShopsPage({ searchParams }: { searchParams: { page?: string } }) {
  const user = getCurrentUser();
  if (!user || user.role !== 'ADMIN') redirect('/');

  const page = Math.max(1, Number(searchParams.page || 1));
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const [shops, total] = await Promise.all([
    prisma.shop.findMany({
      orderBy: { id: 'asc' },
      include: { owner: { select: { id: true, name: true, email: true } }, _count: { select: { products: true } } },
      skip,
      take: pageSize,
    }),
    prisma.shop.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const t = getDict(getLang());
  return (
    <div className="card" style={{ maxWidth: 1000 }}>
      <h1 className="page-title">{t.adminPage.shops}</h1>
      <table className="table">
        <thead>
          <tr>
            <th>{t.tables.id}</th>
            <th>{t.orders.view === 'View' ? 'Name' : 'Tên'}</th>
            <th>{t.orders.view === 'View' ? 'Owner' : 'Chủ sở hữu'}</th>
            <th>{t.adminPage.products}</th>
          </tr>
        </thead>
        <tbody>
          {shops.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.name}</td>
              <td>
                {s.owner.name} ({s.owner.email})
              </td>
              <td>{s._count.products}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="section" style={{ display: 'flex', gap: 8 }}>
        <Link className="btn-outline" href={`?page=${Math.max(1, page - 1)}` as Route}>{t.prev}</Link>
        <span className="muted">{t.pagination.page(page, totalPages)}</span>
        <Link className="btn-outline" href={`?page=${Math.min(totalPages, page + 1)}` as Route}>{t.next}</Link>
      </div>
    </div>
  );
}
