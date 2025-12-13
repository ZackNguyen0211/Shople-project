"use client";
import { useTransition, useState } from 'react';

export default function StatusSelect({ id, value, lang = 'vi' }: { id: number; value: string; lang?: 'vi' | 'en' }) {
  const [pending, start] = useTransition();
  const [status, setStatus] = useState(value);
  const [msg, setMsg] = useState<string | null>(null);

  async function update(next: string) {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) {
      setStatus(next);
      setMsg(lang === 'en' ? 'Updated' : 'Đã cập nhật');
      setTimeout(() => setMsg(null), 1000);
    } else {
      setMsg(lang === 'en' ? 'Failed' : 'Thất bại');
      setTimeout(() => setMsg(null), 1000);
    }
  }

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <select className="input" value={status} disabled={pending} onChange={(e) => start(() => update(e.target.value))}>
        {['PENDING', 'PAID', 'SHIPPED', 'CANCELLED'].map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {msg ? <span className="muted" style={{ fontSize: 12 }}>{msg}</span> : null}
    </div>
  );
}
