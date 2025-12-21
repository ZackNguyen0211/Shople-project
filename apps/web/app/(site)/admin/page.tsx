import Link from 'next/link';
import type { Route } from 'next';
import { redirect } from 'next/navigation';

import { getCurrentUser } from '../../../lib/auth';
import { getDict, getLang } from '../../../lib/i18n';
import { getDb, mapOrderItem } from '../../../lib/db';
import AdminDashboard from './AdminDashboard';
import ShopRequestActions from '@/components/admin/ShopRequestActions';

export default async function AdminPage() {
  const user = getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/');
  }

  const supabase = getDb();
  const [usersCountRes, shopsCountRes, productsCountRes, invoicesRes, requestsRes] =
    await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('shops').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase
        .from('invoices')
        .select('id,order_id,created_at,total,item_count,payload')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('shop_requests')
        .select('id,shop_name,shop_owner_email,requester_id,status,created_at')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

  const usersCount = usersCountRes.count || 0;
  const shopsCount = shopsCountRes.count || 0;
  const productsCount = productsCountRes.count || 0;
  const orders = (invoicesRes.data || []).map((row) => ({
    id: row.order_id,
    status: 'PAID', // Invoices are created only after successful payment
    created_at: row.created_at,
    items: (row.payload?.items || []).map((item: any) => ({
      id: item.product?.id,
      productId: item.product?.id,
      price: item.product?.price || 0,
      quantity: item.quantity || 0,
    })),
    total_cents: row.total || 0,
  }));
  const revenueVnd = (invoicesRes.data || []).reduce((sum, row) => sum + (row.total || 0), 0);
  const pendingRequests = (requestsRes.data || []).map((row) => ({
    id: row.id,
    shopName: row.shop_name,
    shopOwnerEmail: row.shop_owner_email,
    requesterId: row.requester_id,
    status: row.status,
    createdAt: row.created_at,
  }));

  const lang = getLang();
  const t = getDict(lang);

  // Prepare translation strings for Client Component (no functions)
  const translations = {
    adminPage: {
      title: t.adminPage.title,
      revenue: t.adminPage.revenue,
      users: t.adminPage.users,
      shops: t.adminPage.shops,
      products: t.adminPage.products,
      recentOrders: t.adminPage.recentOrders,
      noRecent: t.adminPage.noRecent,
    },
    adminButtons: {
      users: t.adminButtons.users,
      shops: t.adminButtons.shops,
      products: t.adminButtons.products,
      orders: t.adminButtons.orders,
    },
    tables: {
      id: t.tables.id,
      items: t.tables.items,
      total: t.tables.total,
      status: t.tables.status,
    },
  };

  return (
    <div className="container" style={{ padding: 0 }}>
      <AdminDashboard
        usersCount={usersCount}
        shopsCount={shopsCount}
        productsCount={productsCount}
        orders={orders}
        revenueVnd={revenueVnd}
        translations={translations}
        lang={lang}
      />

      {/* Management Buttons */}
      <div style={{ marginTop: 40, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link
          className="btn"
          href={`/admin/users` as Route}
          style={{
            background: 'linear-gradient(135deg, #52a373 0%, #2f6d54 100%)',
            color: 'white',
            textDecoration: 'none',
            padding: '12px 24px',
            borderRadius: 8,
            fontWeight: 500,
            fontSize: 14,
            border: 'none',
            cursor: 'pointer',
            display: 'inline-block',
          }}
        >
          👥 {t.adminButtons.users}
        </Link>
        <Link
          className="btn"
          href={`/admin/shops` as Route}
          style={{
            background: 'linear-gradient(135deg, #3a8068 0%, #2f6d54 100%)',
            color: 'white',
            textDecoration: 'none',
            padding: '12px 24px',
            borderRadius: 8,
            fontWeight: 500,
            fontSize: 14,
            border: 'none',
            cursor: 'pointer',
            display: 'inline-block',
          }}
        >
          🏪 {t.adminButtons.shops}
        </Link>
        <Link
          className="btn"
          href={`/admin/products` as Route}
          style={{
            background: 'linear-gradient(135deg, #5db876 0%, #3a8068 100%)',
            color: 'white',
            textDecoration: 'none',
            padding: '12px 24px',
            borderRadius: 8,
            fontWeight: 500,
            fontSize: 14,
            border: 'none',
            cursor: 'pointer',
            display: 'inline-block',
          }}
        >
          📦 {t.adminButtons.products}
        </Link>
        <Link
          className="btn"
          href={`/admin/orders` as Route}
          style={{
            background: 'linear-gradient(135deg, #2f6d54 0%, #1e4d3a 100%)',
            color: 'white',
            textDecoration: 'none',
            padding: '12px 24px',
            borderRadius: 8,
            fontWeight: 500,
            fontSize: 14,
            border: 'none',
            cursor: 'pointer',
            display: 'inline-block',
          }}
        >
          📋 {t.adminButtons.orders}
        </Link>
        <Link
          className="btn"
          href={`/admin/shop-requests` as Route}
          style={{
            background: 'linear-gradient(135deg, #22644d 0%, #184838 100%)',
            color: 'white',
            textDecoration: 'none',
            padding: '12px 24px',
            borderRadius: 8,
            fontWeight: 500,
            fontSize: 14,
            border: 'none',
            cursor: 'pointer',
            display: 'inline-block',
          }}
        >
          ✅ Pending Requests
        </Link>
      </div>

      {/* Pending Shop Verification Requests */}
      <div className="card" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Pending Shop Verification</h2>
          <Link href={`/admin/shop-requests` as Route} className="btn-outline">
            View all
          </Link>
        </div>
        {pendingRequests.length === 0 ? (
          <p className="muted" style={{ marginTop: 8 }}>
            No pending requests.
          </p>
        ) : (
          <table className="table" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Shop</th>
                <th>Owner Email</th>
                <th>Requester</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map((r) => (
                <tr key={r.id}>
                  <td>#{r.id}</td>
                  <td>{r.shopName}</td>
                  <td>{r.shopOwnerEmail}</td>
                  <td>{r.requesterId}</td>
                  <td>{new Date(r.createdAt).toLocaleString('vi-VN')}</td>
                  <td>
                    <ShopRequestActions id={r.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
