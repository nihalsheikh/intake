import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
  RequestHandler,
} from "express";
import { ApiError } from "../utils/ApiError";
import { isProd } from "../config/envConfig";

// Catch-all middleware for handling undefined endpoints
export const notFound: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

// Global Express error handler middleware (must accept 4 arguments)
export const errorHandler: ErrorRequestHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let error = err;

  // Handle schema validation errors
  if (error.name === "ValidationError") {
    const details = Object.values(error.errors || {}).map(
      (e: any) => e.message,
    );
    error = ApiError.badRequest("Validation Failed", details);
  }

  // Handle invalid UUID/ID cast failures
  else if (error.name === "CastError") {
    error = ApiError.badRequest(`Invalid ${error.path}: ${error.value}`);
  }

  // Handle DB duplicate key (11000) or Postgres unique constraint violation (23505)
  else if (error.code === 11000 || error.code === "23505") {
    const field = error.keyValue
      ? Object.keys(error.keyValue)[0]
      : error.detail?.match(/Key \((.*?)\)=/)?.[1] || "field";
    error = ApiError.conflict(`${field} already exists`);
  }

  // Fallback generic unhandled errors into an ApiError instance
  else if (!(error instanceof ApiError)) {
    error = ApiError.internal(error?.message);
  }

  // Log internal server errors during local development
  if (!isProd && (error.statusCode || 500) >= 500) {
    console.error(err);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    ...(error.details ? { details: error.details } : {}),
  });
};
