'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from '../../../../components/ImageUploader';

type Shop = { id: number; name: string };

export default function NewProductForm({
  shops,
  lang = 'vi',
}: {
  shops: Shop[];
  lang?: 'vi' | 'en';
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [uploadKey, setUploadKey] = useState(0);
  const defaultShopId = shops.length === 1 ? shops[0].id : shops[0]?.id || 0;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get('title') || '').trim();
    const price = Number(fd.get('price') || 0);
    const description = String(fd.get('description') || '');
    const shopId = shops.length === 1 ? defaultShopId : Number(fd.get('shopId') || 0);
    if (!title || !Number.isFinite(price) || !Number.isFinite(shopId)) {
      setMsg(
        lang === 'en'
          ? 'Please fill all required fields'
          : 'Vui lòng điền đầy đủ các trường bắt buộc'
      );
      return;
    }
    const res = await fetch(`/api/shops/${shopId}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, price, description, imageUrls: images }),
    });
    if (res.ok) {
      setMsg(lang === 'en' ? 'Product created' : 'Thêm sản phẩm thành công');
      if (formRef.current) {
        formRef.current.reset();
      }
      setImages([]);
      setUploadKey((prev) => prev + 1);
      router.refresh();
      setTimeout(() => setMsg(null), 1200);
    } else {
      setMsg(lang === 'en' ? 'Failed to create product' : 'Thêm sản phẩm thất bại');
      setTimeout(() => setMsg(null), 1200);
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
      {msg ? (
        <p
          className="muted"
          style={{
            color:
              msg.includes('success') || msg.includes('created') || msg.includes('thành công')
                ? '#166534'
                : '#b91c1c',
          }}
        >
          {msg}
        </p>
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
      <ImageUploader
        key={uploadKey}
        label={lang === 'en' ? 'Images' : 'Ảnh sản phẩm'}
        initialUrls={[]}
      />
      {shops.length > 1 && (
        <label style={{ display: 'grid', gap: 4 }}>
          <span>{lang === 'en' ? 'Select Shop' : 'Chọn Shop'}</span>
          <select className="input" name="shopId" defaultValue={defaultShopId} required>
            {shops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {shops.length === 1 && (
        <div style={{ padding: '12px 14px', background: '#f1f5f9', borderRadius: 8, fontSize: 14 }}>
          <span style={{ fontWeight: 500 }}>{lang === 'en' ? 'Shop: ' : 'Shop: '}</span>
          <span>{shops[0].name}</span>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn" type="submit">
          {lang === 'en' ? 'Add product' : 'Thêm sản phẩm'}
        </button>
      </div>
    </form>
  );
}
