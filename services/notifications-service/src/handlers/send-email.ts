import type { SQSHandler, SQSBatchResponse } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger();

interface OrderConfirmedDetail {
  orderId: string;
  customerEmail: string;
  amount: number;
}

/**
 * Consumidor de la cola de email (fan-out desde SNS).
 *
 * Procesa cada mensaje SQS y "envía" un email (SES en producción).
 * Usa partial batch response: si un mensaje falla, solo ese vuelve a la cola;
 * tras maxReceiveCount reintentos cae a la DLQ.
 *
 * Bloque 5 — TODO:
 *   Por cada record de event.Records:
 *     1. Parsear el body (viene de SNS con RawMessageDelivery → es el envelope).
 *     2. Simular fallo si el email contiene 'fail' (para demostrar la DLQ):
 *        throw new Error('EmailProviderError').
 *     3. Loguear el envío exitoso.
 *   Si un record falla, agregarlo a batchItemFailures con su messageId
 *   (partial batch response) y continuar con el resto.
 *   Devolver { batchItemFailures }.
 */
export const handler: SQSHandler = async (event): Promise<SQSBatchResponse> => {
  const batchItemFailures: { itemIdentifier: string }[] = [];

  // TODO Bloque 5: implementar según JSDoc.
  void event;
  void logger;
  void ({} as OrderConfirmedDetail);

  return { batchItemFailures };
};
