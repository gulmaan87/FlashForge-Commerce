// ─── Products ───────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // price in cents
  sku: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Cart ────────────────────────────────────────────────────────────────────
export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  price: number; // price in cents
}

// ─── Checkout ────────────────────────────────────────────────────────────────
export interface CheckoutSession {
  id: string;
  sessionId: string;
  userId: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'EXPIRED';
  totalAmount: number;
  cart: CartSessionItem[];
  createdAt: string;
  expiresAt: string;
}

export interface CartSessionItem {
  productId: string;
  quantity: number;
  price: number;
}

// ─── Orders ──────────────────────────────────────────────────────────────────
export interface Order {
  id: string;
  sessionId: string;
  userId: string;
  totalAmount: number;
  status: 'CREATED' | 'PAID' | 'FAILED' | 'CANCELLED';
  items: OrderItem[];
  events: OrderEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface OrderEvent {
  id: string;
  orderId: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

// ─── API Response wrapper ────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
