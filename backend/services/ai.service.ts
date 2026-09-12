import { generateJson, generateText } from "./gemini.service";
import { ApiError } from "../utils/ApiError";
import { nanoid } from "../utils/nanoid";
import { FIELD_TYPES, OPTION_FIELD_TYPES } from "../utils/constants";
import type { FormRecord } from "../repositories/form.repo";

const FIELD_TYPE_LIST = FIELD_TYPES.join(", ");

// Safely converts arbitrary input to a finite number or returns null
const numberOrNull = (v: any): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

// Formats raw question objects into standardized schema representations with generated IDs
const normalizeQuestion = (q: any, index: number) => {
  const type = FIELD_TYPES.includes(q.type) ? q.type : "short_text";

  // Normalizes dropdown, radio, and checkbox choices into id-label pairs
  const options =
    OPTION_FIELD_TYPES.includes(type as any) && Array.isArray(q.options)
      ? q.options.map((label: any) => ({
          id: nanoid(8),
          label: String(typeof label === "object" ? label.label : label),
          value: "",
        }))
      : [];

  return {
    id: nanoid(10),
    type,
    label: typeof q.label === "string" ? q.label : `Question ${index + 1}`,
    placeholder: typeof q.placeholder === "string" ? q.placeholder : "",
    description: typeof q.description === "string" ? q.description : "",
    helpText: "",
    required: Boolean(q.required),
    defaultValue: "",
    options,
    content: typeof q.content === "string" ? q.content : "",
    validation: {},
    order: index,
  };
};

// Normalizes entire AI-generated form structures, ensuring valid theme and questions array
const normalizeForm = (data: any) => {
  const validThemes = [
    "minimal",
    "modern",
    "corporate",
    "gradient",
    "dark",
    "glassmorphism",
  ];
  const questions = Array.isArray(data?.questions) ? data.questions : [];

  return {
    title: typeof data?.title === "string" ? data.title : "Untitled form",
    description: typeof data?.description === "string" ? data.description : "",
    theme: validThemes.includes(data?.theme) ? data.theme : "modern",
    questions: questions.map((q: any, index: number) =>
      normalizeQuestion(q, index),
    ),
  };
};

// Generates a complete form layout and questions using Gemini based on a user prompt
export const generateForm = async (prompt: string) => {
  if (!prompt?.trim()) {
    throw ApiError.badRequest("Describe the form you want to create");
  }

  const schemaHint = `{
  "title": string,
  "description": string,
  "theme": one of ["minimal","modern","corporate","gradient","dark","glassmorphism"],
  "questions": [{
    "type": one of [${FIELD_TYPE_LIST}],
    "label": string,
    "placeholder": string,
    "description": string,
    "required": boolean,
    "options": string[] (only for dropdown/radio/checkbox),
    "content": string (only for heading/paragraph/section/image)
  }]
}`;

  const data = await generateJson(
    `You are an expert form designer. Create a thoughtful, well-structured form based on this request: "${prompt}".
Use a logical order, group related questions, add a "section" or "heading" block where helpful, choose the most appropriate field type for each question, and mark essential questions as required. Aim for 5-10 questions unless requested otherwise.`,
    { schemaHint },
  );

  return normalizeForm(data);
};

// Generates validation constraints like min/max lengths, numeric limits, and regex patterns for a field
export const generateValidation = async ({
  label,
  type,
  description = "",
}: {
  label: string;
  type: string;
  description?: string;
}) => {
  if (!label || !type) {
    throw ApiError.badRequest("Field label and type are required");
  }

  const schemaHint = `{
  "minLength": number | null,
  "maxLength": number | null,
  "min": number | null,
  "max": number | null,
  "pattern": string,
  "message": string
}`;

  const data = await generateJson(
    `Suggest sensible validation rules for a form field.
Field label: "${label}". Field type: "${type}". ${description ? `Context: ${description}. ` : ""}
Provide a regex pattern when it improves data quality (e.g. phone, postal code), reasonable length/number bounds, and a friendly, specific error "message". Use null for rules that do not apply.`,
    { schemaHint },
  );

  return {
    minLength: numberOrNull(data?.minLength),
    maxLength: numberOrNull(data?.maxLength),
    min: numberOrNull(data?.min),
    max: numberOrNull(data?.max),
    pattern: typeof data?.pattern === "string" ? data.pattern : "",
    message: typeof data?.message === "string" ? data.message : "",
  };
};

// Refines question wording for better clarity, tone, and generates suggested follow-ups
export const improveQuestion = async ({
  label,
  type = "short_text",
}: {
  label: string;
  type?: string;
}) => {
  if (!label?.trim()) {
    throw ApiError.badRequest("Provide the question to improve");
  }

  const schemaHint = `{
  "improved": string,
  "clarity": string,
  "followUps": string[]
}`;

  const data = await generateJson(
    `Improve this ${type} survey/form question for clarity, neutrality and engagement: "${label}".
Return the rewritten question as "improved", a one-sentence note on what you improved as "clarity", and 2-3 relevant follow-up questions as "followUps".`,
    { schemaHint },
  );

  return {
    improved: data?.improved || label,
    clarity: data?.clarity || "",
    followUps: Array.isArray(data?.followUps) ? data.followUps.slice(0, 3) : [],
  };
};

// Analyzes questions to produce audience analysis, purpose summary, and UX improvement tips
export const summarizeForm = async (form: FormRecord) => {
  if (!form?.questions?.length) {
    throw ApiError.badRequest("Add some questions before generating a summary");
  }

  const outline = form.questions
    .map(
      (q: any, i: number) =>
        `${i + 1}. [${q.type}]${q.required ? " *" : ""} ${q.label}`,
    )
    .join("\n");

  const schemaHint = `{
  "purpose": string,
  "audience": string,
  "completionTime": string,
  "suggestions": string[]
}`;

  const data = await generateJson(
    `Analyse this form titled "${form.title}".
Questions:\n${outline}\n
Return its likely "purpose", the target "audience", an estimated "completionTime" (e.g. "2-3 minutes"), and 3-4 concrete "suggestions" to improve completion rate and data quality.`,
    { schemaHint },
  );

  return {
    purpose: data?.purpose || "",
    audience: data?.audience || "",
    completionTime: data?.completionTime || "",
    suggestions: Array.isArray(data?.suggestions) ? data.suggestions : [],
  };
};

export { generateText };
