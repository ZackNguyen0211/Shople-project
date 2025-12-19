import Link from 'next/link';
import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '../../../../lib/auth';
import { getDict, getLang } from '../../../../lib/i18n';
import { getDb } from '../../../../lib/db';

export default async function AdminShopsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const user = getCurrentUser();
  if (!user || user.role !== 'ADMIN') redirect('/');

  const page = Math.max(1, Number(searchParams.page || 1));
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const supabase = getDb();
  const [shopsRes, totalRes] = await Promise.all([
    supabase
      .from('shops')
      .select('id,name,owner:users(id,name,email),products:products(id)')
      .order('id', { ascending: true })
      .range(skip, skip + pageSize - 1),
    supabase.from('shops').select('id', { count: 'exact', head: true }),
  ]);
  const shops = (shopsRes.data || []).map((row) => ({
    id: row.id,
    name: row.name,
    owner: (row.owner as unknown as { id: number; name: string; email: string }) || {
      id: 0,
      name: 'Unknown',
      email: '',
    },
    _count: { products: row.products ? row.products.length : 0 },
  }));
  const totalPages = Math.max(1, Math.ceil((totalRes.count || 0) / pageSize));
  const totalCount = totalRes.count ?? 0;

  const t = getDict(getLang());
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
            🏪
          </div>

          <div style={{ flex: '1 1 320px' }}>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: '#059669' }}>
              {t.adminPage.shops}
            </h1>
            <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: 15 }}>
              Manage all shops on platform
            </p>
          </div>
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
              Total Shops
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>{totalCount}</div>
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

      {/* List Card */}
      <div
        style={{
          marginTop: 24,
          borderRadius: 18,
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        {shops.length === 0 ? (
          <div style={{ padding: 40, background: 'white', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏪</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#059669' }}>
              No shops yet
            </div>
            <div style={{ color: '#6b7280', marginBottom: 24, fontSize: 14 }}>
              No shops have been created on the platform yet.
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 20,
              padding: 24,
              background: '#f9fafb',
            }}
          >
            {shops.map((s) => (
              <div
                key={s.id}
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
                {/* Card Header */}
                <div
                  style={{
                    padding: '16px 16px 12px',
                    borderBottom: '1px solid #e5e7eb',
                    background: '#f3f4f6',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#059669',
                        background: 'rgba(16, 185, 129, 0.1)',
                        padding: '4px 10px',
                        borderRadius: 8,
                      }}
                    >
                      #{s.id}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: '#9ca3af',
                        background: 'rgba(107, 114, 128, 0.1)',
                        padding: '4px 8px',
                        borderRadius: 6,
                      }}
                    >
                      {s._count.products} {s._count.products === 1 ? 'product' : 'products'}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div
                  style={{
                    padding: '16px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  {/* Shop Name */}
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 16,
                        fontWeight: 700,
                        color: '#1f2937',
                        lineHeight: 1.4,
                      }}
                    >
                      {s.name}
                    </h3>
                  </div>

                  {/* Owner Info */}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: 12,
                      borderTop: '1px solid #e5e7eb',
                    }}
                  >
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Owner</div>
                    <div style={{ fontWeight: 600, color: '#1f2937', marginBottom: 2 }}>
                      {s.owner.name}
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af', wordBreak: 'break-all' }}>
                      {s.owner.email}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div
                  style={{
                    padding: '12px 16px',
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    gap: 8,
                  }}
                >
                  <Link
                    className="btn-outline"
                    href={`/admin/shops/${s.id}` as Route}
                    style={{
                      flex: 1,
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
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div
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
            border: prevDisabled ? '1.5px solid #d1d5db' : '1.5px solid #e5e7eb',
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
            border: nextDisabled ? '1.5px solid #d1d5db' : '1.5px solid #e5e7eb',
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
