import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
};

export function Badge({ children, className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-100",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
