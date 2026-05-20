import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary";
};

export function Button({
  children,
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-teal-300 text-zinc-950 shadow-lg shadow-teal-950/30 hover:bg-teal-200",
        variant === "secondary" &&
          "border border-white/12 bg-white/[0.04] text-zinc-100 hover:bg-white/[0.08]",
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
