'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export default function CheckoutPayNow({
  defaultEmail,
  redirectUrl,
  fieldIds,
  children,
}: {
  defaultEmail: string;
  orderId: string;
  total: number;
  itemCount: number;
  redirectUrl: string;
  fieldIds?: {
    email?: string;
    phone?: string;
    fullName?: string;
    address?: string;
    city?: string;
    postalCode?: string;
  };
  children: ReactNode;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(defaultEmail);
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const disabled = status === 'sending';
  const buttonLabel = useMemo(() => {
    if (status === 'sending') return 'Đang xử lý...';
    if (status === 'error') return 'Thử lại';
    return children;
  }, [status, children]);

  const handleSubmit = async () => {
    const readValue = (id?: string) => {
      if (!id) return '';
      const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null;
      return el?.value?.trim?.() ?? '';
    };

    const contactEmail = readValue(fieldIds?.email) || email.trim();
    const phone = readValue(fieldIds?.phone);
    const fullName = readValue(fieldIds?.fullName);
    const address = readValue(fieldIds?.address);
    const city = readValue(fieldIds?.city);
    const postalCode = readValue(fieldIds?.postalCode);

    if (!contactEmail) {
      setStatus('error');
      setMessage('Vui lòng nhập email nhận hóa đơn');
      return;
    }

    setStatus('sending');
    setMessage('');
    const url = new URL(redirectUrl, window.location.origin);
    url.searchParams.set('email', contactEmail);
    if (fullName) url.searchParams.set('name', fullName);
    if (phone) url.searchParams.set('phone', phone);
    if (address) url.searchParams.set('address', address);
    if (city) url.searchParams.set('city', city);
    if (postalCode) url.searchParams.set('postalCode', postalCode);

    router.push(url.pathname + url.search);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        style={{
          padding: '12px 12px',
          borderRadius: 10,
          border: '1.5px solid #e5e7eb',
          background: '#f9fafb',
        }}
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={disabled}
        style={{
          display: 'block',
          textAlign: 'center',
          padding: '14px 18px',
          borderRadius: 12,
          border: 'none',
          background: '#10b981',
          color: 'white',
          fontWeight: 700,
          fontSize: 15,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.7 : 1,
        }}
      >
        {buttonLabel}
      </button>
      {message ? <span style={{ fontSize: 12, color: '#dc2626' }}>{message}</span> : null}
      <span style={{ fontSize: 11, color: '#9ca3af' }}>
        Hóa đơn sẽ lưu trên Supabase, email để hiển thị trên hóa đơn/PDF.
      </span>
    </div>
  );
}
