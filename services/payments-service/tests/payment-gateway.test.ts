import { callExternalGateway } from '../src/lib/payment-gateway';

describe('callExternalGateway (mock)', () => {
  afterEach(() => {
    delete process.env.GATEWAY_FORCE_FAIL;
  });

  it('approves amounts under the limit', async () => {
    const result = await callExternalGateway(50);
    expect(result.status).toBe('approved');
    expect(result.gatewayRef).toMatch(/^gw_/);
  });

  it('declines amounts over 1000', async () => {
    await expect(callExternalGateway(5000)).rejects.toThrow('PaymentDeclined');
  });

  it('fails when GATEWAY_FORCE_FAIL is set (for circuit breaker demo)', async () => {
    process.env.GATEWAY_FORCE_FAIL = 'true';
    await expect(callExternalGateway(10)).rejects.toThrow('GatewayUnavailable');
  });
});
