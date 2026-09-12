import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../config/envConfig";

// Standard JWT payload shape for authenticated user sessions
export interface UserTokenPayload extends JwtPayload {
  id: string;
  email: string;
}

// Encrypts user details into a signed, expiring JWT string
export const signToken = (payload: { id: string; email: string }): string => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
};

// Validates token signature and expiration, returning decoded data if valid
export const verifyToken = (token: string): UserTokenPayload => {
  return jwt.verify(token, env.jwtSecret) as UserTokenPayload;
};
