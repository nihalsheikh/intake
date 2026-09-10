import { useState } from "react";
import { toast } from "sonner";
import { Plus, X, Sparkles, Wand2, GripVertical } from "lucide-react";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { FIELD_DEFS, OPTION_TYPES, uid } from "@/lib/fieldTypes";
import { aiApi } from "@/services";
import type { FormField, FieldValidation } from "@/types/forms";

interface FieldSettingsProps {
  field: FormField;
  onChange: (field: FormField) => void;
}

interface NumberInputProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
}

const NumberInput = ({ label, value, onChange }: NumberInputProps) => {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        className="h-9"
        value={value ?? ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value === "" ? null : Number(e.target.value))
        }
      />
    </div>
  );
};

export const FieldSettings = ({ field, onChange }: FieldSettingsProps) => {
  const def = FIELD_DEFS[field.type];
  const [aiBusy, setAiBusy] = useState<boolean>(false);
  const [improving, setImproving] = useState<boolean>(false);
  const [followUps, setFollowUps] = useState<string[]>([]);

  const set = (patch: Partial<FormField>) => onChange({ ...field, ...patch });
  const setValidation = (patch: Partial<FieldValidation>) =>
    set({ validation: { ...field.validation, ...patch } });

  const updateOption = (id: string, label: string) =>
    set({
      options: field.options.map((o) => (o.id === id ? { ...o, label } : o)),
    });

  const addOption = () =>
    set({
      options: [
        ...field.options,
        {
          id: uid("opt"),
          label: `Option ${field.options.length + 1}`,
          value: "",
        },
      ],
    });

  const removeOption = (id: string) =>
    set({ options: field.options.filter((o) => o.id !== id) });

  const suggestValidation = async (): Promise<void> => {
    setAiBusy(true);
    try {
      const v = await aiApi.generateValidation({
        label: field.label,
        type: field.type,
      });
      setValidation(v);
      toast.success("AI suggested validation rules");
    } catch (err: any) {
      toast.error(err?.message || "Failed to suggest validation");
    } finally {
      setAiBusy(false);
    }
  };

  const improve = async (): Promise<void> => {
    setImproving(true);
    try {
      const result = await aiApi.improveQuestion({ question: field });
      set({ label: result.improved });
      setFollowUps(result.followUps || []);
      toast.success("Question improved");
    } catch (err: any) {
      toast.error(err?.message || "Failed to improve question");
    } finally {
      setImproving(false);
    }
  };

  if (def?.static) {
    return (
      <div className="space-y-4">
        <div>
          <Label>{field.type === "image" ? "Image URL" : "Content"}</Label>
          {field.type === "image" ? (
            <Input
              value={field.content}
              placeholder="https://…"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                set({ content: e.target.value })
              }
            />
          ) : (
            <Textarea
              value={field.content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                set({ content: e.target.value })
              }
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <Label>Question label</Label>
          <button
            type="button"
            onClick={improve}
            disabled={improving}
            className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline disabled:opacity-50"
          >
            <Wand2 className="h-3 w-3" />{" "}
            {improving ? "Improving…" : "AI improve"}
          </button>
        </div>
        <Input
          value={field.label}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            set({ label: e.target.value })
          }
        />
      </div>

      {followUps.length > 0 && (
        <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-3 dark:border-brand-900 dark:bg-brand-900/20">
          <p className="mb-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300">
            Suggested follow-up questions
          </p>
          <div className="space-y-1">
            {followUps.map((f, i) => (
              <p key={i} className="text-xs text-muted">
                • {f}
              </p>
            ))}
          </div>
        </div>
      )}

      {!["yes_no", "rating", "file", "date"].includes(field.type) && (
        <div>
          <Label>Placeholder</Label>
          <Input
            value={field.placeholder}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              set({ placeholder: e.target.value })
            }
          />
        </div>
      )}

      <div>
        <Label>Description</Label>
        <Input
          value={field.description}
          placeholder="Optional helper text shown under the label"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            set({ description: e.target.value })
          }
        />
      </div>

      {OPTION_TYPES.has(field.type) && (
        <div>
          <Label>Options</Label>
          <div className="space-y-1.5">
            {field.options.map((o) => (
              <div key={o.id} className="flex items-center gap-1.5">
                <GripVertical className="h-4 w-4 shrink-0 text-muted" />
                <Input
                  value={o.label}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateOption(o.id, e.target.value)
                  }
                  className="h-9"
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeOption(o.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-1.5"
            onClick={addOption}
          >
            <Plus className="h-3.5 w-3.5" /> Add option
          </Button>
        </div>
      )}

      <div>
        <Label>Help text</Label>
        <Input
          value={field.helpText}
          placeholder="Shown below the field"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            set({ helpText: e.target.value })
          }
        />
      </div>

      <div className="rounded-xl border border-default bg-surface-2 p-3">
        <Switch
          checked={field.required}
          onChange={(v: boolean) => set({ required: v })}
          label="Required"
          description="Respondents must answer this question"
        />
      </div>

      <div className="rounded-xl border border-default p-3">
        <div className="mb-2 flex items-center justify-between">
          <Label className="mb-0">Validation</Label>
          <Button
            variant="subtle"
            size="sm"
            loading={aiBusy}
            onClick={suggestValidation}
          >
            <Sparkles className="h-3.5 w-3.5" /> AI suggest
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {["short_text", "long_text", "password", "address", "phone"].includes(
            field.type,
          ) && (
            <>
              <NumberInput
                label="Min length"
                value={field.validation.minLength}
                onChange={(v) => setValidation({ minLength: v })}
              />
              <NumberInput
                label="Max length"
                value={field.validation.maxLength}
                onChange={(v) => setValidation({ maxLength: v })}
              />
            </>
          )}
          {field.type === "number" && (
            <>
              <NumberInput
                label="Min value"
                value={field.validation.min}
                onChange={(v) => setValidation({ min: v })}
              />
              <NumberInput
                label="Max value"
                value={field.validation.max}
                onChange={(v) => setValidation({ max: v })}
              />
            </>
          )}
        </div>
        <div className="mt-2">
          <Label className="text-xs">Regex pattern</Label>
          <Input
            value={field.validation.pattern}
            placeholder="^[A-Za-z]+$"
            className="h-9 font-mono text-xs"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setValidation({ pattern: e.target.value })
            }
          />
        </div>
        <div className="mt-2">
          <Label className="text-xs">Error message</Label>
          <Input
            value={field.validation.message}
            placeholder="Please enter a valid value"
            className="h-9"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setValidation({ message: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
};
