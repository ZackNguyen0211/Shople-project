import Link from 'next/link';
import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { formatVND } from '../../../../lib/format';
import { getDict, getLang } from '../../../../lib/i18n';
import { getCurrentUser } from '../../../../lib/auth';
import { getDb, mapProduct } from '../../../../lib/db';

type SearchParams = { page?: string };

function clampPage(input: unknown) {
  const n = Number(input);
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.floor(n));
}

export default async function AdminProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = getCurrentUser();
  if (!user || user.role !== 'ADMIN') redirect('/');

  const page = clampPage(searchParams.page ?? 1);
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const supabase = getDb();

  const [productsRes, totalRes] = await Promise.all([
    supabase
      .from('products')
      .select('id,title,description,price,image_url,shop_id,shop:shops(id,name)')
      .order('id', { ascending: true })
      .range(skip, skip + pageSize - 1),
    supabase.from('products').select('id', { count: 'exact', head: true }),
  ]);

  const t = getDict(getLang());

  const listLabel = t.adminPage?.products ?? 'Products';
  const subtitle = 'Manage your catalog';
  const createLabel = 'Create';
  const editLabel = 'Edit';
  const totalLabel = 'Items';

  const hasError = Boolean(productsRes.error || totalRes.error);
  const errorMessage =
    productsRes.error?.message || totalRes.error?.message || 'Failed to load data';

  const products = (productsRes.data || []).map((row) => {
    const mapped = mapProduct(row);
    const shop = (row.shop as unknown as { id: number; name: string } | null) || null;
    return {
      id: mapped.id,
      title: mapped.title,
      price: mapped.price,
      description: mapped.description,
      image_url: mapped.imageUrl,
      shop,
    };
  }) as Array<{
    id: number;
    title: string;
    price: number;
    description?: string | null;
    image_url?: string;
    shop: { id: number; name: string } | null;
  }>;

  const totalCount = totalRes.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

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
      {/* Header / Summary */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: 20,
          padding: '28px 28px',
          display: 'grid',
          gap: 20,
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
              letterSpacing: 1.2,
              fontSize: 20,
            }}
          >
            📦
          </div>

          <div style={{ flex: '1 1 320px' }}>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: '#059669' }}>
              {listLabel}
            </h1>
            <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: 15 }}>{subtitle}</p>
          </div>

          <Link
            className="btn"
            href={{ pathname: '/admin/products/new' }}
            style={{
              padding: '12px 24px',
              borderRadius: 12,
              background: '#10b981',
              color: 'white',
              fontWeight: 600,
              border: 'none',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            + {createLabel}
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
          }}
        >
          <div
            style={{
              background: '#f3f4f6',
              borderRadius: 16,
              padding: '18px 20px',
              border: '1px solid #e5e7eb',
            }}
          >
            <div
              style={{
                fontSize: 13,
                letterSpacing: 0.5,
                color: '#6b7280',
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              {totalLabel}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>
              {totalCount || products.length}
            </div>
          </div>

          <div
            style={{
              background: '#f3f4f6',
              borderRadius: 16,
              padding: '18px 20px',
              border: '1px solid #e5e7eb',
            }}
          >
            <div
              style={{
                fontSize: 13,
                letterSpacing: 0.5,
                color: '#6b7280',
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              {t.pagination?.page
                ? t.pagination.page(page, totalPages)
                : `Page ${page} of ${totalPages}`}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#059669' }}>
              {page} / {totalPages}
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {hasError && (
        <div
          className="card"
          style={{
            marginTop: 24,
            borderRadius: 16,
            border: '1px solid rgba(239, 68, 68, 0.2)',
            background: 'rgba(239, 68, 68, 0.05)',
            padding: 18,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6, color: '#dc2626' }}>
            {'Something went wrong'}
          </div>
          <div style={{ color: '#6b7280', fontSize: 14 }}>{errorMessage}</div>
        </div>
      )}

      {/* List Card */}
      <div
        className="card"
        style={{
          marginTop: 24,
          borderRadius: 18,
          overflow: 'hidden',
          border: '1px solid rgba(16, 185, 129, 0.1)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
        }}
      >
        {products.length === 0 ? (
          <div style={{ padding: 40, background: 'white', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#059669' }}>
              {'No items yet'}
            </div>
            <div style={{ color: '#6b7280', marginBottom: 24, fontSize: 14 }}>
              {'Create your first product to start selling.'}
            </div>
            <Link
              className="btn"
              href="/admin/products/new"
              style={{
                padding: '12px 28px',
                borderRadius: 12,
                background: '#10b981',
                color: 'white',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              + {createLabel}
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
              padding: 24,
              background: '#f9fafb',
            }}
          >
            {products.map((p) => (
              <div
                key={p.id}
                style={{
                  background: 'white',
                  borderRadius: 12,
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                {/* Image Container */}
                <div
                  style={{
                    width: '100%',
                    height: 200,
                    background: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 48,
                    color: '#d1d5db',
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image_url}
                      alt={p.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    '📦'
                  )}
                </div>

                {/* Card Body */}
                <div
                  style={{
                    padding: '14px 14px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  {/* Shop Info */}
                  <div
                    style={{
                      fontSize: 11,
                      color: '#9ca3af',
                      fontWeight: 500,
                    }}
                  >
                    #{p.id} · {p.shop?.name ?? 'No shop'}
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#1f2937',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {p.title}
                  </h3>

                  {/* Price */}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: '#10b981',
                      }}
                    >
                      {formatVND(p.price)}
                    </div>
                  </div>
                </div>

                {/* Button */}
                <div
                  style={{
                    padding: '10px 14px',
                    borderTop: '1px solid #e5e7eb',
                  }}
                >
                  <Link
                    className="btn-outline"
                    href={`/admin/products/${p.id}` as Route}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #10b981',
                      color: '#10b981',
                      fontWeight: 600,
                      background: 'transparent',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      display: 'block',
                      textAlign: 'center',
                      fontSize: 13,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {editLabel}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div
        className="section"
        style={{
          display: 'flex',
          gap: 12,
          marginTop: 24,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Link
          className="btn-outline"
          href={`?page=${prevPage}` as Route}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            border: prevDisabled ? '1.5px solid #d1d5db' : '1.5px solid rgba(16, 185, 129, 0.3)',
            color: prevDisabled ? '#9ca3af' : '#059669',
            fontWeight: 600,
            background: 'transparent',
            cursor: prevDisabled ? 'not-allowed' : 'pointer',
            textDecoration: 'none',
            display: 'inline-block',
            opacity: prevDisabled ? 0.5 : 1,
            transition: 'all 0.2s ease',
            pointerEvents: prevDisabled ? 'none' : 'auto',
          }}
        >
          {t.prev ?? '← Prev'}
        </Link>

        <span
          className="muted"
          style={{
            color: '#6b7280',
            fontSize: 14,
            fontWeight: 500,
            minWidth: '140px',
            textAlign: 'center',
          }}
        >
          {t.pagination?.page
            ? t.pagination.page(page, totalPages)
            : `Page ${page} of ${totalPages}`}
        </span>

        <Link
          className="btn-outline"
          href={`?page=${nextPage}` as Route}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            border: nextDisabled ? '1.5px solid #d1d5db' : '1.5px solid rgba(16, 185, 129, 0.3)',
            color: nextDisabled ? '#9ca3af' : '#059669',
            fontWeight: 600,
            background: 'transparent',
            cursor: nextDisabled ? 'not-allowed' : 'pointer',
            textDecoration: 'none',
            display: 'inline-block',
            opacity: nextDisabled ? 0.5 : 1,
            transition: 'all 0.2s ease',
            pointerEvents: nextDisabled ? 'none' : 'auto',
          }}
        >
          {t.next ?? 'Next →'}
        </Link>
      </div>
    </div>
  );
}
