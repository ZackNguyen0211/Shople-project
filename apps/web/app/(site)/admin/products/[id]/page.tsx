"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getClientDict } from '../../../../../lib/i18n-client';

type Shop = { id: number; name: string };
type Product = { id: number; title: string; price: number; description?: string | null; shopId: number; images?: { url: string; sortOrder: number }[] };

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const t = getClientDict();
  const id = Number(params?.id);
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<Shop[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [pRes, sRes] = await Promise.all([
        fetch(`/api/products/${id}`),
        fetch(`/api/shops`),
      ]);
      if (pRes.ok) setProduct(await pRes.json());
      if (sRes.ok) setShops(await sRes.json());
      setLoading(false);
    }
    if (Number.isFinite(id)) load();
  }, [id]);

  async function save(e: React.FormEvent<HTMLFormElement>) {
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
    const res = await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setMsg(t.messages.saved);
      setTimeout(() => setMsg(null), 1000);
    } else {
      setMsg(t.messages.failed);
      setTimeout(() => setMsg(null), 1000);
    }
  }

  async function remove() {
    if (!confirm(t.messages.deleteConfirm)) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) router.push('/admin/products');
  }

  if (loading || !product) {
    return (
      <div className="card" style={{ maxWidth: 720 }}>
        <h1 className="page-title">{t.adminButtons.edit} Product</h1>
        <p className="muted">{t.home.loading}</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 720 }}>
      <h1 className="page-title">{t.adminButtons.edit} Product #{product.id}</h1>
      <form onSubmit={save} style={{ display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>{t.forms.title}</span>
          <input className="input" name="title" defaultValue={product.title} required />
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>Image URLs (mỗi dòng một link)</span>
          <textarea className="input" name="imageUrls" defaultValue={(product.images || []).sort((a,b)=>a.sortOrder-b.sortOrder).map((i)=>i.url).join('\n')} />
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>{t.forms.price}</span>
          <input className="input" name="price" type="number" min={0} step={1} defaultValue={product.price} required />
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>{t.forms.description}</span>
          <textarea className="input" name="description" defaultValue={product.description || ''} />
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>{t.forms.shop}</span>
          <select className="input" name="shopId" defaultValue={product.shopId}>
            {shops.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" type="submit">{t.adminButtons.save}</button>
          <button className="btn-outline" type="button" onClick={remove}>{t.adminButtons.delete}</button>
          {msg ? <span className="muted" style={{ fontSize: 12 }}>{msg}</span> : null}
        </div>
      </form>
    </div>
  );
}
