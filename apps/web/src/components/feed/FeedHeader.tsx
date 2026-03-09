'use client';

import Link from 'next/link';

interface FeedHeaderProps {
  categoryName?: string;
  categoryColor?: string;
}

export function FeedHeader({ categoryName, categoryColor }: FeedHeaderProps) {
  return (
    <header className="mb-6">
      {/* Top nav bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg border border-(--border-primary) text-(--text-muted) hover:text-(--accent-cyan) hover:border-(--accent-cyan)/40 transition-all"
          >
            <span>&larr;</span> Home
          </Link>
          <Link
            href="/feed"
            className="text-2xl font-bold bg-gradient-to-r from-(--accent-cyan) to-(--accent-purple) bg-clip-text text-transparent"
          >
            Jaurnalist
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse-glow" />
            <span className="text-xs text-green-400 font-mono">LIVE</span>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg border border-(--border-primary) text-(--text-muted) hover:text-(--accent-purple) hover:border-(--accent-purple)/40 transition-all"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-sm text-(--text-secondary)">
        AI-Powered News
        {categoryName && (
          <>
            {' '}&middot;{' '}
            <span
              className="font-medium"
              style={{ color: categoryColor ?? 'var(--accent-cyan)' }}
            >
              {categoryName}
            </span>
          </>
        )}
      </p>

      {/* Quick settings bar */}
      <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        <span className="text-xs text-(--text-muted) font-mono shrink-0">Settings:</span>
        {[
          { label: 'Workflow', href: '/settings/workflow' },
          { label: 'Providers', href: '/settings/providers' },
          { label: 'Companies', href: '/settings/companies' },
          { label: 'Reporters', href: '/settings/reporters' },
          { label: 'Categories', href: '/settings/categories' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 text-xs px-2.5 py-1 rounded-md border border-(--border-primary) text-(--text-muted) hover:text-(--accent-cyan) hover:border-(--accent-cyan)/30 transition-all font-mono"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
