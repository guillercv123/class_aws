import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { DomainError } from './errors';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
} as const;

export function ok<T>(body: T, extraHeaders: Record<string, string> = {}): APIGatewayProxyStructuredResultV2 {
  return { statusCode: 200, headers: { ...DEFAULT_HEADERS, ...extraHeaders }, body: JSON.stringify(body) };
}
export function created<T>(body: T, location?: string): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode: 201,
    headers: { ...DEFAULT_HEADERS, ...(location ? { Location: location } : {}) },
    body: JSON.stringify(body),
  };
}
export function noContent(): APIGatewayProxyStructuredResultV2 {
  return { statusCode: 204, headers: DEFAULT_HEADERS };
}
export function errorResponse(err: unknown): APIGatewayProxyStructuredResultV2 {
  if (err instanceof DomainError) {
    return {
      statusCode: err.statusCode,
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({ code: err.code, message: err.message }),
    };
  }
  return {
    statusCode: 500,
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({ code: 'INTERNAL_ERROR', message: 'Internal server error' }),
  };
}
