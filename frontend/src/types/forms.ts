import type { ComponentType } from "react";

// used in fieldTypes
export type FieldGroup = "input" | "choice" | "advanced" | "layout";

export type FieldType =
  | "short_text"
  | "long_text"
  | "email"
  | "phone"
  | "number"
  | "url"
  | "password"
  | "address"
  | "dropdown"
  | "radio"
  | "checkbox"
  | "yes_no"
  | "date"
  | "rating"
  | "file"
  | "section"
  | "heading"
  | "paragraph"
  | "image";

export interface FieldDefinition {
  label: string;
  icon: ComponentType<{ className?: string }>;
  group: FieldGroup;
  hasOptions: boolean;
  placeholder?: string;
  static?: boolean;
}

export interface FieldOption {
  id: string;
  label: string;
  value: string;
}

export interface FieldValidation {
  minLength: number | null;
  maxLength: number | null;
  min: number | null;
  max: number | null;
  pattern: string;
  message: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder: string;
  description: string;
  helpText: string;
  required: boolean;
  defaultValue: string | string[] | number | boolean;
  options: FieldOption[];
  content: string;
  validation: FieldValidation;
}

export interface FormTheme {
  primaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  borderRadius?: string;
}

export interface FormSettings {
  logo?: string;
  primaryColor?: string;
  background?: string;
  borderRadius?: number;
  thankYouMessage?: string;
  submitButtonText?: string;
  seoTitle?: string;
  seoDescription?: string;
  showProgressBar?: boolean;
  isPublished?: boolean;
  requireAuth?: boolean;
  collectEmail?: boolean;
  singleResponse?: boolean;
  redirectUrl?: string;
  [key: string]: any;
}

export interface Form {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  questions: FormField[];
  theme?: string | FormTheme;
  settings?: FormSettings;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// services/index
export interface AIImproveQuestionResult {
  improved: string;
  clarity: string;
  followUps: string[];
}

export interface AIFormSummaryResult {
  purpose: string;
  audience: string;
  completionTime: string;
  suggestions: string[];
}

// Pages/Analytics
export interface FormResponseMeta {
  userAgent?: string;
  ip?: string;
  completionTime?: number;
  submittedAt?: string;
  [key: string]: any;
}

export interface FormResponse {
  _id?: string;
  id?: string;
  formId: string;
  answers: Record<string, any>;
  meta?: FormResponseMeta;
  createdAt?: string;
  updatedAt?: string;
}
