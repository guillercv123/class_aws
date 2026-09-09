import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const ddbMock = mockClient(DynamoDBDocumentClient);
process.env.TABLE_NAME = 'test-table';

import { withIdempotency } from '../src/lib/idempotency';

beforeEach(() => ddbMock.reset());

describe('withIdempotency', () => {
  it('runs the function when the lock is acquired', async () => {
    ddbMock.on(PutCommand).resolves({});
    const fn = jest.fn(async () => {});

    await withIdempotency('evt-1', fn);

    expect(fn).toHaveBeenCalledTimes(1);
    const call = ddbMock.commandCalls(PutCommand)[0]!;
    expect(call.args[0].input.Item?.PK).toBe('IDEMPOTENCY#evt-1');
    expect(call.args[0].input.ConditionExpression).toBe('attribute_not_exists(PK)');
  });

  it('skips the function when the event was already processed', async () => {
    const err = new Error('exists');
    err.name = 'ConditionalCheckFailedException';
    ddbMock.on(PutCommand).rejects(err);
    const fn = jest.fn(async () => {});

    await withIdempotency('evt-dup', fn);

    expect(fn).not.toHaveBeenCalled();
  });

  it('rethrows unexpected errors', async () => {
    ddbMock.on(PutCommand).rejects(new Error('boom'));
    const fn = jest.fn(async () => {});

    await expect(withIdempotency('evt-x', fn)).rejects.toThrow('boom');
    expect(fn).not.toHaveBeenCalled();
  });

  it('sets a TTL on the lock item', async () => {
    ddbMock.on(PutCommand).resolves({});
    await withIdempotency('evt-ttl', async () => {});

    const call = ddbMock.commandCalls(PutCommand)[0]!;
    expect(call.args[0].input.Item?.expiresAt).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });
});
