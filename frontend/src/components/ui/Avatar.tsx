import { initials, cn } from "@/lib/utils";

export type AvatarSize = "sm" | "md" | "lg";

export interface AvatarProps {
  name?: string;
  color?: string;
  size?: AvatarSize;
  className?: string;
}

const SIZES: Record<AvatarSize, string> = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
};

export const Avatar = ({
  name = "",
  color = "#6366f1",
  size = "md",
  className,
}: AvatarProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold text-white",
        SIZES[size],
        className,
      )}
      style={{ backgroundColor: color }}
    >
      {initials(name) || "?"}
    </span>
  );
};
