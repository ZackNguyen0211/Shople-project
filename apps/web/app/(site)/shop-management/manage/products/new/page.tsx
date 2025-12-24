'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader, { ImageUploaderRef } from '../../../../../../components/ImageUploader';
import { getClientDict } from '../../../../../../lib/i18n-client';

type Shop = { id: number; name: string };

type ShopsResponse = Shop[];

export default function NewProductPage() {
  const router = useRouter();
  const t = getClientDict();
  const formRef = useRef<HTMLFormElement>(null);
  const imageUploaderRef = useRef<ImageUploaderRef>(null);
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<Shop[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    async function loadShops() {
      try {
        const res = await fetch('/api/shops');
        if (res.ok) {
          const data = (await res.json()) as ShopsResponse;
          const ownerShops = Array.isArray(data) ? data : [];
          setShops(ownerShops);
        } else {
          setMsg('Không tải được shop. Vui lòng thử lại.');
        }
      } finally {
        setLoading(false);
      }
    }
    loadShops();
  }, []);

  const currentShopId = useMemo(() => (shops.length ? shops[0].id : 0), [shops]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitLoading) return;

    const fd = new FormData(e.currentTarget);
    const title = String(fd.get('title') || '').trim();
    const price = Number(fd.get('price') || 0);
    const description = String(fd.get('description') || '');
    const shopId = currentShopId;

    const imageUrlsForSubmit = imageUploaderRef.current?.getUploadedUrls() || [];

    if (!title || !Number.isFinite(price) || !Number.isFinite(shopId) || shopId <= 0) {
      setMsg(t.messages.failed || 'Vui lòng điền đầy đủ thông tin');
      setTimeout(() => setMsg(null), 1200);
      return;
    }

    setSubmitLoading(true);
    const res = await fetch(`/api/shops/${shopId}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, price, description, imageUrls: imageUrlsForSubmit }),
    });

    if (res.ok) {
      setMsg(t.messages.saved || 'Thêm sản phẩm thành công');
      if (formRef.current) formRef.current.reset();
      const goBack = confirm('Đã tạo thành công! Bạn có muốn quay lại trang quản lý shop?');
      if (goBack) {
        router.refresh();
        await new Promise((resolve) => setTimeout(resolve, 100));
        router.push('/shop-management/manage');
      } else {
        setTimeout(() => setMsg(null), 1200);
      }
    } else {
      setMsg(t.messages.failed || 'Thêm sản phẩm thất bại');
      setTimeout(() => setMsg(null), 1200);
    }
    setSubmitLoading(false);
  }

  if (loading) {
    return (
      <div className="card" style={{ maxWidth: 720, margin: '0 auto' }}>
        <p className="muted">Đang tải shop...</p>
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="card" style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 className="page-title">Thêm sản phẩm</h1>
        <p className="muted">Bạn chưa có shop nào để thêm sản phẩm.</p>
        <button
          className="btn"
          type="button"
          onClick={() => router.push('/shop-management/manage')}
        >
          Quay lại quản lý shop
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
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
          ➕
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Thêm sản phẩm mới</h1>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <form ref={formRef} onSubmit={onSubmit} style={{ display: 'grid', gap: 20 }}>
          {/* Title */}
          <label style={{ display: 'grid', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{t.forms.title}</span>
            <input
              className="input"
              name="title"
              required
              placeholder="Tên sản phẩm"
              style={{ padding: '12px 14px', borderRadius: 8 }}
            />
          </label>

          {/* Price */}
          <label style={{ display: 'grid', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{t.forms.price}</span>
            <input
              className="input"
              name="price"
              type="number"
              min={0}
              step={1}
              required
              placeholder="0"
              style={{ padding: '12px 14px', borderRadius: 8 }}
            />
          </label>

          {/* Description */}
          <label style={{ display: 'grid', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{t.forms.description}</span>
            <textarea
              className="input"
              name="description"
              placeholder="Mô tả sản phẩm"
              style={{
                padding: '12px 14px',
                borderRadius: 8,
                minHeight: 120,
                fontFamily: 'inherit',
              }}
            />
          </label>

          {/* Images */}
          <div>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Hình ảnh</span>
            </div>
            <ImageUploader ref={imageUploaderRef} label="" initialUrls={[]} />
          </div>

          {/* Shop info (auto-assigned) */}
          <div
            style={{
              padding: '12px 14px',
              background: '#f1f5f9',
              borderRadius: 8,
              fontSize: 14,
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <span style={{ fontWeight: 600 }}>Shop:</span>
            <span>{shops[0].name}</span>
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              flexWrap: 'wrap',
              paddingTop: 12,
              borderTop: '1px solid #e2e8f0',
              marginTop: 8,
            }}
          >
            {msg ? (
              <span
                className="muted"
                style={{
                  fontSize: 13,
                  color:
                    msg.includes('thành công') || msg.includes('saved') ? '#16a34a' : '#dc2626',
                  fontWeight: 500,
                }}
              >
                ✓ {msg}
              </span>
            ) : null}
            <button className="btn" type="submit" disabled={submitLoading}>
              {submitLoading ? 'Đang lưu...' : 'Lưu sản phẩm'}
            </button>
            <button
              className="btn-outline"
              type="button"
              onClick={() => {
                router.push('/shop-management/manage');
              }}
            >
              Quay lại quản lý shop
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
