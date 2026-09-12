import { ApiError } from "../utils/ApiError";
import { getOwnedForm } from "./form.service";
import * as formRepo from "../repositories/form.repo";
import * as responseRepo from "../repositories/response.repo";
import { OPTION_FIELD_TYPES, STATIC_FIELD_TYPES } from "../utils/constants";
import type { FormRecord } from "../repositories/form.repo";
import type { ResponseRecord } from "../repositories/response.repo";

// Validates question constraints like patterns, string limits, numbers, and allowed options
const validateAnswer = (q: any, value: any): void => {
  const v = q.validation || {};
  const asString = Array.isArray(value) ? value.join(",") : String(value);

  // Verifies basic email format if question type is email
  if (q.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(asString)) {
    throw ApiError.badRequest(
      v.message || `"${q.label}" must be a valid email`,
    );
  }

  // Verifies standard web URL scheme if question type is url
  if (q.type === "url" && !/^https?:\/\/.+/i.test(asString)) {
    throw ApiError.badRequest(v.message || `"${q.label}" must be a valid URL`);
  }

  // Enforces minimum character length rule
  if (v.minLength != null && asString.length < v.minLength) {
    throw ApiError.badRequest(v.message || `"${q.label}" is too short`);
  }

  // Enforces maximum character length rule
  if (v.maxLength != null && asString.length > v.maxLength) {
    throw ApiError.badRequest(v.message || `"${q.label}" is too long`);
  }

  // Enforces numeric validity along with minimum and maximum thresholds
  if (q.type === "number") {
    const num = Number(value);
    if (Number.isNaN(num)) {
      throw ApiError.badRequest(`"${q.label}" must be a number`);
    }
    if (v.min != null && num < v.min) {
      throw ApiError.badRequest(v.message || `"${q.label}" is too small`);
    }
    if (v.max != null && num > v.max) {
      throw ApiError.badRequest(v.message || `"${q.label}" is too large`);
    }
  }

  // Checks value against a custom user-defined regex expression
  if (v.pattern) {
    try {
      if (!new RegExp(v.pattern).test(asString)) {
        throw ApiError.badRequest(v.message || `"${q.label}" is invalid`);
      }
    } catch (err) {
      if (err instanceof ApiError) throw err;
    }
  }

  // Ensures choices for dropdowns, radios, and checkboxes exist in the defined options list
  if (
    OPTION_FIELD_TYPES.includes(q.type as any) &&
    q.options &&
    q.options.length
  ) {
    const allowed = new Set(q.options.map((o: any) => o.label));
    const selected = Array.isArray(value) ? value : [value];
    for (const sel of selected) {
      if (!allowed.has(sel)) {
        throw ApiError.badRequest(
          `"${sel}" is not a valid choice for "${q.label}"`,
        );
      }
    }
  }
};

// Validates submitted inputs against form schema, saves the entry, and increments counter
export const submitResponse = async (
  slug: string,
  {
    answers = [],
    completionTime = 0,
    meta = {},
  }: {
    answers?: any[];
    completionTime?: number;
    meta?: Record<string, any>;
  } = {},
): Promise<ResponseRecord | null> => {
  // Looks up the published form by public slug
  const form = await formRepo.findPublishedBySlug(slug);
  if (!form) {
    throw ApiError.notFound("This form is not accepting responses");
  }

  const answerById = new Map(answers.map((a: any) => [a.questionId, a.value]));
  const normalized: any[] = [];

  // Loops over all schema questions to validate required values and answer formats
  for (const q of form.questions || []) {
    if (STATIC_FIELD_TYPES.includes(q.type)) continue;

    const value = answerById.get(q.id);
    const isEmpty =
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);

    // Checks required constraint
    if (q.required && isEmpty) {
      throw ApiError.badRequest(`"${q.label}" is required`);
    }

    if (isEmpty) continue;

    validateAnswer(q, value);
    normalized.push({
      questionId: q.id,
      label: q.label,
      type: q.type,
      value,
    });
  }

  // Commits the response entry into the Neon database
  const response = await responseRepo.createResponse({
    form: form._id,
    answers: normalized,
    completionTime,
    meta,
  });

  // Updates the total submission counter on the parent form
  await formRepo.incrementResponseCount(form._id, 1);
  return response;
};

// Lists submissions for an owned form with in-memory substring filtering on text answers
export const listResponses = async (
  formId: string,
  userId: string,
  { search = "" }: { search?: string } = {},
): Promise<(ResponseRecord | null)[]> => {
  await getOwnedForm(formId, userId);
  const responses = await responseRepo.listResponsesByForm(formId);

  // Filters answers by search query if provided
  if (!search.trim()) return responses;

  const needle = search.trim().toLowerCase();
  return responses.filter((r) =>
    r?.answers.some((a: any) => {
      const val = Array.isArray(a.value)
        ? a.value.join(" ")
        : String(a.value ?? "");
      return val.toLowerCase().includes(needle);
    }),
  );
};

// Removes a single response record and decrements the form submission counter
export const deleteResponse = async (
  responseId: string,
  userId: string,
): Promise<void> => {
  const response = await responseRepo.findResponseById(responseId);
  if (!response) {
    throw ApiError.notFound("Response not found");
  }

  await getOwnedForm(response.form, userId);
  await responseRepo.deleteResponse(responseId);
  await formRepo.incrementResponseCount(response.form, -1);
};

// Loads form metadata and its submissions to prepare for CSV spreadsheet export
export const exportResponses = async (
  formId: string,
  userId: string,
): Promise<{ form: FormRecord; responses: (ResponseRecord | null)[] }> => {
  const form = await getOwnedForm(formId, userId);
  const responses = await responseRepo.listResponsesByForm(formId);
  return { form, responses };
};
