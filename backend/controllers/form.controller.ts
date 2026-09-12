import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponses";
import * as formService from "../services/form.service";

// Fetches all forms owned by the authenticated user matching optional filter and search parameters
export const getForms = asyncHandler(async (req: Request, res: Response) => {
  const { search, filter } = req.query;
  const forms = await formService.listForms(req.user!._id, {
    search: search as string | undefined,
    filter: filter as string | undefined,
  });
  sendSuccess(res, { data: { forms } });
});

// Retrieves a single owned form by its ID
export const getForm = asyncHandler(async (req: Request, res: Response) => {
  const form = await formService.getFormById(
    req.params.id as string,
    req.user!._id,
  );
  sendSuccess(res, { data: { form } });
});

// Fetches a published form for public display and increments its view counter
export const getPublicForm = asyncHandler(
  async (req: Request, res: Response) => {
    const slug = req.params.slug as string;
    await formService.registerView(slug);
    const form = await formService.getPublicForm(slug);
    sendSuccess(res, { data: { form } });
  },
);

// Creates a new empty or preconfigured form under the active user
export const createForm = asyncHandler(async (req: Request, res: Response) => {
  const form = await formService.createForm(req.user!._id, req.body);
  sendSuccess(res, {
    statusCode: 201,
    message: "Form created",
    data: { form },
  });
});

// Updates the settings, styling, or questions of an owned form
export const updateForm = asyncHandler(async (req: Request, res: Response) => {
  const form = await formService.updateForm(
    req.params.id as string,
    req.user!._id,
    req.body,
  );
  sendSuccess(res, { message: "Form saved", data: { form } });
});

// Toggles the form lifecycle state between draft and published
export const publishForm = asyncHandler(async (req: Request, res: Response) => {
  const shouldPublish = req.body.publish !== false;
  const form = await formService.setPublishState(
    req.params.id as string,
    req.user!._id,
    shouldPublish,
  );
  sendSuccess(res, {
    message: shouldPublish ? "Form published" : "Form unpublished",
    data: { form },
  });
});

// Clones an existing form layout and questions into a new draft
export const duplicateForm = asyncHandler(
  async (req: Request, res: Response) => {
    const form = await formService.duplicateForm(
      req.params.id as string,
      req.user!._id,
    );
    sendSuccess(res, {
      statusCode: 201,
      message: "Form duplicated",
      data: { form },
    });
  },
);

// Permanently removes an owned form and its associated data
export const deleteForm = asyncHandler(async (req: Request, res: Response) => {
  await formService.deleteForm(req.params.id as string, req.user!._id);
  sendSuccess(res, { message: "Form deleted" });
});
