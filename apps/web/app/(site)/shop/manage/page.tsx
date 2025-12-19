import Link from 'next/link';
import type { Route } from 'next';
import { redirect } from 'next/navigation';

import { getCurrentUser } from '../../../../lib/auth';
import StatusSelect from './status/StatusSelect';
import { formatVND, statusLabel } from '../../../../lib/format';
import NewProductForm from './NewProductForm';
import { getDict, getLang } from '../../../../lib/i18n';
import NewShopForm from './NewShopForm';
import { getDb, mapOrderItem, mapProduct } from '../../../../lib/db';
import ProductCard from './ProductCard';

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

  const supabase = getDb();
  const { data: myShopsData, error: shopsError } = await supabase
    .from('shops')
    .select('id,name')
    .eq('owner_id', me.id);
  if (shopsError) {
    throw new Error('Failed to load shops');
  }
  const myShops = myShopsData || [];
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

  let ordersQuery = supabase
    .from('orders')
    .select(
      'id,status,created_at,items:order_items(id,product_id,price,quantity),shop:shops(id,name),user:users(id,email)'
    )
    .in('shop_id', shopIds)
    .order('created_at', { ascending: false });
  let countQuery = supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .in('shop_id', shopIds);
  if (status) {
    ordersQuery = ordersQuery.eq('status', status);
    countQuery = countQuery.eq('status', status);
  }
  const [ordersRes, totalRes, productsRes] = await Promise.all([
    ordersQuery.range(skip, skip + pageSize - 1),
    countQuery,
    supabase
      .from('products')
      .select('id,title,description,price,image_url,shop_id,shop:shops(name)')
      .in('shop_id', shopIds)
      .order('id', { ascending: false }),
  ]);
  const orders = (ordersRes.data || []).map((row) => ({
    id: row.id,
    status: row.status,
    items: (row.items || []).map(mapOrderItem),
    shop: Array.isArray(row.shop) ? row.shop[0] : row.shop,
    user: Array.isArray(row.user) ? row.user[0] : row.user,
  }));
  const products = (productsRes.data || []).map((row) => ({
    ...mapProduct(row),
    shop: Array.isArray(row.shop) ? row.shop[0] : row.shop,
  }));
  const totalPages = Math.max(1, Math.ceil((totalRes.count || 0) / pageSize));

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 className="page-title" style={{ marginBottom: 8 }}>
          {t.shopManage.title}
        </h1>
        <p className="muted">Quản lý shop, sản phẩm và đơn hàng của bạn</p>
      </div>

      {/* Your Shops Section */}
      <div className="card" style={{ marginBottom: 24, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: 18,
            }}
          >
            🏪
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{t.shopManage.yourShops}</h2>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {myShops.map((s) => (
            <div
              key={s.id}
              style={{
                padding: '12px 20px',
                background: '#f1f5f9',
                borderRadius: 8,
                fontWeight: 500,
                border: '2px solid #e2e8f0',
              }}
            >
              {s.name}
            </div>
          ))}
        </div>
      </div>

      {/* Add Product Section */}
      <div className="card" style={{ marginBottom: 24, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: 18,
            }}
          >
            ➕
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{t.shopManage.addProduct}</h2>
        </div>
        <NewProductForm shops={myShops} lang={lang} />
      </div>

      {/* Products Section - Card Grid */}
      <div className="card" style={{ marginBottom: 24, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: 18,
            }}
          >
            📦
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{t.adminPage.products}</h2>
          <span className="muted" style={{ marginLeft: 'auto' }}>
            {products.length} sản phẩm
          </span>
        </div>
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p className="muted" style={{ fontSize: 16 }}>
              {t.shopManage.none}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {products.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                title={p.title}
                price={p.price}
                imageUrl={p.imageUrl}
                shopName={p.shop.name}
                editLabel={t.orders.view === 'View' ? 'Edit' : 'Sửa'}
              />
            ))}
          </div>
        )}
      </div>

      {/* Orders Section */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: 18,
            }}
          >
            📋
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{t.shopManage.orders}</h2>
        </div>
        <form style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
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
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p className="muted" style={{ fontSize: 16 }}>
              {t.shopManage.none}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
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
          </div>
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
