/**
 * Test del paso de pago simulado.
 * Bloque 6 — TODO: completar las aserciones.
 */
import { handler } from '../src/handlers/process-payment';
import type { SagaInput } from '../src/lib/types';

const base: SagaInput = {
  tenantId: 't1',
  orderId: 'o1',
  items: [{ productId: 'p1', quantity: 1 }],
  amount: 50,
};

describe('process-payment (simulated)', () => {
  it('succeeds for amounts under the threshold', async () => {
    const result = await handler(base);
    // TODO Bloque 6: verificar que result.status === 'succeeded'
    // TODO Bloque 6: verificar que result.paymentId está definido
    expect(result).toBeDefined();
  });

  it('declines for amounts over 1000 (triggers compensation)', async () => {
    // TODO Bloque 6: verificar que handler({ ...base, amount: 5000 }) rechaza con 'PaymentDeclined'
    await expect(handler({ ...base, amount: 5000 })).rejects.toThrow();
  });
});
