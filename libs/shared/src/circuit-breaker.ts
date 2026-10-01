import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.CIRCUIT_TABLE!;

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitConfig {
  name: string;
  failureThreshold: number;
  openDurationMs: number;
}

export class CircuitOpenError extends Error {
  constructor(name: string) {
    super(`Circuit "${name}" is OPEN`);
    this.name = 'CircuitOpenError';
  }
}

/**
 * Ejecuta `fn` protegido por un circuit breaker cuyo estado se persiste en
 * DynamoDB (compartido entre invocaciones de Lambda, que no comparten memoria).
 *
 * Estados:
 *   CLOSED    → opera normal, cuenta fallos; al superar el umbral pasa a OPEN.
 *   OPEN      → rechaza rápido con CircuitOpenError; vencido openDurationMs
 *               pasa a HALF_OPEN al siguiente intento.
 *   HALF_OPEN → deja pasar el intento; éxito → CLOSED, fallo → OPEN de nuevo.
 */
export async function withCircuitBreaker<T>(
  config: CircuitConfig,
  fn: () => Promise<T>,
): Promise<T> {
  const circuit = await loadCircuit(config.name);
  const now = Date.now();

  if (circuit.state === 'OPEN') {
    if (now < circuit.openUntil) {
      throw new CircuitOpenError(config.name);
    }
    await setState(config.name, 'HALF_OPEN');
  }

  try {
    const result = await fn();
    await reset(config.name);
    return result;
  } catch (err) {
    if (err instanceof CircuitOpenError) throw err;
    await recordFailure(config, circuit.failureCount + 1, now);
    throw err;
  }
}

async function loadCircuit(name: string) {
  const res = await ddb.send(
    new GetCommand({ TableName: TABLE, Key: { PK: `CIRCUIT#${name}`, SK: 'STATE' } }),
  );
  return {
    state: (res.Item?.state as CircuitState) ?? 'CLOSED',
    failureCount: (res.Item?.failureCount as number) ?? 0,
    openUntil: (res.Item?.openUntil as number) ?? 0,
  };
}

async function recordFailure(config: CircuitConfig, count: number, now: number) {
  if (count >= config.failureThreshold) {
    await ddb.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { PK: `CIRCUIT#${config.name}`, SK: 'STATE' },
        UpdateExpression: 'SET #s = :open, failureCount = :c, openUntil = :u',
        ExpressionAttributeNames: { '#s': 'state' },
        ExpressionAttributeValues: {
          ':open': 'OPEN',
          ':c': count,
          ':u': now + config.openDurationMs,
        },
      }),
    );
  } else {
    await ddb.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { PK: `CIRCUIT#${config.name}`, SK: 'STATE' },
        UpdateExpression: 'SET failureCount = :c',
        ExpressionAttributeValues: { ':c': count },
      }),
    );
  }
}

async function setState(name: string, state: CircuitState) {
  await ddb.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { PK: `CIRCUIT#${name}`, SK: 'STATE' },
      UpdateExpression: 'SET #s = :st',
      ExpressionAttributeNames: { '#s': 'state' },
      ExpressionAttributeValues: { ':st': state },
    }),
  );
}

async function reset(name: string) {
  await ddb.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { PK: `CIRCUIT#${name}`, SK: 'STATE' },
      UpdateExpression: 'SET #s = :closed, failureCount = :z',
      ExpressionAttributeNames: { '#s': 'state' },
      ExpressionAttributeValues: { ':closed': 'CLOSED', ':z': 0 },
    }),
  );
}
