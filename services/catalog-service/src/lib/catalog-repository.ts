import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'node:crypto';
import { keys } from './keys';
import type { CreateProductInput, CreateCategoryInput } from './schemas';
import type { Product } from '../types/catalog';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE_NAME!;

type ProductItem = Product & {
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
  entityType: 'Product';
};

type Category = CreateCategoryInput & {
  categoryId: string;
  createdAt: string;
};

type CategoryItem = Category & {
  PK: string;
  SK: string;
  entityType: 'Category';
};

const toProduct = (item: ProductItem): Product => ({
  productId: item.productId,
  name: item.name,
  price: item.price,
  categoryId: item.categoryId,
  status: item.status,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

/**
 * Repository del catálogo. Encapsula TODA la interacción con DynamoDB.
 *
 * Regla de oro de aislamiento multi-tenant:
 *   El `tenantId` se recibe en el CONSTRUCTOR (viene del context del authorizer),
 *   NUNCA del input del cliente. Así ninguna operación puede cruzar tenants.
 */
export class CatalogRepository {
  constructor(private readonly tenantId: string) {}

  /**
   * Bloque 3 — TODO:
   * Crea un producto con:
   *   - PK = keys.catalogPk(tenantId)
   *   - SK = keys.productSk(productId)   (productId nuevo con randomUUID)
   *   - GSI1PK = keys.gsi1CategoryPk(tenantId, categoryId)
   *   - GSI1SK = keys.productSk(productId)
   *   - entityType = 'Product'
   *   - los campos del input + createdAt/updatedAt (ISO string)
   * Usa ConditionExpression 'attribute_not_exists(PK)' para no sobrescribir.
   * Devuelve el Product creado.
   */
  async createProduct(input: CreateProductInput): Promise<Product> {
    const productId = randomUUID();
    const now = new Date().toISOString();
    const product: Product = {
      productId,
      ...input,
      createdAt: now,
      updatedAt: now,
    };

    const item: ProductItem = {
      PK: keys.catalogPk(this.tenantId),
      SK: keys.productSk(productId),
      GSI1PK: keys.gsi1CategoryPk(this.tenantId, input.categoryId),
      GSI1SK: keys.productSk(productId),
      entityType: 'Product',
      ...product,
    };

    await client.send(
        new PutCommand({
          TableName: TABLE,
          Item: item,
          ConditionExpression: 'attribute_not_exists(PK)',
        }),
    );

    return product;
  }

  /**
   * Bloque 3 — TODO:
   * Obtiene un producto por su ID dentro del tenant.
   *   Key = { PK: catalogPk(tenantId), SK: productSk(productId) }
   * Devuelve el Product o null si no existe.
   */
  async getProduct(productId: string): Promise<Product | null> {
    const result = await client.send(
        new GetCommand({
          TableName: TABLE,
          Key: {
            PK: keys.catalogPk(this.tenantId),
            SK: keys.productSk(productId),
          },
        }),
    );

    if (!result.Item) {
      return null;
    }

    return toProduct(result.Item as ProductItem);
  }

  /**
   * Bloque 3 — TODO:
   * Lista productos de una categoría usando el índice GSI1.
   *   IndexName = 'GSI1'
   *   KeyConditionExpression = 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)'
   *   :pk = gsi1CategoryPk(tenantId, categoryId), :sk = 'PRODUCT#'
   * Respeta el `limit` recibido.
   */
  async listProductsByCategory(categoryId: string, limit = 25): Promise<Product[]> {
    const result = await client.send(
        new QueryCommand({
          TableName: TABLE,
          IndexName: 'GSI1',
          KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
          ExpressionAttributeValues: {
            ':pk': keys.gsi1CategoryPk(this.tenantId, categoryId),
            ':sk': 'PRODUCT#',
          },
          Limit: limit,
        }),
    );

    return ((result.Items ?? []) as ProductItem[]).map(toProduct);
  }

  /**
   * Bloque 3 — TODO:
   * Crea una categoría:
   *   PK = catalogPk(tenantId), SK = categorySk(categoryId)
   *   entityType = 'Category', + campos del input + createdAt
   * Devuelve { categoryId, ...input, createdAt }.
   */
  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const categoryId = randomUUID();
    const createdAt = new Date().toISOString();
    const category: Category = {
      categoryId,
      ...input,
      createdAt,
    };

    const item: CategoryItem = {
      PK: keys.catalogPk(this.tenantId),
      SK: keys.categorySk(categoryId),
      entityType: 'Category',
      ...category,
    };

    await client.send(
        new PutCommand({
          TableName: TABLE,
          Item: item,
        }),
    );

    return category;
  }
}
