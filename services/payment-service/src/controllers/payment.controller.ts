import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { z } from 'zod';

const paymentService = new PaymentService();

const createIntentSchema = z.object({
  sessionId: z.string(),
  amount: z.number().int().positive(),
});

export class PaymentController {
  async createIntent(req: Request, res: Response) {
    try {
      const parsed = createIntentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.format() } });
      }

      const intent = await paymentService.createIntent(parsed.data.sessionId, parsed.data.amount);
      res.status(201).json({ success: true, data: intent });
    } catch (error) {
      req.log.error(error, 'Failed to create payment intent');
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create payment intent' } });
    }
  }

  async confirm(req: Request, res: Response) {
    try {
      const { sessionId } = req.body;
      if (!sessionId) {
         return res.status(400).json({ success: false, error: { code: 'MISSING_DATA', message: 'sessionId is required' } });
      }

      const intent = await paymentService.confirmPayment(sessionId);
      res.status(200).json({ success: true, data: intent });
    } catch (error) {
      req.log.error(error, 'Failed to confirm payment');
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to confirm payment' } });
    }
  }
}
