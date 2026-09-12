import { STATIC_FIELD_TYPES } from "./constants";
import type { FormRecord } from "../repositories/form.repo";
import type { ResponseRecord } from "../repositories/response.repo";

// Wraps CSV cell contents in quotes and escapes internal quotation marks
export const escapeCell = (value: any): string => {
  if (value === null || value === undefined) return "";
  let str = Array.isArray(value) ? value.join("; ") : String(value);
  if (/[",\n\r]/.test(str)) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// Converts form metadata and collected submissions into a formatted RFC-4180 CSV string
export const responsesToCsv = (
  form: FormRecord,
  responses: ResponseRecord[],
): string => {
  // Excludes presentational layout blocks like headings and images
  const answerableQuestions = (form.questions || []).filter(
    (q: any) => !STATIC_FIELD_TYPES.includes(q.type),
  );

  // Constructs header columns with submission metadata followed by question labels
  const headers = [
    "Submitted At",
    "Completion Time (s)",
    ...answerableQuestions.map((q: any) => q.label || "Untitled"),
  ];

  // Maps each response record to match the header column order
  const rows = responses.map((resp) => {
    const byId = new Map(
      (resp.answers || []).map((a: any) => [a.questionId, a.value]),
    );
    return [
      new Date(resp.submittedAt).toISOString(),
      resp.completionTime || 0,
      ...answerableQuestions.map((q: any) => escapeCell(byId.get(q.id))),
    ];
  });

  // Combines escaped headers and rows separated by standard CRLF line endings
  const lines = [
    headers.map(escapeCell).join(","),
    ...rows.map((r) => r.join(",")),
  ];

  return lines.join("\r\n");
};
