'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import Link from 'next/link';

interface Reporter {
  id: string;
  journalistName: string;
  modelId: string;
  role: string;
  companyName: string;
}

export default function ReportersPage() {
  const [reporters, setReporters] = useState<Reporter[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formRole, setFormRole] = useState('reporter');
  const [formCompany, setFormCompany] = useState('');

  const handleAdd = () => {
    const newReporter: Reporter = {
      id: crypto.randomUUID(),
      journalistName: formName,
      modelId: formModel,
      role: formRole,
      companyName: formCompany,
    };
    // TODO: Save via API
    setReporters((prev) => [...prev, newReporter]);
    setFormName('');
    setFormModel('');
    setFormRole('reporter');
    setFormCompany('');
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    // TODO: Delete via API
    setReporters((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <Link
          href="/dashboard"
          className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors font-mono mb-2 inline-block"
        >
          &larr; Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Reporters</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Manage AI reporters and their model assignments
        </p>
      </header>

      <div className="space-y-6">
        {/* Reporter list */}
        {reporters.map((reporter) => (
          <GlassCard key={reporter.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-purple)] flex items-center justify-center text-sm font-bold text-white">
                  {reporter.journalistName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    {reporter.journalistName}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] font-mono">
                    {reporter.modelId} &middot; {reporter.role} &middot; {reporter.companyName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(reporter.id)}
                className="px-3 py-1 text-xs rounded-lg border border-red-400/30 text-red-400 hover:bg-red-400/10 transition-colors"
              >
                Delete
              </button>
            </div>
          </GlassCard>
        ))}

        {reporters.length === 0 && !showForm && (
          <GlassCard>
            <div className="text-center py-4">
              <p className="text-[var(--text-muted)] text-sm mb-2">No reporters configured</p>
              <p className="text-[var(--text-muted)] text-xs">Add AI reporters to start generating articles</p>
            </div>
          </GlassCard>
        )}

        {/* Add form */}
        {showForm ? (
          <GlassCard glow="cyan">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Add Reporter</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1 font-mono">Journalist Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Ada Lovelace"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-cyan)]/50"
                />
              </div>

              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1 font-mono">Model ID</label>
                <input
                  type="text"
                  value={formModel}
                  onChange={(e) => setFormModel(e.target.value)}
                  placeholder="e.g. gpt-4o, claude-3-opus"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent-cyan)]/50"
                />
              </div>

              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1 font-mono">Role</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-cyan)]/50"
                >
                  <option value="ceo">CEO</option>
                  <option value="editor">Editor</option>
                  <option value="reporter">Reporter</option>
                  <option value="fact-checker">Fact Checker</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1 font-mono">Company</label>
                <input
                  type="text"
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  placeholder="Company name"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-cyan)]/50"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 text-sm rounded-lg bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/40 hover:bg-[var(--accent-cyan)]/30 transition-colors"
                >
                  Add Reporter
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-[var(--border-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </GlassCard>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 rounded-xl border border-dashed border-[var(--border-primary)] text-sm text-[var(--text-muted)] hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)]/40 transition-colors"
          >
            + Add Reporter
          </button>
        )}
      </div>
    </main>
  );
}
