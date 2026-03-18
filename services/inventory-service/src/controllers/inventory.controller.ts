import { Request, Response } from 'express';
import { InventoryService } from '../services/inventory.service';
import { z } from 'zod';

const inventoryService = new InventoryService();

const reserveSchema = z.object({
  quantity: z.number().int().positive(),
});

const seedSchema = z.object({
  productId: z.string().min(1),
  total: z.number().int().positive(),
});

export class InventoryController {
  async seed(req: Request, res: Response) {
    try {
      const parsed = seedSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.format() } });
      }
      const item = await inventoryService.setStock(parsed.data.productId, parsed.data.total);
      res.status(200).json({ success: true, data: item });
    } catch (error) {
      req.log.error(error, 'Failed to seed inventory');
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to seed inventory' } });
    }
  }

  async getAvailability(req: Request, res: Response) {
    try {
      const avail = await inventoryService.getAvailability(req.params.productId as string);
      if (!avail) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Item not found' } });
      }
      res.status(200).json({ success: true, data: avail });
    } catch (error) {
      req.log.error(error, 'Failed to fetch availability');
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch availability' } });
    }
  }

  async reserve(req: Request, res: Response) {
    try {
      const parsed = reserveSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.format() } });
      }

      const reservation = await inventoryService.reserve(req.params.productId as string, parsed.data.quantity);
      res.status(201).json({ success: true, data: reservation });
    } catch (error: any) {
      req.log.error(error, 'Failed to reserve inventory');
      if (error.message === 'Insufficient stock') {
        return res.status(409).json({ success: false, error: { code: 'INSUFFICIENT_STOCK', message: 'Not enough stock available' } });
      }
      if (error.message === 'Item not found') {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'No inventory record found for this product' } });
      }
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to reserve inventory' } });
    }
  }

  async release(req: Request, res: Response) {
    try {
      const reservation = await inventoryService.release(req.params.reservationId as string);
      res.status(200).json({ success: true, data: reservation });
    } catch (error) {
      req.log.error(error, 'Failed to release reservation');
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to release reservation' } });
    }
  }

  async commit(req: Request, res: Response) {
    try {
      const reservation = await inventoryService.commit(req.params.reservationId as string);
      res.status(200).json({ success: true, data: reservation });
    } catch (error) {
      req.log.error(error, 'Failed to commit reservation');
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to commit reservation' } });
    }
  }
}
