import { getSupabaseServerClient } from './supabase';

export function getDb() {
  return getSupabaseServerClient();
}

export type DbUserRow = {
  id: number;
  email: string;
  name: string;
  role: string;
  created_at?: string;
};

export type DbShopRow = {
  id: number;
  name: string;
  owner_id?: number;
};

export type DbProductRow = {
  id: number;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  shop_id: number | null;
};

export type DbProductImageRow = {
  url: string;
  sort_order: number;
};

export type DbOrderItemRow = {
  id: number;
  product_id: number;
  price: number;
  quantity: number;
};

export function mapUser(row: DbUserRow) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.created_at || null,
  };
}

export function mapShop(row: DbShopRow) {
  return {
    id: row.id,
    name: row.name,
    ownerId: row.owner_id ?? undefined,
  };
}

export function mapProduct(row: DbProductRow) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    imageUrl: row.image_url,
    shopId: row.shop_id ?? undefined,
  };
}

export function mapProductImage(row: DbProductImageRow) {
  return { url: row.url, sortOrder: row.sort_order };
}

export function mapOrderItem(row: DbOrderItemRow) {
  return {
    id: row.id,
    productId: row.product_id,
    price: row.price,
    quantity: row.quantity,
  };
}
