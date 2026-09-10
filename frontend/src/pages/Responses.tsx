import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Download,
  Search,
  Trash2,
  Inbox,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  Monitor,
  ArrowUpRight,
} from "lucide-react";
import { formApi, responseApi } from "@/services";
import { useDebounce } from "@/hooks/useDebounce";
import { FormPageHeader } from "@/components/forms/FormPageHeader";
import { KpiCard } from "@/components/analytics/KpiCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton, EmptyState } from "@/components/ui/Feedback";
import { ConfirmModal } from "@/components/ui/Modal";
import { Drawer } from "@/components/ui/Drawer";
import { formatDate, formatDuration, downloadBlob } from "@/lib/utils";
import { isStatic } from "@/lib/fieldTypes";
import type { Form, FormField } from "@/types/forms";

interface ResponseAnswer {
  questionId: string;
  label?: string;
  type?: string;
  value: any;
}

interface ResponseItemMeta {
  userAgent?: string;
  [key: string]: any;
}

interface ResponseItem {
  _id: string;
  id?: string;
  formId?: string;
  submittedAt: string;
  completionTime?: number;
  answers: ResponseAnswer[];
  meta?: ResponseItemMeta;
}

interface AnalyticsStats {
  totalResponses?: number;
  views?: number;
  conversionRate?: number;
  completionRate?: number;
  avgCompletionTime?: number;
}

interface AnalyticsData {
  stats?: AnalyticsStats;
  [key: string]: any;
}

interface IdentityResult {
  name: string;
  email: string;
  byId: Map<string, any>;
}

interface ResponseDetailProps {
  response: ResponseItem;
  questions: FormField[];
}

interface MetaTileProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
  wide?: boolean;
}

