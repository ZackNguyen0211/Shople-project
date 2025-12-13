export type Product = {
  id: number;
  title: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  shopId?: number;
};

export type Shop = {
  id: number;
  name: string;
};

export type CartItem = {
  id: number;
  quantity: number;
  product: Product;
};

export type Cart = {
  id: number;
  items: CartItem[];
};

export type OrderItem = {
  id: number;
  productId: number;
  quantity: number;
  price: number;
};

export type Order = {
  id: number;
  status: string;
  items: OrderItem[];
};
