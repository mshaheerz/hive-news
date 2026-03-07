'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { trpc } from '@/lib/trpc/client';

export function CompanyManager() {
  const utils = trpc.useUtils();
  const { data: companies = [], isLoading } = trpc.companies.list.useQuery();
  const createMutation = trpc.companies.create.useMutation({
    onSuccess: () => utils.companies.list.invalidate(),
  });
  const updateMutation = trpc.companies.update.useMutation({
    onSuccess: () => utils.companies.list.invalidate(),
  });
  const deleteMutation = trpc.companies.delete.useMutation({
    onSuccess: () => utils.companies.list.invalidate(),
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    const slug = formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (editingId) {
      await updateMutation.mutateAsync({
        id: editingId,
        name: formName,
        description: formDescription || undefined,
      });
    } else {
      await createMutation.mutateAsync({
        name: formName,
        slug,
        description: formDescription || undefined,
      });
    }
    resetForm();
  };

  const handleEdit = (company: { id: string; name: string; description: string | null }) => {
    setFormName(company.name);
    setFormDescription(company.description ?? '');
    setEditingId(company.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id });
  };

  if (isLoading) {
    return (
      <GlassCard>
        <div className="text-center py-4">
          <p className="text-(--text-muted) text-sm">Loading companies...</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {companies.map((company) => (
        <GlassCard key={company.id}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-(--text-primary)">{company.name}</h3>
              <p className="text-xs text-(--text-muted) mt-1">{company.description}</p>
              <p className="text-xs text-(--text-secondary) mt-2 font-mono">
                {company.slug} &middot; {company.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleEdit(company)}
                className="px-3 py-1 text-xs rounded-lg border border-(--border-primary) text-(--text-secondary) hover:text-(--accent-cyan) hover:border-(--accent-cyan)/50 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(company.id)}
                className="px-3 py-1 text-xs rounded-lg border border-red-400/30 text-red-400 hover:bg-red-400/10 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </GlassCard>
      ))}

      {companies.length === 0 && !showForm && (
        <GlassCard>
          <div className="text-center py-4">
            <p className="text-(--text-muted) text-sm mb-2">No companies configured</p>
            <p className="text-(--text-muted) text-xs">Add a company to organize your AI reporters</p>
          </div>
        </GlassCard>
      )}

      {showForm ? (
        <GlassCard glow="purple">
          <h3 className="text-sm font-semibold text-(--text-primary) mb-4">
            {editingId ? 'Edit Company' : 'Add Company'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-(--text-muted) mb-1 font-mono">Name</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Company name"
                className="w-full bg-(--bg-primary) border border-(--border-primary) rounded-lg px-3 py-2 text-sm text-(--text-primary) focus:outline-none focus:border-(--accent-purple)/50"
              />
            </div>

            <div>
              <label className="block text-xs text-(--text-muted) mb-1 font-mono">Description</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Brief description..."
                rows={3}
                className="w-full bg-(--bg-primary) border border-(--border-primary) rounded-lg px-3 py-2 text-sm text-(--text-primary) focus:outline-none focus:border-(--accent-purple)/50 resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 text-sm rounded-lg bg-(--accent-purple)/20 text-(--accent-purple) border border-(--accent-purple)/40 hover:bg-(--accent-purple)/30 transition-colors disabled:opacity-50"
              >
                {editingId ? 'Update' : 'Add Company'}
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
          className="w-full py-3 rounded-xl border border-dashed border-(--border-primary) text-sm text-(--text-muted) hover:text-(--accent-purple) hover:border-(--accent-purple)/40 transition-colors"
        >
          + Add Company
        </button>
      )}
    </div>
  );
}
