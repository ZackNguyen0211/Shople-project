import Link from 'next/link';
import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { getDict, getLang } from '../../../../lib/i18n';

export default async function AdminUsersPage({ searchParams }: { searchParams: { page?: string } }) {
  const user = getCurrentUser();
  if (!user || user.role !== 'ADMIN') redirect('/');

  const page = Math.max(1, Number(searchParams.page || 1));
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: pageSize,
      orderBy: { id: 'asc' },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    }),
    prisma.user.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const t = getDict(getLang());
  return (
    <div className="card" style={{ maxWidth: 1000 }}>
      <h1 className="page-title">{t.adminPage.users}</h1>
      <table className="table">
        <thead>
          <tr>
            <th>{t.tables.id}</th>
            <th> {t.orders.view === 'View' ? 'Name' : 'Họ tên'}</th>
            <th>Email</th>
            <th>{t.orders.view === 'View' ? 'Role' : 'Vai trò'}</th>
            <th>{t.orders.view === 'View' ? 'Created' : 'Ngày tạo'}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
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
