import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { randomUUID } from 'node:crypto';

const client = new EventBridgeClient({});
const BUS = process.env.EVENT_BUS_NAME!;

/**
 * Publica un evento en el bus custom de OrderFlow con el envelope estándar.
 * El eventId generado sirve de idempotency key para los consumidores.
 */
export async function publishEvent<T>(params: {
    source: string;
    type: string;
    tenantId: string;
    detail: T;
}): Promise<string> {
    const eventId = randomUUID();
    const envelope = {
        eventId,
        eventVersion: params.type.split('.').pop() ?? 'v1',
        tenantId: params.tenantId,
        occurredAt: new Date().toISOString(),
        detail: params.detail,
    };

    await client.send(
        new PutEventsCommand({
            Entries: [
                {
                    EventBusName: BUS,
                    Source: params.source,
                    DetailType: params.type,
                    Detail: JSON.stringify(envelope),
                },
            ],
        }),
    );

    return eventId;
}
