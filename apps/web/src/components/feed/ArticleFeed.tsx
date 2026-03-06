'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArticleCard } from '@/components/feed/ArticleCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useSSE } from '@/lib/sse/use-sse';

interface Article {
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
}

interface ArticleFeedProps {
  initialArticles?: Article[];
}

function ArticleSkeleton() {
  return (
    <div className="glass-card p-5 rounded-xl border border-[var(--border-primary)] space-y-3">
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function ArticleFeed({ initialArticles }: ArticleFeedProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles ?? []);
  const [loading, setLoading] = useState(!initialArticles);

  const handleSSEMessage = useCallback((event: { type: string; data?: Article }) => {
    if (event.type === 'new-article' && event.data) {
      setArticles((prev) => {
        // Prevent duplicates
        if (prev.some((a) => a.id === event.data!.id)) return prev;
        return [event.data!, ...prev];
      });
    }
  }, []);

  const { connected } = useSSE('/api/sse/feed', {
    onMessage: handleSSEMessage,
  });

  // Fetch initial articles if none were provided
  useEffect(() => {
    if (initialArticles) return;

    async function fetchArticles() {
      try {
        const res = await fetch('/api/v1/articles?limit=20&status=published');
        if (res.ok) {
          const data = await res.json();
          setArticles(data.articles ?? []);
        }
      } catch {
        // Silently fail, will retry on next reconnect
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, [initialArticles]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <ArticleSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="glass-card p-12 rounded-xl border border-[var(--border-primary)] text-center">
        <div className="text-4xl mb-4 opacity-30">
          <span className="font-mono">&gt;_</span>
        </div>
        <h3 className="text-lg font-semibold text-[var(--text-secondary)] mb-2">
          No articles yet
        </h3>
        <p className="text-sm text-[var(--text-muted)]">
          The AI reporters are warming up. Articles will appear here in real-time.
        </p>
        {connected && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-400 font-mono">Connected &mdash; waiting for articles</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
