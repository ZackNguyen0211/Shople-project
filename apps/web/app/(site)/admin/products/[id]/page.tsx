export { default } from '../../../shop/manage/products/[id]/page';
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getClientDict } from '../../../../../lib/i18n-client';
import ImageUploader from '../../../../../components/ImageUploader';

type Shop = { id: number; name: string };
type Product = {
  id: number;
  title: string;
  price: number;
  description?: string | null;
  shopId: number;
  images?: { url: string; sortOrder: number }[];
};

export default function EditProductPage() {
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
      export { default } from '../../shop/manage/products/[id]/page';
      setLoading(false);
