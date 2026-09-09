/**
 * Tests del consumidor on-product-created.
 * Bloque 6 — TODO: completar las aserciones marcadas.
 */
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const ddbMock = mockClient(DynamoDBDocumentClient);
process.env.TABLE_NAME = 'test-table';

import { handler } from '../src/handlers/on-product-created';

const ctx = {} as never;
const cb = () => undefined;

const makeEvent = (
  eventId: string,
  detail: { productId: string; categoryId: string; initialStock: number },
): never =>
  ({
    detail: { eventId, tenantId: 'tnt_001', detail },
  }) as never;

beforeEach(() => ddbMock.reset());

describe('on-product-created', () => {
  it('creates an inventory record scoped to the tenant', async () => {
    ddbMock.on(PutCommand).resolves({});

    await handler(
      makeEvent('evt-1', { productId: 'p1', categoryId: 'c1', initialStock: 100 }),
      ctx,
      cb,
    );

    // El primer PutCommand es el lock de idempotencia, el segundo el registro.
    const calls = ddbMock.commandCalls(PutCommand);
    // TODO Bloque 6: verificar que hay 2 PutCommand (lock + inventario)
    // TODO Bloque 6: verificar que el registro tiene PK 'TENANT#tnt_001#INVENTORY'
    // TODO Bloque 6: verificar que available === 100 y reserved === 0
    expect(calls.length).toBeGreaterThanOrEqual(1);
  });

  it('is idempotent: does not create a second record on replay', async () => {
    // Primer evento: lock OK
    ddbMock.on(PutCommand).resolvesOnce({});
    // Replay: el lock falla con ConditionalCheckFailedException
    const dupErr = new Error('exists');
    dupErr.name = 'ConditionalCheckFailedException';
    ddbMock.on(PutCommand).rejects(dupErr);

    await handler(makeEvent('evt-dup', { productId: 'p1', categoryId: 'c1', initialStock: 5 }), ctx, cb);
    await handler(makeEvent('evt-dup', { productId: 'p1', categoryId: 'c1', initialStock: 5 }), ctx, cb);

    // TODO Bloque 6: verificar que el registro de inventario se escribió una sola vez
    expect(true).toBe(true);
  });
});
