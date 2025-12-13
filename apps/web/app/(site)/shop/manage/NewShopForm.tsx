"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewShopForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    setPending(true);
    try {
      const res = await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: n }),
      });
      if (res.ok) {
        setMsg('Tạo shop thành công');
        setName('');
        router.refresh();
      } else {
        setMsg('Tạo shop thất bại');
      }
    } catch {
      setMsg('Tạo shop thất bại');
    } finally {
      setPending(false);
      setTimeout(() => setMsg(null), 1200);
    }
  }

  return (
    <form onSubmit={create} style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
      <input className="input" placeholder="Tên shop" value={name} onChange={(e) => setName(e.target.value)} />
      <button className="btn" type="submit" disabled={pending || !name.trim()}>
        Tạo shop
      </button>
      {msg ? <span className="muted" style={{ fontSize: 12 }}>{msg}</span> : null}
    </form>
  );
}

