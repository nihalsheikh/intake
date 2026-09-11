import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.warn("ERROR: DATABASE_URL is not set in environment variables.");
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrls: (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean),
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "dev_insecure_secret_change_me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  },
} as const;

export const isProd = env.nodeEnv === "production";

export type Env = typeof env;
