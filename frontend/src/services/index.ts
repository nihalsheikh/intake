import api from "../lib/api";

// --- Auth ---
export const authApi = {
  register: (payload: any) =>
    api.post("/auth/register", payload).then((r) => r.data.data),
  login: (payload: any) =>
    api.post("/auth/login", payload).then((r) => r.data.data),
  me: () => api.get("/auth/me").then((r) => r.data.data),
  updateProfile: (payload: any) =>
    api.put("/auth/profile", payload).then((r) => r.data.data.user),
  changePassword: (payload: any) =>
    api.put("/auth/password", payload).then((r) => r.data),
  deleteAccount: () => api.delete("/auth/me").then((r) => r.data),
};

// --- Workspace-wide ---
export const insightsApi = {
  overview: () => api.get("/insights").then((r) => r.data.data.insights),
  inbox: (params?: any) =>
    api.get("/inbox", { params }).then((r) => r.data.data),
};

// --- Forms ---
export const formApi = {
  list: (params?: any) =>
    api.get("/forms", { params }).then((r) => r.data.data.forms),
  get: (id: string) => api.get(`/forms/${id}`).then((r) => r.data.data.form),
  getPublic: (slug: string) =>
    api.get(`/public/forms/${slug}`).then((r) => r.data.data.form),
  create: (payload: any) =>
    api.post("/forms", payload).then((r) => r.data.data.form),
  update: (id: string, payload: any) =>
    api.put(`/forms/${id}`, payload).then((r) => r.data.data.form),
  publish: (id: string, publish = true) =>
    api.post(`/forms/${id}/publish`, { publish }).then((r) => r.data.data.form),
  duplicate: (id: string) =>
    api.post(`/forms/${id}/duplicate`).then((r) => r.data.data.form),
  remove: (id: string) => api.delete(`/forms/${id}`).then((r) => r.data),
};

// --- Responses & analytics ---
export const responseApi = {
  submit: (slug: string, payload: any) =>
    api.post(`/public/forms/${slug}/respond`, payload).then((r) => r.data.data),
  list: (formId: string, params?: any) =>
    api.get(`/forms/${formId}/responses`, { params }).then((r) => r.data.data),
  analytics: (formId: string) =>
    api.get(`/forms/${formId}/analytics`).then((r) => r.data.data.analytics),
  remove: (id: string) => api.delete(`/responses/${id}`).then((r) => r.data),
  exportCsv: (formId: string) =>
    api
      .get(`/forms/${formId}/responses/export`, { responseType: "text" })
      .then((r) => r.data),
};

// --- AI ---
export const aiApi = {
  generateForm: (prompt: string) =>
    api.post("/ai/generate-form", { prompt }).then((r) => r.data.data.form),
  generateValidation: (payload: any) =>
    api
      .post("/ai/generate-validation", payload)
      .then((r) => r.data.data.validation),
  improveQuestion: (payload: any) =>
    api.post("/ai/improve-question", payload).then((r) => r.data.data.result),
  formSummary: (form: any) =>
    api.post("/ai/form-summary", { form }).then((r) => r.data.data.summary),
};
