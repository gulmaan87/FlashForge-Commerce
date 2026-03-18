import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { z } from 'zod';

const orderService = new OrderService();

const createOrderSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  totalAmount: z.number().int().positive(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().int().positive()
  })).min(1)
});

export class OrderController {
  async create(req: Request, res: Response) {
    // Basic idempotency mechanism using idempotency key header
    const idempotencyKey = req.headers['x-idempotency-key'] as string;
    if (!idempotencyKey) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_IDEMPOTENCY_KEY', message: 'x-idempotency-key header required' } });
    }

    try {
      const parsed = createOrderSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.format() } });
      }

      // In a real app we'd use a robust idempotency store for orders too, or rely on sessionId uniqueness
      const order = await orderService.createOrder(
        parsed.data.sessionId,
        parsed.data.userId,
        parsed.data.totalAmount,
        parsed.data.items
      );

      res.status(201).json({ success: true, data: order });
    } catch (error: any) {
      req.log.error(error, 'Failed to create order');
      if (error.code === 'P2002') { // Prisma unique constraint violation (sessionId)
        res.status(409).json({ success: false, error: { code: 'CONCURRENT_REQUEST', message: 'Order already exists for this session' } });
      } else {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create order' } });
      }
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const order = await orderService.getOrder(req.params.id as string);
      if (!order) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
      }
      res.status(200).json({ success: true, data: order });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal error' } });
    }
  }

  async getByUser(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ success: false, error: { code: 'MISSING_DATA', message: 'userId query param is required' } });
      }
      const orders = await orderService.getUserOrders(userId);
      res.status(200).json({ success: true, data: orders });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal error' } });
    }
  }
}
