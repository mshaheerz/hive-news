'use client';

import { useMemo, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { trpc } from '@/lib/trpc/client';
import Link from 'next/link';

export default function ReportersPage() {
  const utils = trpc.useUtils();
  const { data: reporters = [], isLoading } = trpc.reporters.list.useQuery({});
  const { data: companies = [] } = trpc.companies.list.useQuery();
  const { data: providers = [] } = trpc.providers.list.useQuery();
  const { data: categories = [] } = trpc.categories.list.useQuery();
  const createMutation = trpc.reporters.create.useMutation({
    onSuccess: () => utils.reporters.list.invalidate(),
  });
  const updateMutation = trpc.reporters.update.useMutation({
    onSuccess: () => utils.reporters.list.invalidate(),
  });
  const deleteMutation = trpc.reporters.delete.useMutation({
    onSuccess: () => utils.reporters.list.invalidate(),
  });

  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formRole, setFormRole] = useState<'ceo' | 'reporter'>('reporter');
  const [formCompanyId, setFormCompanyId] = useState('');
  const [formProviderId, setFormProviderId] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setFormName('');
    setFormModel('');
    setFormRole('reporter');
    setFormCompanyId('');
    setFormProviderId('');
    setSelectedCategories([]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!formCompanyId || !formProviderId) return;
    const payload = {
      journalistName: formName,
      companyId: formCompanyId,
      providerId: formProviderId,
      modelId: formModel,
      role: formRole,
      categories: selectedCategories,
    };
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    resetForm();
  };

  const handleEdit = (reporter: (typeof reporters)[number]) => {
    setFormName(reporter.journalistName);
    setFormModel(reporter.modelId);
    setFormRole(reporter.role);
    setFormCompanyId(reporter.companyId);
    setFormProviderId(reporter.providerId);
    setSelectedCategories(reporter.categories ?? []);
    setEditingId(reporter.id);
    setShowForm(true);
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    );
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id });
  };

  const getCompanyName = (companyId: string) =>
    companies.find((c) => c.id === companyId)?.name ?? 'Unknown';

  const categoryMap = useMemo(
    () =>
      categories.reduce<Record<string, { name: string; color: string | null }>>((acc, category) => {
        acc[category.id] = { name: category.name, color: category.color };
        return acc;
      }, {}),
    [categories],
  );

  const isCategorySelected = (id: string) => selectedCategories.includes(id);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <Link
          href="/dashboard"
          className="text-xs text-(--text-muted) hover:text-(--accent-cyan) transition-colors font-mono mb-2 inline-block"
        >
          &larr; Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-(--text-primary)">Reporters</h1>
        <p className="text-sm text-(--text-muted) mt-1">Manage AI reporters and their model assignments</p>
      </header>

      <div className="space-y-6">
        {isLoading && (
          <GlassCard>
            <div className="text-center py-4">
              <p className="text-(--text-muted) text-sm">Loading reporters...</p>
            </div>
          </GlassCard>
        )}

        {reporters.map((reporter) => (
          <GlassCard key={reporter.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-(--accent-cyan) to-(--accent-purple) flex items-center justify-center text-sm font-bold text-white">
                  {reporter.journalistName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-(--text-primary)">{reporter.journalistName}</h3>
                  <p className="text-xs text-(--text-muted) font-mono">
                    {reporter.modelId} &middot; {reporter.role} &middot; {getCompanyName(reporter.companyId)}
                  </p>
                  {reporter.categories && reporter.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 text-[11px]">
                      {reporter.categories.map((categoryId) => (
                        <span
                          key={categoryId}
                          className="px-2 py-1 rounded-full border text-(--text-secondary)"
                          style={{ borderColor: categoryMap[categoryId]?.color ?? '#ccc' }}
                        >
                          {categoryMap[categoryId]?.name ?? categoryId}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(reporter)}
                  className="px-3 py-1 text-xs rounded-lg border border-(--border-primary) text-(--text-secondary) hover:text-(--accent-cyan) hover:border-(--accent-cyan)/50 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(reporter.id)}
                  className="px-3 py-1 text-xs rounded-lg border border-red-400/30 text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </GlassCard>
        ))}

        {!isLoading && reporters.length === 0 && !showForm && (
          <GlassCard>
            <div className="text-center py-4">
              <p className="text-(--text-muted) text-sm mb-2">No reporters configured</p>
              <p className="text-(--text-muted) text-xs">Add AI reporters to start generating articles</p>
            </div>
          </GlassCard>
        )}

        {showForm ? (
          <GlassCard glow="cyan">
            <h3 className="text-sm font-semibold text-(--text-primary) mb-4">
              {editingId ? 'Edit Reporter' : 'Add Reporter'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-(--text-muted) mb-1 font-mono">Journalist Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Ada Lovelace"
                  className="w-full bg-(--bg-primary) border border-(--border-primary) rounded-lg px-3 py-2 text-sm text-(--text-primary) focus:outline-none focus:border-(--accent-cyan)/50"
                />
              </div>

              <div>
                <label className="block text-xs text-(--text-muted) mb-1 font-mono">Company</label>
                <select
                  value={formCompanyId}
                  onChange={(e) => setFormCompanyId(e.target.value)}
                  className="w-full bg-(--bg-primary) border border-(--border-primary) rounded-lg px-3 py-2 text-sm text-(--text-primary) focus:outline-none focus:border-(--accent-cyan)/50"
                >
                  <option value="">Select company...</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-(--text-muted) mb-1 font-mono">Provider</label>
                <select
                  value={formProviderId}
                  onChange={(e) => setFormProviderId(e.target.value)}
                  className="w-full bg-(--bg-primary) border border-(--border-primary) rounded-lg px-3 py-2 text-sm text-(--text-primary) focus:outline-none focus:border-(--accent-cyan)/50"
                >
                  <option value="">Select provider...</option>
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-(--text-muted) mb-1 font-mono">Model ID</label>
                <input
                  type="text"
                  value={formModel}
                  onChange={(e) => setFormModel(e.target.value)}
                  placeholder="e.g. gpt-4o, llama-3.3-70b-versatile"
                  className="w-full bg-(--bg-primary) border border-(--border-primary) rounded-lg px-3 py-2 text-sm text-(--text-primary) font-mono focus:outline-none focus:border-(--accent-cyan)/50"
                />
              </div>

              <div>
                <label className="block text-xs text-(--text-muted) mb-1 font-mono">Role</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as 'ceo' | 'reporter')}
                  className="w-full bg-(--bg-primary) border border-(--border-primary) rounded-lg px-3 py-2 text-sm text-(--text-primary) focus:outline-none focus:border-(--accent-cyan)/50"
                >
                  <option value="ceo">CEO</option>
                  <option value="reporter">Reporter</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-(--text-muted) mb-1 font-mono">Categories</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      type="button"
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        isCategorySelected(category.id)
                          ? 'bg-(--accent-cyan) text-white border-(--accent-cyan)'
                          : 'border-(--border-primary) text-(--text-primary)'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={
                    createMutation.isPending ||
                    updateMutation.isPending ||
                    !formCompanyId ||
                    !formProviderId
                  }
                  className="px-4 py-2 text-sm rounded-lg bg-(--accent-cyan)/20 text-(--accent-cyan) border border-(--accent-cyan)/40 hover:bg-(--accent-cyan)/30 transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingId
                    ? 'Update Reporter'
                    : 'Add Reporter'}
                </button>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 text-sm rounded-lg border border-(--border-primary) text-(--text-muted) hover:text-(--text-primary) transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </GlassCard>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 rounded-xl border border-dashed border-(--border-primary) text-sm text-(--text-muted) hover:text-(--accent-cyan) hover:border-(--accent-cyan)/40 transition-colors"
          >
            + Add Reporter
          </button>
        )}
      </div>
    </main>
  );
}
