import { prisma } from '../db';
import { PaymentIntent } from '../generated/client';
import { PaymentStatus } from '@flashforge/shared-types';

export class PaymentRepository {
  async createIntent(data: { sessionId: string; amount: number; status: string }): Promise<PaymentIntent> {
    return prisma.paymentIntent.create({ data });
  }

  async getIntentBySession(sessionId: string): Promise<PaymentIntent | null> {
    return prisma.paymentIntent.findUnique({ where: { sessionId } });
  }

  async updateIntentStatus(id: string, status: string): Promise<PaymentIntent> {
    return prisma.paymentIntent.update({ where: { id }, data: { status } });
  }

  async recordCallback(paymentId: string, payload: any): Promise<void> {
    await prisma.paymentCallback.create({ data: { paymentId, payload } });
  }
}
