export class DomainError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly context?: Record<string, unknown>;

  constructor(code: string, message: string, statusCode = 400, context?: Record<string, unknown>) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
    Error.captureStackTrace?.(this, new.target);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Unauthorized', context?: Record<string, unknown>) {
    super('UNAUTHORIZED', message, 401, context);
  }
}
export class ForbiddenError extends DomainError {
  constructor(message = 'Forbidden', context?: Record<string, unknown>) {
    super('FORBIDDEN', message, 403, context);
  }
}
export class NotFoundError extends DomainError {
  constructor(resource: string, id?: string) {
    super('NOT_FOUND', `${resource}${id ? ` "${id}"` : ''} not found`, 404, { resource, id });
  }
}
export class ValidationError extends DomainError {
  constructor(message: string, context?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, 400, context);
  }
}
export class ConflictError extends DomainError {
  constructor(message: string, context?: Record<string, unknown>) {
    super('CONFLICT', message, 409, context);
  }
}
