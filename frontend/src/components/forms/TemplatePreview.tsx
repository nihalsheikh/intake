import { Star } from "lucide-react";
import { isStatic } from "@/lib/fieldTypes";
import type { FormField, FieldType } from "@/types/forms";

interface TemplatePreviewProps {
  questions: FormField[];
}

interface MiniFieldProps {
  type: FieldType;
}

const bar = (extra: string = ""): string =>
  `rounded bg-slate-100 ring-1 ring-slate-200/70 dark:bg-slate-800 dark:ring-slate-700 ${extra}`;

const MiniField = ({ type }: MiniFieldProps) => {
  if (type === "rating") {
    return (
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((n) => (
          <Star
            key={n}
            className="h-3 w-3"
            style={{
              fill: n < 4 ? "var(--color-brand-300)" : "transparent",
              color: n < 4 ? "var(--color-brand-300)" : "#cbd5e1",
            }}
          />
        ))}
      </div>
    );
  }

  if (["radio", "checkbox", "dropdown"].includes(type)) {
    return (
      <div className="space-y-1.5">
        {[0, 1, 2].map((n) => (
          <div key={n} className="flex items-center gap-1.5">
            <span
              className={`h-2.5 w-2.5 shrink-0 border border-slate-300 dark:border-slate-600 ${
                type === "checkbox" ? "rounded-[3px]" : "rounded-full"
              }`}
            />
            <span className={bar("h-1.5 w-1/2")} />
          </div>
        ))}
      </div>
    );
  }

  if (type === "long_text") {
    return <div className={bar("h-8 w-full")} />;
  }

  return <div className={bar("h-4 w-full")} />;
};

export const TemplatePreview = ({ questions }: TemplatePreviewProps) => {
  const fields = questions.filter((q) => !isStatic(q.type)).slice(0, 4);

  return (
    <div className="relative h-44 overflow-hidden bg-surface-2">
      <div className="mx-auto mt-6 w-[16rem] max-w-[82%] rounded-xl border border-default bg-surface p-4 shadow-soft">
        <div className="h-2.5 w-1/2 rounded-full bg-brand-500/80" />
        <div className="mt-1.5 h-1.5 w-2/3 rounded-full bg-slate-200 dark:bg-slate-700" />

        <div className="mt-3.5 space-y-3">
          {fields.map((f, i) => (
            <div key={i}>
              <div className="mb-1 h-1.5 w-1/3 rounded-full bg-slate-200 dark:bg-slate-700" />
              <MiniField type={f.type} />
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--surface-2)] to-transparent" />
    </div>
  );
};
