import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type CardVariant = "default" | "primary" | "subtle";

type CardProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  children: ReactNode;
  eyebrow?: string;
  title?: ReactNode;
  variant?: CardVariant;
};

const variantClasses: Record<CardVariant, string> = {
  default:
    "border-white/10 bg-white/[0.045] shadow-xl shadow-black/20",
  primary:
    "border-teal-300/30 bg-gradient-to-br from-teal-300/[0.09] via-white/[0.045] to-white/[0.02] shadow-2xl shadow-teal-950/30",
  subtle: "border-white/[0.06] bg-white/[0.02]",
};

export function Card({
  children,
  className,
  eyebrow,
  title,
  variant = "default",
  ...props
}: CardProps) {
  return (
    <article
      className={cn(
        "rounded-3xl border p-5 backdrop-blur",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {(eyebrow || title) && (
        <div className="mb-4 space-y-2">
          {eyebrow && (
            <p
              className={cn(
                "text-xs font-medium uppercase tracking-[0.18em]",
                variant === "primary" ? "text-teal-200" : "text-teal-200/80",
              )}
            >
              {eyebrow}
            </p>
          )}
          {title && (
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          )}
        </div>
      )}
      {children}
    </article>
  );
}
