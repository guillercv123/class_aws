/**
 * Tests del consumidor send-email.
 * Bloque 6 — TODO: completar las aserciones.
 */
import { handler } from '../src/handlers/send-email';
import type { SQSEvent } from 'aws-lambda';

const ctx = {} as never;
const cb = () => undefined;

const makeEvent = (messages: Array<{ id: string; email: string }>): SQSEvent =>
  ({
    Records: messages.map((m) => ({
      messageId: m.id,
      body: JSON.stringify({ detail: { orderId: 'o1', customerEmail: m.email, amount: 50 } }),
    })),
  }) as SQSEvent;

describe('send-email', () => {
  it('processes a valid message with no failures', async () => {
    const result = await handler(makeEvent([{ id: 'm1', email: 'ok@demo.dev' }]), ctx, cb);
    // TODO Bloque 6: verificar que batchItemFailures está vacío
    expect(result).toBeDefined();
  });

  it('reports the failed message in batchItemFailures (goes to DLQ after retries)', async () => {
    const result = await handler(
      makeEvent([
        { id: 'm1', email: 'ok@demo.dev' },
        { id: 'm2', email: 'fail@demo.dev' },
      ]),
      ctx,
      cb,
    );
    // TODO Bloque 6: verificar que batchItemFailures contiene { itemIdentifier: 'm2' }
    // TODO Bloque 6: verificar que 'm1' NO está en batchItemFailures
    expect(result).toBeDefined();
  });
});
