import Link from 'next/link';
import { getCurrentUser } from '../../../lib/auth';
import { formatVND } from '../../../lib/format';
import { getDict, getLang } from '../../../lib/i18n';
import { getDb, mapProduct } from '../../../lib/db';
import LoginRequired from '../LoginRequired';
import CheckoutPayNow from './CheckoutPayNow';

export default async function CheckoutPage() {
  const user = getCurrentUser();
  const t = getDict(getLang());

  if (!user) {
    return <LoginRequired message="Đăng nhập để tiếp tục thanh toán" />;
  }

  const supabase = getDb();
  const cart = await supabase
    .from('carts')
    .select(
      'id,items:cart_items(id,quantity,product:products(id,title,description,price,image_url,shop_id))'
    )
    .eq('user_id', user.id)
    .maybeSingle();

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

  const subtotal = mappedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = mappedItems.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = 0;
  const total = subtotal + shipping;
  const orderId = `ORD-${user.id}-${Math.floor(Date.now() / 1000)
    .toString(36)
    .toUpperCase()}`;

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
          <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#059669', margin: 0 }}>
            {t.checkout.title}
          </h1>
          <p style={{ color: '#6b7280', marginTop: 12, marginBottom: 28 }}>
            {t.cart?.empty || 'Giỏ hàng của bạn đang trống.'}
          </p>
          <Link
            href="/"
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
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
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
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: 22,
            }}
          >
            💳
          </div>
          <div style={{ flex: '1 1 260px' }}>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: '#059669' }}>
              {t.checkout.title}
            </h1>
            <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: 15 }}>{t.checkout.note}</p>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gap: 20,
          gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)',
          alignItems: 'start',
        }}
      >
        {/* Left: Forms */}
        <div style={{ display: 'grid', gap: 16 }}>
          {/* Contact */}
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              border: '1px solid #e5e7eb',
              padding: '20px 22px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1f2937' }}>
                Thông tin liên hệ
              </h3>
              <span style={{ fontSize: 13, color: '#6b7280' }}>Bước 1/3</span>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#4b5563' }}>
                Email
                <input
                  id="checkout-email"
                  name="email"
                  defaultValue={user.email || ''}
                  placeholder="you@example.com"
                  style={{
                    padding: '12px 12px',
                    borderRadius: 10,
                    border: '1.5px solid #e5e7eb',
                    background: '#f9fafb',
                  }}
                />
              </label>
              <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#4b5563' }}>
                Số điện thoại
                <input
                  id="checkout-phone"
                  placeholder="(+84) 0123 456 789"
                  style={{
                    padding: '12px 12px',
                    borderRadius: 10,
                    border: '1.5px solid #e5e7eb',
                    background: '#f9fafb',
                  }}
                />
              </label>
            </div>
          </div>

          {/* Shipping */}
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              border: '1px solid #e5e7eb',
              padding: '20px 22px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1f2937' }}>
                Địa chỉ giao hàng
              </h3>
              <span style={{ fontSize: 13, color: '#6b7280' }}>Bước 2/3</span>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#4b5563' }}>
                Họ và tên
                <input
                  id="checkout-fullname"
                  placeholder="Nguyễn Văn A"
                  style={{
                    padding: '12px 12px',
                    borderRadius: 10,
                    border: '1.5px solid #e5e7eb',
                    background: '#f9fafb',
                  }}
                />
              </label>
              <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#4b5563' }}>
                Địa chỉ
                <input
                  id="checkout-address"
                  placeholder="123 Đường ABC, Quận 1, TP.HCM"
                  style={{
                    padding: '12px 12px',
                    borderRadius: 10,
                    border: '1.5px solid #e5e7eb',
                    background: '#f9fafb',
                  }}
                />
              </label>
              <div
                style={{
                  display: 'grid',
                  gap: 10,
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                }}
              >
                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#4b5563' }}>
                  Thành phố
                  <input
                    id="checkout-city"
                    placeholder="TP.HCM"
                    style={{
                      padding: '12px 12px',
                      borderRadius: 10,
                      border: '1.5px solid #e5e7eb',
                      background: '#f9fafb',
                    }}
                  />
                </label>
                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#4b5563' }}>
                  Mã bưu điện
                  <input
                    id="checkout-postal"
                    placeholder="700000"
                    style={{
                      padding: '12px 12px',
                      borderRadius: 10,
                      border: '1.5px solid #e5e7eb',
                      background: '#f9fafb',
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              border: '1px solid #e5e7eb',
              padding: '20px 22px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1f2937' }}>
                Phương thức thanh toán
              </h3>
              <span style={{ fontSize: 13, color: '#6b7280' }}>Bước 3/3</span>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 12px',
                  borderRadius: 12,
                  border: '1.5px solid #e5e7eb',
                  background: '#f9fafb',
                  cursor: 'pointer',
                }}
              >
                <input type="radio" name="payment" defaultChecked />
                <div>
                  <div style={{ fontWeight: 700, color: '#1f2937' }}>
                    Thanh toán khi nhận hàng (COD)
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Phổ biến, an toàn, dễ dàng</div>
                </div>
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 12px',
                  borderRadius: 12,
                  border: '1.5px solid #e5e7eb',
                  background: 'white',
                  cursor: 'pointer',
                }}
              >
                <input type="radio" name="payment" />
                <div>
                  <div style={{ fontWeight: 700, color: '#1f2937' }}>Thẻ / Ví điện tử</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Hỗ trợ thẻ nội địa & quốc tế</div>
                </div>
              </label>
            </div>
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
              Tóm tắt đơn hàng
            </h3>
            <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
              {mappedItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    borderBottom: '1px solid #e5e7eb',
                    paddingBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 12,
                      border: '1px solid #e5e7eb',
                      background: '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      fontWeight: 700,
                      color: '#059669',
                    }}
                  >
                    {item.quantity}×
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
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
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      {item.product.description?.slice(0, 70)}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: '#059669' }}>
                    {formatVND(item.product.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gap: 10, fontSize: 14, color: '#4b5563' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tạm tính ({itemCount} sản phẩm)</span>
                <span style={{ fontWeight: 700 }}>{formatVND(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Phí vận chuyển</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>
                  {shipping === 0 ? 'Miễn phí' : formatVND(shipping)}
                </span>
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

            <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
              <CheckoutPayNow
                defaultEmail={user.email || ''}
                orderId={orderId}
                total={total}
                itemCount={itemCount}
                redirectUrl={`/checkout/success?orderId=${encodeURIComponent(orderId)}`}
                fieldIds={{
                  email: 'checkout-email',
                  phone: 'checkout-phone',
                  fullName: 'checkout-fullname',
                  address: 'checkout-address',
                  city: 'checkout-city',
                  postalCode: 'checkout-postal',
                }}
              >
                {t.checkout.payNow}
              </CheckoutPayNow>
              <Link
                href="/cart"
                style={{
                  textAlign: 'center',
                  padding: '10px',
                  borderRadius: 10,
                  border: '1.5px solid #e5e7eb',
                  color: '#059669',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                {t.checkout.backToCart}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
