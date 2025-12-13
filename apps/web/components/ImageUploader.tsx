'use client';

import { useEffect, useRef, useState } from 'react';

type ImageUploaderProps = {
  initialUrls?: string[];
  onChange?: (urls: string[]) => void;
  label?: string;
};

type ImageItem = { url: string };

export default function ImageUploader({
  initialUrls = [],
  onChange,
  label = 'Images',
}: ImageUploaderProps) {
  const [items, setItems] = useState<ImageItem[]>(initialUrls.map((url) => ({ url })));
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const skipNextOnChange = useRef(false);

  useEffect(() => {
    // When parent updates initialUrls (e.g., after fetch), sync items but skip triggering onChange to avoid loops.
    skipNextOnChange.current = true;
    setItems(initialUrls.map((url) => ({ url })));
  }, [initialUrls]);

  useEffect(() => {
    if (skipNextOnChange.current) {
      skipNextOnChange.current = false;
      return;
    }
    onChange?.(items.map((i) => i.url));
  }, [items, onChange]);

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/storage/files', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.url) {
          setItems((prev) => [...prev, { url: data.url as string }]);
        }
      } else {
        const msg = (await res.json().catch(() => null))?.error || 'Upload failed';
        setError(msg);
      }
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  async function remove(url: string) {
    setItems((prev) => prev.filter((i) => i.url !== url));
    setError(null);
    const res = await fetch('/api/storage/files', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) {
      const msg = (await res.json().catch(() => null))?.error || 'Delete failed';
      setError(msg);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'grid', gap: 4 }}>
        <span>{label}</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => uploadFiles(e.target.files)}
        />
        {uploading ? <span className="muted">Uploading...</span> : null}
        {error ? (
          <span className="muted" style={{ color: '#b91c1c' }}>
            {error}
          </span>
        ) : null}
      </div>
      {items.length ? (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {items.map((item) => (
            <div
              key={item.url}
              style={{ border: '1px solid #e5e7eb', padding: 8, borderRadius: 8, width: 120 }}
            >
              <div
                style={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  overflow: 'hidden',
                  borderRadius: 6,
                  marginBottom: 6,
                }}
              >
                <img
                  src={item.url}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <button
                type="button"
                className="btn-outline"
                style={{ width: '100%', fontSize: 12 }}
                onClick={() => remove(item.url)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : null}
      {/* Hidden input for forms that still need serialized URLs */}
      <input type="hidden" name="imageUrls" value={items.map((i) => i.url).join('\n')} />
    </div>
  );
}
