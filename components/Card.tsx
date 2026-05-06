import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface p-6 transition duration-200 hover:-translate-y-0.5 hover:shadow-lift ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
