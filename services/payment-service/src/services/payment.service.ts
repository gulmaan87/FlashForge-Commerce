import { PaymentRepository } from '../repositories/payment.repository';
import { PaymentStatus } from '@flashforge/shared-types';

export class PaymentService {
  private repo: PaymentRepository;

  constructor() {
    this.repo = new PaymentRepository();
  }

  async createIntent(sessionId: string, amount: number) {
    const existing = await this.repo.getIntentBySession(sessionId);
    if (existing) {
      return existing;
    }

    return this.repo.createIntent({
      sessionId,
      amount,
      status: PaymentStatus.CREATED,
    });
  }

  async confirmPayment(sessionId: string) {
    const intent = await this.repo.getIntentBySession(sessionId);
    if (!intent) throw new Error('Payment intent not found');
    
    // Simulate payment gateway call
    // In reality, this would be an async webhook. Here we just update the status
    // Let's assume an 80% success rate
    const isSuccess = Math.random() < 0.8;
    const newStatus = isSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
    
    const updated = await this.repo.updateIntentStatus(intent.id, newStatus);
    await this.repo.recordCallback(intent.id, { simulated: true, success: isSuccess });

    return updated;
  }
}
