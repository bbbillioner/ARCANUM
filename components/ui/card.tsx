import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
};

export function Card({ children, className, eyebrow, title, ...props }: CardProps) {
  return (
    <article
      className={cn(
        "rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/20 backdrop-blur",
        className,
      )}
      {...props}
    >
      {(eyebrow || title) && (
        <div className="mb-4 space-y-2">
          {eyebrow && (
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-teal-200/80">
              {eyebrow}
            </p>
          )}
          {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
        </div>
      )}
      {children}
    </article>
  );
}
