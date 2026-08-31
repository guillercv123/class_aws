import type { APIGatewayProxyHandlerV2WithLambdaAuthorizer } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { created, errorResponse, ValidationError } from '@orderflow/shared';
import { createProductSchema } from '../lib/schemas';
import { CatalogRepository } from '../lib/catalog-repository';
import type { AuthContext } from '../types/catalog';

const logger = new Logger();

/**
 * POST /products
 *
 * Bloque 4 — TODO:
 *   1. Leer tenantId del context del authorizer.
 *   2. Parsear el body y validarlo con createProductSchema.safeParse.
 *      Si falla → throw new ValidationError(...).
 *   3. Crear el producto con el repository (scoped al tenant).
 *   4. Devolver created(product, `/products/${product.productId}`).
 *   Todo dentro de try/catch → errorResponse(err).
 */
export const handler: APIGatewayProxyHandlerV2WithLambdaAuthorizer<AuthContext> = async (event) => {
  try {
    const { tenantId } = event.requestContext.authorizer.lambda;
    logger.debug('createProduct invoked', { tenantId });

    // TODO Bloque 4: implementar.
    void createProductSchema;
    void CatalogRepository;
    void ValidationError;
    void created;
    throw new Error('Not implemented: createProduct handler');
  } catch (err) {
    logger.error('createProduct failed', { err });
    return errorResponse(err);
  }
};
