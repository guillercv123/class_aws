import type { APIGatewayProxyHandlerV2WithLambdaAuthorizer } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn';
import { randomUUID } from 'node:crypto';
import { ok, errorResponse, ValidationError } from '@orderflow/shared';
import type { AuthContext } from '../lib/types';

const logger = new Logger();
const sfn = new SFNClient({});
const STATE_MACHINE_ARN = process.env.STATE_MACHINE_ARN!;

/**
 * POST /orders — inicia la Saga de creación de orden.
 *
 * Bloque 4 — TODO:
 *   1. tenantId del context del authorizer.
 *   2. Parsear body: { items: [{productId, quantity}], amount }. Validar mínimos.
 *   3. Generar orderId con randomUUID().
 *   4. StartExecutionCommand con input = JSON.stringify({ tenantId, orderId, items, amount }).
 *   5. Devolver ok({ orderId, status: 'processing', executionArn }).
 */
export const handler: APIGatewayProxyHandlerV2WithLambdaAuthorizer<AuthContext> = async (event) => {
  try {
    const { tenantId } = event.requestContext.authorizer.lambda;
    logger.debug('createOrder invoked', { tenantId });

    // TODO Bloque 4: implementar según JSDoc.
    void sfn;
    void STATE_MACHINE_ARN;
    void StartExecutionCommand;
    void randomUUID;
    void ValidationError;
    void ok;
    throw new Error('Not implemented: create-order handler');
  } catch (err) {
    logger.error('createOrder failed', { err });
    return errorResponse(err);
  }
};
