import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type SelectHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

const baseField =
  "w-full rounded-xl border border-default bg-surface-2/60 px-3.5 py-2.5 text-sm text-fg placeholder:text-muted/60 transition-all duration-200 " +
  "hover:border-brand-200 focus:outline-none focus:border-brand-400 focus:bg-surface focus:ring-4 focus:ring-brand-500/12 disabled:opacity-60";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        baseField,
        invalid && "border-red-400 focus:ring-red-500/10",
        className,
      )}
      {...props}
    />
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, invalid, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          baseField,
          "min-h-[96px] resize-y",
          invalid && "border-red-400",
          className,
        )}
        {...props}
      />
    );
  },
);

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
  children?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          baseField,
          "cursor-pointer appearance-none bg-no-repeat",
          className,
        )}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundPosition: "right 0.75rem center",
          paddingRight: "2.25rem",
        }}
        {...props}
      >
        {children}
      </select>
    );
  },
);

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
  children?: ReactNode;
  required?: boolean;
}

export const Label = ({
  className,
  children,
  required,
  ...props
}: LabelProps) => {
  return (
    <label
      className={cn("block text-sm font-medium text-fg mb-1.5", className)}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
};

export interface FieldErrorProps {
  children?: ReactNode;
}

export const FieldError = ({ children }: FieldErrorProps) => {
  if (!children) return null;
  return <p className="mt-1.5 text-xs font-medium text-red-500">{children}</p>;
};

export interface FieldProps {
  label?: ReactNode;
  required?: boolean;
  error?: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
}

export const Field = ({
  label,
  required,
  error,
  hint,
  children,
}: FieldProps) => {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      <FieldError>{error}</FieldError>
    </div>
  );
};
