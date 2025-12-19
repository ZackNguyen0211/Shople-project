'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getClientDict } from '../../../../../../lib/i18n-client';
import ImageUploader from '../../../../../../components/ImageUploader';

type Shop = { id: number; name: string };
type Product = {
  id: number;
  title: string;
  price: number;
  description?: string | null;
  shopId: number;
  images?: { url: string; sortOrder: number }[];
};

export default function ShopEditProductPage() {
  const router = useRouter();
  const params = useParams();
  const t = getClientDict();
  const id = Number(params?.id);
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<Shop[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const [pRes, sRes] = await Promise.all([fetch(`/api/products/${id}`), fetch(`/api/shops`)]);
      if (pRes.ok) {
        const data = (await pRes.json()) as Product;
        setProduct(data);
        const sorted = (data.images || [])
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((i) => i.url);
        setImages(sorted);
      }
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
      shopId: product.shopId,
      imageUrls: images,
    };
    const res = await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setMsg(t.messages.saved);
      const goBack = confirm('Đã lưu thành công! Bạn có muốn quay lại trang trước không?');
      if (goBack) {
        router.back();
      } else {
        setTimeout(() => setMsg(null), 1000);
      }
    } else {
      setMsg(t.messages.failed);
      setTimeout(() => setMsg(null), 1000);
    }
  }

  async function remove() {
    if (!confirm(t.messages.deleteConfirm)) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) router.push('/shop/manage');
  }

  if (loading || !product) {
    return (
      <div className="card" style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: 18,
            }}
          >
            📦
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
            {t.adminButtons.edit} Product
          </h1>
        </div>
        <p className="muted">{t.home.loading}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: 18,
            }}
          >
            📦
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
            {t.adminButtons.edit} Product #{product.id}
          </h1>
        </div>
        <p className="muted" style={{ marginLeft: 52 }}>
          Chỉnh sửa thông tin sản phẩm của bạn
        </p>
      </div>

      {/* Form Card */}
      <div className="card" style={{ padding: 20 }}>
        <form onSubmit={save} style={{ display: 'grid', gap: 20 }}>
          {/* Title Section */}
          <div>
            <label style={{ display: 'grid', gap: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{t.forms.title}</span>
              <input
                className="input"
                name="title"
                defaultValue={product.title}
                required
                placeholder="Tên sản phẩm"
                style={{ padding: '12px 14px', borderRadius: 8 }}
              />
            </label>
          </div>

          {/* Price Section */}
          <div>
            <label style={{ display: 'grid', gap: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{t.forms.price}</span>
              <input
                className="input"
                name="price"
                type="number"
                min={0}
                step={1}
                defaultValue={product.price}
                required
                placeholder="0"
                style={{ padding: '12px 14px', borderRadius: 8 }}
              />
            </label>
          </div>

          {/* Description Section */}
          <div>
            <label style={{ display: 'grid', gap: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{t.forms.description}</span>
              <textarea
                className="input"
                name="description"
                defaultValue={product.description || ''}
                placeholder="Mô tả sản phẩm"
                style={{
                  padding: '12px 14px',
                  borderRadius: 8,
                  minHeight: 120,
                  fontFamily: 'inherit',
                }}
              />
            </label>
          </div>

          {/* Images Section */}
          <div>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Hình ảnh</span>
            </div>
            <ImageUploader label="" initialUrls={images} onChange={setImages} />
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto auto',
              gap: 12,
              alignItems: 'center',
              paddingTop: 12,
              borderTop: '1px solid #e2e8f0',
              marginTop: 8,
            }}
          >
            {msg && (
              <span
                className={msg === t.messages.saved ? 'muted' : 'muted'}
                style={{
                  fontSize: 13,
                  color: msg === t.messages.saved ? '#16a34a' : '#dc2626',
                  fontWeight: 500,
                }}
              >
                ✓ {msg}
              </span>
            )}
            <button className="btn" type="submit" style={{ padding: '10px 24px' }}>
              {t.adminButtons.save}
            </button>
            <button
              className="btn-outline"
              type="button"
              onClick={remove}
              style={{ padding: '10px 24px' }}
            >
              {t.adminButtons.delete}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
