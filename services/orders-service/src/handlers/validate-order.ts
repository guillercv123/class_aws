import { Logger } from '@aws-lambda-powertools/logger';
import { ValidationError } from '@orderflow/shared';
import type { SagaInput } from '../lib/types';

const logger = new Logger();

/**
 * Paso de la Saga: valida la orden.
 * Provisto completo — sirve de ejemplo de un Task handler simple.
 */
export const handler = async (input: SagaInput) => {
  logger.info('ValidateOrder', { orderId: input.orderId });

  if (!input.items || input.items.length === 0) {
    throw new ValidationError('Order has no items');
  }
  if (input.amount <= 0) {
    throw new ValidationError('Order amount must be positive');
  }
  for (const item of input.items) {
    if (item.quantity <= 0) {
      throw new ValidationError(`Invalid quantity for product ${item.productId}`);
    }
  }
  return { valid: true };
};
