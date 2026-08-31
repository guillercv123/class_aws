import type { APIGatewayProxyHandlerV2WithLambdaAuthorizer } from 'aws-lambda';
import { ok, errorResponse, ValidationError } from '@orderflow/shared';
import { CatalogRepository } from '../lib/catalog-repository';
import type { AuthContext } from '../types/catalog';

/**
 * GET /products?category=<id>&limit=<n>
 *
 * Bloque 4 — TODO:
 *   1. tenantId del context.
 *   2. categoryId de queryStringParameters.category; si falta → ValidationError.
 *   3. Acotar el límite entre 1 y 100 (OWASP API4): Math.min(Math.max(raw,1),100).
 *   4. repo.listProductsByCategory(categoryId, limit).
 *   5. Devolver ok({ items, count }).
 */
export const handler: APIGatewayProxyHandlerV2WithLambdaAuthorizer<AuthContext> = async (event) => {
  try {
    const { tenantId } = event.requestContext.authorizer.lambda;

    // TODO Bloque 4: implementar.
    void tenantId;
    void CatalogRepository;
    void ValidationError;
    void ok;
    throw new Error('Not implemented: listProducts handler');
  } catch (err) {
    return errorResponse(err);
  }
};
