import Link from 'next/link';
import { getCurrentUser } from '../../../../lib/auth';
import { formatVND } from '../../../../lib/format';
import { getDict, getLang } from '../../../../lib/i18n';
import { getDb, mapProduct } from '../../../../lib/db';
import LoginRequired from '@/components/LoginRequired';
import InvoiceActions from '@/components/InvoiceActions';

export const dynamic = 'force-dynamic';

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: {
    orderId?: string;
    email?: string;
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
  };
}) {
  const user = getCurrentUser();
  const t = getDict(getLang());

  if (!user) {
    return <LoginRequired message="Đăng nhập để xem đơn hàng của bạn" />;
  }

  const supabase = getDb();
  const cart = await supabase
    .from('carts')
    .select(
      'id,items:cart_items(id,quantity,product:products(id,title,description,price,image_url,shop_id))'
    )
    .eq('user_id', user.id)
    .maybeSingle();
  const cartId = cart.data?.id ?? null;

  const mappedItems = (cart.data?.items || [])
    .map((item: { id: number; quantity: number; product: unknown }) => ({
      id: item.id,
      quantity: item.quantity,
      product: item.product ? mapProduct(item.product as Parameters<typeof mapProduct>[0]) : null,
    }))
    .filter(
      (
        item
      ): item is {
        id: number;
        quantity: number;
        product: NonNullable<ReturnType<typeof mapProduct>>;
      } => item.product !== null
    );

  if (mappedItems.length === 0) {
    return (
      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '40px 20px 64px',
          fontFamily: '"Space Grotesk", "Segoe UI", sans-serif',
          background: '#f9fafb',
          minHeight: '100vh',
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: 18,
            border: '1px solid #e5e7eb',
            padding: 48,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#059669', margin: 0 }}>
            {t.checkout.title}
          </h1>
          <p style={{ color: '#6b7280', marginTop: 12, marginBottom: 28 }}>
            Không tìm thấy sản phẩm trong đơn. Vui lòng quay lại giỏ hàng.
          </p>
          <Link
            href="/cart"
            style={{
              display: 'inline-block',
              padding: '12px 28px',
              background: '#10b981',
              color: 'white',
              borderRadius: 12,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Quay lại giỏ hàng
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = mappedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = 0;
  const total = subtotal + shipping;
  const itemCount = mappedItems.reduce((sum, item) => sum + item.quantity, 0);
  const orderId = searchParams?.orderId
    ? String(searchParams.orderId)
    : `ORD-${user.id}-${Math.floor(Date.now() / 1000)
        .toString(36)
        .toUpperCase()}`;
  const targetEmail = searchParams?.email
    ? String(searchParams.email)
    : user.email || 'unknown@example.com';
  const contactName = searchParams?.name ? String(searchParams.name) : '';
  const contactPhone = searchParams?.phone ? String(searchParams.phone) : '';
  const contactAddress = searchParams?.address ? String(searchParams.address) : '';
  const contactCity = searchParams?.city ? String(searchParams.city) : '';
  const contactPostal = searchParams?.postalCode ? String(searchParams.postalCode) : '';

  // Persist invoice to Supabase (idempotent via order_id unique)
  const { error: invoiceError } = await supabase
    .from('invoices')
    .upsert(
      {
        order_id: orderId,
        user_id: user.id,
        email: targetEmail,
        total,
        item_count: itemCount,
        payload: {
          items: mappedItems,
          contact: {
            name: contactName,
            phone: contactPhone,
            email: targetEmail,
          },
          shipping: {
            address: contactAddress,
            city: contactCity,
            postalCode: contactPostal,
          },
        },
      },
      { onConflict: 'order_id' }
    )
    .select('id')
    .single();

  if (invoiceError) {
    console.error('Failed to save invoice', invoiceError);
  }

  const invoiceWarning = invoiceError
    ? 'Lưu hóa đơn lên Supabase thất bại. Vui lòng thử lại sau.'
    : null;

  // Clear cart items only if invoice was saved
  if (!invoiceError && cartId) {
    await supabase.from('cart_items').delete().eq('cart_id', cartId);
  }

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '32px 20px 64px',
        fontFamily: '"Space Grotesk", "Segoe UI", sans-serif',
        color: '#1f2937',
        background: '#f9fafb',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: 20,
          padding: '24px 28px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: 24,
          }}
        >
          ✅
        </div>
        <div style={{ flex: '1 1 260px' }}>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: '#059669' }}>
            Thanh toán thành công
          </h1>
          <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 15 }}>Mã đơn: {orderId}</p>
        </div>
        <InvoiceActions
          invoice={{
            orderId,
            email: targetEmail,
            total,
            itemCount,
            contactName,
            phone: contactPhone,
            address: contactAddress,
            city: contactCity,
            postalCode: contactPostal,
            items: mappedItems.map((i) => ({
              title: i.product.title,
              quantity: i.quantity,
              price: i.product.price * i.quantity,
            })),
          }}
        />
      </div>

      {invoiceWarning ? (
        <div
          style={{
            background: 'rgba(248, 113, 113, 0.12)',
            border: '1px solid #fecdd3',
            color: '#b91c1c',
            padding: '12px 14px',
            borderRadius: 12,
            marginBottom: 16,
            fontWeight: 600,
          }}
        >
          {invoiceWarning}
        </div>
      ) : null}

      <div
        style={{
          display: 'grid',
          gap: 20,
          gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)',
          alignItems: 'start',
        }}
      >
        {/* Left: Items */}
        <div
          style={{
            background: 'white',
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            padding: '20px 22px',
          }}
        >
          <h2
            style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1f2937', marginBottom: 14 }}
          >
            Sản phẩm trong đơn
          </h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {mappedItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '64px 1fr auto',
                  gap: 14,
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 12,
                    border: '1px solid #e5e7eb',
                    background: '#f3f4f6',
                    overflow: 'hidden',
                  }}
                >
                  {item.product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                      }}
                    >
                      📦
                    </div>
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      color: '#1f2937',
                      marginBottom: 4,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.product.title}
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>
                    {item.product.description?.slice(0, 80)}
                  </div>
                  <div style={{ fontSize: 14, color: '#6b7280' }}>Số lượng: {item.quantity}</div>
                </div>
                <div style={{ fontWeight: 800, color: '#059669', textAlign: 'right' }}>
                  {formatVND(item.product.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
            <Link
              href="/cart"
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: '1.5px solid #e5e7eb',
                color: '#059669',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Về giỏ hàng
            </Link>
            <Link
              href="/orders"
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                background: '#10b981',
                color: 'white',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Xem đơn hàng
            </Link>
          </div>
        </div>

        {/* Right: Summary */}
        <div
          style={{
            position: 'sticky',
            top: 24,
            display: 'grid',
            gap: 16,
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              border: '1px solid #e5e7eb',
              padding: '20px 22px',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 800,
                color: '#1f2937',
                marginBottom: 14,
              }}
            >
              Tóm tắt thanh toán
            </h3>
            <div style={{ display: 'grid', gap: 10, fontSize: 14, color: '#4b5563' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tạm tính ({itemCount} sản phẩm)</span>
                <span style={{ fontWeight: 700 }}>{formatVND(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Phí vận chuyển</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>Miễn phí</span>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 16,
                paddingTop: 12,
                borderTop: '2px solid #e5e7eb',
              }}
            >
              <span style={{ fontWeight: 800, fontSize: 18, color: '#1f2937' }}>Tổng cộng</span>
              <span style={{ fontWeight: 800, fontSize: 22, color: '#059669' }}>
                {formatVND(total)}
              </span>
            </div>
            <div style={{ marginTop: 16, display: 'grid', gap: 6, fontSize: 13, color: '#4b5563' }}>
              <div style={{ fontWeight: 700, color: '#1f2937' }}>Thông tin giao hàng</div>
              <div>{contactName || 'Chưa cung cấp tên'}</div>
              <div>{contactPhone || 'Chưa cung cấp số điện thoại'}</div>
              <div>
                {[contactAddress, contactCity, contactPostal].filter(Boolean).join(', ') ||
                  'Chưa cung cấp địa chỉ'}
              </div>
            </div>
            <p style={{ marginTop: 12, color: '#9ca3af', fontSize: 12 }}>
              Đây là trang demo, thanh toán thật chưa được kích hoạt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
