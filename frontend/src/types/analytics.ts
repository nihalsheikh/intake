// services/index
export interface OverviewInsights {
  totalForms: number;
  totalResponses: number;
  avgCompletionRate: number;
  activeForms: number;
  recentActivity: Array<{
    id: string;
    formTitle: string;
    respondentEmail?: string;
    createdAt: string;
  }>;
}

export interface FormAnalytics {
  formId?: string;
  views: number;
  starts: number;
  submissions: number;
  completionRate: number;
  averageTimeSeconds: number;
  dropoffByQuestion?: Array<{
    fieldId: string;
    label: string;
    dropoffs: number;
  }>;
  breakdownByChoice?: Record<string, Record<string, number>>;
  [key: string]: any;
}

export interface FormResponseItem {
  id: string;
  formId?: string;
  answers: Record<string, any>;
  submittedAt?: string;
  createdAt?: string;
  userAgent?: string;
}

export interface InboxItem {
  id: string;
  formId: string;
  formTitle: string;
  answers: Record<string, any>;
  createdAt: string;
  read?: boolean;
}

export interface InboxResponse {
  responses: InboxItem[] | any[];
  count: number;
}
