export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[var(--bg-card)] rounded-lg ${className}`} />
  );
}
