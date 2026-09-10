import { useMemo, useState, type FormEvent } from "react";
import { FieldRenderer } from "@/components/public/FieldRenderer";
import { FormArtPanel } from "@/components/public/FormArtPanel";
import { getTheme } from "@/lib/themes";
import { isStatic } from "@/lib/fieldTypes";
import {
  validateForm,
  type FormAnswers,
  type FormErrors,
} from "@/lib/validate";
import { shade } from "@/lib/utils";
import type { Form, FormField } from "@/types/forms";

interface SubmissionAnswer {
  questionId: string;
  value: any;
}

interface FormViewProps {
  form: Form;
  preview?: boolean;
  onSubmit?: (payload: SubmissionAnswer[]) => void;
  submitting?: boolean;
}

export const FormView = ({
  form,
  preview = false,
  onSubmit,
  submitting = false,
}: FormViewProps) => {
  const theme = getTheme(
    typeof form.theme === "string" ? form.theme : undefined,
  );
  const accent = form.settings?.primaryColor || theme.accent;
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [errors, setErrors] = useState<FormErrors>({});

  const answerable = useMemo(
    () => form.questions.filter((q: FormField) => !isStatic(q.type)),
    [form.questions],
  );

  const answeredCount = answerable.filter((q: FormField) => {
    const v = answers[q.id];
    return v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0);
  }).length;

  const progress = answerable.length
    ? Math.round((answeredCount / answerable.length) * 100)
    : 0;

  const setAnswer = (id: string, value: any): void => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const found = validateForm(form.questions, answers);
    if (Object.keys(found).length) {
      setErrors(found);
      const firstId = Object.keys(found)[0];
      document.getElementById(`q-${firstId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }
    const payload: SubmissionAnswer[] = answerable
      .filter(
        (q: FormField) => answers[q.id] !== undefined && answers[q.id] !== "",
      )
      .map((q: FormField) => ({ questionId: q.id, value: answers[q.id] }));
    onSubmit?.(payload);
  };

  const formBody = (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-xl px-6 py-12 sm:px-10 lg:px-12"
    >
      {form.settings?.logo ? (
        <img
          src={form.settings.logo}
          alt=""
          className="mb-8 h-9 w-auto object-contain"
        />
      ) : (
        <div
          className="mb-8 h-1 w-10 rounded-full"
          style={{ background: accent }}
        />
      )}

      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {form.title}
        </h1>
        {form.description && (
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {form.description}
          </p>
        )}
      </header>

      <div className="space-y-6 text-slate-900">
        {form.questions.map((q: FormField) => (
          <div key={q.id} id={`q-${q.id}`}>
            <FieldRenderer
              field={q}
              value={answers[q.id]}
              onChange={(val) => setAnswer(q.id, val)}
              error={errors[q.id]}
              accent={accent}
            />
          </div>
        ))}
      </div>

      {answerable.length > 0 && (
        <button
          type="submit"
          disabled={submitting}
          className="mt-9 w-full rounded-xl py-3 text-sm font-semibold text-white transition-all hover:brightness-[1.07] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
          style={{
            background: `linear-gradient(145deg, ${accent}, ${shade(accent, -16)})`,
            boxShadow: `0 8px 22px -8px ${accent}80`,
          }}
        >
          {submitting
            ? "Submitting…"
            : form.settings?.submitButtonText || "Submit"}
        </button>
      )}

      {preview && (
        <p className="mt-3 text-center text-xs text-slate-400">
          Preview mode — submissions are disabled
        </p>
      )}

      <p className="mt-10 text-center text-xs text-slate-400">
        Powered by Intake AI
      </p>
    </form>
  );

  const progressBar = form.settings?.showProgressBar &&
    answerable.length > 0 && (
      <div className="sticky top-0 z-10 h-1 w-full bg-slate-100">
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${progress}%`, background: accent }}
        />
      </div>
    );

  if (preview) {
    return (
      <div className="bg-white">
        {progressBar}
        {formBody}
      </div>
    );
  }

  return (
    <div className="grid h-screen grid-cols-1 lg:grid-cols-[1fr_minmax(0,42%)] xl:grid-cols-[1fr_minmax(0,46%)]">
      <div className="relative flex h-screen flex-col bg-white">
        {progressBar}
        <div className="flex-1 overflow-y-auto scrollbar-thin">{formBody}</div>
      </div>
      <FormArtPanel
        accent={accent}
        variant={theme.art}
        className="hidden lg:block"
      />
    </div>
  );
};
