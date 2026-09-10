import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  MoreVertical,
  Star,
  Pencil,
  Copy,
  BarChart3,
  Inbox,
  Link2,
  Archive,
  ArchiveRestore,
  Trash2,
  Globe,
  CircleDashed,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Feedback";
import { Dropdown, MenuItem, MenuDivider } from "@/components/ui/Dropdown";
import { CardDecor } from "@/components/dashboard/CardDecor";
import { cn, timeAgo, hexToRgba } from "@/lib/utils";
import type { Form } from "@/types/forms";

interface FormCardProps {
  form: Form & {
    slug?: string;
    views?: number;
    responseCount?: number;
    isFavorite?: boolean;
    isArchived?: boolean;
    status?: "published" | "draft";
  };
  index?: number;
  onDuplicate: (id: string) => void;
  onDelete: (form: Form) => void;
  onPatch: (id: string, updates: Partial<Form>) => void;
}

interface StripItem {
  color: string;
  decor: "a" | "b" | "c" | "d" | "e";
}

const STRIP: StripItem[] = [
  { color: "#0c8b7c", decor: "e" },
  { color: "#4f7cc0", decor: "b" },
  { color: "#7e6cc0", decor: "a" },
  { color: "#c79235", decor: "c" },
  { color: "#c2706a", decor: "d" },
  { color: "#2f9e8a", decor: "a" },
  { color: "#5e7fb8", decor: "c" },
  { color: "#b06ca0", decor: "b" },
];

export const FormCard = ({
  form,
  index = 0,
  onDuplicate,
  onDelete,
  onPatch,
}: FormCardProps) => {
  const navigate = useNavigate();
  const strip = STRIP[index % STRIP.length];
  const accent = strip.color;
  const published = form.status === "published";
  const formId = (form._id || form.id || "") as string;

  const copyLink = () => {
    const url = `${window.location.origin}/f/${form.slug || formId}`;
    navigator.clipboard.writeText(url);
    toast.success("Public link copied");
  };

  return (
    <Card hover className="group flex flex-col">
      <div
        className="relative h-24 w-full overflow-hidden rounded-t-2xl"
        style={{
          background: `linear-gradient(135deg, ${hexToRgba(accent, 0.14)}, ${hexToRgba(accent, 0.05)})`,
        }}
      >
        <div className="pointer-events-none absolute -bottom-2 right-0 opacity-55">
          <CardDecor
            variant={strip.decor}
            color={accent}
            className="h-28 w-28"
          />
        </div>
        <button
          onClick={() =>
            onPatch(formId, { isFavorite: !form.isFavorite } as any)
          }
          className={cn(
            "absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg backdrop-blur transition",
            form.isFavorite
              ? "bg-white/90 text-amber-500"
              : "bg-black/15 text-white hover:bg-black/25",
          )}
          aria-label="Favorite"
        >
          <Star className={cn("h-4 w-4", form.isFavorite && "fill-current")} />
        </button>
        <div className="absolute left-3 top-3">
          <Badge variant={published ? "green" : "gray"}>
            {published ? (
              <Globe className="h-3 w-3" />
            ) : (
              <CircleDashed className="h-3 w-3" />
            )}
            {published ? "Published" : "Draft"}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <button
            onClick={() => navigate(`/builder/${formId}`)}
            className="line-clamp-1 text-left text-base font-semibold text-fg hover:text-brand-600"
          >
            {form.title}
          </button>

          <Dropdown
            trigger={
              <button className="rounded-lg p-1 text-muted opacity-0 transition hover:bg-surface-2 group-hover:opacity-100">
                <MoreVertical className="h-4 w-4" />
              </button>
            }
          >
            <MenuItem
              icon={Pencil}
              onClick={() => navigate(`/builder/${formId}`)}
            >
              Edit
            </MenuItem>
            <MenuItem
              icon={BarChart3}
              onClick={() => navigate(`/forms/${formId}/analytics`)}
            >
              Analytics
            </MenuItem>
            <MenuItem
              icon={Inbox}
              onClick={() => navigate(`/forms/${formId}/responses`)}
            >
              Responses
            </MenuItem>
            <MenuItem icon={Copy} onClick={() => onDuplicate(formId)}>
              Duplicate
            </MenuItem>
            {published && (
              <MenuItem icon={Link2} onClick={copyLink}>
                Copy link
              </MenuItem>
            )}
            <MenuDivider />
            <MenuItem
              icon={form.isArchived ? ArchiveRestore : Archive}
              onClick={() =>
                onPatch(formId, { isArchived: !form.isArchived } as any)
              }
            >
              {form.isArchived ? "Unarchive" : "Archive"}
            </MenuItem>
            <MenuItem icon={Trash2} danger onClick={() => onDelete(form)}>
              Delete
            </MenuItem>
          </Dropdown>
        </div>

        <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-muted">
          {form.description || "No description yet."}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-default pt-3 text-xs text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Inbox className="h-3.5 w-3.5" /> {form.responseCount || 0}
            </span>
            <span className="flex items-center gap-1">
              <BarChart3 className="h-3.5 w-3.5" /> {form.views || 0}
            </span>
          </div>
          <span>{timeAgo(form.updatedAt || form.createdAt || "")}</span>
        </div>
      </div>
    </Card>
  );
};
