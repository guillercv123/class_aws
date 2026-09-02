
import { ok, errorResponse, ValidationError } from '@orderflow/shared';
import { CatalogRepository } from '../lib/catalog-repository';
import type { AuthContext } from '../types/catalog';
import {APIGatewayProxyWithLambdaAuthorizerHandler} from "aws-lambda";

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

const parseLimit = (value: string | undefined): number => {
  if (value === undefined) {
    return DEFAULT_LIMIT;
  }

  const limit = Number(value);

  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    throw new ValidationError(
        `El parámetro "limit" debe ser un número entero entre 1 y ${MAX_LIMIT}`,
    );
  }

  return limit;
};
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
export const handler: APIGatewayProxyWithLambdaAuthorizerHandler<AuthContext> = async (event) => {
  try {
    const { tenantId } = event.requestContext.authorizer;
    const categoryId = event.queryStringParameters?.categoryId?.trim();
    const limit = parseLimit(event.queryStringParameters?.limit);

    if (!categoryId) {
      throw new ValidationError('El parámetro de consulta "categoryId" es obligatorio',);
    }

    const repository = new CatalogRepository(tenantId);
    const products = await repository.listProductsByCategory(categoryId, limit);
    return ok(products);
  } catch (err) {
    return errorResponse(err);
  }
};