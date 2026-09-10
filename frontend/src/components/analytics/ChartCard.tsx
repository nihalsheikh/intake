import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon?: ComponentType<{ className?: string; strokeWidth?: number }>;
  right?: ReactNode;
  className?: string;
  bodyClass?: string;
  children: ReactNode;
}

export const ChartCard = ({
  title,
  subtitle,
  icon: Icon,
  right,
  className,
  bodyClass,
  children,
}: ChartCardProps) => {
  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-default bg-surface p-5 shadow-soft",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
              <Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
            </span>
          )}
          <div>
            <h3 className="text-sm font-semibold text-fg">{title}</h3>
            {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
          </div>
        </div>
        {right}
      </div>
      <div className={cn("mt-4 flex-1", bodyClass)}>{children}</div>
    </div>
  );
};
