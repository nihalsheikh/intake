import * as formRepo from "../repositories/form.repo";
import * as responseRepo from "../repositories/response.repo";
import type { FormRecord } from "../repositories/form.repo";
import type { ResponseRecord } from "../repositories/response.repo";

// Aggregates workspace-level metrics, charts, device splits, and top-performing forms
export const getInsights = async (userId: string) => {
  // Loads all active forms created by the user
  const forms = (await formRepo.listFormsByOwner(userId, {
    filter: "all",
  })) as FormRecord[];

  const formIds = forms.map((f) => f._id);

  // Computes high-level overview metrics across all forms
  const totalViews = forms.reduce((s, f) => s + (f.views || 0), 0);
  const totalResponses = forms.reduce((s, f) => s + (f.responseCount || 0), 0);
  const published = forms.filter((f) => f.status === "published").length;
  const conversion = totalViews
    ? Math.round((totalResponses / totalViews) * 100)
    : 0;

  // Fetches timeline, completion averages, heatmap, and device breakdowns in parallel
  const [timeline, avgCompletionTime, heatmap, devices] = await Promise.all([
    responseRepo.timelineByForms(formIds),
    responseRepo.avgCompletionByForms(formIds),
    responseRepo.heatmapByForms(formIds),
    responseRepo.devicesByForms(formIds),
  ]);

  // Sorts and selects the top 6 forms by total submission volume
  const topForms = [...forms]
    .sort((a, b) => (b.responseCount || 0) - (a.responseCount || 0))
    .slice(0, 6)
    .map((f) => ({
      id: f._id,
      title: f.title,
      theme: f.theme,
      status: f.status,
      responses: f.responseCount || 0,
      views: f.views || 0,
      conversion: f.views
        ? Math.round(((f.responseCount || 0) / f.views) * 100)
        : 0,
      color: f.settings?.primaryColor || "#0c8b7c",
    }));

  return {
    stats: {
      totalForms: forms.length,
      published,
      totalResponses,
      totalViews,
      conversion,
      avgCompletionTime,
    },
    timeline,
    heatmap,
    devices,
    topForms,
  };
};

// Aggregates incoming responses across all forms into a unified searchable inbox stream
export const getInbox = async (
  userId: string,
  { search = "" }: { search?: string } = {},
) => {
  // Loads both active and archived forms to match submissions across the account
  const [active, archived] = await Promise.all([
    formRepo.listFormsByOwner(userId, { filter: "all" }),
    formRepo.listFormsByOwner(userId, { filter: "archived" }),
  ]);

  const forms = [...active, ...archived].filter(
    (f): f is FormRecord => f !== null,
  );
  const formMap = new Map<string, FormRecord>(forms.map((f) => [f._id, f]));

  // Retrieves the 300 most recent submissions across all owned forms
  let responses = (await responseRepo.recentByForms(
    forms.map((f) => f._id),
    300,
  )) as ResponseRecord[];

  // Filters answers by search text across submitted fields
  if (search.trim()) {
    const needle = search.trim().toLowerCase();
    responses = responses.filter((r) =>
      r.answers.some((a: any) => {
        const val = Array.isArray(a.value)
          ? a.value.join(" ")
          : String(a.value ?? "");
        return val.toLowerCase().includes(needle);
      }),
    );
  }

  // Enriches each response record with parent form metadata
  return responses.map((r) => {
    const form = formMap.get(r.form);
    return {
      ...r,
      formId: r.form,
      formTitle: form?.title || "Untitled form",
      formColor: form?.settings?.primaryColor || "#0c8b7c",
    };
  });
};
