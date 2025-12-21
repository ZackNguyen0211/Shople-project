'use client';

import { formatVND } from '../../../lib/format';

interface Order {
  id: number;
  status: string;
  created_at: string;
  items: { price: number; quantity: number }[];
  total_cents: number;
}

interface AdminDashboardProps {
  usersCount: number;
  shopsCount: number;
  productsCount: number;
  orders: Order[];
  revenueVnd: number;
  translations: {
    adminPage: {
      title: string;
      revenue: string;
      users: string;
      shops: string;
      products: string;
      recentOrders: string;
      noRecent: string;
    };
    adminButtons: {
      users: string;
      shops: string;
      products: string;
      orders: string;
    };
    tables: {
      id: string;
      items: string;
      total: string;
      status: string;
    };
  };
  lang: string;
}

export default function AdminDashboard({
  usersCount,
  shopsCount,
  productsCount,
  orders,
  revenueVnd,
  translations,
  lang,
}: AdminDashboardProps) {
  const t = translations;
  // Calculate statistics
  // Note: All invoices are PAID (created only after successful payment)
  const totalOrders = orders.length;
  const completedOrders = orders.length; // All invoices = completed orders
  const averageOrderValue = totalOrders > 0 ? revenueVnd / totalOrders : 0;

  // Group orders by date for chart
  const ordersByDate: Record<string, number> = {};
  orders.forEach((order) => {
    const date = new Date(order.created_at).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
    });
    ordersByDate[date] = (ordersByDate[date] || 0) + 1;
  });

  const chartData = Object.entries(ordersByDate)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([date, count]) => ({ date, count }));

  // Status breakdown
  // All invoices are completed/paid
  const statusBreakdown = [{ status: 'PAID', count: completedOrders, color: '#16a34a' }];

  return (
    <div style={{ padding: 0 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 8px 0', color: '#1f2937' }}>
          {t.adminPage.title}
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          {lang === 'en'
            ? 'Welcome back! Here is your business overview.'
            : 'Chào mừng bạn trở lại! Đây là tổng quan kinh doanh của bạn.'}
        </p>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        {/* Revenue Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #2f6d54 0%, #1e4d3a 100%)',
            borderRadius: 12,
            padding: 24,
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>{t.adminPage.revenue}</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
            {formatVND(revenueVnd)}
          </div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            {completedOrders} {lang === 'en' ? 'completed orders' : 'đơn hàng hoàn thành'}
          </div>
        </div>

        {/* Users Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #52a373 0%, #2f6d54 100%)',
            borderRadius: 12,
            padding: 24,
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>{t.adminPage.users}</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>{usersCount}</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            {lang === 'en' ? 'Total registered users' : 'Tổng người dùng đã đăng ký'}
          </div>
        </div>

        {/* Shops Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #3a8068 0%, #2f6d54 100%)',
            borderRadius: 12,
            padding: 24,
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>{t.adminPage.shops}</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>{shopsCount}</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            {lang === 'en' ? 'Active merchants' : 'Người bán hàng hoạt động'}
          </div>
        </div>

        {/* Products Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #5db876 0%, #3a8068 100%)',
            borderRadius: 12,
            padding: 24,
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>{t.adminPage.products}</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>{productsCount}</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            {lang === 'en' ? 'Listed products' : 'Sản phẩm được liệt kê'}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div style={{ background: '#f3f4f6', borderRadius: 12, padding: 20 }}>
          <div
            style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase' }}
          >
            {lang === 'en' ? 'Total Orders' : 'Tổng Đơn Hàng'}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1f2937' }}>{totalOrders}</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
            {lang === 'en' ? '📊 All time' : '📊 Mọi lúc'}
          </div>
        </div>

        <div style={{ background: '#f3f4f6', borderRadius: 12, padding: 20 }}>
          <div
            style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase' }}
          >
            {lang === 'en' ? 'Completed' : 'Hoàn Thành'}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#16a34a' }}>{completedOrders}</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
            ✓ {lang === 'en' ? 'All invoices are paid' : 'Tất cả hóa đơn đã thanh toán'}
          </div>
        </div>

        <div style={{ background: '#f3f4f6', borderRadius: 12, padding: 20 }}>
          <div
            style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase' }}
          >
            {lang === 'en' ? 'Success Rate' : 'Tỷ Lệ Thành Công'}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#16a34a' }}>100%</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
            📊 {lang === 'en' ? 'Payment completion' : 'Hoàn thành thanh toán'}
          </div>
        </div>

        <div style={{ background: '#f3f4f6', borderRadius: 12, padding: 20 }}>
          <div
            style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase' }}
          >
            {lang === 'en' ? 'Avg Order' : 'Trung Bình'}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#667eea' }}>
            {formatVND(averageOrderValue)}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
            💰 {lang === 'en' ? 'Per order' : 'Mỗi đơn'}
          </div>
        </div>
      </div>

      {/* Order Trends Chart */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            background: 'white',
            borderRadius: 12,
            padding: 24,
            border: '1px solid #e5e7eb',
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#1f2937' }}>
            📈 {lang === 'en' ? 'Order Trends' : 'Xu Hướng Đơn Hàng'}
          </h2>

          {chartData.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 8,
                  minHeight: 200,
                  minWidth: '100%',
                  paddingBottom: 16,
                }}
              >
                {chartData.map((item, idx) => {
                  const maxCount = Math.max(...chartData.map((d) => d.count), 1);
                  const height = (item.count / maxCount) * 150;
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        flex: 1,
                        minWidth: 40,
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: `${height}px`,
                          background: 'linear-gradient(180deg, #2f6d54 0%, #1e4d3a 100%)',
                          borderRadius: '4px 4px 0 0',
                          marginBottom: 8,
                          minHeight: 4,
                        }}
                        title={`${item.date}: ${item.count} orders`}
                      />
                      <div style={{ fontSize: 10, color: '#6b7280', textAlign: 'center' }}>
                        {item.date}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p style={{ color: '#9ca3af', textAlign: 'center', margin: 0 }}>
              {lang === 'en' ? 'No order data yet' : 'Chưa có dữ liệu đơn hàng'}
            </p>
          )}
        </div>
      </div>

      {/* Status Breakdown */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            background: 'white',
            borderRadius: 12,
            padding: 24,
            border: '1px solid #e5e7eb',
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#1f2937' }}>
            📊 {lang === 'en' ? 'Invoice Summary' : 'Tóm Tắt Hóa Đơn'}
          </h2>

          <div
            style={{
              display: 'flex',
              gap: 32,
              flexWrap: 'wrap',
            }}
          >
            {statusBreakdown.map((item) => {
              const percentage =
                totalOrders > 0 ? ((item.count / totalOrders) * 100).toFixed(1) : 0;
              return (
                <div key={item.status} style={{ flex: '1 1 200px', minWidth: 200 }}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>
                      {lang === 'en' ? '✓ Completed' : '✓ Hoàn Thành'}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: item.color }}>
                      {item.count}
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#e5e7eb',
                      borderRadius: 8,
                      height: 8,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        background: item.color,
                        height: '100%',
                        width: `${percentage}%`,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>

                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
                    {percentage}% {lang === 'en' ? 'of all invoices' : 'của tất cả hóa đơn'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div
        style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          border: '1px solid #e5e7eb',
          overflowX: 'auto',
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#1f2937' }}>
          📋 {t.adminPage.recentOrders}
        </h2>

        {orders.length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', margin: 0 }}>{t.adminPage.noRecent}</p>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th
                  style={{
                    padding: '12px 0',
                    textAlign: 'left',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                  }}
                >
                  {t.tables.id}
                </th>
                <th
                  style={{
                    padding: '12px 0',
                    textAlign: 'left',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                  }}
                >
                  {lang === 'en' ? 'Date' : 'Ngày'}
                </th>
                <th
                  style={{
                    padding: '12px 0',
                    textAlign: 'left',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                  }}
                >
                  {t.tables.items}
                </th>
                <th
                  style={{
                    padding: '12px 0',
                    textAlign: 'right',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                  }}
                >
                  {t.tables.total}
                </th>
                <th
                  style={{
                    padding: '12px 0',
                    textAlign: 'center',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                  }}
                >
                  {t.tables.status}
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const itemCount = order.items?.length || 0;
                // Use total_cents directly from invoice data (already calculated)
                const total = order.total_cents || 0;
                const date = new Date(order.created_at).toLocaleDateString(
                  lang === 'en' ? 'en-US' : 'vi-VN'
                );
                const statusColor = order.status === 'PAID' ? '#16a34a' : '#f59e0b';
                const statusText =
                  order.status === 'PAID'
                    ? lang === 'en'
                      ? 'Completed'
                      : 'Hoàn Thành'
                    : lang === 'en'
                      ? 'Pending'
                      : 'Đang Chờ';

                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '16px 0', color: '#374151', fontWeight: 500 }}>
                      #{order.id}
                    </td>
                    <td style={{ padding: '16px 0', color: '#6b7280', fontSize: 14 }}>{date}</td>
                    <td style={{ padding: '16px 0', color: '#6b7280', fontSize: 14 }}>
                      {itemCount}
                    </td>
                    <td
                      style={{
                        padding: '16px 0',
                        textAlign: 'right',
                        color: '#374151',
                        fontWeight: 600,
                      }}
                    >
                      {formatVND(total)}
                    </td>
                    <td style={{ padding: '16px 0', textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          paddingLeft: 8,
                          paddingRight: 8,
                          paddingTop: 4,
                          paddingBottom: 4,
                          borderRadius: 6,
                          background: `${statusColor}20`,
                          color: statusColor,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {order.status === 'PAID' ? '✓' : '⏱'} {statusText}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
