import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponses";
import { getInsights, getInbox } from "../services/insights.service";

// Retrieves high-level analytics, timeline distributions, and top forms for the user
export const insights = asyncHandler(async (req: Request, res: Response) => {
  const data = await getInsights(req.user!._id);
  sendSuccess(res, { data: { insights: data } });
});

// Retrieves the latest unified response stream across all owned forms with optional search
export const inbox = asyncHandler(async (req: Request, res: Response) => {
  const responses = await getInbox(req.user!._id, {
    search: (req.query.search as string) || "",
  });
  sendSuccess(res, { data: { responses, count: responses.length } });
});
