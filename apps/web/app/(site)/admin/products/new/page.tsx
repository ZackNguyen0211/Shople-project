"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getClientDict } from '../../../../lib/i18n-client';

type Shop = { id: number; name: string };

export default function CreateProductPage() {
  const router = useRouter();
  const t = getClientDict();
  const [shops, setShops] = useState<Shop[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/shops', { cache: 'no-store' });
      if (res.ok) setShops(await res.json());
    })();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: String(fd.get('title') || ''),
      price: Number(fd.get('price') || 0),
      description: String(fd.get('description') || ''),
      shopId: Number(fd.get('shopId') || 0),
      imageUrls: String(fd.get('imageUrls') || '')
        .split(/\n|,/)
        .map((s) => s.trim())
        .filter(Boolean),
    };
    if (!payload.title || !Number.isFinite(payload.price) || !Number.isFinite(payload.shopId)) {
      setMsg(t.auth.quickSecure);
      return;
    }
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      router.push('/admin/products');
    } else {
      setMsg(t.messages.failed);
      setTimeout(() => setMsg(null), 1200);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 720 }}>
      <h1 className="page-title">{t.adminButtons.create || 'Create product'}</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        {msg ? <p className="muted" style={{ color: '#b91c1c' }}>{msg}</p> : null}
        <label style={{ display: 'grid', gap: 4 }}>
          <span>{t.forms.title}</span>
          <input className="input" name="title" required />
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>{t.forms.price}</span>
          <input className="input" name="price" type="number" min={0} step={1} required />
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>{t.forms.description}</span>
          <textarea className="input" name="description" />
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>Image URLs (mỗi dòng một link)</span>
          <textarea className="input" name="imageUrls" placeholder="https://...\nhttps://..." />
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>{t.forms.shop}</span>
          <select className="input" name="shopId" required>
            <option value="">{t.forms.selectShop}</option>
            {shops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" type="submit">{t.adminButtons.create}</button>
          <button className="btn-outline" type="button" onClick={() => router.push('/admin/products')}>{t.adminButtons.cancel}</button>
        </div>
      </form>
    </div>
  );
}
