import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'node:crypto';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE_NAME!;

export interface RecordPaymentParams {
  tenantId: string;
  orderId: string;
  amount: number;
  status: 'succeeded' | 'failed';
}

/**
 * Escribe el registro de pago Y el evento outbox de forma ATÓMICA
 * (TransactWriteItems). Esta es la base del patrón Outbox: si la transacción
 * falla, no se escribe ninguno de los dos; si tiene éxito, se escriben ambos.
 * Un worker separado (outbox-worker) drena el outbox y publica el evento.
 *
 * Bloque 1 — TODO:
 *   Usar TransactWriteCommand con DOS Put:
 *     1) El pago:
 *        PK = `TENANT#${tenantId}#PAYMENT`, SK = `PAYMENT#${paymentId}`
 *        { paymentId, orderId, amount, status, createdAt }
 *     2) El evento outbox (misma transacción):
 *        PK = `TENANT#${tenantId}#OUTBOX`, SK = `OUTBOX#${outboxId}`
 *        { outboxId, eventType, tenantId, detail, published: false, createdAt }
 *        eventType = status === 'succeeded' ? 'payment.succeeded.v1' : 'payment.failed.v1'
 *   Devolver el paymentId.
 */
export async function recordPaymentWithOutbox(params: RecordPaymentParams): Promise<string> {
  const paymentId = randomUUID();
  const outboxId = randomUUID();
  const now = new Date().toISOString();
  const eventType =
      params.status === 'succeeded' ? 'payment.succeeded.v1' : 'payment.failed.v1';

  await ddb.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: TABLE,
              Item: {
                PK: `TENANT#${params.tenantId}#PAYMENT`,
                SK: `PAYMENT#${paymentId}`,
                paymentId,
                orderId: params.orderId,
                amount: params.amount,
                status: params.status,
                createdAt: now,
              },
            },
          },
          {
            Put: {
              TableName: TABLE,
              Item: {
                PK: `TENANT#${params.tenantId}#OUTBOX`,
                SK: `OUTBOX#${outboxId}`,
                outboxId,
                eventType,
                tenantId: params.tenantId,
                detail: { paymentId, orderId: params.orderId, amount: params.amount },
                published: false,
                createdAt: now,
              },
            },
          },
        ],
      }),
  );

  return paymentId;
}
