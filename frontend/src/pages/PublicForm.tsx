import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle2, FileX2 } from "lucide-react";
import { formApi, responseApi } from "@/services";
import { FormView } from "@/components/public/FormView";
import { FormArtPanel } from "@/components/public/FormArtPanel";
import { getTheme } from "@/lib/themes";
import { PageLoader } from "@/components/ui/Feedback";
import type { Form } from "@/types/forms";

export type PublicFormStatus = "loading" | "ready" | "notfound" | "done";

interface SuccessScreenProps {
  form: Form;
}

export default function PublicForm() {
  const { slug } = useParams<{ slug: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [status, setStatus] = useState<PublicFormStatus>("loading");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const startedAt = useRef<number>(Date.now());

  useEffect(() => {
    if (!slug) {
      setStatus("notfound");
      return;
    }

    formApi
      .getPublic(slug)
      .then((f: Form) => {
        setForm(f);
        setStatus("ready");
        startedAt.current = Date.now();
        document.title = `${f.settings?.seoTitle || f.title} - Intake AI`;
      })
      .catch(() => setStatus("notfound"));
  }, [slug]);

  const handleSubmit = async (answers: Record<string, any>) => {
    if (!slug) return;
    setSubmitting(true);
    try {
      await responseApi.submit(slug, {
        answers,
        completionTime: Math.round((Date.now() - startedAt.current) / 1000),
      });
      setStatus("done");
      window.scrollTo({ top: 0 });
    } catch (err: any) {
      toast.error(err?.message || "Could not submit — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") return <PageLoader label="Loading form…" />;

  if (status === "notfound" || !form) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-app px-6 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-surface-2 text-muted">
          <FileX2 className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-fg">Form not available</h1>
        <p className="max-w-sm text-muted">
          This form may have been unpublished or the link is incorrect.
        </p>
      </div>
    );
  }

  if (status === "done") return <SuccessScreen form={form} />;

  return (
    <div className="min-h-screen">
      <FormView form={form} onSubmit={handleSubmit} submitting={submitting} />
    </div>
  );
}

function SuccessScreen({ form }: SuccessScreenProps) {
  const theme = getTheme(
    typeof form.theme === "string" ? form.theme : undefined,
  );
  const accent = form.settings?.primaryColor || theme.accent;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fafafa] px-4">
      {/* Soft accent illustration behind the card */}
      <FormArtPanel
        accent={accent}
        variant={theme.art}
        className="pointer-events-none absolute inset-0 opacity-60"
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-9 text-center shadow-[0_30px_60px_-28px_rgba(16,24,40,0.30)] ring-1 ring-slate-900/[0.06]">
        <div
          className="mx-auto grid h-16 w-16 place-items-center rounded-full text-white animate-pop"
          style={{
            background: accent,
            boxShadow: `0 10px 26px -8px ${accent}80`,
          }}
        >
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
          {form.settings?.thankYouMessage || "Thank you!"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Your response has been recorded.
        </p>
        <p className="mt-8 text-xs text-slate-400">Powered by Intake AI</p>
      </div>
    </div>
  );
}
