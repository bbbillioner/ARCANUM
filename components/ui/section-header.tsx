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
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-teal-200/80">
          {eyebrow}
        </p>
      )}
      <h2 className="font-serif text-3xl font-semibold leading-[1.15] tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-7 text-zinc-400">{description}</p>
      )}
    </div>
  );
}
