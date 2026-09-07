import { handler } from '../src/handlers/validate-order';
import type { SagaInput } from '../src/lib/types';

const base: SagaInput = {
  tenantId: 'tnt_001',
  orderId: 'o1',
  items: [{ productId: 'p1', quantity: 2 }],
  amount: 25,
};

describe('validate-order', () => {
  it('accepts a valid order', async () => {
    await expect(handler(base)).resolves.toEqual({ valid: true });
  });

  it('rejects an order with no items', async () => {
    await expect(handler({ ...base, items: [] })).rejects.toThrow('no items');
  });

  it('rejects a non-positive amount', async () => {
    await expect(handler({ ...base, amount: 0 })).rejects.toThrow('positive');
  });

  it('rejects invalid item quantity', async () => {
    await expect(
      handler({ ...base, items: [{ productId: 'p1', quantity: 0 }] }),
    ).rejects.toThrow('Invalid quantity');
  });
});
