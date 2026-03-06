interface BadgeProps {
  label: string;
  color?: string;
  className?: string;
}

export function Badge({ label, color = '#8b5cf6', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
    >
      {label}
    </span>
  );
}
