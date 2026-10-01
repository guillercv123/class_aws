import { handler } from '../src/handlers/send-push';
import type { SQSEvent } from 'aws-lambda';

const ctx = {} as never;
const cb = () => undefined;

describe('send-push', () => {
  it('processes valid messages with no failures', async () => {
    const event = {
      Records: [{ messageId: 'm1', body: JSON.stringify({ detail: { orderId: 'o1' } }) }],
    } as SQSEvent;

    const result = await handler(event, ctx, cb);
    expect(result).toEqual({ batchItemFailures: [] });
  });

  it('reports malformed messages as failures', async () => {
    const event = {
      Records: [{ messageId: 'm-bad', body: 'not-json' }],
    } as SQSEvent;

    const result = await handler(event, ctx, cb);
    expect(result).toEqual({ batchItemFailures: [{ itemIdentifier: 'm-bad' }] });
  });
});
