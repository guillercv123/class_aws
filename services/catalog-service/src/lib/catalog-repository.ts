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

/**
 * Repository del catálogo. Encapsula TODA la interacción con DynamoDB.
 *
 * Regla de oro de aislamiento multi-tenant:
 *   El `tenantId` se recibe en el CONSTRUCTOR (viene del context del authorizer),
 *   NUNCA del input del cliente. Así ninguna operación puede cruzar tenants.
 */
export class CatalogRepository {
  constructor(private readonly tenantId: string) {
    // TODO Bloque 3: usarás this.tenantId, client, TABLE y keys al implementar.
    void this.tenantId;
    void client;
    void TABLE;
    void keys;
  }

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
    // TODO Bloque 3: implementar.
    void input;
    void PutCommand;
    void randomUUID;
    throw new Error('Not implemented: createProduct');
  }

  /**
   * Bloque 3 — TODO:
   * Obtiene un producto por su ID dentro del tenant.
   *   Key = { PK: catalogPk(tenantId), SK: productSk(productId) }
   * Devuelve el Product o null si no existe.
   */
  async getProduct(productId: string): Promise<Product | null> {
    // TODO Bloque 3: implementar.
    void productId;
    void GetCommand;
    throw new Error('Not implemented: getProduct');
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
    // TODO Bloque 3: implementar.
    void categoryId;
    void limit;
    void QueryCommand;
    throw new Error('Not implemented: listProductsByCategory');
  }

  /**
   * Bloque 3 — TODO:
   * Crea una categoría:
   *   PK = catalogPk(tenantId), SK = categorySk(categoryId)
   *   entityType = 'Category', + campos del input + createdAt
   * Devuelve { categoryId, ...input, createdAt }.
   */
  async createCategory(input: CreateCategoryInput) {
    // TODO Bloque 3: implementar.
    void input;
    throw new Error('Not implemented: createCategory');
  }
}
