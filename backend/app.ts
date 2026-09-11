import express, { type Request, type Response } from "express";
import cors from "cors";
import { env } from "./config/envConfig";
import { notFound, errorHandler } from "./middleware/errorHandler.middleware";

const app = express();

// CORS and Middlewares
app.use(
  cors({
    origin(
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) {
      if (!origin || env.frontendUrls.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "API is healthy",
    uptime: process.uptime(),
  });
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
