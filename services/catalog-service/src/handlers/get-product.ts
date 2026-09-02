import type {
  APIGatewayProxyWithLambdaAuthorizerHandler
} from 'aws-lambda';
import {ok, errorResponse, NotFoundError, ValidationError} from '@orderflow/shared';
import { CatalogRepository } from '../lib/catalog-repository';
import {AuthContext} from "../types/catalog";

/**
 * GET /products/{id}
 *
 * Bloque 4 — TODO:
 *   1. tenantId del context, productId de pathParameters.
 *   2. Si no hay productId → throw new NotFoundError('Product').
 *   3. repo.getProduct(productId); si null → throw new NotFoundError('Product', productId).
 *   4. Devolver ok(product).
 */
export const handler: APIGatewayProxyWithLambdaAuthorizerHandler<AuthContext> = async (event) => {
  try {
    const { tenantId } = event.requestContext.authorizer;
    const productId = event.pathParameters?.id?.trim();

    if (!productId) {
      throw new ValidationError(
          'El parámetro de ruta "id" es obligatorio',
      );
    }

    const repository = new CatalogRepository(tenantId);
    const product = await repository.getProduct(productId);

    if (!product) {
      throw new NotFoundError(
          `No se encontró el producto con ID "${productId}"`,
      );
    }

    return ok(product);
  } catch (err) {
    return errorResponse(err);
  }
};
