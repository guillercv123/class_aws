import type { APIGatewayProxyHandlerV2WithLambdaAuthorizer } from 'aws-lambda';
import { created, errorResponse, ValidationError } from '@orderflow/shared';
import { createCategorySchema } from '../lib/schemas';
import { CatalogRepository } from '../lib/catalog-repository';
import type { AuthContext } from '../types/catalog';

/**
 * POST /categories
 *
 * Bloque 4 — TODO:
 *   1. tenantId del context.
 *   2. Validar body con createCategorySchema.safeParse; si falla → ValidationError.
 *   3. repo.createCategory(parsed.data).
 *   4. Devolver created(category, `/categories/${category.categoryId}`).
 */
export const handler: APIGatewayProxyHandlerV2WithLambdaAuthorizer<AuthContext> = async (event) => {
  try {
    const { tenantId } = event.requestContext.authorizer.lambda;

    // TODO Bloque 4: implementar.
    void tenantId;
    void createCategorySchema;
    void CatalogRepository;
    void ValidationError;
    void created;
    throw new Error('Not implemented: createCategory handler');
  } catch (err) {
    return errorResponse(err);
  }
};
