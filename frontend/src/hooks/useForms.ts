import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { toast } from "sonner";
import { formApi } from "@/services";
import type { Form } from "@/types/forms";

export interface UseFormsOptions {
  search?: string;
  filter?: string;
}

export interface UseFormsReturn {
  forms: Form[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  duplicate: (id: string) => Promise<void>;
  patch: (id: string, updates: Partial<Form>) => Promise<void>;
  setForms: Dispatch<SetStateAction<Form[]>>;
}

// Loads and mutates the current user's forms with optimistic UI helpers.
export const useForms = ({
  search = "",
  filter = "all",
}: UseFormsOptions = {}): UseFormsReturn => {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await formApi.list({ search, filter });
      setForms(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load forms");
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = useCallback(
    async (id: string): Promise<void> => {
      setForms((prev) => prev.filter((f) => (f._id || f.id) !== id));
      try {
        await formApi.remove(id);
        toast.success("Form deleted");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete form");
        load();
      }
    },
    [load],
  );

  const duplicate = useCallback(async (id: string): Promise<void> => {
    try {
      const copy = await formApi.duplicate(id);
      setForms((prev) => [copy, ...prev]);
      toast.success("Form duplicated");
    } catch (err: any) {
      toast.error(err.message || "Failed to duplicate form");
    }
  }, []);

  const patch = useCallback(
    async (id: string, updates: Partial<Form>): Promise<void> => {
      setForms((prev) =>
        prev.map((f) => ((f._id || f.id) === id ? { ...f, ...updates } : f)),
      );
      try {
        await formApi.update(id, updates);
      } catch (err: any) {
        toast.error(err.message || "Failed to update form");
        load();
      }
    },
    [load],
  );

  return {
    forms,
    loading,
    error,
    reload: load,
    remove,
    duplicate,
    patch,
    setForms,
  };
};
