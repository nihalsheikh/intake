export class ApiError extends Error {
  statusCode: number;
  details?: any;
  isOperational: boolean;

  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;

    // Maintains proper prototype chain and stack trace in V8/Bun
    Object.setPrototypeOf(this, new.target.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message = "Bad Request", details?: any): ApiError {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = "Unauthorized"): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message = "Forbidden"): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message = "Resource Not Found"): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message = "Conflict"): ApiError {
    return new ApiError(409, message);
  }

  static internal(message = "Something Went Wrong"): ApiError {
    return new ApiError(500, message);
  }
}
