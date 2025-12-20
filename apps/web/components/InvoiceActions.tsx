'use client';

import { useMemo } from 'react';

type InvoiceItem = {
  title: string;
  quantity: number;
  price: number;
};

export default function InvoiceActions({
  invoice,
}: {
  invoice: {
    orderId: string;
    email: string;
    total: number;
    itemCount: number;
    contactName?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    items: InvoiceItem[];
  };
}) {
  const printableHtml = useMemo(() => {
    const rows = invoice.items
      .map(
        (it) => `
          <tr>
            <td style="padding:6px 8px;border:1px solid #e5e7eb;">${it.title}</td>
            <td style="padding:6px 8px;border:1px solid #e5e7eb; text-align:center;">${it.quantity}</td>
            <td style="padding:6px 8px;border:1px solid #e5e7eb; text-align:right;">${it.price.toLocaleString('vi-VN')} VND</td>
          </tr>
        `
      )
      .join('');

    return `
      <html>
        <head>
          <meta charSet="utf-8" />
          <title>Invoice ${invoice.orderId}</title>
        </head>
        <body style="font-family: Arial, sans-serif; color: #1f2937; padding: 24px;">
          <h2 style="color:#059669;">Hóa đơn thanh toán</h2>
          <p>Mã đơn: <strong>${invoice.orderId}</strong></p>
          <p>Email nhận: <strong>${invoice.email}</strong></p>
          ${invoice.contactName ? `<p>Tên người nhận: <strong>${invoice.contactName}</strong></p>` : ''}
          ${invoice.phone ? `<p>Số điện thoại: <strong>${invoice.phone}</strong></p>` : ''}
          ${invoice.address || invoice.city || invoice.postalCode ? `<p>Địa chỉ giao hàng: <strong>${[invoice.address, invoice.city, invoice.postalCode].filter(Boolean).join(', ')}</strong></p>` : ''}
          <p>Số lượng: <strong>${invoice.itemCount}</strong></p>
          <table style="border-collapse: collapse; width: 100%; margin-top: 12px;">
            <thead>
              <tr>
                <th style="padding:6px 8px;border:1px solid #e5e7eb; text-align:left;">Sản phẩm</th>
                <th style="padding:6px 8px;border:1px solid #e5e7eb; text-align:center;">SL</th>
                <th style="padding:6px 8px;border:1px solid #e5e7eb; text-align:right;">Giá</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <h3 style="margin-top:16px;">Tổng cộng: ${invoice.total.toLocaleString('vi-VN')} VND</h3>
        </body>
      </html>
    `;
  }, [invoice]);

  const handleDownload = () => {
    const blob = new Blob([printableHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      win.onload = () => win.print();
    }
  };

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <button
        type="button"
        onClick={handleDownload}
        style={{
          padding: '10px 14px',
          borderRadius: 10,
          border: '1.5px solid #e5e7eb',
          background: '#10b981',
          color: 'white',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Tải PDF
      </button>
    </div>
  );
}
