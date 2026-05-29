type WordmarkProps = {
  className?: string;
};

export function Wordmark({ className }: WordmarkProps) {
  return (
    <span className={`mark${className ? ` ${className}` : ""}`}>
      <span aria-hidden className="diamond" />
      <span className="name">ARCANUM</span>
    </span>
  );
}

export function DiamondGem({ className }: { className?: string }) {
  return <span aria-hidden className={`gem${className ? ` ${className}` : ""}`} />;
}
