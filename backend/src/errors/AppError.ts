export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);

    this.statusCode = statusCode;
    this.details = details;

    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}
