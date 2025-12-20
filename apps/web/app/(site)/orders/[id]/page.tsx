import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatVND } from '../../../../lib/format';
import { getDb } from '../../../../lib/db';
import { getCurrentUser } from '../../../../lib/auth';
import InvoiceActions from '@/components/InvoiceActions';

type InvoicePayloadItem = {
  id?: number;
  quantity?: number;
  product?: {
    title?: string | null;
    price?: number | null;
    shopId?: number | null;
  } | null;
};

type Params = { params: { id: string } };

export default async function OrderPage({ params }: Params) {
  const orderId = decodeURIComponent(params.id);
  if (!orderId) notFound();

  const user = getCurrentUser();
  if (!user) {
    return (
      <div
        style={{
          maxWidth: 640,
          margin: '0 auto',
          padding: '48px 20px',
          fontFamily: '"Space Grotesk", "Segoe UI", sans-serif',
        }}
      >
        <h2 style={{ marginTop: 0, color: '#111827' }}>Cần đăng nhập</h2>
        <p style={{ color: '#6b7280' }}>Vui lòng đăng nhập để xem hóa đơn của bạn.</p>
        <Link
          href="/auth/login"
          style={{
            display: 'inline-block',
            marginTop: 12,
            padding: '10px 16px',
            borderRadius: 12,
            background: '#10b981',
            color: 'white',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Đăng nhập
        </Link>
      </div>
    );
  }

  const supabase = getDb();
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('order_id,email,total,item_count,payload,created_at,user_id')
    .eq('order_id', orderId)
    .maybeSingle();

  if (error || !invoice) notFound();

  let scopedItems: InvoicePayloadItem[] = invoice.payload?.items ?? [];
  if (user.id !== invoice.user_id) {
    if (user.role === 'SHOP') {
      const { data: myShops } = await supabase.from('shops').select('id').eq('owner_id', user.id);
      const shopIds = (myShops || []).map((s) => s.id);
      scopedItems = scopedItems.filter((item) => {
        const shopId = item.product?.shopId ?? null;
        return shopId !== null && shopIds.includes(shopId);
      });
      if (scopedItems.length === 0) notFound();
    } else if (user.role !== 'ADMIN') {
      notFound();
    }
  }

  const items = scopedItems.map((item) => {
    const quantity = item.quantity ?? 1;
    const unitPrice = item.product?.price ?? 0;
    return {
      title: item.product?.title ?? 'Sản phẩm',
      quantity,
      price: unitPrice * quantity,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const shipping = 0;
  const total = subtotal + shipping;
  const createdAt = invoice.created_at ? new Date(invoice.created_at) : null;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const contact = invoice.payload?.contact;
  const shippingInfo = invoice.payload?.shipping;

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
          gap: 12,
          marginBottom: 18,
          flexWrap: 'wrap',
        }}
      >
        <Link
          href="/orders"
          style={{
            padding: '10px 12px',
            borderRadius: 12,
            border: '1.5px solid #e5e7eb',
            background: 'white',
            color: '#059669',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          ← Hóa đơn đã lưu
        </Link>
        <div style={{ flex: '1 1 240px' }}>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: '#059669' }}>
            Hóa đơn {orderId}
          </h1>
          <p style={{ margin: '6px 0 0', color: '#6b7280' }}>
            {createdAt ? createdAt.toLocaleString('vi-VN') : ''}
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)',
          gap: 18,
          alignItems: 'start',
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#111827' }}>
              Chi tiết sản phẩm
            </h2>
            <span style={{ color: '#6b7280', fontSize: 13 }}>{items.length} sản phẩm</span>
          </div>

          <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
            {items.map((item, idx) => (
              <div
                key={`${item.title}-${idx}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 10,
                  padding: '12px 0',
                  borderBottom: '1px solid #f3f4f6',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#111827' }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>Số lượng: {item.quantity}</div>
                </div>
                <div style={{ textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                  {formatVND(item.price)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            position: 'sticky',
            top: 24,
            display: 'grid',
            gap: 12,
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              border: '1px solid #e5e7eb',
              padding: 18,
            }}
          >
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Tóm tắt</h3>
            <div style={{ marginTop: 12, display: 'grid', gap: 10, color: '#4b5563' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span>Tạm tính</span>
                <span style={{ fontWeight: 700 }}>{formatVND(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span>Vận chuyển</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>Miễn phí</span>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 14,
                paddingTop: 12,
                borderTop: '2px solid #e5e7eb',
              }}
            >
              <span style={{ fontWeight: 800, fontSize: 18, color: '#111827' }}>Tổng cộng</span>
              <span style={{ fontWeight: 800, fontSize: 20, color: '#059669' }}>
                {formatVND(total)}
              </span>
            </div>
            <div style={{ marginTop: 12, display: 'grid', gap: 6, color: '#4b5563', fontSize: 13 }}>
              <div style={{ fontWeight: 700, color: '#111827' }}>Thông tin giao hàng</div>
              <div>{contact?.name || 'Chưa cung cấp tên'}</div>
              <div>{contact?.phone || 'Chưa cung cấp số điện thoại'}</div>
              <div>
                {[shippingInfo?.address, shippingInfo?.city, shippingInfo?.postalCode]
                  .filter(Boolean)
                  .join(', ') || 'Chưa cung cấp địa chỉ'}
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <InvoiceActions
                invoice={{
                  orderId,
                  email: invoice.email,
                  total,
                  itemCount,
                  contactName: contact?.name || undefined,
                  phone: contact?.phone || undefined,
                  address: shippingInfo?.address || undefined,
                  city: shippingInfo?.city || undefined,
                  postalCode: shippingInfo?.postalCode || undefined,
                  items: items.map((item) => ({
                    title: item.title,
                    quantity: item.quantity,
                    price: item.price,
                  })),
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
