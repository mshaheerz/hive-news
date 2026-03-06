'use client';

import Link from 'next/link';

interface Category {
  name: string;
  slug: string;
  color: string;
  icon?: string;
}

interface CategoryNavProps {
  categories: Category[];
  activeSlug?: string;
}

export function CategoryNav({ categories, activeSlug }: CategoryNavProps) {
  const isAllActive = !activeSlug;

  return (
    <nav className="relative">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {/* All option */}
        <Link
          href="/"
          className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
            isAllActive
              ? 'bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border-[var(--accent-cyan)]/50'
              : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-[var(--accent-cyan)]/30 hover:text-[var(--text-primary)]'
          }`}
        >
          All
        </Link>

        {/* Category pills */}
        {categories.map((cat) => {
          const isActive = activeSlug === cat.slug;
          return (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border"
              style={{
                backgroundColor: isActive ? `${cat.color}20` : 'transparent',
                color: isActive ? cat.color : 'var(--text-secondary)',
                borderColor: isActive ? `${cat.color}50` : 'var(--border-primary)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = `${cat.color}40`;
                  e.currentTarget.style.color = cat.color;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {cat.icon && <span>{cat.icon}</span>}
              {cat.name}
            </Link>
          );
        })}
      </div>

      {/* Scroll fade edges */}
      <div className="pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-[var(--bg-primary)] to-transparent" />
    </nav>
  );
}
