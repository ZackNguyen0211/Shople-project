"use client";
import { useState } from 'react';

export default function ProductActions({ productId, addLabel }: { productId: number; addLabel: string }) {
  const [qty, setQty] = useState(1);
  return (
    <form action="/api/cart/items" method="post" className="product-actions">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value={qty} />
      <div className="qty-control">
        <button className="btn-outline" type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
        <span>{qty}</span>
        <button className="btn-outline" type="button" onClick={() => setQty((q) => q + 1)}>+</button>
      </div>
      <button className="btn" type="submit" style={{ minWidth: 160 }}>{addLabel}</button>
    </form>
  );
}

