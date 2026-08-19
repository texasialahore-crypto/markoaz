export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  image: string;
  productCount: number;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  rating: number;
  reviewCount: number;
  category: string;
  stock: number;
  isFeatured?: boolean;
  isFlashDeal?: boolean;
  tags: string[];
  images: string[];
  specifications: Record<string, string>;
  variants?: {
    colors?: string[];
    sizes?: string[];
  };
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  verifiedBuyer: boolean;
}

export interface UserAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface User {
  id: string;
  customerId: string;
  email: string;
  name: string;
  phone: string;
  role: 'customer' | 'admin';
  address?: UserAddress;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
}

export type OrderStatus = 'placed' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cod' | 'card' | 'upi';
export type PaymentStatus = 'pending' | 'paid' | 'paid_on_delivery' | 'refunded' | 'failed';

export interface StoreSettings {
  announcement: string;
  isCodEnabled: boolean;
  freeShippingThreshold: number;
  flashSaleDiscount: number;
  supportPhone: string;
  supportEmail: string;
  storeName?: string;
  announcementBanner?: string;
  codEnabled?: boolean;
  flashSaleActive?: boolean;
  flashSaleDiscountPercentage?: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedColor?: string;
  selectedSize?: string;
}

export interface OrderTimelineItem {
  status: OrderStatus;
  label: string;
  time: string;
  completed: boolean;
}

export interface Order {
  id: string;
  userId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: UserAddress;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingNumber: string;
  estimatedDelivery: string;
  createdAt: string;
  timeline: OrderTimelineItem[];
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrdersCount: number;
  salesData: { date: string; sales: number; orders: number }[];
  categoryBreakdown: { category: string; count: number; sales: number }[];
}
