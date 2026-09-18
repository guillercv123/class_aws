import type { APIGatewayProxyWithLambdaAuthorizerHandler } from 'aws-lambda';
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
export const handler: APIGatewayProxyWithLambdaAuthorizerHandler<AuthContext> = async (event) => {
  try {
    const { tenantId } = event.requestContext.authorizer;
    const body = JSON.parse(event.body ?? '{}');
    if (!Array.isArray(body.items) || body.items.length === 0) {
      throw new ValidationError('items is required and must be non-empty');
    }
    if (typeof body.amount !== 'number' || body.amount <= 0) {
      throw new ValidationError('amount must be a positive number');
    }

    const orderId = randomUUID();
    const sagaInput = { tenantId, orderId, items: body.items, amount: body.amount };

    const exec = await sfn.send(
        new StartExecutionCommand({
          stateMachineArn: STATE_MACHINE_ARN,
          name: orderId,
          input: JSON.stringify(sagaInput),
        }),
    );

    logger.info('Order saga started', { tenantId, orderId });
    return ok({ orderId, status: 'processing', executionArn: exec.executionArn });
  } catch (err) {
    logger.error('createOrder failed', { err });
    return errorResponse(err);
  }
};
