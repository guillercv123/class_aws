import { Logger } from '@aws-lambda-powertools/logger';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import type { SagaInput } from '../lib/types';

const logger = new Logger();
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.INVENTORY_TABLE!;

/**
 * Compensación de ReserveInventory: revierte la reserva.
 *
 * Bloque 4 — TODO:
 *   Por cada item, UpdateCommand que revierte:
 *     UpdateExpression: 'SET available = available + :q, reserved = reserved - :q'
 *     (inverso exacto de la reserva)
 *   Devuelve { released: true }.
 *
 * Nota: la compensación es una acción de negocio que revierte, NO un rollback
 * de base de datos. available += q, reserved -= q deja el inventario como estaba.
 */
export const handler = async (input: SagaInput) => {
  logger.info('ReleaseInventory (compensation)', { orderId: input.orderId });

  // TODO Bloque 4: implementar.
  void ddb;
  void TABLE;
  void UpdateCommand;
  throw new Error('Not implemented: release-inventory');
};
