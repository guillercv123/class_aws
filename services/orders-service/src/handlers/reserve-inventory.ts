import { Logger } from '@aws-lambda-powertools/logger';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import type { SagaInput } from '../lib/types';

const logger = new Logger();
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.INVENTORY_TABLE!;

/**
 * Paso de la Saga: reserva inventario para cada item de la orden.
 *
 * Bloque 4 — TODO:
 *   Por cada item:
 *     UpdateCommand sobre la tabla de inventario:
 *       Key { PK: `TENANT#${tenantId}#INVENTORY`, SK: `PRODUCT#${productId}` }
 *       UpdateExpression: 'SET available = available - :q, reserved = reserved + :q'
 *       ConditionExpression: 'available >= :q'   (falla si no hay stock → dispara Catch)
 *       ExpressionAttributeValues: { ':q': item.quantity }
 *   Devuelve { reserved: true, items }.
 */
export const handler = async (input: SagaInput) => {
  logger.info('ReserveInventory', { orderId: input.orderId });

  // TODO Bloque 4: implementar.
  void ddb;
  void TABLE;
  void UpdateCommand;
  throw new Error('Not implemented: reserve-inventory');
};
