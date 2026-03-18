import { ProductRepository } from '../repositories/product.repository';
import { Product } from '../generated/client';

export class ProductService {
  private repo: ProductRepository;

  constructor() {
    this.repo = new ProductRepository();
  }

  async getAllProducts(): Promise<Product[]> {
    return this.repo.findAll();
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.repo.findById(id);
  }

  async createProduct(data: { name: string; description: string; price: number; sku: string; imageUrl?: string }): Promise<Product> {
    return this.repo.create({ ...data, imageUrl: data.imageUrl ?? null });
  }
}
