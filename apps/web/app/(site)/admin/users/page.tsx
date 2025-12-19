import Link from 'next/link';
import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '../../../../lib/auth';
import { getDict, getLang } from '../../../../lib/i18n';
import { getDb, mapUser } from '../../../../lib/db';

export default async function AdminUsersPage({
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
  const [usersRes, totalRes] = await Promise.all([
    supabase
      .from('users')
      .select('id,email,name,role,created_at')
      .order('id', { ascending: true })
      .range(skip, skip + pageSize - 1),
    supabase.from('users').select('id', { count: 'exact', head: true }),
  ]);
  const users = (usersRes.data || []).map(mapUser);
  const totalPages = Math.max(1, Math.ceil((totalRes.count || 0) / pageSize));
  const totalCount = totalRes.count ?? 0;

  const t = getDict(getLang());
  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return { bg: '#fee2e2', text: '#dc2626' };
      case 'SELLER':
        return { bg: '#dbeafe', text: '#2563eb' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280' };
    }
  };

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
            👥
          </div>

          <div style={{ flex: '1 1 320px' }}>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: '#059669' }}>
              {t.adminPage.users}
            </h1>
            <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: 15 }}>
              Manage platform users
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
              Total Users
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
        {users.length === 0 ? (
          <div style={{ padding: 40, background: 'white', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#059669' }}>
              No users yet
            </div>
            <div style={{ color: '#6b7280', marginBottom: 24, fontSize: 14 }}>
              No users have registered on the platform yet.
            </div>
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
            {users.map((u) => {
              const roleColors = getRoleBadgeColor(u.role);
              return (
                <div
                  key={u.id}
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
                        #{u.id}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: roleColors.text,
                          background: roleColors.bg,
                          padding: '4px 8px',
                          borderRadius: 6,
                        }}
                      >
                        {u.role}
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
                    {/* User Name */}
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
                        {u.name}
                      </h3>
                    </div>

                    {/* User Email */}
                    <div
                      style={{
                        fontSize: 13,
                        color: '#6b7280',
                        wordBreak: 'break-all',
                      }}
                    >
                      {u.email}
                    </div>

                    {/* Created Date */}
                    <div
                      style={{
                        marginTop: 'auto',
                        paddingTop: 12,
                        borderTop: '1px solid #e5e7eb',
                      }}
                    >
                      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Joined</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
