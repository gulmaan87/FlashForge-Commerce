import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { z } from 'zod';

const productService = new ProductService();

const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  sku: z.string().min(1),
  imageUrl: z.string().url().optional(),
});

export class ProductController {
  async getAll(req: Request, res: Response) {
    try {
      const products = await productService.getAllProducts();
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      req.log.error(error, 'Failed to fetch products');
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch products' } });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const product = await productService.getProductById(req.params.id as string);
      if (!product) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
      }
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      req.log.error(error, 'Failed to fetch product');
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch product' } });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const parsed = createProductSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.format() } });
      }

      const product = await productService.createProduct(parsed.data);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      req.log.error(error, 'Failed to create product');
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create product' } });
    }
  }
}
