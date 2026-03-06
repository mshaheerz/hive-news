import dynamic from 'next/dynamic';
import Link from 'next/link';

const AgentFlowViz = dynamic(() => import('@/components/admin/AgentFlowViz').then((m) => m.AgentFlowViz), {
  ssr: false,
  loading: () => (
    <div className="glass-card p-8 rounded-xl border border-[var(--border-primary)] animate-pulse h-64 flex items-center justify-center">
      <span className="text-sm text-[var(--text-muted)] font-mono">Loading visualization...</span>
    </div>
  ),
});

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="glass-card p-5 rounded-xl border border-[var(--border-primary)]">
      <p className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  // TODO: Fetch real stats from DB
  const stats = {
    totalArticles: 0,
    activeReporters: 0,
    companies: 0,
    tokensUsed: 0,
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">System overview and controls</p>
        </div>
        <Link
          href="/"
          className="px-4 py-2 text-sm rounded-lg border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)]/50 transition-colors"
        >
          View Feed
        </Link>
      </header>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Articles" value={stats.totalArticles} color="var(--accent-cyan)" />
        <StatCard label="Active Reporters" value={stats.activeReporters} color="var(--accent-purple)" />
        <StatCard label="Companies" value={stats.companies} color="#22c55e" />
        <StatCard label="Tokens Used" value={stats.tokensUsed.toLocaleString()} color="#f59e0b" />
      </div>

      {/* Agent status */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Agent Status</h2>
        <div className="glass-card p-6 rounded-xl border border-[var(--border-primary)]">
          <div className="space-y-3">
            {['Editor-in-Chief', 'Research Agent', 'Writer Agent', 'Fact-Check Agent', 'Publisher Agent'].map(
              (agent) => (
                <div key={agent} className="flex items-center justify-between py-2 border-b border-[var(--border-primary)] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
                    <span className="text-sm text-[var(--text-secondary)]">{agent}</span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] font-mono">Idle</span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Agent Flow Visualization */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Workflow Pipeline</h2>
        <AgentFlowViz />
      </section>

      {/* Recent articles */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Recent Articles</h2>
        <div className="glass-card p-6 rounded-xl border border-[var(--border-primary)]">
          <div className="text-center py-8">
            <p className="text-sm text-[var(--text-muted)]">No articles published yet</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Start the workflow to generate articles</p>
          </div>
        </div>
      </section>

      {/* Quick nav to settings */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Settings</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'AI Providers', href: '/settings/providers', color: 'var(--accent-cyan)' },
            { label: 'Companies', href: '/settings/companies', color: 'var(--accent-purple)' },
            { label: 'Reporters', href: '/settings/reporters', color: '#22c55e' },
            { label: 'Workflow', href: '/settings/workflow', color: '#f59e0b' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="glass-card p-4 rounded-xl border border-[var(--border-primary)] hover:border-opacity-50 transition-all duration-200 group"
              style={{ '--hover-color': item.color } as React.CSSProperties}
            >
              <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                {item.label}
              </span>
              <span className="block text-xs text-[var(--text-muted)] mt-1 font-mono">&rarr; Configure</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
