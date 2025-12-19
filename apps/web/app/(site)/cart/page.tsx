import { getCurrentUser } from '../../../lib/auth';
import { formatVND } from '../../../lib/format';
import { getDict, getLang } from '../../../lib/i18n';
import { getDb, mapProduct } from '../../../lib/db';
import LoginRequired from '../LoginRequired';
import CartItemControls from './CartItemControls';
import Link from 'next/link';

export default async function CartPage() {
  const me = getCurrentUser();
  const t = getDict(getLang());

  if (!me) {
    return <LoginRequired message="Đăng nhập để xem giỏ hàng của bạn" />;
  }

  const supabase = getDb();
  const items = me
    ? (
        await supabase
          .from('carts')
          .select(
            'id,items:cart_items(id,quantity,product:products(id,title,description,price,image_url,shop_id))'
          )
          .eq('user_id', me.id)
          .maybeSingle()
      ).data?.items || []
    : [];
  const mappedItems = items
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
  const total = mappedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = mappedItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '32px 20px 48px',
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
          padding: '28px 28px',
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
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
              fontWeight: 700,
              fontSize: 24,
            }}
          >
            🛒
          </div>

          <div style={{ flex: '1 1 320px' }}>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: '#059669' }}>
              {t.cart.title}
            </h1>
            <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: 15 }}>
              {mappedItems.length > 0
                ? `${mappedItems.length} ${mappedItems.length === 1 ? 'product' : 'products'} (${itemCount} ${itemCount === 1 ? 'item' : 'items'})`
                : t.cart.empty}
            </p>
          </div>
        </div>
      </div>

      {mappedItems.length === 0 ? (
        <div
          style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: 18,
            padding: 60,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 64, marginBottom: 20 }}>🛒</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#059669', marginBottom: 12 }}>
            {t.cart.empty}
          </h2>
          <p style={{ color: '#6b7280', marginBottom: 32, fontSize: 15 }}>
            Start shopping to add items to your cart
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              background: '#10b981',
              color: 'white',
              borderRadius: 12,
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: 16,
            }}
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 24 }}>
          {/* Cart Items */}
          <div
            style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: 18,
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'grid', gap: 1, background: '#e5e7eb' }}>
              {mappedItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: 'white',
                    padding: '20px 24px',
                    display: 'grid',
                    gap: 20,
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto',
                      gap: 20,
                      alignItems: 'center',
                    }}
                  >
                    {/* Product Image */}
                    <Link
                      href={`/product/${item.product.id}`}
                      style={{
                        display: 'block',
                        width: 100,
                        height: 100,
                        borderRadius: 12,
                        overflow: 'hidden',
                        border: '1px solid #e5e7eb',
                        background: '#f3f4f6',
                        textDecoration: 'none',
                      }}
                    >
                      {item.product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 40,
                          }}
                        >
                          📦
                        </div>
                      )}
                    </Link>

                    {/* Product Info */}
                    <div style={{ minWidth: 0 }}>
                      <Link
                        href={`/product/${item.product.id}`}
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: '#1f2937',
                          textDecoration: 'none',
                          display: 'block',
                          marginBottom: 8,
                        }}
                      >
                        {item.product.title}
                      </Link>
                      <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>
                        {item.product.description && item.product.description.length > 80
                          ? item.product.description.slice(0, 80) + '...'
                          : item.product.description}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>
                        {formatVND(item.product.price)}
                        <span
                          style={{ fontSize: 14, color: '#6b7280', fontWeight: 400, marginLeft: 8 }}
                        >
                          × {item.quantity}
                        </span>
                      </div>
                    </div>

                    {/* Price & Controls */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: 12,
                      }}
                    >
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#059669' }}>
                        {formatVND(item.product.price * item.quantity)}
                      </div>
                      <CartItemControls
                        productId={item.product.id}
                        quantity={item.quantity}
                        lang={getLang()}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div
            style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: 18,
              padding: '28px',
            }}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#1f2937',
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: '2px solid #e5e7eb',
              }}
            >
              Order Summary
            </h2>

            <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 15,
                  color: '#6b7280',
                }}
              >
                <span>Subtotal ({itemCount} items)</span>
                <span style={{ fontWeight: 600 }}>{formatVND(total)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 15,
                  color: '#6b7280',
                }}
              >
                <span>Shipping</span>
                <span style={{ fontWeight: 600, color: '#10b981' }}>Free</span>
              </div>
            </div>

            <div
              style={{
                paddingTop: 20,
                borderTop: '2px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>
                {t.cart.total}
              </span>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#059669' }}>
                {formatVND(total)}
              </span>
            </div>

            <Link
              href="/checkout"
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '16px 32px',
                background: '#10b981',
                color: 'white',
                borderRadius: 12,
                fontWeight: 700,
                textDecoration: 'none',
                fontSize: 16,
                transition: 'all 0.2s ease',
              }}
            >
              {t.cart.checkout}
            </Link>

            <Link
              href="/"
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '12px',
                marginTop: 12,
                color: '#059669',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
