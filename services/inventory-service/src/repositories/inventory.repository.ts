import { prisma } from '../db';
import { InventoryItem, InventoryReservation } from '../generated/client';

export class InventoryRepository {
  async upsertStock(productId: string, total: number): Promise<InventoryItem> {
    return prisma.inventoryItem.upsert({
      where: { productId },
      create: { productId, total },
      update: { total },
    });
  }

  async getItemByProductId(productId: string): Promise<InventoryItem | null> {
    return prisma.inventoryItem.findUnique({
      where: { productId },
    });
  }

  async createReservation(data: { productId: string; quantity: number; expiresAt: Date }): Promise<InventoryReservation> {
    return prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findUnique({
        where: { productId: data.productId }
      });
      if (!item) throw new Error('Item not found');
      
      const available = item.total - item.reserved;
      if (available < data.quantity) {
        throw new Error('Insufficient stock');
      }

      await tx.inventoryItem.update({
        where: { id: item.id },
        data: { reserved: { increment: data.quantity } },
      });

      return tx.inventoryReservation.create({
        data: {
          productId: data.productId,
          quantity: data.quantity,
          status: 'PENDING',
          expiresAt: data.expiresAt,
        }
      });
    });
  }

  async releaseReservation(reservationId: string): Promise<InventoryReservation> {
    return prisma.$transaction(async (tx) => {
      const reservation = await tx.inventoryReservation.findUnique({ where: { id: reservationId } });
      if (!reservation) throw new Error('Reservation not found');
      if (reservation.status !== 'PENDING') throw new Error('Reservation is not pending');

      await tx.inventoryItem.update({
        where: { productId: reservation.productId },
        data: { reserved: { decrement: reservation.quantity } },
      });

      return tx.inventoryReservation.update({
        where: { id: reservationId },
        data: { status: 'RELEASED' },
      });
    });
  }

  async commitReservation(reservationId: string): Promise<InventoryReservation> {
    return prisma.$transaction(async (tx) => {
      const reservation = await tx.inventoryReservation.findUnique({ where: { id: reservationId } });
      if (!reservation) throw new Error('Reservation not found');
      if (reservation.status !== 'PENDING') throw new Error('Reservation is not pending');

      await tx.inventoryItem.update({
        where: { productId: reservation.productId },
        data: { 
          total: { decrement: reservation.quantity },
          reserved: { decrement: reservation.quantity }
        },
      });

      return tx.inventoryReservation.update({
        where: { id: reservationId },
        data: { status: 'CONFIRMED' },
      });
    });
  }
}
