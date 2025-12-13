import Link from 'next/link';
import type { Route } from 'next';
import { formatVND } from '../../../../lib/format';
import { getDict, getLang } from '../../../../lib/i18n';
import ProductActions from './ProductActions';
import ProductGallery from './ProductGallery';
import { notFound } from 'next/navigation';

import { prisma } from '../../../../lib/prisma';

type Params = { params: { id: string } };

export default async function ProductPage({ params }: Params) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    notFound();
  }
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    notFound();
  }
  const shop = product.shopId
    ? await prisma.shop.findUnique({ where: { id: product.shopId } })
    : null;
  const t = getDict(getLang());
  type ProductImageRow = { url: string; sortOrder: number };
  type ProductImageClient = {
    findMany: (args: { where: { productId: number }; orderBy: { sortOrder: 'asc' | 'desc' } }) => Promise<ProductImageRow[]>;
  };
  const productImage = (prisma as unknown as { productImage: ProductImageClient }).productImage;
  const imageRows = await productImage.findMany({ where: { productId: id }, orderBy: { sortOrder: 'asc' } });
  const images = (Array.isArray(imageRows) && imageRows.length > 0)
    ? imageRows.map((im: ProductImageRow) => im.url)
    : [product?.imageUrl || '/placeholder-product.png'];

  return (
    <div className="product-page">
      <div className="product-gallery card">
        <ProductGallery images={images} title={product.title} />
      </div>
      <div className="product-info card">
        <h1 className="page-title" style={{ marginBottom: 4 }}>{product.title}</h1>
        {shop ? (
          <div className="muted" style={{ marginBottom: 8 }}>
            {t.product.soldBy} <Link href={`/shop/${shop.id}` as Route}>{shop.name}</Link>
          </div>
        ) : null}
        <div className="product-price-block">
          <div className="product-price">{formatVND(product.price)}</div>
        </div>
        {product.description ? (
          <p className="muted" style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{product.description}</p>
        ) : null}
        <ProductActions productId={product.id} addLabel={t.product.addToCart} />
      </div>
    </div>
  );
}
