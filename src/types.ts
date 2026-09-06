export type OrderStatus = 'placed' | 'confirmed' | 'packing' | 'ready' | 'completed' | 'cancelled';

export type PaymentMethodAtStore = 'QR' | 'UPI' | 'Card' | 'Cash';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  mrp: number;
  unit: string;
  image: string;
  inStock: boolean;
  stockCount: number;
  tag?: string;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface StatusLog {
  status: OrderStatus;
  timestamp: string;
  note: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  pickupToken: string;
  pickupPin: string; // 4-digit OTP/PIN to verify at counter
  items: CartItem[];
  totalAmount: number;
  savingsAmount: number;
  paymentMethodAtStore: PaymentMethodAtStore;
  paymentStatus: 'pending_at_store' | 'paid_at_counter';
  status: OrderStatus;
  statusHistory: StatusLog[];
  createdAt: string;
  readyAt?: string;
  completedAt?: string;
  pickupCounter: string;
  notes?: string;
  inventoryDeducted?: boolean; // True once inventory has been reduced upon order acceptance
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  cta: string;
  bgGradient: string;
  accentColor: string;
  image: string;
  categoryLink: string;
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  badge?: string;
}

export interface StoreConfig {
  name: string;
  tagline: string;
  address: string;
  pickupCounter: string;
  phone: string;
  timings: string;
  upiId: string;
  announcementTicker: string;
}
