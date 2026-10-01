import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const ddbMock = mockClient(DynamoDBDocumentClient);
process.env.CIRCUIT_TABLE = 'test-circuit';

import { withCircuitBreaker, CircuitOpenError } from '@orderflow/shared';

const config = { name: 'test-gw', failureThreshold: 3, openDurationMs: 30_000 };

beforeEach(() => ddbMock.reset());

describe('withCircuitBreaker', () => {
  it('runs fn and resets when CLOSED and fn succeeds', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { state: 'CLOSED', failureCount: 0, openUntil: 0 } });
    ddbMock.on(UpdateCommand).resolves({});

    const result = await withCircuitBreaker(config, async () => 'ok');
    expect(result).toBe('ok');
    // reset() escribe CLOSED + failureCount 0
    const resetCall = ddbMock.commandCalls(UpdateCommand).at(-1)!;
    expect(resetCall.args[0].input.ExpressionAttributeValues?.[':closed']).toBe('CLOSED');
  });

  it('opens the circuit after reaching the failure threshold', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { state: 'CLOSED', failureCount: 2, openUntil: 0 } });
    ddbMock.on(UpdateCommand).resolves({});

    await expect(withCircuitBreaker(config, async () => { throw new Error('gw down'); })).rejects.toThrow('gw down');

    const call = ddbMock.commandCalls(UpdateCommand)[0]!;
    // 3er fallo (2+1) alcanza el umbral → escribe OPEN
    expect(call.args[0].input.ExpressionAttributeValues?.[':open']).toBe('OPEN');
  });

  it('rejects fast with CircuitOpenError when OPEN and not yet expired', async () => {
    const future = Date.now() + 20_000;
    ddbMock.on(GetCommand).resolves({ Item: { state: 'OPEN', failureCount: 3, openUntil: future } });

    const fn = jest.fn(async () => 'should not run');
    await expect(withCircuitBreaker(config, fn)).rejects.toBeInstanceOf(CircuitOpenError);
    expect(fn).not.toHaveBeenCalled();
  });

  it('transitions to HALF_OPEN and tries fn after openUntil elapses', async () => {
    const past = Date.now() - 1000;
    ddbMock.on(GetCommand).resolves({ Item: { state: 'OPEN', failureCount: 3, openUntil: past } });
    ddbMock.on(UpdateCommand).resolves({});

    const result = await withCircuitBreaker(config, async () => 'recovered');
    expect(result).toBe('recovered');
    // Debe haber pasado por HALF_OPEN (un Update de setState)
    const halfOpen = ddbMock
      .commandCalls(UpdateCommand)
      .some((c) => c.args[0].input.ExpressionAttributeValues?.[':st'] === 'HALF_OPEN');
    expect(halfOpen).toBe(true);
  });

  it('increments failure count without opening below the threshold', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { state: 'CLOSED', failureCount: 0, openUntil: 0 } });
    ddbMock.on(UpdateCommand).resolves({});

    await expect(withCircuitBreaker(config, async () => { throw new Error('x'); })).rejects.toThrow('x');
    const call = ddbMock.commandCalls(UpdateCommand)[0]!;
    expect(call.args[0].input.ExpressionAttributeValues?.[':c']).toBe(1);
    expect(call.args[0].input.ExpressionAttributeValues?.[':open']).toBeUndefined();
  });
});
