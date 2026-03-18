import { OrderRepository } from '../repositories/order.repository';
import { OrderStatus } from '@flashforge/shared-types';

export class OrderService {
  private repo: OrderRepository;

  constructor() {
    this.repo = new OrderRepository();
  }

  async createOrder(sessionId: string, userId: string, totalAmount: number, items: { productId: string; quantity: number; price: number }[]) {
    // Idempotency check via sessionId
    const existing = await this.repo.getOrderBySessionId(sessionId);
    if (existing) return existing;

    const order = await this.repo.createOrder(
      { sessionId, userId, totalAmount, status: OrderStatus.CREATED },
      items
    );

    await this.repo.recordEvent(order.id, 'ORDER_CREATED', { items });

    return order;
  }

  async getOrder(id: string) {
    return this.repo.getOrderById(id);
  }

  async getUserOrders(userId: string) {
    return this.repo.getOrdersByUser(userId);
  }
}
