import { listResponsesByForm } from "../repositories/response.repo";
import { getOwnedForm } from "./form.service";
import { OPTION_FIELD_TYPES, STATIC_FIELD_TYPES } from "../utils/constants";
import type { FormRecord } from "../repositories/form.repo";
import type { ResponseRecord } from "../repositories/response.repo";

// Computes the percentage of questions answered across all form submissions
const computeCompletionRate = (
  responses: (ResponseRecord | null)[],
  answerableCount: number,
): number => {
  if (!responses.length || !answerableCount) return 0;

  // Calculates the sum of answer completion fractions per respondent
  const total = responses.reduce((sum, r) => {
    const answered = r?.answers?.length || 0;
    return sum + Math.min(answered, answerableCount) / answerableCount;
  }, 0);

  return Math.round((total / responses.length) * 100);
};

// Groups submission counts by date for historical activity charts
const buildTimeline = (
  responses: (ResponseRecord | null)[],
): { date: string; count: number }[] => {
  const counts = new Map<string, number>();

  for (const r of responses) {
    if (!r?.submittedAt) continue;
    const key = new Date(r.submittedAt).toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  // Returns chronologically sorted day-by-day submission totals
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
};

// Aggregates answer distributions, averages, or text samples per question
const buildQuestionAnalytics = (
  form: FormRecord,
  responses: (ResponseRecord | null)[],
) => {
  return (form.questions || [])
    .filter((q: any) => !STATIC_FIELD_TYPES.includes(q.type))
    .map((q: any) => {
      // Extracts all non-empty response values submitted for this question
      const values = responses
        .map((r) => r?.answers?.find((a: any) => a.questionId === q.id)?.value)
        .filter((v) => v !== undefined && v !== null && v !== "");

      const base = {
        id: q.id,
        label: q.label,
        type: q.type,
        total: values.length,
      };

      // Tally selected choices for multiple choice and dropdown fields
      if (OPTION_FIELD_TYPES.includes(q.type as any)) {
        const tally = new Map<string, number>(
          (q.options || []).map((o: any) => [o.label, 0]),
        );

        for (const v of values) {
          const selected = Array.isArray(v) ? v : [v];
          for (const sel of selected) {
            tally.set(sel, (tally.get(sel) || 0) + 1);
          }
        }

        return {
          ...base,
          breakdown: [...tally.entries()].map(([label, count]) => ({
            label,
            count,
          })),
        };
      }

      // Calculates mathematical average and distribution for numbers and ratings
      if (q.type === "rating" || q.type === "number") {
        const nums = values.map(Number).filter((n) => !Number.isNaN(n));
        const average = nums.length
          ? Number((nums.reduce((s, n) => s + n, 0) / nums.length).toFixed(2))
          : 0;

        const distribution = new Map<number, number>();
        for (const n of nums) {
          distribution.set(n, (distribution.get(n) || 0) + 1);
        }

        return {
          ...base,
          average,
          breakdown: [...distribution.entries()]
            .sort(([a], [b]) => a - b)
            .map(([label, count]) => ({ label: String(label), count })),
        };
      }

      // Tallies binary responses for boolean toggle fields
      if (q.type === "yes_no") {
        const yes = values.filter(
          (v) => v === true || v === "Yes" || v === "yes",
        ).length;

        return {
          ...base,
          breakdown: [
            { label: "Yes", count: yes },
            { label: "No", count: values.length - yes },
          ],
        };
      }

      // Returns the 5 most recent entries as string samples for free-text answers
      return {
        ...base,
        samples: values.slice(-5).reverse().map(String),
      };
    });
};

// Generates an end-to-end performance and breakdown report for an owned form
export const getFormAnalytics = async (formId: string, userId: string) => {
  const form = await getOwnedForm(formId, userId);
  const responses = await listResponsesByForm(formId);

  const totalResponses = responses.length;
  const views = form.views || 0;

  // Calculates percentage of views that converted into completed submissions
  const conversionRate = views ? Math.round((totalResponses / views) * 100) : 0;

  // Counts answerable questions omitting display-only layout blocks
  const answerableCount = (form.questions || []).filter(
    (q: any) => !STATIC_FIELD_TYPES.includes(q.type),
  ).length;

  const completionRate = computeCompletionRate(responses, answerableCount);

  // Calculates mean duration in seconds spent completing the form
  const avgCompletionTime = totalResponses
    ? Math.round(
        responses.reduce((sum, r) => sum + (r?.completionTime || 0), 0) /
          totalResponses,
      )
    : 0;

  return {
    stats: {
      totalResponses,
      views,
      conversionRate,
      completionRate,
      avgCompletionTime,
    },
    timeline: buildTimeline(responses),
    questions: buildQuestionAnalytics(form, responses),
  };
};
