import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';
import InvoiceActions from '../success/InvoiceActions';

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

type InvoiceItem = {
  title: string;
  quantity: number;
  price: number;
};

type Invoice = {
  orderId: string;
  email: string;
  total: number;
  itemCount: number;
  createdAt: string;
  items: InvoiceItem[];
};

export default async function InvoicesPage() {
  const user = getCurrentUser();
  if (!user) redirect('/');

  const supabase = getDb();
  const { data, error } = await supabase
    .from('invoices')
    .select('order_id,email,total,item_count,payload,created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return (
      <div style={{ padding: 32 }}>
        <h2>Lỗi tải hóa đơn</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  const invoices: Invoice[] = ((data ?? []) as InvoiceRow[]).map((inv) => {
    const payloadItems: InvoicePayloadItem[] = inv.payload?.items ?? [];
    const items: InvoiceItem[] = payloadItems.map((item) => {
      const quantity = item.quantity ?? 0;
      const unitPrice = item.product?.price ?? 0;

      return {
        title: item.product?.title ?? 'Sản phẩm',
        quantity,
        price: unitPrice * quantity,
      };
    });

    return {
      orderId: inv.order_id,
      email: inv.email,
      total: inv.total,
      itemCount: inv.item_count,
      createdAt: inv.created_at,
      items,
    };
  });

  return (
    <div
      style={{
        maxWidth: 960,
        margin: '0 auto',
        padding: '32px 20px 48px',
        fontFamily: '"Space Grotesk", "Segoe UI", sans-serif',
        background: '#f9fafb',
        minHeight: '100vh',
        color: '#1f2937',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: 18,
          padding: 24,
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#059669' }}>
            Hóa đơn đã lưu
          </h1>
          <p style={{ margin: '6px 0 0', color: '#6b7280' }}>
            Lưu trên hệ thống, tối đa 50 hóa đơn gần nhất.
          </p>
        </div>

        <Link
          href="/checkout"
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            border: '1.5px solid #e5e7eb',
            color: '#059669',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Quay lại thanh toán
        </Link>
      </div>

      {/* Empty State */}
      {invoices.length === 0 ? (
        <div
          style={{
            background: 'white',
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            padding: 32,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#059669' }}>Chưa có hóa đơn</div>
          <p style={{ color: '#6b7280' }}>Thanh toán đơn hàng đầu tiên để tạo hóa đơn.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {invoices.map((inv) => (
            <div
              key={inv.orderId}
              style={{
                background: 'white',
                borderRadius: 14,
                border: '1px solid #e5e7eb',
                padding: 16,
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 800 }}>{inv.orderId}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>Email: {inv.email}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>
                  Tổng: {inv.total.toLocaleString('vi-VN')} VND
                </div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>
                  Tạo lúc: {new Date(inv.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>

              <InvoiceActions
                invoice={{
                  orderId: inv.orderId,
                  email: inv.email,
                  total: inv.total,
                  itemCount: inv.itemCount,
                  items: inv.items,
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
