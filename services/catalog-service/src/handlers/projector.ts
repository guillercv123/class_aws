import type { DynamoDBStreamHandler } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { keys } from '../lib/keys';

const logger = new Logger();
const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE_NAME!;

/**
 * Projector CQRS — consume el DynamoDB Stream y materializa la vista
 * denormalizada `ProductView` (producto + nombre de su categoría).
 *
 * Bloque 5 — TODO:
 *   Por cada record del stream:
 *     1. Ignorar eventos REMOVE.
 *     2. Tomar NewImage; si no hay, saltar.
 *     3. unmarshall(image). Procesar solo entityType === 'Product'.
 *        (Ignorar 'ProductView' para evitar bucles: el projector escribe VIEWs.)
 *     4. GetItem de la categoría: Key { PK: item.PK, SK: keys.categorySk(item.categoryId) }.
 *        categoryName = cat?.name ?? 'Uncategorized'.
 *     5. PutItem de la vista:
 *        PK = item.PK, SK = keys.productViewSk(item.productId),
 *        entityType = 'ProductView', + campos denormalizados.
 *   El PutCommand es idempotente por diseño (reprocesar no daña).
 */
export const handler: DynamoDBStreamHandler = async (event) => {
  // TODO Bloque 5: usarás client, TABLE, keys, unmarshall, Put/GetCommand al implementar.
  void client;
  void TABLE;
  void keys;
  void unmarshall;
  void PutCommand;
  void GetCommand;

  for (const record of event.Records) {
    // TODO Bloque 5: implementar.
    void record;
    logger.debug('projector record (not implemented)');
  }
};
