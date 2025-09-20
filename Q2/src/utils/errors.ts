export class BaseError extends Error {
  public statusCode: number;
  public code?: string;

  constructor(message: string, statusCode = 500, code?: string) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends BaseError {
  constructor(message = "Bad Request", code?: string) {
    super(message, 400, code);
  }
}

export class NotFoundError extends BaseError {
  constructor(message = "Not Found", code?: string) {
    super(message, 404, code);
  }
}

export class ConflictError extends BaseError {
  constructor(message = "Conflict", code?: string) {
    super(message, 409, code);
  }
}

export class InsufficientFundsError extends BaseError {
  constructor(message = "Insufficient funds", code?: string) {
    // 400 is acceptable here; you may change to 422 if preferred
    super(message, 400, code);
  }
}

export const isBaseError = (err: unknown): err is BaseError => {
  return typeof err === "object" && err !== null && "statusCode" in (err as any);
};
