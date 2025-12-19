import Link from 'next/link';
import { getCurrentUser } from '../../../lib/auth';
import { formatVND } from '../../../lib/format';
import { getDict, getLang } from '../../../lib/i18n';
import { getDb } from '../../../lib/db';
import LoginRequired from '../LoginRequired';

type InvoicePayloadItem = {
  id?: number;
  quantity?: number;
  product?: {
    title?: string | null;
    price?: number | null;
  } | null;
};

type InvoiceRow = {
  order_id: string;
  email: string;
  total: number;
  item_count: number;
  created_at: string;
  payload: {
    items?: InvoicePayloadItem[];
    contact?: {
      name?: string | null;
      phone?: string | null;
      email?: string | null;
    } | null;
    shipping?: {
      address?: string | null;
      city?: string | null;
      postalCode?: string | null;
    } | null;
  } | null;
};

export default async function OrdersPage() {
  const me = getCurrentUser();
  getDict(getLang());

  if (!me) {
    return <LoginRequired message="Đăng nhập để xem lịch sử đơn hàng" />;
  }

  const supabase = getDb();
  const { data, error } = await supabase
    .from('invoices')
    .select('order_id,email,total,item_count,payload,created_at')
    .eq('user_id', me.id)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) {
    throw new Error('Failed to load invoices');
  }
  const invoices = (data || []).map((row: InvoiceRow) => {
    const payloadItems: InvoicePayloadItem[] = row.payload?.items ?? [];
    const items = payloadItems.map((item) => {
      const quantity = item.quantity ?? 0;
      const price = item.product?.price ?? 0;
      return {
        title: item.product?.title ?? 'Sản phẩm',
        quantity,
        price: price * quantity,
      };
    });

    return {
      orderId: row.order_id,
      email: row.email,
      total: row.total,
      itemCount: row.item_count,
      createdAt: row.created_at,
      items,
      contact: row.payload?.contact ?? null,
      shipping: row.payload?.shipping ?? null,
    };
  });

  const statusTone = { bg: 'rgba(16, 185, 129, 0.12)', text: '#0f766e' };

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '32px 20px 64px',
        fontFamily: '"Space Grotesk", "Segoe UI", sans-serif',
        color: '#111827',
        background: '#f9fafb',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 18,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: '#059669' }}>
            Hóa đơn đã lưu
          </h1>
          <p style={{ margin: '6px 0 0', color: '#6b7280' }}>
            Lưu trên Supabase, tối đa 50 hóa đơn gần nhất.
          </p>
        </div>
        <Link
          href="/checkout"
          style={{
            padding: '10px 14px',
            borderRadius: 12,
            background: '#10b981',
            color: 'white',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Tiếp tục mua sắm
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div
          style={{
            background: 'white',
            borderRadius: 18,
            border: '1px solid #e5e7eb',
            padding: 32,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#059669' }}>Chưa có hóa đơn</div>
          <p style={{ color: '#6b7280', marginTop: 6 }}>
            Hãy thanh toán đơn đầu tiên để tạo hóa đơn.
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
                  background: 'white',
                  borderRadius: 16,
                  border: '1px solid #e5e7eb',
                  padding: 16,
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, color: '#111827' }}>{inv.orderId}</span>
                    <span
                      style={{
                        padding: '8px 12px',
                        borderRadius: 999,
                        background: statusTone.bg,
                        color: statusTone.text,
                        fontWeight: 700,
                        letterSpacing: 0.2,
                        textTransform: 'uppercase',
                        fontSize: 12,
                      }}
                    >
                      Lưu trên Supabase
                    </span>
                  </div>
                  <div style={{ marginTop: 6, color: '#6b7280', fontSize: 13 }}>
                    {createdAt ? createdAt.toLocaleString('vi-VN') : ''} · {inv.itemCount} sản phẩm
                  </div>
                  <div style={{ marginTop: 4, color: '#6b7280', fontSize: 13 }}>
                    Email: {inv.email}
                  </div>
                  <div style={{ marginTop: 8, fontWeight: 800, color: '#059669', fontSize: 18 }}>
                    {formatVND(inv.total)}
                  </div>
                </div>
                <Link
                  href={`/orders/${encodeURIComponent(inv.orderId)}`}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1.5px solid #e5e7eb',
                    background: 'white',
                    color: '#059669',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  Xem chi tiết
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
