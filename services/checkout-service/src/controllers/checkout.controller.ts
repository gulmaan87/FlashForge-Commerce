import { Request, Response } from 'express';
import { CheckoutService } from '../services/checkout.service';
import { CheckoutRepository } from '../repositories/checkout.repository';
import { z } from 'zod';

const checkoutService = new CheckoutService();
const repo = new CheckoutRepository();

const createSessionSchema = z.object({
  userId: z.string(),
  cart: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().int().positive()
  }))
});

export class CheckoutController {
  async createSession(req: Request, res: Response) {
    try {
      const parsed = createSessionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.format() } });
      }

      const session = await checkoutService.createSession(parsed.data.userId, parsed.data.cart);
      res.status(201).json({ success: true, data: session });
    } catch (error) {
      req.log.error(error, 'Failed to create checkout session');
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create session' } });
    }
  }

  async confirm(req: Request, res: Response) {
    const idempotencyKey = req.headers['x-idempotency-key'] as string;
    if (!idempotencyKey) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_IDEMPOTENCY_KEY', message: 'x-idempotency-key header is required' } });
    }

    try {
      const existing = await repo.checkIdempotency(idempotencyKey);
      if (existing) {
        if (!existing.completedAt) {
          return res.status(409).json({ success: false, error: { code: 'CONCURRENT_REQUEST', message: 'Request is already processing' } });
        }
        return res.status(200).json(existing.response);
      }

      await repo.lockIdempotencyKey(idempotencyKey);
    } catch (error) {
      return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to process idempotency' } });
    }

    try {
      const result = await checkoutService.confirmCheckout(req.body.sessionId);
      const responsePayload = { success: true, data: result };
      await repo.saveIdempotencyResult(idempotencyKey, responsePayload);
      res.status(200).json(responsePayload);
    } catch (error: any) {
      req.log.error(error, 'Failed to confirm checkout');
      const errResponse = { success: false, error: { code: 'CHECKOUT_FAILED', message: error.message } };
      await repo.saveIdempotencyResult(idempotencyKey, errResponse);
      res.status(500).json(errResponse);
    }
  }

  async getSession(req: Request, res: Response) {
    try {
      const session = await repo.getSession(req.params.sessionId as string);
      if (!session) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session not found' } });
      }
      res.status(200).json({ success: true, data: session });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal error' } });
    }
  }
}
