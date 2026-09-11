import type { Response } from "express";

interface SuccessResponseOptions<T = any> {
  statusCode?: number;
  message?: string;
  data?: T | null;
  meta?: Record<string, any>;
}

// To keep successful responses consistent, Send Success helper
export const sendSuccess = <T = any>(
  res: Response,
  {
    statusCode = 200,
    message = "OK",
    data = null,
    meta,
  }: SuccessResponseOptions<T> = {},
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
};
