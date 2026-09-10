import type { ComponentType, ReactNode } from "react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { cn } from "@/lib/utils";

type KpiAccent =
  | "brand"
  | "gold"
  | "slate"
  | "green"
  | "amber"
  | "pink"
  | "violet";

interface AccentConfig {
  chip: string;
  spark: string;
  bar: string;
}

interface SparklinePoint {
  count: number;
  [key: string]: any;
}

interface KpiCardProps {
  icon?: ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: ReactNode;
  sub?: string;
  accent?: KpiAccent;
  spark?: SparklinePoint[];
  progress?: number;
}

const ACCENTS: Record<KpiAccent, AccentConfig> = {
  brand: {
    chip: "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300",
    spark: "#0c8b7c",
    bar: "from-brand-400 to-brand-600",
  },
  gold: {
    chip: "bg-amber-50 text-amber-700 dark:bg-amber-900/25 dark:text-amber-300",
    spark: "#c79235",
    bar: "from-amber-400 to-amber-500",
  },
  slate: {
    chip: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    spark: "#64748b",
    bar: "from-slate-400 to-slate-500",
  },
  green: {
    chip: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300",
    spark: "#0e9b88",
    bar: "from-emerald-400 to-teal-600",
  },
  amber: {
    chip: "bg-amber-50 text-amber-700 dark:bg-amber-900/25 dark:text-amber-300",
    spark: "#c79235",
    bar: "from-amber-400 to-amber-500",
  },
  pink: {
    chip: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    spark: "#64748b",
    bar: "from-slate-400 to-slate-500",
  },
  violet: {
    chip: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    spark: "#64748b",
    bar: "from-slate-400 to-slate-500",
  },
};

// Premium KPI tile with optional sparkline and progress bar
export const KpiCard = ({
  icon: Icon,
  label,
  value,
  sub,
  accent = "brand",
  spark,
  progress,
}: KpiCardProps) => {
  const a = ACCENTS[accent] || ACCENTS.brand;
  const sparkData = spark?.length ? spark : null;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-default bg-surface p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-fg">
            {value}
          </p>
          {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              a.chip,
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={1.8} />
          </div>
        )}
      </div>

      {progress != null && (
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className={cn("h-full rounded-full bg-gradient-to-r", a.bar)}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}

      {sparkData && (
        <div className="mt-3 -mb-1 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={sparkData}
              margin={{ top: 2, bottom: 0, left: 0, right: 0 }}
            >
              <defs>
                <linearGradient
                  id={`spark-${accent}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={a.spark} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={a.spark} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="count"
                stroke={a.spark}
                strokeWidth={2}
                fill={`url(#spark-${accent})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
