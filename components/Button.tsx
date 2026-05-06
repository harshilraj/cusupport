import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "border-primary bg-primary text-white hover:border-primary-hover hover:bg-primary-hover hover:shadow-glow",
  secondary:
    "border-border bg-surface text-text-primary hover:border-primary hover:text-primary"
};

export function Button({
  className = "",
  variant = "primary",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-md border px-4 py-2 text-sm font-bold transition duration-200 focus:outline-none focus:ring-[3px] focus:ring-primary/40 ${variantStyles[variant]} ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
