/**
 * Tests del payment-repository (Outbox).
 * Bloque 6 — TODO: completar las aserciones.
 */
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';

const ddbMock = mockClient(DynamoDBDocumentClient);
process.env.TABLE_NAME = 'test-payments';

import { recordPaymentWithOutbox } from '../src/lib/payment-repository';

beforeEach(() => ddbMock.reset());

describe('recordPaymentWithOutbox', () => {
  it('writes payment and outbox item atomically (one TransactWrite, 2 Puts)', async () => {
    ddbMock.on(TransactWriteCommand).resolves({});

    const paymentId = await recordPaymentWithOutbox({
      tenantId: 't1',
      orderId: 'o1',
      amount: 50,
      status: 'succeeded',
    });

    expect(paymentId).toBeDefined();
    const call = ddbMock.commandCalls(TransactWriteCommand)[0]!;
    const items = call.args[0].input.TransactItems!;
    // TODO Bloque 6: verificar que hay exactamente 2 items (payment + outbox)
    // TODO Bloque 6: verificar que el primer Put tiene PK 'TENANT#t1#PAYMENT'
    // TODO Bloque 6: verificar que el segundo Put (outbox) tiene published === false
    // TODO Bloque 6: verificar que el eventType del outbox es 'payment.succeeded.v1'
    expect(items).toHaveLength(2);
  });

  it('uses payment.failed.v1 when status is failed', async () => {
    ddbMock.on(TransactWriteCommand).resolves({});

    await recordPaymentWithOutbox({ tenantId: 't1', orderId: 'o1', amount: 50, status: 'failed' });

    const call = ddbMock.commandCalls(TransactWriteCommand)[0]!;
    const outbox = call.args[0].input.TransactItems![1]!.Put!.Item!;
    // TODO Bloque 6: verificar que outbox.eventType === 'payment.failed.v1'
    expect(outbox).toBeDefined();
  });
});
