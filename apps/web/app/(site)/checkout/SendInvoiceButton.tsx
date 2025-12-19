'use client';

import { useState } from 'react';

export default function SendInvoiceButton({
  email,
  orderId,
  total,
  itemCount,
}: {
  email: string;
  orderId: string;
  total: number;
  itemCount: number;
}) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  async function sendInvoice() {
    try {
      setStatus('sending');
      setMessage('');
      const res = await fetch('/api/checkout/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, orderId, total, itemCount }),
      });
      if (!res.ok) {
        throw new Error('Failed to send invoice');
      }
      const data = await res.json();
      setStatus('sent');
      setMessage(data.message || 'Hóa đơn đã được gửi (giả lập)');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('Gửi hóa đơn thất bại, vui lòng thử lại.');
    }
  }

  const isSending = status === 'sending';
  const isSent = status === 'sent';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
      <button
        type="button"
        onClick={sendInvoice}
        disabled={isSending || isSent}
        style={{
          padding: '10px 14px',
          borderRadius: 10,
          border: '1.5px solid #e5e7eb',
          background: isSent ? '#ecfdf3' : '#10b981',
          color: isSent ? '#059669' : 'white',
          fontWeight: 700,
          cursor: isSending || isSent ? 'not-allowed' : 'pointer',
          minWidth: 180,
        }}
      >
        {isSent ? 'Đã gửi hóa đơn' : isSending ? 'Đang gửi...' : 'Gửi hóa đơn về email'}
      </button>
      {message ? (
        <span style={{ fontSize: 12, color: isSent ? '#059669' : '#dc2626' }}>{message}</span>
      ) : null}
      <span style={{ fontSize: 11, color: '#9ca3af' }}>
        (Giả lập: hóa đơn sẽ không được gửi thật)
      </span>
    </div>
  );
}
