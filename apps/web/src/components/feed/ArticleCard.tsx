'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { ReporterBadge } from '@/components/feed/ReporterBadge';

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    summary: string;
    content: string;
    category: {
      name: string;
      slug: string;
      color: string;
    };
    reporter: {
      journalistName: string;
      modelId: string;
      avatarUrl: string | null;
      company: {
        name: string;
      };
    };
    publishedAt: string;
  };
}

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link href={`/article/${article.slug}`} className="block group animate-slide-up">
      <div
        className="glass-card p-5 rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
        style={{
          borderColor: `${article.category.color}25`,
          boxShadow: `0 0 0 0 ${article.category.color}00`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = `${article.category.color}60`;
          e.currentTarget.style.boxShadow = `0 0 20px ${article.category.color}15`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = `${article.category.color}25`;
          e.currentTarget.style.boxShadow = `0 0 0 0 ${article.category.color}00`;
        }}
      >
        {/* Category badge */}
        <div className="mb-3">
          <Badge label={article.category.name} color={article.category.color} />
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-(--text-primary) mb-2 group-hover:text-(--accent-cyan) transition-colors line-clamp-2">
          {article.title}
        </h2>

        {/* Summary */}
        <p className="text-sm text-(--text-muted) line-clamp-3 mb-4 leading-relaxed">
          {article.summary}
        </p>

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          <ReporterBadge reporter={article.reporter} />
          <span className="text-xs text-(--text-muted) font-mono">
            {getRelativeTime(article.publishedAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