export default function Responses() {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchInput, setSearchInput] = useState<string>("");
  const search = useDebounce(searchInput, 300);
  const [active, setActive] = useState<ResponseItem | null>(null);
  const [toDelete, setToDelete] = useState<ResponseItem | null>(null);
  const [exporting, setExporting] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([formApi.get(id), responseApi.analytics(id)])
      .then(([f, a]: [Form, AnalyticsData]) => {
        setForm(f);
        setAnalytics(a);
      })
      .catch((err: any) =>
        toast.error(err?.message || "Failed to load responses info"),
      )
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    responseApi
      .list(id, { search })
      .then((data: any) => setResponses(data?.responses || []))
      .catch(() => {});
  }, [id, search]);

  const answerable = useMemo<FormField[]>(
    () => (form?.questions || []).filter((q) => !isStatic(q.type)),
    [form],
  );

  // Identity columns for the respondent cell
  const nameQ = useMemo(
    () => answerable.find((q) => q.type === "short_text"),
    [answerable],
  );
  const emailQ = useMemo(
    () => answerable.find((q) => q.type === "email"),
    [answerable],
  );
  const extraCols = useMemo(
    () => answerable.filter((q) => q !== nameQ && q !== emailQ).slice(0, 2),
    [answerable, nameQ, emailQ],
  );

  const handleExport = async () => {
    if (!id || !form) return;
    setExporting(true);
    try {
      const csv: any = await responseApi.exportCsv(id);
      downloadBlob(
        csv,
        `${form.title.replace(/\s+/g, "_")}_responses.csv`,
        "text/csv",
      );
      toast.success("CSV exported");
    } catch (err: any) {
      toast.error(err?.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    const target = toDelete;
    if (!target) return;
    setToDelete(null);
    setActive((a) => (a?._id === target._id ? null : a));
    setResponses((prev) => prev.filter((r) => r._id !== target._id));
    try {
      await responseApi.remove(target._id);
      toast.success("Response deleted");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete response");
    }
  };

  const identity = (r: ResponseItem): IdentityResult => {
    const byId = new Map<string, any>(
      (r.answers || []).map((a) => [a.questionId, a.value]),
    );
    const name = nameQ ? byId.get(nameQ.id) : undefined;
    const email = emailQ ? byId.get(emailQ.id) : undefined;
    return { name: name || "Anonymous", email: email || "", byId };
  };

  if (loading || !form) {
    return (
      <div>
        <div className="h-32 border-b border-default bg-surface" />
        <div className="mx-auto max-w-7xl space-y-4 px-4 py-8 lg:px-8">
          <Skeleton className="h-24" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const stats: AnalyticsStats = analytics?.stats || {};

  return (
    <div className="min-h-full bg-app">
      <FormPageHeader
        form={form}
        right={
          <Button
            size="sm"
            onClick={handleExport}
            loading={exporting}
            disabled={!responses.length}
          >
            <Download className="h-4 w-4" />{" "}
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <KpiCard
            icon={Inbox}
            label="Responses"
            value={stats.totalResponses ?? 0}
            accent="brand"
          />
          <KpiCard
            icon={Eye}
            label="Views"
            value={stats.views ?? 0}
            accent="amber"
          />
          <KpiCard
            icon={TrendingUp}
            label="Conversion"
            value={`${stats.conversionRate ?? 0}%`}
            accent="pink"
            progress={stats.conversionRate}
          />
          <KpiCard
            icon={CheckCircle2}
            label="Completion"
            value={`${stats.completionRate ?? 0}%`}
            accent="green"
            progress={stats.completionRate}
          />
          <KpiCard
            icon={Clock}
            label="Avg. time"
            value={formatDuration(stats.avgCompletionTime)}
            accent="violet"
          />
        </div>

        {/* Table card */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-default bg-surface shadow-soft">
          <div className="flex flex-col gap-3 border-b border-default p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-fg">All responses</h2>
              <p className="text-xs text-muted">{responses.length} shown</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search responses…"
                className="h-9 pl-9"
              />
            </div>
          </div>

          {responses.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title={searchInput ? "No matching responses" : "No responses yet"}
              description={
                searchInput
                  ? "Try a different search term."
                  : "Share your form to start collecting responses."
              }
            />
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead className="border-b border-default text-left text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Respondent</th>
                    {extraCols.map((c) => (
                      <th
                        key={c.id}
                        className="hidden px-4 py-3 font-semibold lg:table-cell"
                      >
                        {c.label}
                      </th>
                    ))}
                    <th className="hidden px-4 py-3 font-semibold sm:table-cell">
                      Submitted
                    </th>
                    <th className="hidden px-4 py-3 font-semibold sm:table-cell">
                      Time
                    </th>
                    <th className="w-12 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {responses.map((r) => {
                    const { name, email, byId } = identity(r);
                    return (
                      <tr
                        key={r._id}
                        onClick={() => setActive(r)}
                        className="group cursor-pointer border-b border-default transition-colors last:border-0 hover:bg-surface-2"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={name} color="#0c8b7c" size="sm" />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-fg">
                                {name}
                              </p>
                              {email && (
                                <p className="truncate text-xs text-muted">
                                  {email}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        {extraCols.map((c) => (
                          <td
                            key={c.id}
                            className="hidden max-w-[12rem] truncate px-4 py-3 text-muted lg:table-cell"
                          >
                            {formatValue(byId.get(c.id)) || "—"}
                          </td>
                        ))}
                        <td className="hidden whitespace-nowrap px-4 py-3 text-muted sm:table-cell">
                          {formatDate(r.submittedAt)}
                        </td>
                        <td className="hidden whitespace-nowrap px-4 py-3 text-muted sm:table-cell">
                          {formatDuration(r.completionTime)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-muted opacity-0 transition group-hover:opacity-100">
                              <ArrowUpRight className="h-4 w-4" />
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setToDelete(r);
                              }}
                              className="rounded-lg p-1.5 text-muted transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail drawer */}
      <Drawer
        open={Boolean(active)}
        onClose={() => setActive(null)}
        title={active ? identity(active).name : "Response"}
        subtitle={
          active ? identity(active).email || "Anonymous respondent" : ""
        }
        footer={
          active && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">
                {active.answers.length} of {answerable.length} answered
              </span>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setToDelete(active)}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          )
        }
      >
        {active && <ResponseDetail response={active} questions={answerable} />}
      </Drawer>

      <ConfirmModal
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Delete this response?"
        description="This response will be permanently removed."
        confirmText="Delete"
        danger
      />
    </div>
  );
}

function ResponseDetail({ response, questions }: ResponseDetailProps) {
  const byId = new Map<string, any>(
    (response.answers || []).map((a) => [a.questionId, a.value]),
  );
  return (
    <div className="space-y-5">
      {/* Meta */}
      <div className="grid grid-cols-2 gap-3">
        <MetaTile
          icon={Calendar}
          label="Submitted"
          value={formatDate(response.submittedAt)}
        />
        <MetaTile
          icon={Clock}
          label="Completion"
          value={formatDuration(response.completionTime)}
        />
      </div>
      {response.meta?.userAgent && (
        <MetaTile
          icon={Monitor}
          label="Device"
          value={shortUA(response.meta.userAgent)}
          wide
        />
      )}

      {/* Answers */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Answers
        </p>
        {questions.map((q) => {
          const val = formatValue(byId.get(q.id));
          return (
            <div
              key={q.id}
              className="rounded-xl border border-default bg-surface-2/50 p-3.5"
            >
              <p className="text-xs font-medium text-muted">{q.label}</p>
              <p className="mt-1 text-sm text-fg">
                {val || <span className="text-muted/70">No answer</span>}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MetaTile({ icon: Icon, label, value, wide = false }: MetaTileProps) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <div className="flex items-center gap-2.5 rounded-xl border border-default bg-surface-2/50 p-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted">{label}</p>
          <p className="truncate text-sm font-medium text-fg">{value}</p>
        </div>
      </div>
    </div>
  );
}

function shortUA(ua: string): string {
  const m = ua.match(/(Chrome|Firefox|Safari|Edg|Edge|Opera)[/ ]?([\d.]+)?/);
  const os = /Windows/.test(ua)
    ? "Windows"
    : /Mac/.test(ua)
      ? "macOS"
      : /Android/.test(ua)
        ? "Android"
        : /iPhone|iPad/.test(ua)
          ? "iOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "";
  return [m?.[1], os].filter(Boolean).join(" · ") || "Unknown";
}

function formatValue(value: any): string {
  if (value === undefined || value === null || value === "") return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}
