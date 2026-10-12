import middy from '@middy/core';
import type {APIGatewayProxyWithLambdaAuthorizerHandler} from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import {
  ok,
  errorResponse,
  ValidationError,
  withCircuitBreaker,
  CircuitOpenError,
  idempotencyMiddleware,
} from '@orderflow/shared';
import { callExternalGateway } from '../lib/payment-gateway';
import { recordPaymentWithOutbox } from '../lib/payment-repository';

interface AuthContext {
  tenantId: string;
  userId: string;
  roles: string;
  permissions: string;
}

const logger = new Logger();

/**
 * POST /payments — procesa un pago con resiliencia completa:
 *   - Idempotencia por Idempotency-Key (middleware Middy, ya envuelto abajo).
 *   - Circuit Breaker protege la llamada al gateway externo.
 *   - Outbox garantiza que el evento de resultado salga siempre.
 *
 * Bloque 2/3 — TODO:
 *   1. tenantId del context; parsear body { orderId, amount }. Validar mínimos.
 *   2. Llamar al gateway PROTEGIDO por withCircuitBreaker:
 *        await withCircuitBreaker(
 *          { name: 'payment-gateway', failureThreshold: 3, openDurationMs: 30000 },
 *          () => callExternalGateway(amount),
 *        )
 *      Capturar:
 *        - CircuitOpenError → responder 503 (o status 'unavailable').
 *        - PaymentDeclined  → registrar con status 'failed' vía outbox.
 *   3. Si el gateway aprueba → recordPaymentWithOutbox(status: 'succeeded').
 *   4. Devolver ok({ paymentId, status }).
 */
const baseHandler: APIGatewayProxyWithLambdaAuthorizerHandler<AuthContext> = async (event) => {
  try {
    const { tenantId } = event.requestContext.authorizer;

    const body = JSON.parse(event.body ?? '{}');
    logger.debug('processPayment invoked', { tenantId });
/*    if (typeof body.orderId !== 'string' || !body.orderId) {
      throw new ValidationError('orderId is required');
    }*/
    if (typeof body.amount !== 'number' || body.amount <= 0) {
      throw new ValidationError('amount must be a positive number');
    }

    try {
      await withCircuitBreaker(
          { name: 'payment-gateway', failureThreshold: 3, openDurationMs: 30_000 },
          () => callExternalGateway(body.amount),
      );
    } catch (err) {
      if (err instanceof CircuitOpenError) {
        return { statusCode: 503, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: 'GATEWAY_UNAVAILABLE', message: 'Payment gateway temporarily unavailable' }) };
      }
      if ((err as Error).message === 'PaymentDeclined') {
        const failedId = await recordPaymentWithOutbox({ tenantId, orderId: body.orderId, amount: body.amount, status: 'failed' });
        return ok({ paymentId: failedId, status: 'failed' });
      }
      throw err;
    }

    const paymentId = await recordPaymentWithOutbox({
      tenantId,
      orderId: body.orderId,
      amount: body.amount,
      status: 'succeeded',
    });

    logger.info('Payment processed', { tenantId, paymentId });
    return ok({ paymentId, status: 'succeeded' });
  } catch (err) {
    logger.error('processPayment failed', { err });
    return errorResponse(err);
  }
};

export const handler = middy(baseHandler).use(idempotencyMiddleware());