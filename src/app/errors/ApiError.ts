class ApiError extends Error {
  statusCode: number;
  retryAfter?: number; // seconds, sent as the Retry-After header on 429s

  constructor(statusCode: number, message: string | undefined, stack = '', retryAfter?: number) {
    super(message);
    this.statusCode = statusCode;
    this.retryAfter = retryAfter;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
