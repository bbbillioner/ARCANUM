import type { ReactNode } from "react";

type SectionHeaderProps = {
  description?: ReactNode;
  eyebrow?: string;
  title: ReactNode;
};

export function SectionHeader({
  description,
  eyebrow,
  title,
}: SectionHeaderProps) {
  return (
    <div className="max-w-3xl">
      {eyebrow && (
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-amber-200/80">
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl font-semibold leading-tight text-white sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-7 text-zinc-400">{description}</p>
      )}
    </div>
  );
}
