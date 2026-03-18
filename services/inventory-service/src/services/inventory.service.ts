import { InventoryRepository } from '../repositories/inventory.repository';

export class InventoryService {
  private repo: InventoryRepository;

  constructor() {
    this.repo = new InventoryRepository();
  }

  async setStock(productId: string, total: number) {
    return this.repo.upsertStock(productId, total);
  }

  async getAvailability(productId: string) {
    const item = await this.repo.getItemByProductId(productId);
    if (!item) return null;
    return {
      productId,
      available: item.total - item.reserved,
      total: item.total,
    };
  }

  async reserve(productId: string, quantity: number) {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    return this.repo.createReservation({ productId, quantity, expiresAt });
  }

  async release(reservationId: string) {
    return this.repo.releaseReservation(reservationId);
  }

  async commit(reservationId: string) {
    return this.repo.commitReservation(reservationId);
  }
}
