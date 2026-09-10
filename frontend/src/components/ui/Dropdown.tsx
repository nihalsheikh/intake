import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export type DropdownAlign = "left" | "right";

export interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: DropdownAlign;
  className?: string;
}

export interface MenuItemProps {
  icon?: ComponentType<{ className?: string }>;
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  danger?: boolean;
  className?: string;
}

/**
 * Lightweight click-to-open menu. `trigger` is the clickable element;
 * children are MenuItem nodes rendered in a floating panel.
 */
export const Dropdown = ({
  trigger,
  children,
  align = "right",
  className = "",
}: DropdownProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: globalThis.MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className={cn(
            "absolute z-40 mt-1.5 min-w-[12rem] overflow-hidden rounded-xl border border-default bg-surface p-1.5 shadow-pop animate-scale-in",
            align === "right" ? "right-0" : "left-0",
            className,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const MenuItem = ({
  icon: Icon,
  children,
  onClick,
  danger = false,
  className = "",
}: MenuItemProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors",
        danger
          ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          : "text-fg hover:bg-surface-2",
        className,
      )}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      {children}
    </button>
  );
};

export const MenuDivider = () => {
  return <div className="my-1.5 h-px bg-[var(--border)]" />;
};
