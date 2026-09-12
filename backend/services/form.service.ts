import { ApiError } from "../utils/ApiError";
import * as formRepo from "../repositories/form.repo";
import type { FormRecord } from "../repositories/form.repo";

// Ensures the requested form exists and belongs to the authenticated user
export const getOwnedForm = async (
  formId: string,
  userId: string,
): Promise<FormRecord> => {
  const form = await formRepo.findFormById(formId);
  if (!form) throw ApiError.notFound("Form not found");
  if (form.owner.toString() !== userId.toString()) {
    throw ApiError.forbidden("You do not have access to this form");
  }
  return form;
};

// Lists forms belonging to the user filtered by search criteria and status
export const listForms = async (
  userId: string,
  opts: { search?: string; filter?: string } = {},
): Promise<(FormRecord | null)[]> => {
  return formRepo.listFormsByOwner(userId, opts);
};

// Fetches a single form by ID after verifying user ownership
export const getFormById = async (
  formId: string,
  userId: string,
): Promise<FormRecord> => {
  return getOwnedForm(formId, userId);
};

// Fetches an active published form by URL slug for public access
export const getPublicForm = async (slug: string): Promise<FormRecord> => {
  const form = await formRepo.findPublishedBySlug(slug);
  if (!form) throw ApiError.notFound("This form is not available");
  return form;
};

// Increments the view impression counter when a public form link is opened
export const registerView = async (slug: string): Promise<void> => {
  await formRepo.incrementViews(slug);
};

// Creates and saves a new form assigned to the authenticated user
export const createForm = async (
  userId: string,
  payload: Record<string, any> = {},
): Promise<FormRecord | null> => {
  return formRepo.createForm(userId, payload);
};

// Sanitizes update inputs and applies changes to an owned form
export const updateForm = async (
  formId: string,
  userId: string,
  updates: Record<string, any>,
): Promise<FormRecord | null> => {
  await getOwnedForm(formId, userId);

  const allowed = [
    "title",
    "description",
    "theme",
    "questions",
    "settings",
    "isFavorite",
    "isArchived",
  ];

  const patch: Record<string, any> = {};
  for (const key of allowed) {
    if (key in updates) patch[key] = updates[key];
  }

  return formRepo.updateForm(formId, patch);
};

// Toggles the publish state of a form and ensures it has at least one question before going live
export const setPublishState = async (
  formId: string,
  userId: string,
  shouldPublish: boolean,
): Promise<FormRecord | null> => {
  const form = await getOwnedForm(formId, userId);

  if (shouldPublish && form.questions.length === 0) {
    throw ApiError.badRequest("Add at least one question before publishing");
  }

  return formRepo.updateForm(formId, {
    status: shouldPublish ? "published" : "draft",
    publishedAt: shouldPublish ? new Date() : null,
  });
};

// Clones an existing form as a draft with "(Copy)" appended to its title
export const duplicateForm = async (
  formId: string,
  userId: string,
): Promise<FormRecord | null> => {
  const form = await getOwnedForm(formId, userId);

  return formRepo.createForm(userId, {
    title: `${form.title} (Copy)`,
    description: form.description,
    theme: form.theme,
    questions: form.questions,
    settings: form.settings,
    status: "draft",
  });
};

// Verifies ownership and permanently deletes the specified form
export const deleteForm = async (
  formId: string,
  userId: string,
): Promise<void> => {
  await getOwnedForm(formId, userId);
  await formRepo.deleteForm(formId);
};
