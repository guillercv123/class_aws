import { Logger } from '@aws-lambda-powertools/logger';
import type { SagaInput } from '../lib/types';

const logger = new Logger();

/** Estado terminal de fallo de la Saga: marca la orden como fallida. */
export const handler = async (input: SagaInput & { error?: unknown }) => {
  logger.warn('OrderFailed', { orderId: input.orderId, error: input.error });
  return { orderId: input.orderId, status: 'failed' };
};
