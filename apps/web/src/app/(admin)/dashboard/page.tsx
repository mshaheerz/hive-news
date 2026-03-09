'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

import { trpc } from '@/lib/trpc/client';

const AgentFlowViz = dynamic(() => import('@/components/three/AgentFlowViz').then((m) => m.AgentFlowViz), {
  ssr: false,
  loading: () => (
    <div className="glass-card p-8 rounded-xl border border-(--border-primary) animate-pulse h-125 flex items-center justify-center">
      <span className="text-sm text-(--text-muted) font-mono">Loading visualization...</span>
    </div>
  ),
});

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="glass-card p-5 rounded-xl border border-(--border-primary)">
      <p className="text-xs text-(--text-muted) font-mono uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

const EVENT_COLORS: Record<string, string> = {
  'article-generated': '#22c55e',
  'article-approved': '#22c55e',
  'article-rejected': '#ef4444',
  'article-published': 'var(--accent-cyan)',
  'topic-selected': '#f59e0b',
  'generation-started': '#3b82f6',
  'generation-completed': '#22c55e',
  'review-started': '#a855f7',
  'error': '#ef4444',
};

function getEventColor(event: string): string {
  return EVENT_COLORS[event] ?? 'var(--text-muted)';
}

function formatEventLabel(event: string): string {
  return event
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function DashboardPage() {
  const { data } = trpc.dashboard.stats.useQuery();
  const { data: logsData = [], isLoading: logsLoading } = trpc.dashboard.logs.useQuery({ limit: 12 });
  const { data: reviewEntries = [], isLoading: reviewLoading } = trpc.dashboard.reviewLogs.useQuery({
    limit: 5,
    action: 'rejected',
  });
  const { data: recentArticlesData, isLoading: articlesLoading } = trpc.articles.getLatest.useQuery({ count: 5 });

  const stats = {
    totalArticles: data?.articles.total ?? 0,
    publishedArticles: data?.articles.published ?? 0,
    approvedArticles: data?.articles.approved ?? 0,
    activeReporters: data?.reporters.active ?? 0,
    companies: data?.companies.total ?? 0,
    tokensUsed: data?.articles.totalTokens ?? 0,
  };

  const logEntries = logsData;
  const formatTimestamp = (value?: string | Date | null) => {
    if (!value) return '';
    const d = typeof value === 'string' ? new Date(value) : value;
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-(--text-primary)">Dashboard</h1>
          <p className="text-sm text-(--text-muted) mt-1">System overview and controls</p>
        </div>
        <Link
          href="/"
          className="px-4 py-2 text-sm rounded-lg border border-(--border-primary) text-(--text-secondary) hover:text-(--accent-cyan) hover:border-(--accent-cyan)/50 transition-colors"
        >
          View Feed
        </Link>
      </header>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard label="Total Articles" value={stats.totalArticles} color="var(--accent-cyan)" />
        <StatCard label="Published" value={stats.publishedArticles} color="#22c55e" />
        <StatCard label="Approved" value={stats.approvedArticles} color="var(--accent-purple)" />
        <StatCard label="Reporters" value={stats.activeReporters} color="var(--accent-purple)" />
        <StatCard label="Companies" value={stats.companies} color="#0ea5e9" />
        <StatCard label="Tokens" value={stats.tokensUsed.toLocaleString()} color="#f59e0b" />
      </div>

      {/* Agent Flow Visualization */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-(--text-primary) mb-4">Workflow Pipeline</h2>
        <div className="glass-card rounded-xl border border-(--border-primary) h-125 overflow-hidden">
          <AgentFlowViz />
        </div>
      </section>

      {/* Two-column layout: Logs + Rejections */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* Workflow Activity Logs - wider column */}
        <section className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-(--text-primary)">Activity Log</h2>
              <p className="text-xs text-(--text-muted)">Live workflow events</p>
            </div>
            <span className="text-xs font-mono text-(--text-muted) bg-(--bg-secondary) px-2 py-1 rounded">
              {logsLoading ? '...' : `${logEntries.length}`}
            </span>
          </div>
          <div className="glass-card rounded-xl border border-(--border-primary) overflow-hidden">
            {logsLoading ? (
              <div className="p-6">
                <p className="text-sm text-(--text-muted)">Loading events...</p>
              </div>
            ) : logEntries.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-(--text-muted)">No workflow activity yet</p>
                <p className="text-xs text-(--text-muted)/60 mt-1">Start the workflow to see events here</p>
              </div>
            ) : (
              <div className="divide-y divide-(--border-primary)/50">
                {logEntries.map((entry) => {
                  const eventColor = getEventColor(entry.event);
                  return (
                    <div key={entry.id} className="px-4 py-3 hover:bg-(--bg-secondary)/30 transition-colors">
                      {/* Top row: event badge + timestamp */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: eventColor }}
                          />
                          <span
                            className="text-[11px] font-semibold uppercase tracking-wider"
                            style={{ color: eventColor }}
                          >
                            {formatEventLabel(entry.event)}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-(--text-muted)/60">
                          {formatTimestamp(entry.createdAt)}
                        </span>
                      </div>
                      {/* Message */}
                      <p className="text-sm text-(--text-secondary) leading-snug">
                        {entry.message}
                      </p>
                      {/* Source info */}
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-(--text-muted)/70">
                        {entry.companyName && (
                          <span className="bg-(--bg-secondary) px-1.5 py-0.5 rounded">
                            {entry.companyName}
                          </span>
                        )}
                        {entry.reporterName && (
                          <span className="bg-(--bg-secondary) px-1.5 py-0.5 rounded">
                            {entry.reporterName}
                          </span>
                        )}
                        {entry.metadata &&
                          Object.entries(entry.metadata)
                            .slice(0, 3)
                            .map(([key, value]) => (
                              <span key={key} className="bg-(--bg-secondary) px-1.5 py-0.5 rounded">
                                {key}: {String(value)}
                              </span>
                            ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Review Rejections - narrower column */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-(--text-primary)">Rejections</h2>
              <p className="text-xs text-(--text-muted)">CEO review decisions</p>
            </div>
            <span className="text-xs font-mono text-(--text-muted) bg-(--bg-secondary) px-2 py-1 rounded">
              {reviewLoading ? '...' : `${reviewEntries.length}`}
            </span>
          </div>
          <div className="glass-card rounded-xl border border-(--border-primary) overflow-hidden">
            {reviewLoading ? (
              <div className="p-6">
                <p className="text-sm text-(--text-muted)">Loading...</p>
              </div>
            ) : reviewEntries.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-(--text-muted)">No rejections yet</p>
              </div>
            ) : (
              <div className="divide-y divide-(--border-primary)/50">
                {reviewEntries.map((entry) => (
                  <div key={entry.id} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono text-(--text-muted)/60">
                        {entry.createdAt ? new Date(entry.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                      {entry.score != null && (
                        <span className="text-[11px] font-mono text-red-400/80 bg-red-400/10 px-1.5 py-0.5 rounded">
                          Score: {entry.score}/10
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-(--text-secondary) leading-snug truncate">
                      {entry.articleTitle}
                    </p>
                    <p className="text-[11px] text-red-400/80 mt-1">
                      Rejected by {entry.reviewerName}
                    </p>
                    {entry.feedback && (
                      <p className="text-xs text-(--text-muted) mt-1.5 line-clamp-2 leading-relaxed">
                        {entry.feedback}
                      </p>
                    )}
                    {entry.companyName && (
                      <span className="inline-block text-[10px] text-(--text-muted)/60 bg-(--bg-secondary) px-1.5 py-0.5 rounded mt-1.5">
                        {entry.companyName}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Recent articles */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-(--text-primary)">Recent Articles</h2>
            <p className="text-xs text-(--text-muted)">Latest published articles</p>
          </div>
          <span className="text-xs font-mono text-(--text-muted) bg-(--bg-secondary) px-2 py-1 rounded">
            {articlesLoading ? '...' : `${recentArticlesData?.length ?? 0}`}
          </span>
        </div>
        <div className="glass-card rounded-xl border border-(--border-primary) overflow-hidden">
          {articlesLoading ? (
            <div className="p-6">
              <p className="text-sm text-(--text-muted)">Loading articles...</p>
            </div>
          ) : !recentArticlesData || recentArticlesData.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-(--text-muted)">No articles published yet</p>
              <p className="text-xs text-(--text-muted)/60 mt-1">Start the workflow to generate articles</p>
            </div>
          ) : (
            <div className="divide-y divide-(--border-primary)/50">
              {recentArticlesData.map((article) => (
                <Link
                  key={article.id}
                  href={`/article/${article.slug}`}
                  className="block px-4 py-3 hover:bg-(--bg-secondary)/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-(--accent-cyan)">
                      {article.status}
                    </span>
                    <span className="text-[11px] font-mono text-(--text-muted)/60">
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : article.createdAt
                          ? new Date(article.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : ''}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-(--text-secondary) leading-snug truncate">
                    {article.title}
                  </p>
                  {article.summary && (
                    <p className="text-xs text-(--text-muted) mt-1 line-clamp-1">
                      {article.summary}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick nav to settings */}
      <section>
        <h2 className="text-lg font-semibold text-(--text-primary) mb-4">Settings</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[
            { label: 'AI Providers', href: '/settings/providers', color: 'var(--accent-cyan)' },
            { label: 'Companies', href: '/settings/companies', color: 'var(--accent-purple)' },
            { label: 'Reporters', href: '/settings/reporters', color: '#22c55e' },
            { label: 'Categories', href: '/settings/categories', color: '#fb923c' },
            { label: 'Workflow', href: '/settings/workflow', color: '#f59e0b' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="glass-card p-4 rounded-xl border border-(--border-primary) hover:border-opacity-50 transition-all duration-200 group"
            >
              <span
                className="text-sm font-medium transition-colors"
                style={{ color: item.color }}
              >
                {item.label}
              </span>
              <span className="block text-xs text-(--text-muted) mt-1 font-mono">&rarr;</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
