"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Shop = { id: number; name: string };

export default function NewProductForm({ shops, lang = 'vi' }: { shops: Shop[]; lang?: 'vi' | 'en' }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get('title') || '').trim();
    const price = Number(fd.get('price') || 0);
    const description = String(fd.get('description') || '');
    const imageUrls = String(fd.get('imageUrls') || '');
    const shopId = Number(fd.get('shopId') || 0);
    if (!title || !Number.isFinite(price) || !Number.isFinite(shopId)) {
      setMsg(lang === 'en' ? 'Please fill all required fields' : 'Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }
    const res = await fetch(`/api/shops/${shopId}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, price, description, imageUrls }),
    });
    if (res.ok) {
      setMsg(lang === 'en' ? 'Product created' : 'Thêm sản phẩm thành công');
      e.currentTarget.reset();
      router.refresh();
      setTimeout(() => setMsg(null), 1200);
    } else {
      setMsg(lang === 'en' ? 'Failed to create product' : 'Thêm sản phẩm thất bại');
      setTimeout(() => setMsg(null), 1200);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
      {msg ? (
        <p className="muted" style={{ color: msg.includes('success') || msg.includes('created') || msg.includes('thành công') ? '#166534' : '#b91c1c' }}>{msg}</p>
      ) : null}
      <label style={{ display: 'grid', gap: 4 }}>
        <span>{lang === 'en' ? 'Title' : 'Tiêu đề'}</span>
        <input className="input" name="title" required />
      </label>
      <label style={{ display: 'grid', gap: 4 }}>
        <span>{lang === 'en' ? 'Price (VND)' : 'Giá (VND)'}</span>
        <input className="input" name="price" type="number" min={0} step={1} required />
      </label>
      <label style={{ display: 'grid', gap: 4 }}>
        <span>{lang === 'en' ? 'Description' : 'Mô tả'}</span>
        <textarea className="input" name="description" />
      </label>
      <label style={{ display: 'grid', gap: 4 }}>
        <span>{lang === 'en' ? 'Image URLs (one per line)' : 'Link ảnh (mỗi dòng một link)'}</span>
        <textarea className="input" name="imageUrls" placeholder={lang === 'en' ? 'https://...\nhttps://...' : 'https://...\nhttps://...'} />
      </label>
      <label style={{ display: 'grid', gap: 4 }}>
        <span>{lang === 'en' ? 'Select Shop' : 'Chọn Shop'}</span>
        <select className="input" name="shopId" required>
          <option value="">{lang === 'en' ? '-- Select shop --' : '-- Chọn shop --'}</option>
          {shops.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn" type="submit">{lang === 'en' ? 'Add product' : 'Thêm sản phẩm'}</button>
      </div>
    </form>
  );
}
