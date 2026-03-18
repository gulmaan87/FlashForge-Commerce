import { prisma } from '../db';
import { Order, OrderItem, OrderEvent } from '../generated/client';

export class OrderRepository {
  async createOrder(
    data: { sessionId: string; userId: string; totalAmount: number; status: string },
    items: { productId: string; quantity: number; price: number }[]
  ): Promise<Order> {
    return prisma.order.create({
      data: {
        ...data,
        items: {
          create: items,
        },
      },
      include: {
        items: true,
      },
    });
  }

  async getOrderById(id: string): Promise<Order | null> {
    return prisma.order.findUnique({
      where: { id },
      include: { items: true, events: true },
    });
  }

  async getOrderBySessionId(sessionId: string): Promise<Order | null> {
    return prisma.order.findUnique({
      where: { sessionId },
      include: { items: true },
    });
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async recordEvent(orderId: string, type: string, payload: any): Promise<OrderEvent> {
    return prisma.orderEvent.create({
      data: { orderId, type, payload },
    });
  }
}
