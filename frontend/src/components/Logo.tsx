import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: number;
}

export const Logo = ({ className, showText = true, size = 32 }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className="grid place-items-center rounded-xl bg-brand-gradient text-white shadow-soft"
        style={{ width: size, height: size }}
      >
        <svg
          width={size * 0.56}
          height={size * 0.56}
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M4 5h16M4 12h10M4 19h7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="18" cy="17" r="3.4" fill="currentColor" opacity="0.9" />
        </svg>
      </div>
      {showText && (
        <span className="text-lg font-bold tracking-tight text-fg">
          Intake <span className="text-brand-600">AI</span>
        </span>
      )}
    </div>
  );
};
