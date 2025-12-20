import Link from 'next/link';
import type { Route } from 'next';
import { redirect } from 'next/navigation';

import { getCurrentUser } from '../../../../lib/auth';
import { formatVND } from '../../../../lib/format';
import NewProductForm from './NewProductForm';
import { getDict, getLang } from '../../../../lib/i18n';
import NewShopForm from './NewShopForm';
import { getDb, mapProduct } from '../../../../lib/db';
import ProductCard from './ProductCard';

type InvoicePayloadItem = {
  id?: number;
  quantity?: number;
  product?: {
    title?: string | null;
    price?: number | null;
    shopId?: number | null;
  } | null;
};

export default async function ShopManagePage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const me = getCurrentUser();
  if (!me || me.role !== 'SHOP') redirect('/');

  const page = Math.max(1, Number(searchParams.page || 1));
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const supabase = getDb();
  const { data: myShopsData, error: shopsError } = await supabase
    .from('shops')
    .select('id,name,verified')
    .eq('owner_id', me.id);
  if (shopsError) {
    throw new Error('Failed to load shops');
  }
  const myShops =
    (myShopsData as unknown as { id: number; name: string; verified: boolean }[]) || [];
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

  const anyVerified = myShops.some(
    (s: { id: number; name: string; verified: boolean }) => s.verified === true
  );
  if (!anyVerified) {
    return (
      <div className="card" style={{ padding: 20 }}>
        <h1 className="page-title" style={{ marginBottom: 8 }}>
          {t.shopManage.title}
        </h1>
        <p className="muted">Shop của bạn đang chờ xác thực. Vui lòng đợi admin approve.</p>
        <div style={{ marginTop: 16 }}>
          <a href="/shop/request" className="btn-outline">
            Gửi yêu cầu xác thực lại
          </a>
        </div>
      </div>
    );
  }

  const [invoicesRes, productsRes] = await Promise.all([
    supabase
      .from('invoices')
      .select('order_id,email,total,item_count,payload,created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(skip, skip + pageSize - 1),
    supabase
      .from('products')
      .select('id,title,description,price,image_url,shop_id,shop:shops(name)')
      .in('shop_id', shopIds)
      .order('id', { ascending: false }),
  ]);

  const invoices = (invoicesRes.data || [])
    .map((row) => {
      const payloadItems: InvoicePayloadItem[] = row.payload?.items ?? [];
      const shopItems = payloadItems.filter((item) => {
        const shopId = item.product?.shopId ?? null;
        return shopId !== null && shopIds.includes(shopId);
      });

      if (shopItems.length === 0) return null;

      const shopItemCount = shopItems.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
      const shopTotal = shopItems.reduce(
        (sum, item) => sum + (item.quantity ?? 1) * (item.product?.price ?? 0),
        0
      );

      return {
        orderId: row.order_id,
        email: row.email,
        total: shopTotal,
        itemCount: shopItemCount,
        createdAt: row.created_at,
        items: shopItems,
      };
    })
    .filter(Boolean) as {
    orderId: string;
    email: string;
    total: number;
    itemCount: number;
    createdAt: string;
    items: InvoicePayloadItem[];
  }[];

  const products = (productsRes.data || []).map((row) => ({
    ...mapProduct(row),
    shop: Array.isArray(row.shop) ? row.shop[0] : row.shop,
  }));
  const totalPages = Math.max(1, Math.ceil(Math.max(1, invoices.length) / pageSize));

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
              {s.name} {s.verified ? '' : '(Chưa xác thực)'}
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

      {/* Invoices Section */}
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
          <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Hóa đơn</h2>
        </div>
        {invoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p className="muted" style={{ fontSize: 16 }}>
              {t.shopManage.none}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {invoices.map((inv) => {
              const createdAt = inv.createdAt ? new Date(inv.createdAt) : null;
              return (
                <div
                  key={inv.orderId}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 12,
                    alignItems: 'center',
                    padding: 16,
                    border: '1px solid #e5e7eb',
                    borderRadius: 14,
                    background: 'white',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{inv.orderId}</div>
                    <div style={{ color: '#6b7280', fontSize: 13 }}>
                      {createdAt ? createdAt.toLocaleString('vi-VN') : ''} · {inv.itemCount} sản
                      phẩm
                    </div>
                    <div style={{ color: '#6b7280', fontSize: 13 }}>Email: {inv.email}</div>
                    <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
                      {inv.items.map((item, idx) => {
                        const title = item.product?.title || 'Sản phẩm';
                        const quantity = item.quantity ?? 1;
                        const price = item.product?.price ?? 0;
                        return (
                          <div
                            key={`${inv.orderId}-${idx}`}
                            style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}
                          >
                            <span style={{ color: '#111827', fontWeight: 600 }}>{title}</span>
                            <span style={{ color: '#6b7280' }}>
                              x{quantity} · {formatVND(price)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ marginTop: 6, fontWeight: 800, color: '#059669', fontSize: 18 }}>
                      {formatVND(inv.total)}
                    </div>
                  </div>
                  <Link
                    className="btn-outline"
                    href={`/orders/${encodeURIComponent(inv.orderId)}`}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    Xem hóa đơn
                  </Link>
                </div>
              );
            })}
          </div>
        )}
        <div className="section" style={{ display: 'flex', gap: 8 }}>
          <Link
            className="btn-outline"
            href={`?${new URLSearchParams({ page: String(Math.max(1, page - 1)) })}` as Route}
          >
            {t.prev}
          </Link>
          <span className="muted">{t.pagination.page(page, totalPages)}</span>
          <Link
            className="btn-outline"
            href={
              `?${new URLSearchParams({ page: String(Math.min(totalPages, page + 1)) })}` as Route
            }
          >
            {t.next}
          </Link>
        </div>
      </div>
    </div>
  );
}
