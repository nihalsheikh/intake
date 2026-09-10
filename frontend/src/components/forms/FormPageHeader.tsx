import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Inbox,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Feedback";
import { cn } from "@/lib/utils";
import type { Form } from "@/types/forms";

interface FormPageHeaderProps {
  form: Form & {
    slug?: string;
    views?: number;
    responseCount?: number;
    status?: "published" | "draft";
  };
  right?: ReactNode;
}

// Header shared by the Responses and Analytics views of a form.
export const FormPageHeader = ({ form, right }: FormPageHeaderProps) => {
  const navigate = useNavigate();
  const published = form?.status === "published";
  const formId = form?._id || form?.id || "";

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-1.5 border-b-2 px-1 pb-2 text-sm font-medium transition-colors",
      isActive
        ? "border-brand-600 text-brand-600"
        : "border-transparent text-muted hover:text-fg",
    );

  return (
    <div className="border-b border-default bg-surface">
      <div className="mx-auto max-w-7xl px-4 pt-5 lg:px-8">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-xl font-bold tracking-tight text-fg">
                  {form?.title}
                </h1>
                <Badge variant={published ? "green" : "gray"}>
                  {published ? "Published" : "Draft"}
                </Badge>
              </div>
              <p className="text-xs text-muted">
                {form?.responseCount || 0} responses · {form?.views || 0} views
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {published && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  window.open(`/f/${form.slug || formId}`, "_blank")
                }
              >
                <ExternalLink className="h-4 w-4" />{" "}
                <span className="hidden sm:inline">View</span>
              </Button>
            )}
            {right}
          </div>
        </div>

        <nav className="mt-4 flex gap-5">
          <NavLink to={`/builder/${formId}`} className={tabClass}>
            <Pencil className="h-4 w-4" /> Edit
          </NavLink>
          <NavLink to={`/forms/${formId}/responses`} className={tabClass}>
            <Inbox className="h-4 w-4" /> Responses
          </NavLink>
          <NavLink to={`/forms/${formId}/analytics`} className={tabClass}>
            <BarChart3 className="h-4 w-4" /> Analytics
          </NavLink>
        </nav>
      </div>
    </div>
  );
};
