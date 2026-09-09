import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE_NAME!;
const TTL_SECONDS = 24 * 60 * 60;

/**
 * Ejecuta `fn` una sola vez por `eventId`.
 *
 * Usa una escritura condicional como lock: intenta insertar un item
 * `IDEMPOTENCY#<eventId>`; si ya existe (ConditionalCheckFailedException),
 * significa que el evento ya fue procesado y se retorna sin hacer nada.
 *
 * Esta es la defensa contra la entrega "al menos una vez" de EventBridge:
 * procesar dos veces produce el mismo resultado que procesar una vez.
 */
export async function withIdempotency(eventId: string, fn: () => Promise<void>): Promise<void> {
  try {
    await ddb.send(
      new PutCommand({
        TableName: TABLE,
        Item: {
          PK: `IDEMPOTENCY#${eventId}`,
          SK: 'LOCK',
          expiresAt: Math.floor(Date.now() / 1000) + TTL_SECONDS,
        },
        ConditionExpression: 'attribute_not_exists(PK)',
      }),
    );
  } catch (err) {
    if ((err as { name?: string }).name === 'ConditionalCheckFailedException') {
      return; // ya procesado — idempotente
    }
    throw err;
  }
  await fn();
}
