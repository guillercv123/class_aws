/**
 * Test de la compensación de la Saga.
 * Bloque 6 — TODO: completar las aserciones.
 *
 * Verifica la invariante clave: reservar y luego liberar deja el inventario
 * en efecto neto cero (la compensación es el inverso exacto de la reserva).
 */
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const ddbMock = mockClient(DynamoDBDocumentClient);
process.env.INVENTORY_TABLE = 'test-inventory';

import { handler as reserve } from '../src/handlers/reserve-inventory';
import { handler as release } from '../src/handlers/release-inventory';
import type { SagaInput } from '../src/lib/types';

const input: SagaInput = {
  tenantId: 't1',
  orderId: 'o1',
  items: [{ productId: 'p1', quantity: 3 }],
  amount: 30,
};

beforeEach(() => ddbMock.reset());

describe('saga compensation', () => {
  it('reserve then release leaves inventory net zero', async () => {
    ddbMock.on(UpdateCommand).resolves({});

    await reserve(input);
    await release(input);

    const calls = ddbMock.commandCalls(UpdateCommand);
    // TODO Bloque 6: verificar que hay 2 UpdateCommand
    // TODO Bloque 6: verificar que reserve usa 'available - :q'
    // TODO Bloque 6: verificar que release usa 'available + :q'
    expect(calls.length).toBeGreaterThanOrEqual(2);
  });

  it('reserve scopes the update to the tenant partition', async () => {
    ddbMock.on(UpdateCommand).resolves({});
    await reserve(input);

    const call = ddbMock.commandCalls(UpdateCommand)[0]!;
    // TODO Bloque 6: verificar que Key.PK === 'TENANT#t1#INVENTORY'
    expect(call.args[0].input.Key).toBeDefined();
  });
});
