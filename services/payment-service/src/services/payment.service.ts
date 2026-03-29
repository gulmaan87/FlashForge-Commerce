import { PaymentRepository } from '../repositories/payment.repository';
import { PaymentStatus } from '@flashforge/shared-types';
import { createLogger } from '@flashforge/shared-logger';

const logger = createLogger('payment-service');

// ---------------------------------------------------------------------------
// Gateway abstraction
// ---------------------------------------------------------------------------
// Set PAYMENT_GATEWAY_ENABLED=true in production and provide STRIPE_SECRET_KEY.
// When disabled (local dev / test) the stub always succeeds — no random failures.
// ---------------------------------------------------------------------------
async function chargeViaGateway(amount: number, _sessionId: string): Promise<boolean> {
  const gatewayEnabled = process.env.PAYMENT_GATEWAY_ENABLED === 'true';

  if (!gatewayEnabled) {
    logger.warn('PAYMENT_GATEWAY_ENABLED is not set — using local stub (always succeeds). DO NOT USE IN PRODUCTION.');
    return true; // deterministic: always succeeds in dev/test
  }

  // ─── Real gateway call (Stripe example) ────────────────────────────────
  // Replace this block with your actual payment provider SDK call.
  // The Stripe SDK is already listed as an optional dependency in package.json.
  //
  //   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' });
  //   const paymentIntent = await stripe.paymentIntents.create({
  //     amount: Math.round(amount * 100),   // Stripe uses cents
  //     currency: 'usd',
  //     confirm: true,
  //     payment_method: 'pm_card_visa',     // from frontend token, not hardcoded
  //   });
  //   return paymentIntent.status === 'succeeded';
  // ────────────────────────────────────────────────────────────────────────

  logger.error({ amount }, 'Gateway enabled but no real gateway integration implemented — rejecting payment');
  return false;
}

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

    let isSuccess = false;
    try {
      isSuccess = await chargeViaGateway(intent.amount, sessionId);
    } catch (err) {
      logger.error({ err, sessionId }, 'Payment gateway call threw an unexpected error');
      isSuccess = false;
    }

    const newStatus = isSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
    const updated = await this.repo.updateIntentStatus(intent.id, newStatus);
    await this.repo.recordCallback(intent.id, { gatewayEnabled: process.env.PAYMENT_GATEWAY_ENABLED === 'true', success: isSuccess });

    return updated;
  }
}
