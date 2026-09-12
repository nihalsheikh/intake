import type { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { verifyToken } from "../utils/token";
import { findUserById, type UserRecord } from "../repositories/user.repo";

// Extends Express Request type definition to attach the authenticated user object
declare global {
  namespace Express {
    interface Request {
      user?: UserRecord;
    }
  }
}

// Blocks unauthenticated requests and attaches the authenticated user to the request object
export const protect = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    // Reads authorization header or defaults to an empty string
    const header = req.headers.authorization || "";

    // Extracts the raw token string if Bearer is present
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    // Stops execution if no token was provided in the headers
    if (!token) {
      throw ApiError.unauthorized("Authentication Required");
    }

    let decoded;
    try {
      // Verifies signature and expiration of the JWT
      decoded = verifyToken(token);
    } catch {
      // Rejects requests with malformed, tampered, or expired tokens
      throw ApiError.unauthorized("Invalid or expired token");
    }

    // Fetches the user from Neon to ensure the account still exists in the database
    const user = await findUserById(decoded.id);
    if (!user) {
      throw ApiError.unauthorized("User no longer exists");
    }

    // Stores verified user data on the request for downstream controllers
    req.user = user;
    next();
  },
);
