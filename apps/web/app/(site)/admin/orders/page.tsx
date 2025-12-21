import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { getCurrentUser } from '@/lib/auth';
import { formatVND } from '@/lib/format';
import { getDict, getLang } from '@/lib/i18n';
import { getDb } from '@/lib/db';

interface InvoiceRow {
  order_id: string;
  created_at?: string;
  total: number;
  item_count: number;
  payload: {
    items?: Array<{
      quantity?: number;
      product?: { title?: string; price?: number };
    }>;
    contact?: { email?: string };
  };
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { page?: string; sort?: string };
}) {
  const user = getCurrentUser();
  if (!user || user.role !== 'ADMIN') redirect('/');

  const page = Math.max(1, Number(searchParams.page || 1));
  const sort = searchParams.sort === 'asc' ? 'asc' : 'desc';
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const lang = getLang();
  const t = getDict(lang);
  const supabase = getDb();

  // Query invoices instead of orders (invoices are paid orders)
  const invoicesQuery = supabase
    .from('invoices')
    .select('order_id,created_at,total,item_count,payload')
    .order('created_at', { ascending: sort === 'asc' });

  const countQuery = supabase.from('invoices').select('id', { count: 'exact', head: true });

  const [invoicesRes, totalRes] = await Promise.all([
    invoicesQuery.range(skip, skip + pageSize - 1),
    countQuery,
  ]);

  const invoices = (invoicesRes.data || []).map((row: InvoiceRow) => {
    const items = (row.payload?.items || []).map((item) => ({
      title: item.product?.title || 'Product',
      quantity: item.quantity || 0,
      price: item.product?.price || 0,
    }));

    return {
      id: row.order_id,
      status: 'PAID', // All invoices are completed/paid
      created_at: row.created_at,
      total: row.total,
      email: row.payload?.contact?.email || 'N/A',
      items,
    };
  });

  const totalPages = Math.max(1, Math.ceil((totalRes.count || 0) / pageSize));

  return (
    <div className="card" style={{ maxWidth: 1100 }}>
      <h1 className="page-title">{t.orders.title}</h1>

      <form style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <select name="sort" defaultValue={sort} className="input" style={{ maxWidth: 160 }}>
          <option value="desc">{t.filters.newest}</option>
          <option value="asc">{t.filters.oldest}</option>
        </select>
        <button className="btn" type="submit">
          {t.filters.apply}
        </button>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>{t.tables.items}</th>
            <th>{t.tables.status}</th>
            <th>{t.tables.total}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((o) => (
            <tr key={o.id}>
              <td>#{o.id}</td>
              <td>{o.email}</td>
              <td>{o.items.length}</td>
              <td>
                <span
                  style={{
                    display: 'inline-block',
                    paddingLeft: 8,
                    paddingRight: 8,
                    paddingTop: 4,
                    paddingBottom: 4,
                    borderRadius: 6,
                    background: '#16a34a20',
                    color: '#16a34a',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  ✓ {lang === 'en' ? 'Completed' : 'Hoàn Thành'}
                </span>
              </td>
              <td>{formatVND(o.total)}</td>
              <td>
                <Link className="btn-outline" href={`/orders/${encodeURIComponent(o.id)}` as Route}>
                  {t.orders.view}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="section" style={{ display: 'flex', gap: 8 }}>
        <Link
          className="btn-outline"
          href={`?${new URLSearchParams({ sort, page: String(Math.max(1, page - 1)) })}` as Route}
        >
          {t.prev}
        </Link>
        <span className="muted">{t.pagination.page(page, totalPages)}</span>
        <Link
          className="btn-outline"
          href={
            `?${new URLSearchParams({ sort, page: String(Math.min(totalPages, page + 1)) })}` as Route
          }
        >
          {t.next}
        </Link>
      </div>
    </div>
  );
}
