"use client";
import { useState } from 'react';

export default function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const safe = images && images.length > 0 ? images : ['/placeholder-product.png'];
  const [idx, setIdx] = useState(0);
  const main = safe[Math.min(idx, safe.length - 1)];
  return (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={main} alt={title} className="product-main-img" />
      <div className="product-thumbs">
        {safe.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${src}-${i}`}
            src={src}
            alt={`thumb-${i}`}
            style={{ outline: i === idx ? '2px solid var(--primary)' : 'none' }}
            onClick={() => setIdx(i)}
          />
        ))}
      </div>
    </div>
  );
}

