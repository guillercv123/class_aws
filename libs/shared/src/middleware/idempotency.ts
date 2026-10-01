import type { MiddlewareObj } from '@middy/core';
import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.IDEMPOTENCY_TABLE!;
const TTL = 24 * 60 * 60;

/**
 * Middleware de idempotencia por header `Idempotency-Key`.
 *
 * - before: si la key ya tiene una respuesta guardada, hace short-circuit
 *   devolviéndola (evita reprocesar / cobrar dos veces).
 * - after: guarda la respuesta bajo la key con TTL de 24h.
 *
 * Sin header Idempotency-Key el middleware no hace nada (opt-in por request).
 */
export function idempotencyMiddleware(): MiddlewareObj<
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2
> {
  return {
    before: async (request) => {
      const key = request.event.headers?.['idempotency-key'];
      if (!key) return;

      const existing = await ddb.send(
        new GetCommand({ TableName: TABLE, Key: { PK: `IDEMP#${key}`, SK: 'RESULT' } }),
      );
      if (existing.Item?.response) {
        return JSON.parse(existing.Item.response as string);
      }
    },
    after: async (request) => {
      const key = request.event.headers?.['idempotency-key'];
      if (!key || !request.response) return;

      try {
        await ddb.send(
          new PutCommand({
            TableName: TABLE,
            Item: {
              PK: `IDEMP#${key}`,
              SK: 'RESULT',
              response: JSON.stringify(request.response),
              expiresAt: Math.floor(Date.now() / 1000) + TTL,
            },
            ConditionExpression: 'attribute_not_exists(PK)',
          }),
        );
      } catch (err) {
        // Otra invocación concurrente ya guardó la respuesta: no es un error.
        if ((err as { name?: string }).name !== 'ConditionalCheckFailedException') throw err;
      }
    },
  };
}
