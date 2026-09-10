import type { ComponentType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  className?: string;
  children?: ReactNode;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: ReactNode;
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: ReactNode;
}

export type StatCardAccent = "brand" | "green" | "amber" | "pink";

export interface StatCardProps {
  icon?: ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
  sublabel?: string;
  accent?: StatCardAccent;
  className?: string;
}

const ACCENTS: Record<StatCardAccent, string> = {
  brand: "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300",
  green:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300",
  pink: "bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300",
};

export const Card = ({ className, hover = false, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        "rounded-2xl border border-default bg-surface shadow-soft",
        hover &&
          "transition-all duration-200 hover:shadow-card hover:-translate-y-0.5",
        className,
      )}
      {...props}
    />
  );
};

export const CardHeader = ({ className, ...props }: CardHeaderProps) => {
  return <div className={cn("p-5 pb-0", className)} {...props} />;
};

export const CardBody = ({ className, ...props }: CardBodyProps) => {
  return <div className={cn("p-5", className)} {...props} />;
};

export const StatCard = ({
  icon: Icon,
  label,
  value,
  sublabel,
  accent = "brand",
  className,
}: StatCardProps) => {
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-fg">
            {value}
          </p>
          {sublabel && <p className="mt-1 text-xs text-muted">{sublabel}</p>}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl",
              ACCENTS[accent],
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </Card>
  );
};
