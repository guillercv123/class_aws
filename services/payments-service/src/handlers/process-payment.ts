import middy from '@middy/core';
import type { APIGatewayProxyHandlerV2WithLambdaAuthorizer } from 'aws-lambda';
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
const baseHandler: APIGatewayProxyHandlerV2WithLambdaAuthorizer<AuthContext> = async (event) => {
  try {
    const { tenantId } = event.requestContext.authorizer.lambda;
    logger.debug('processPayment invoked', { tenantId });

    // TODO Bloque 2/3: implementar según JSDoc.
    void ValidationError;
    void withCircuitBreaker;
    void CircuitOpenError;
    void callExternalGateway;
    void recordPaymentWithOutbox;
    void ok;
    throw new Error('Not implemented: process-payment handler');
  } catch (err) {
    logger.error('processPayment failed', { err });
    return errorResponse(err);
  }
};

export const handler = middy(baseHandler).use(idempotencyMiddleware());
