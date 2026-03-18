export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  EXPIRED = 'EXPIRED',
  RELEASED = 'RELEASED',
}

export enum CheckoutStatus {
  INITIATED = 'INITIATED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum PaymentStatus {
  CREATED = 'CREATED',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  TIMEOUT = 'TIMEOUT',
}

export enum OrderStatus {
  CREATED = 'CREATED',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  meta?: Record<string, any>;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface IdempotencyHeader {
  'x-idempotency-key': string;
}

export interface CheckoutSessionEvent {
  sessionId: string;
  cart: { productId: string; quantity: number; price: number }[];
  userId: string;
  totalAmount: number;
}

export interface PaymentIntentEvent {
  paymentId: string;
  sessionId: string;
  amount: number;
  status: PaymentStatus;
}

export interface InventoryReservationEvent {
  reservationId: string;
  productId: string;
  quantity: number;
  status: ReservationStatus;
  expiresAt: string;
}

export interface OrderCreatedEvent {
  orderId: string;
  sessionId: string;
  userId: string;
  totalAmount: number;
  status: OrderStatus;
}
