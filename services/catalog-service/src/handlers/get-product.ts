import type { APIGatewayProxyHandlerV2WithLambdaAuthorizer } from 'aws-lambda';
import { ok, errorResponse, NotFoundError } from '@orderflow/shared';
import { CatalogRepository } from '../lib/catalog-repository';
import type { AuthContext } from '../types/catalog';

/**
 * GET /products/{id}
 *
 * Bloque 4 — TODO:
 *   1. tenantId del context, productId de pathParameters.
 *   2. Si no hay productId → throw new NotFoundError('Product').
 *   3. repo.getProduct(productId); si null → throw new NotFoundError('Product', productId).
 *   4. Devolver ok(product).
 */
export const handler: APIGatewayProxyHandlerV2WithLambdaAuthorizer<AuthContext> = async (event) => {
  try {
    const { tenantId } = event.requestContext.authorizer.lambda;

    // TODO Bloque 4: implementar.
    void tenantId;
    void CatalogRepository;
    void NotFoundError;
    void ok;
    throw new Error('Not implemented: getProduct handler');
  } catch (err) {
    return errorResponse(err);
  }
};
