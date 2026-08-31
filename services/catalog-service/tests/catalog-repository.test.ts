/**
 * Tests del CatalogRepository.
 *
 * Bloque 6 — TODO: completar las aserciones marcadas.
 * Usa aws-sdk-client-mock para no tocar AWS real.
 *
 * El test de aislamiento (scopes reads to the tenant partition) es OBLIGATORIO:
 * es la verificación de OWASP API1 (BOLA) a nivel de repositorio.
 */
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const ddbMock = mockClient(DynamoDBDocumentClient);
process.env.TABLE_NAME = 'test-table';

import { CatalogRepository } from '../src/lib/catalog-repository';

beforeEach(() => ddbMock.reset());

describe('CatalogRepository', () => {
  it('creates a product scoped to the tenant', async () => {
    ddbMock.on(PutCommand).resolves({});
    const repo = new CatalogRepository('tnt_001');

    const product = await repo.createProduct({
      name: 'Latte',
      price: 12.5,
      categoryId: 'cat_bebidas',
      status: 'active',
    });

    // TODO Bloque 6: verificar que product.productId está definido
    // TODO Bloque 6: verificar que el Item tiene PK 'TENANT#tnt_001#CATALOG'
    // TODO Bloque 6: verificar que GSI1PK = 'TENANT#tnt_001#CATEGORY#cat_bebidas'
    const call = ddbMock.commandCalls(PutCommand)[0]!;
    expect(call.args[0].input.Item?.PK).toBe('TENANT#tnt_001#CATALOG');
    void product;
  });

  it('returns null when product not found', async () => {
    ddbMock.on(GetCommand).resolves({ Item: undefined });
    const repo = new CatalogRepository('tnt_001');

    // TODO Bloque 6: verificar que getProduct devuelve null
    const result = await repo.getProduct('nope');
    expect(result).toBeNull();
  });

  it('scopes reads to the tenant partition (OWASP API1 / BOLA)', async () => {
    ddbMock.on(GetCommand).resolves({ Item: undefined });
    const repo = new CatalogRepository('tnt_999');

    await repo.getProduct('p1');

    // TODO Bloque 6: verificar que el Key.PK usado es 'TENANT#tnt_999#CATALOG'
    const call = ddbMock.commandCalls(GetCommand)[0]!;
    expect(call.args[0].input.Key?.PK).toBe('TENANT#tnt_999#CATALOG');
  });

  it('lists products by category via GSI1', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [] });
    const repo = new CatalogRepository('tnt_001');

    await repo.listProductsByCategory('cat_bebidas', 10);

    // TODO Bloque 6: verificar que se usó IndexName 'GSI1'
    // TODO Bloque 6: verificar que :pk = 'TENANT#tnt_001#CATEGORY#cat_bebidas'
    const call = ddbMock.commandCalls(QueryCommand)[0]!;
    expect(call.args[0].input.IndexName).toBe('GSI1');
  });
});
