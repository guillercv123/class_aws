import { Logger } from '@aws-lambda-powertools/logger';
import type { SagaInput } from '../lib/types';

const logger = new Logger();

/** Paso final de la Saga (camino feliz): marca la orden como confirmada. */
export const handler = async (input: SagaInput) => {
  logger.info('ConfirmOrder', { orderId: input.orderId });
  // En una implementación real, aquí se actualizaría el estado de la orden
  // en la tabla y se publicaría order.confirmed.v1.
  return { orderId: input.orderId, status: 'confirmed' };
};
