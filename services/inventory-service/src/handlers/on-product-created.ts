import type { EventBridgeHandler } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { withIdempotency } from '../lib/idempotency';

const logger = new Logger();
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE_NAME!;

interface ProductCreatedEnvelope {
  eventId: string;
  tenantId: string;
  detail: { productId: string; categoryId: string; initialStock: number };
}

/**
 * Consumidor de `product.created.v1`.
 *
 * Bloque 2 — TODO:
 *   1. Extraer eventId, tenantId y detail de event.detail (el envelope).
 *   2. Envolver el trabajo en withIdempotency(eventId, async () => { ... }).
 *   3. Dentro: PutItem de un registro de inventario con:
 *        PK = `TENANT#${tenantId}#INVENTORY`
 *        SK = `PRODUCT#${detail.productId}`
 *        productId, available = detail.initialStock ?? 0, reserved = 0, updatedAt
 *      ConditionExpression 'attribute_not_exists(SK)' para no pisar existente.
 *   4. Loguear el registro creado.
 */
export const handler: EventBridgeHandler<string, ProductCreatedEnvelope, void> = async (event) => {
  const { eventId, tenantId, detail } = event.detail;

  await withIdempotency(eventId, async () => {
    await ddb.send(
        new PutCommand({
          TableName: TABLE,
          Item: {
            PK: `TENANT#${tenantId}#INVENTORY`,
            SK: `PRODUCT#${detail.productId}`,
            productId: detail.productId,
            available: detail.initialStock ?? 0,
            reserved: 0,
            updatedAt: new Date().toISOString(),
          },
          ConditionExpression: 'attribute_not_exists(SK)',
        }),
    );
    logger.info('Inventory record created', { tenantId, productId: detail.productId });
  });
};
