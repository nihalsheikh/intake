import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponses";
import * as responseService from "../services/response.service";
import { getFormAnalytics } from "../services/analytics.service";
import { responsesToCsv } from "../utils/csv";

// Captures client metadata and persists a public response entry for a published form
export const submitResponse = asyncHandler(
  async (req: Request, res: Response) => {
    const { answers, completionTime } = req.body;
    const meta = {
      userAgent: req.headers["user-agent"] || "",
      ip: req.ip || "",
    };

    const response = await responseService.submitResponse(
      req.params.slug as string,
      {
        answers,
        completionTime,
        meta,
      },
    );

    sendSuccess(res, {
      statusCode: 201,
      message: "Response recorded",
      data: { id: response?._id },
    });
  },
);

// Retrieves submissions for an owned form matching optional search text
export const getResponses = asyncHandler(
  async (req: Request, res: Response) => {
    const responses = await responseService.listResponses(
      req.params.id as string,
      req.user!._id,
      { search: req.query.search as string | undefined },
    );

    sendSuccess(res, {
      data: { responses, count: responses.length },
    });
  },
);

// Returns aggregated performance metrics, conversion rates, and question distributions
export const getAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const analytics = await getFormAnalytics(
      req.params.id as string,
      req.user!._id,
    );
    sendSuccess(res, { data: { analytics } });
  },
);

// Permanently removes a single submission record and updates the form response count
export const deleteResponse = asyncHandler(
  async (req: Request, res: Response) => {
    await responseService.deleteResponse(
      req.params.id as string,
      req.user!._id,
    );
    sendSuccess(res, { message: "Response deleted" });
  },
);

// Formats form answers into an RFC-4180 CSV spreadsheet and triggers a direct browser download
export const exportResponses = asyncHandler(
  async (req: Request, res: Response) => {
    const { form, responses } = await responseService.exportResponses(
      req.params.id as string,
      req.user!._id,
    );

    const csv = responsesToCsv(form, responses as any);
    const filename = `${form.title.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}_responses.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  },
);
