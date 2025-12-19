import Link from 'next/link';
import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { formatVND } from '../../../../lib/format';
import { getDict, getLang } from '../../../../lib/i18n';
import { getCurrentUser } from '../../../../lib/auth';
import { getDb, mapProduct } from '../../../../lib/db';

export default async function AdminProductsPage({ searchParams }: { searchParams: { page?: string } }) {
  const user = getCurrentUser();
  if (!user || user.role !== 'ADMIN') redirect('/');

  const page = Math.max(1, Number(searchParams.page || 1));
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const supabase = getDb();
  const [productsRes, totalRes] = await Promise.all([
    supabase
      .from('products')
      .select('id,title,description,price,image_url,shop_id,shop:shops(id,name)')
      .order('id', { ascending: true })
      .range(skip, skip + pageSize - 1),
    supabase.from('products').select('id', { count: 'exact', head: true }),
  ]);
  const products = (productsRes.data || []).map((row) => ({
    ...mapProduct(row),
    shop: row.shop || null,
  }));
  const totalPages = Math.max(1, Math.ceil((totalRes.count || 0) / pageSize));

  const t = getDict(getLang());
  return (
    <div className="card" style={{ maxWidth: 1000 }}>
      <h1 className="page-title">{t.adminPage.products}</h1>
      <div className="section" style={{ marginTop: 0, marginBottom: 12 }}>
        <Link className="btn" href={{ pathname: '/admin/products/new' }}>{t.adminButtons.products.replace('Quản lý ', '').replace('Manage ', '') || 'Create'}</Link>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>{t.tables.id}</th>
            <th>{t.tables.title}</th>
            <th>{t.tables.price}</th>
            <th>{t.tables.shop}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.title}</td>
              <td>{formatVND(p.price)}</td>
              <td>{p.shop?.name}</td>
              <td>
                <Link className="btn-outline" href={`/admin/products/${p.id}` as Route}>{t.orders.view === 'View' ? 'Edit' : 'Sửa'}</Link>
              </td>
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
