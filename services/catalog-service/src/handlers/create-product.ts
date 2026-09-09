import type { APIGatewayProxyWithLambdaAuthorizerHandler } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import {
  created,
      errorResponse,
      ValidationError,
      publishEvent,
      EVENT_SOURCES,
      EVENT_TYPES,
} from '@orderflow/shared';
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
export const handler: APIGatewayProxyWithLambdaAuthorizerHandler<AuthContext> = async (event) => {
  try {
    const { tenantId } = event.requestContext.authorizer;

    const body = JSON.parse(event.body ?? '{}');
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid product payload', { issues: parsed.error.issues });
    }

    const repo = new CatalogRepository(tenantId);
    const product = await repo.createProduct(parsed.data);
    await publishEvent({
      source: EVENT_SOURCES.catalog,
      type: EVENT_TYPES.productCreated,
      tenantId,
      detail: { productId: product.productId, categoryId: product.categoryId, initialStock: 0 },
    });

    logger.info('Product created', { tenantId, productId: product.productId });
    return created(product, `/products/${product.productId}`);
  } catch (err) {
    logger.error('createProduct failed', { err });
    return errorResponse(err);
  }
};