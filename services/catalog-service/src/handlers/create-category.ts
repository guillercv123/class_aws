import type {
  APIGatewayProxyWithLambdaAuthorizerHandler
} from 'aws-lambda';
import { created, errorResponse, ValidationError } from '@orderflow/shared';
import { createCategorySchema } from '../lib/schemas';
import { CatalogRepository } from '../lib/catalog-repository';
import type { AuthContext } from '../types/catalog';

const parseJsonBody = (body: string | null): unknown => {
  if (!body) {
    throw new ValidationError('El cuerpo de la solicitud es obligatorio');
  }
  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new ValidationError('El cuerpo de la solicitud no contiene un JSON válido');
  }
};
/**
 * POST /categories
 *
 * Bloque 4 — TODO:
 *   1. tenantId del context.
 *   2. Validar body con createCategorySchema.safeParse; si falla → ValidationError.
 *   3. repo.createCategory(parsed.data).
 *   4. Devolver created(category, `/categories/${category.categoryId}`).
 */
export const handler: APIGatewayProxyWithLambdaAuthorizerHandler<AuthContext> = async (event) => {
  try {
    const { tenantId } = event.requestContext.authorizer;

    const body = parseJsonBody(event.body);
    const validationResult = createCategorySchema.safeParse(body);

    if (!validationResult.success) {
      throw new ValidationError(
          validationResult.error.issues
              .map((issue) => {
                const path = issue.path.join('.');
                return path
                    ? `${path}: ${issue.message}`
                    : issue.message;
              })
              .join(', '),
      );
    }

    const repository = new CatalogRepository(tenantId);
    const category = await repository.createCategory(validationResult.data);
    return created(category);
  } catch (err) {
    return errorResponse(err);
  }
};
