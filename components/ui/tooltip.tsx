"use client";

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type TooltipProps = {
  term: ReactNode;
  content: ReactNode;
  className?: string;
};

export function Tooltip({ term, content, className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  function handleKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen((value) => !value);
    }
  }

  return (
    <span className="relative inline-block">
      <span
        aria-describedby={open ? id : undefined}
        className={cn(
          "cursor-help border-b border-dashed border-zinc-500 text-inherit outline-none transition hover:border-teal-300 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-teal-300/40",
          className,
        )}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((value) => !value)}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        role="button"
        tabIndex={0}
      >
        {term}
      </span>
      {open && (
        <span
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-xl border border-white/15 bg-[#0d121a] p-3 text-left text-xs font-normal normal-case leading-5 tracking-normal text-zinc-200 shadow-xl shadow-black/60"
          id={id}
          role="tooltip"
        >
          {content}
        </span>
      )}
    </span>
  );
}
