import { Logger } from '@aws-lambda-powertools/logger';
import type { SagaInput } from '../lib/types';

const logger = new Logger();

/**
 * Paso de la Saga: procesa el pago (simulado en la sesión 3).
 *
 * Bloque 4 — TODO:
 *   Simulación para demostrar la compensación:
 *     - Si input.amount > 1000 → throw new Error('PaymentDeclined')
 *       (esto dispara el Catch → ReleaseInventory en la state machine).
 *     - Si no → devolver { paymentId: `pay_${Date.now()}`, status: 'succeeded' }.
 *
 * En la sesión 4 este paso se reemplaza por un payments-service real con
 * Circuit Breaker e idempotencia.
 */
export const handler = async (input: SagaInput) => {
  logger.info('ProcessPayment', { orderId: input.orderId, amount: input.amount });

  // TODO Bloque 4: implementar la simulación.
  throw new Error('Not implemented: process-payment');
};
