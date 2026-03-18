import { prisma } from '../db';
import { CheckoutSession, IdempotencyKey } from '../generated/client';

export class CheckoutRepository {
  async createSession(data: any): Promise<CheckoutSession> {
    return prisma.checkoutSession.create({ data });
  }

  async getSession(id: string): Promise<CheckoutSession | null> {
    return prisma.checkoutSession.findUnique({ where: { id } });
  }

  async updateSession(id: string, data: Partial<CheckoutSession>): Promise<CheckoutSession> {
    return prisma.checkoutSession.update({ where: { id }, data: data as any });
  }

  async checkIdempotency(key: string): Promise<IdempotencyKey | null> {
    return prisma.idempotencyKey.findUnique({ where: { key } });
  }

  async lockIdempotencyKey(key: string): Promise<void> {
    await prisma.idempotencyKey.create({ data: { key } });
  }

  async saveIdempotencyResult(key: string, response: any): Promise<void> {
    await prisma.idempotencyKey.update({
      where: { key },
      data: { completedAt: new Date(), response },
    });
  }
}
