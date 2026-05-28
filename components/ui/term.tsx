import { getDefinition } from "@/lib/glossary";

import { Tooltip } from "./tooltip";

type TermProps = {
  children: string;
  label?: string;
};

export function Term({ children, label }: TermProps) {
  const key = (label ?? children).toLowerCase();
  const definition = getDefinition(key);

  if (!definition) {
    return <>{children}</>;
  }

  return <Tooltip content={definition} term={children} />;
}
