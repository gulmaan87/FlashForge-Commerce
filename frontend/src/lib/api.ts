import axios from 'axios';
import type {
  Product,
  CheckoutSession,
  CartSessionItem,
  Order,
  ApiResponse,
} from './types';

const isProd = process.env.NODE_ENV === 'production';

const PRODUCT_URL  = isProd ? '' : (process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL  || 'http://localhost:4001');
const CHECKOUT_URL = isProd ? '' : (process.env.NEXT_PUBLIC_CHECKOUT_SERVICE_URL || 'http://localhost:4003');
const ORDER_URL    = isProd ? '' : (process.env.NEXT_PUBLIC_ORDER_SERVICE_URL    || 'http://localhost:4005');

// ─── Helpers ─────────────────────────────────────────────────────────────────
function unwrap<T>(res: { data: ApiResponse<T> }): T {
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.error?.message || 'Request failed');
  }
  return res.data.data;
}

// ─── Product API ─────────────────────────────────────────────────────────────
export const productApi = {
  getAll: async (): Promise<Product[]> => {
    const res = await axios.get<ApiResponse<Product[]>>(`${PRODUCT_URL}/api/products`);
    return unwrap(res);
  },
  getById: async (id: string): Promise<Product> => {
    const res = await axios.get<ApiResponse<Product>>(`${PRODUCT_URL}/api/products/${id}`);
    return unwrap(res);
  },
};

// ─── Checkout API ─────────────────────────────────────────────────────────────
export const checkoutApi = {
  createSession: async (userId: string, cart: CartSessionItem[]): Promise<CheckoutSession> => {
    const res = await axios.post<ApiResponse<CheckoutSession>>(
      `${CHECKOUT_URL}/api/checkout/session`,
      { userId, cart }
    );
    return unwrap(res);
  },
  getSession: async (sessionId: string): Promise<CheckoutSession> => {
    const res = await axios.get<ApiResponse<CheckoutSession>>(
      `${CHECKOUT_URL}/api/checkout/${sessionId}`
    );
    return unwrap(res);
  },
  confirm: async (sessionId: string, idempotencyKey: string): Promise<Order> => {
    const res = await axios.post<ApiResponse<Order>>(
      `${CHECKOUT_URL}/api/checkout/confirm`,
      { sessionId },
      { headers: { 'x-idempotency-key': idempotencyKey } }
    );
    return unwrap(res);
  },
};

// ─── Order API ────────────────────────────────────────────────────────────────
export const orderApi = {
  getByUser: async (userId: string): Promise<Order[]> => {
    const res = await axios.get<ApiResponse<Order[]>>(
      `${ORDER_URL}/api/orders?userId=${userId}`
    );
    return unwrap(res);
  },
  getById: async (id: string): Promise<Order> => {
    const res = await axios.get<ApiResponse<Order>>(`${ORDER_URL}/api/orders/${id}`);
    return unwrap(res);
  },
};
