export type UserRole = 'buyer' | 'seller' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  phone: string | null;
  address: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_price: number | null;
  stock: number;
  image_urls: string[];
  category_id: string;
  category?: Category;
  seller_id: string;
  seller?: Profile;
  is_active: boolean;
  rating_avg: number;
  rating_count: number;
  sold_count: number;
  created_at: string;
}

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product?: Product;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  buyer?: Profile;
  status: OrderStatus;
  items?: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  total: number;
  shipping_address: ShippingAddress;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
}

export interface Review {
  id: string;
  product_id: string;
  buyer_id: string;
  buyer?: Profile;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
