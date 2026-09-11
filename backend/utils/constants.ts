export const FIELD_TYPES = [
  "short_text",
  "long_text",
  "email",
  "phone",
  "number",
  "dropdown",
  "radio",
  "checkbox",
  "date",
  "rating",
  "file",
  "yes_no",
  "address",
  "url",
  "password",
  "section",
  "heading",
  "paragraph",
  "image",
] as const;

export const STATIC_FIELD_TYPES = [
  "section",
  "heading",
  "paragraph",
  "image",
] as const;

export const OPTION_FIELD_TYPES = ["dropdown", "radio", "checkbox"] as const;

export const FORM_STATUS = ["draft", "published"] as const;

export const THEMES = [
  "minimal",
  "modern",
  "corporate",
  "gradient",
  "dark",
  "glassmorphism",
] as const;

// Extracted types for reuse across controllers and validation schemas
export type FieldType = (typeof FIELD_TYPES)[number];
export type StaticFieldType = (typeof STATIC_FIELD_TYPES)[number];
export type OptionFieldType = (typeof OPTION_FIELD_TYPES)[number];
export type FormStatus = (typeof FORM_STATUS)[number];
export type Theme = (typeof THEMES)[number];
