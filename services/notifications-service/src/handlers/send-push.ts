import type { SQSHandler, SQSBatchResponse } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger();

/**
 * Consumidor de la cola de push (fan-out desde SNS).
 * Provisto completo como ejemplo de un consumidor simple con partial batch response.
 */
export const handler: SQSHandler = async (event): Promise<SQSBatchResponse> => {
  const batchItemFailures: { itemIdentifier: string }[] = [];

  for (const record of event.Records) {
    try {
      const body = JSON.parse(record.body);
      logger.info('Push sent', { orderId: body.detail?.orderId });
    } catch (err) {
      logger.error('Push failed', { messageId: record.messageId, err });
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures };
};
