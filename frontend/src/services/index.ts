import { mock } from "@/services/mockData";
import type {
  User,
  LoginCredentials,
  RegisterPayload,
  AuthResponse,
} from "@/types/user";
import type {
  Form,
  FormField,
  FieldValidation,
  AIImproveQuestionResult,
  AIFormSummaryResult,
} from "@/types/forms";
import type {
  OverviewInsights,
  FormAnalytics,
  FormResponseItem,
  InboxResponse,
} from "@/types/analytics";

// Artificial latency helpers
const wait = (ms: number): Promise<void> =>
  new Promise((res) => setTimeout(res, ms));

const net = async <T>(
  fn: () => T,
  ms: number = 300 + Math.random() * 350,
): Promise<T> => {
  await wait(ms);
  return fn();
};

const slow = <T>(fn: () => T): Promise<T> => net(fn, 900 + Math.random() * 600);

// Auth endpoints
export const authApi = {
  register: (payload: RegisterPayload): Promise<AuthResponse> =>
    net(() => (mock as any).register(payload)),
  login: (credentials: LoginCredentials): Promise<AuthResponse> =>
    net(() => (mock as any).login(credentials)),
  me: (): Promise<{ user: User }> => net(() => mock.me()),
  updateProfile: (payload: Partial<User>): Promise<User> =>
    net(() => (mock as any).updateProfile(payload)),
  changePassword: (): Promise<{ success: boolean; message: string }> =>
    net(() => ({ success: true, message: "Password changed" })),
  deleteAccount: (): Promise<{ success: boolean; message: string }> =>
    net(() => ({ success: true, message: "Account deleted" })),
};

// Workspace-wide endpoints
export const insightsApi = {
  overview: (): Promise<OverviewInsights> =>
    net(() => (mock as any).insights(), 500 + Math.random() * 400),
  inbox: (params?: {
    filter?: string;
    search?: string;
  }): Promise<InboxResponse> => net(() => mock.inbox(params || {})),
};

// Form management endpoints
export const formApi = {
  list: (params?: { search?: string; filter?: string }): Promise<Form[]> =>
    net(() => mock.listForms(params || {})),
  get: (id: string): Promise<Form> => net(() => mock.getForm(id)),
  getPublic: (slug: string): Promise<Form> =>
    net(() => mock.getPublicForm(slug)),
  create: (payload: Partial<Form>): Promise<Form> =>
    net(() => (mock as any).createForm(payload)),
  update: (id: string, payload: Partial<Form>): Promise<Form> =>
    net(() => (mock as any).updateForm(id, payload)),
  publish: (id: string, publish: boolean = true): Promise<Form> =>
    net(() => mock.publishForm(id, publish)),
  duplicate: (id: string): Promise<Form> => net(() => mock.duplicateForm(id)),
  remove: (id: string): Promise<{ success: boolean }> =>
    net(() => mock.removeForm(id)),
};

// Response & analytics endpoints
export const responseApi = {
  submit: (
    slug: string,
    payload: Record<string, any>,
  ): Promise<{ id: string }> =>
    net(
      () => (mock as any).submitResponse(slug, payload),
      600 + Math.random() * 500,
    ),
  list: (
    formId: string,
    params?: Record<string, any>,
  ): Promise<{ responses: FormResponseItem[] }> =>
    net(() => (mock as any).listResponses(formId, params || {})),
  analytics: (formId: string): Promise<FormAnalytics> =>
    net(() => (mock as any).analytics(formId), 500 + Math.random() * 400),
  remove: (id: string): Promise<{ success: boolean }> =>
    net(() => mock.removeResponse(id)),
  exportCsv: (formId: string): Promise<string> =>
    net(() => mock.exportCsv(formId)),
};

// AI generation endpoints
export const aiApi = {
  generateForm: (prompt: string): Promise<Form> =>
    slow(() => (mock as any).aiGenerateForm(prompt)),
  generateValidation: (payload: {
    label: string;
    type: string;
  }): Promise<FieldValidation> =>
    slow(() => (mock as any).aiGenerateValidation(payload)),
  improveQuestion: (payload: {
    question: FormField;
  }): Promise<AIImproveQuestionResult> =>
    slow(() => (mock as any).aiImproveQuestion(payload)),
  formSummary: (form: Form): Promise<AIFormSummaryResult> =>
    slow(() => (mock as any).aiFormSummary(form)),
};
