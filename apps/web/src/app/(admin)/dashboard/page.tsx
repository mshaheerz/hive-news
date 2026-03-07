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

export default function DashboardPage() {
  const { data } = trpc.dashboard.stats.useQuery();
  const { data: logsData = [], isLoading: logsLoading } = trpc.dashboard.logs.useQuery({ limit: 8 });
  const { data: reviewEntries = [], isLoading: reviewLoading } = trpc.dashboard.reviewLogs.useQuery({
    limit: 5,
    action: 'rejected',
  });

  const stats = {
    totalArticles: data?.articles.total ?? 0,
    publishedArticles: data?.articles.published ?? 0,
    approvedArticles: data?.articles.approved ?? 0,
    activeReporters: data?.reporters.active ?? 0,
    companies: data?.companies.total ?? 0,
    tokensUsed: data?.articles.totalTokens ?? 0,
  };

  const logEntries = logsData;
  const formatTimestamp = (value?: string) =>
    value ? new Date(value).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '';

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard label="Total Articles" value={stats.totalArticles} color="var(--accent-cyan)" />
        <StatCard label="Published" value={stats.publishedArticles} color="#22c55e" />
        <StatCard label="Approved" value={stats.approvedArticles} color="var(--accent-purple)" />
        <StatCard label="Active Reporters" value={stats.activeReporters} color="var(--accent-purple)" />
        <StatCard label="Companies" value={stats.companies} color="#0ea5e9" />
        <StatCard label="Tokens Used" value={stats.tokensUsed.toLocaleString()} color="#f59e0b" />
      </div>

      {/* Agent status */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-(--text-primary) mb-4">Agent Status</h2>
        <div className="glass-card p-6 rounded-xl border border-(--border-primary)">
          <div className="space-y-3">
            {['Editor-in-Chief', 'Research Agent', 'Writer Agent', 'Fact-Check Agent', 'Publisher Agent'].map(
              (agent) => (
                <div key={agent} className="flex items-center justify-between py-2 border-b border-(--border-primary) last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-(--text-muted)" />
                    <span className="text-sm text-(--text-secondary)">{agent}</span>
                  </div>
                  <span className="text-xs text-(--text-muted) font-mono">Idle</span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Agent Flow Visualization */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-(--text-primary) mb-4">Workflow Pipeline</h2>
        <div className="glass-card rounded-xl border border-(--border-primary) h-125 overflow-hidden">
          <AgentFlowViz />
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-(--text-primary)">Workflow Activity</h2>
            <p className="text-xs text-(--text-muted)">Live logs from the worker</p>
          </div>
          <span className="text-xs text-(--text-muted)">
            {logsLoading ? 'Loading…' : `${logEntries.length} entries`}
          </span>
        </div>
          <div className="glass-card p-4 rounded-xl border border-(--border-primary)">
            {logsLoading ? (
              <p className="text-sm text-(--text-muted)">Loading events…</p>
            ) : logEntries.length === 0 ? (
              <p className="text-sm text-(--text-muted)">No workflow activity recorded yet</p>
            ) : (
            <div className="space-y-3">
              {logEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-(--border-primary) bg-(--bg-secondary)/40 px-4 py-3"
                >
                  <div className="flex items-center justify-between text-xs text-(--text-muted)">
                    <span>
                      {entry.companyName}
                      {entry.reporterName ? ` · ${entry.reporterName}` : ''}
                    </span>
                    <span>{formatTimestamp(entry.createdAt)}</span>
                  </div>
                  <p className="text-sm font-medium text-(--text-secondary) mt-1">{entry.message}</p>
                  <div className="flex flex-wrap gap-2 mt-2 text-[11px] text-(--text-muted)">
                    <span className="rounded-full bg-(--border-primary)/40 px-2 py-1">{entry.event}</span>
                    {entry.metadata &&
                      Object.entries(entry.metadata).map(([key, value]) => (
                        <span key={key}>{`${key}: ${String(value)}`}</span>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-(--text-primary)">Review Rejections</h2>
            <p className="text-xs text-(--text-muted)">Latest CEO rejection decisions</p>
          </div>
          <span className="text-xs text-(--text-muted)">
            {reviewLoading ? 'Loading…' : `${reviewEntries.length} entries`}
          </span>
        </div>
        <div className="glass-card p-4 rounded-xl border border-(--border-primary)">
          {reviewLoading ? (
            <p className="text-sm text-(--text-muted)">Loading review logs…</p>
          ) : reviewEntries.length === 0 ? (
            <p className="text-sm text-(--text-muted)">No review rejections yet</p>
          ) : (
            <div className="space-y-3">
              {reviewEntries.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-(--border-primary) bg-(--bg-secondary)/40 px-4 py-3">
                  <div className="flex items-center justify-between text-xs text-(--text-muted)">
                    <span>
                      {entry.articleTitle} · {entry.companyName}
                    </span>
                    <span>{new Date(entry.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-sm font-semibold text-red-400 mt-1">Rejected by {entry.reviewerName}</p>
                  <p className="text-sm text-(--text-muted) mt-2">
                    {entry.feedback ?? 'No feedback provided'}
                  </p>
                  {entry.score != null && (
                    <p className="text-[11px] text-(--text-muted) mt-2">Score: {entry.score}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent articles */}
      <section>
        <h2 className="text-lg font-semibold text-(--text-primary) mb-4">Recent Articles</h2>
        <div className="glass-card p-6 rounded-xl border border-(--border-primary)">
          <div className="text-center py-8">
            <p className="text-sm text-(--text-muted)">No articles published yet</p>
            <p className="text-xs text-(--text-muted) mt-1">Start the workflow to generate articles</p>
          </div>
        </div>
      </section>

      {/* Quick nav to settings */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-(--text-primary) mb-4">Settings</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              style={{ '--hover-color': item.color } as React.CSSProperties}
            >
              <span className="text-sm font-medium text-(--text-secondary) group-hover:text-(--text-primary) transition-colors">
                {item.label}
              </span>
              <span className="block text-xs text-(--text-muted) mt-1 font-mono">&rarr; Configure</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
