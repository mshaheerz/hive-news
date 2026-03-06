interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'purple' | 'none';
}

export function GlassCard({ children, className = '', glow = 'none' }: GlassCardProps) {
  const glowClass = glow === 'cyan' ? 'glow-cyan' : glow === 'purple' ? 'glow-purple' : '';
  return (
    <div className={`glass-card p-6 ${glowClass} ${className}`}>
      {children}
    </div>
  );
}
