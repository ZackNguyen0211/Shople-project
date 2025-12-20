/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

type ImageUploaderProps = {
  initialUrls?: string[];
  label?: string;
};

type ImageItem = { url: string; status?: 'uploading' | 'success' | 'error' };

export type ImageUploaderRef = {
  getUploadedUrls: () => string[];
};

const ImageUploader = forwardRef<ImageUploaderRef, ImageUploaderProps>(
  ({ initialUrls = [], label = 'Images' }, ref) => {
    const [items, setItems] = useState<ImageItem[]>(initialUrls.map((url) => ({ url })));
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const itemsRef = useRef<ImageItem[]>(initialUrls.map((url) => ({ url })));

    useImperativeHandle(ref, () => ({
      getUploadedUrls: () => {
        return itemsRef.current.filter((i) => !i.url.startsWith('blob:')).map((i) => i.url);
      },
    }));

    useEffect(() => {
      const newItems = initialUrls.map((url) => ({ url }));
      setItems(newItems);
      itemsRef.current = newItems;
    }, [initialUrls]);

    useEffect(() => {
      itemsRef.current = items;
    }, [items]);

    async function uploadFiles(files: FileList | null) {
      if (!files || files.length === 0) return;
      setError(null);
      setSuccessMessage(null);
      setUploading(true);

      let successCount = 0;
      const totalFiles = Array.from(files).length;
      // Use ref instead of closure to get current items
      let currentItems = [...itemsRef.current];

      for (const file of Array.from(files)) {
        const tempUrl = URL.createObjectURL(file);
        currentItems = [...currentItems, { url: tempUrl, status: 'uploading' }];
        setItems(currentItems);
        itemsRef.current = currentItems; // Sync ref immediately

        const formData = new FormData();
        formData.append('file', file);

        try {
          const res = await fetch('/api/storage/files', {
            method: 'POST',
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            if (data?.url) {
              successCount++;
              // Replace uploading with actual uploaded image
              currentItems = currentItems.map((item) =>
                item.url === tempUrl ? { url: data.url as string, status: 'success' } : item
              );
              setItems(currentItems);
              itemsRef.current = currentItems; // Sync ref immediately
              // Don't notify here - let useEffect handle it
            }
          } else {
            const msg = (await res.json().catch(() => null))?.error || 'Upload failed';
            setError(msg);
            // Remove failed upload
            currentItems = currentItems.filter((i) => i.url !== tempUrl);
            setItems(currentItems);
            itemsRef.current = currentItems; // Sync ref immediately
          }
        } catch (err) {
          setError(`Upload failed: ${err}`);
          currentItems = currentItems.filter((i) => i.url !== tempUrl);
          setItems(currentItems);
          itemsRef.current = currentItems; // Sync ref immediately
        }
      }

      setUploading(false);
      if (successCount > 0) {
        setSuccessMessage(
          successCount === 1
            ? 'Upload ảnh thành công'
            : `Upload ${successCount}/${totalFiles} ảnh thành công`
        );
        setTimeout(() => setSuccessMessage(null), 2000);
      }

      if (inputRef.current) inputRef.current.value = '';
    }

    async function remove(url: string) {
      setItems((prev) => prev.filter((i) => i.url !== url));
      setError(null);

      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
        return;
      }

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
            disabled={uploading}
          />
          {uploading ? (
            <span className="muted" style={{ color: '#1f2937', fontWeight: 500 }}>
              ⏳ Đang upload ảnh...
            </span>
          ) : null}
          {successMessage ? (
            <span className="muted" style={{ color: '#16a34a', fontWeight: 500 }}>
              ✓ {successMessage}
            </span>
          ) : null}
          {error ? (
            <span className="muted" style={{ color: '#b91c1c' }}>
              ✗ {error}
            </span>
          ) : null}
        </div>
        {items.length ? (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {items.map((item) => (
              <div
                key={item.url}
                style={{
                  border: '1px solid #e5e7eb',
                  padding: 8,
                  borderRadius: 8,
                  width: 120,
                  position: 'relative',
                  opacity: item.status === 'uploading' ? 0.6 : 1,
                }}
              >
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    overflow: 'hidden',
                    borderRadius: 6,
                    marginBottom: 6,
                    position: 'relative',
                    background: '#f3f4f6',
                  }}
                >
                  <img
                    src={item.url}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {item.status === 'uploading' && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      Uploading...
                    </div>
                  )}
                  {item.status === 'success' && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        background: '#16a34a',
                        color: 'white',
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      ✓
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="btn-outline"
                  style={{ width: '100%', fontSize: 12 }}
                  onClick={() => remove(item.url)}
                  disabled={item.status === 'uploading'}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  }
);

ImageUploader.displayName = 'ImageUploader';
export default ImageUploader;
