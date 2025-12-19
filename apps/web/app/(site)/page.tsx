import type { Product, Shop } from '../../lib/types';
import HomeFeed from './HomeFeed';
import { getDict, getLang } from '../../lib/i18n';
import CategoriesCarousel from './CategoriesCarousel';
import { getDb, mapProduct, mapShop } from '../../lib/db';

export default async function HomePage({ searchParams }: { searchParams?: { take?: string } }) {
  const takeParam = Number(searchParams?.take || 32);
  const take = Number.isNaN(takeParam) ? 32 : Math.max(1, Math.min(200, takeParam));
  const supabase = getDb();
  const { data: productRows, error: productError, count } = await supabase
    .from('products')
    .select('id,title,description,price,image_url,shop_id', { count: 'exact' })
    .order('id', { ascending: false })
    .range(0, take - 1);
  if (productError) {
    throw new Error('Failed to load products');
  }
  const products = (productRows || []).map(mapProduct) as Product[];
  const totalCount = count || 0;
  const shopIds = Array.from(new Set(products.map((p) => p.shopId).filter(Boolean))) as number[];
  const shops: Shop[] = shopIds.length
    ? (
        (
          await supabase
            .from('shops')
            .select('id,name')
            .in('id', shopIds)
        ).data || []
      ).map(mapShop)
    : [];
  const shopMap = new Map(shops.map((s) => [s.id, s.name]));

  const lang = getLang();
  const t = getDict(lang);
  const categories = t.categories;
  const labels = lang === 'en' ? { by: 'by', more: 'More', loading: 'Loading…' } : { by: 'bởi', more: 'Xem thêm', loading: 'Đang tải…' };

  return (
    <div>
      <CategoriesCarousel title={t.home.categories} items={categories} />
      <HomeFeed initial={products.map((p) => ({ ...p, shop: p.shopId ? { id: p.shopId, name: shopMap.get(p.shopId) || 'Shop' } : null }))} total={totalCount} labels={labels} />
    </div>
  );
}
