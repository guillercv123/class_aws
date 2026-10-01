import type { DynamoDBStreamHandler } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { publishEvent, EVENT_SOURCES } from '@orderflow/shared';

const logger = new Logger();
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE_NAME!;

/**
 * Worker del Outbox: consume el DynamoDB Stream y publica los eventos outbox
 * pendientes a EventBridge, marcándolos como publicados.
 *
 * Bloque 1 — TODO:
 *   Por cada record del stream (solo INSERT):
 *     1. unmarshall(NewImage). Procesar solo items cuyo SK empiece con 'OUTBOX#'
 *        y published === false.
 *     2. publishEvent({ source: EVENT_SOURCES.payments, type: item.eventType,
 *        tenantId: item.tenantId, detail: item.detail }).
 *     3. UpdateCommand: marcar published = true en ese item del outbox.
 *   El PutEvents + Update no son atómicos, pero al ser idempotente el evento
 *   downstream, reprocesar no daña.
 */
export const handler: DynamoDBStreamHandler = async (event) => {
  for (const record of event.Records) {
    if (record.eventName !== 'INSERT') continue;
    const image = record.dynamodb?.NewImage;
    if (!image) continue;

    const item = unmarshall(image as never);
    if (typeof item.SK !== 'string' || !item.SK.startsWith('OUTBOX#')) continue;
    if (item.published === true) continue;

    await publishEvent({
      source: EVENT_SOURCES.payments,
      type: item.eventType,
      tenantId: item.tenantId,
      detail: item.detail,
    });

    await ddb.send(
        new UpdateCommand({
          TableName: TABLE,
          Key: { PK: item.PK, SK: item.SK },
          UpdateExpression: 'SET published = :t',
          ExpressionAttributeValues: { ':t': true },
        }),
    );

    logger.info('Outbox event published', { eventType: item.eventType, outboxId: item.outboxId });
  }
};
