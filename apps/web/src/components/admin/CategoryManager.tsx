'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { trpc } from '@/lib/trpc/client';

export function CategoryManager() {
  const utils = trpc.useContext();
  const { data: categories = [], isLoading } = trpc.categories.list.useQuery();
  const createMutation = trpc.categories.create.useMutation({
    onSuccess: () => utils.categories.list.invalidate(),
  });
  const updateMutation = trpc.categories.update.useMutation({
    onSuccess: () => utils.categories.list.invalidate(),
  });
  const deleteMutation = trpc.categories.delete.useMutation({
    onSuccess: () => utils.categories.list.invalidate(),
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [color, setColor] = useState('#22c55e');
  const [icon, setIcon] = useState('');

  const resetForm = () => {
    setName('');
    setSlug('');
    setColor('#22c55e');
    setIcon('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    const normalizedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const payload = { name, slug: normalizedSlug, color, icon: icon || null };
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    resetForm();
  };

  const startEdit = (category: { id: string; name: string; slug: string; color: string | null; icon: string | null }) => {
    setName(category.name);
    setSlug(category.slug);
    setColor(category.color ?? '#22c55e');
    setIcon(category.icon ?? '');
    setEditingId(category.id);
    setShowForm(true);
  };

  if (isLoading) {
    return (
      <GlassCard>
        <div className="text-center py-4">
          <p className="text-(--text-muted) text-sm">Loading categories...</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <GlassCard key={category.id}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl" aria-hidden>
                  {category.icon ?? '🏷️'}
                </span>
                <h3 className="text-sm font-semibold text-(--text-primary)">{category.name}</h3>
              </div>
              <p className="text-xs font-mono text-(--text-secondary)">{category.slug}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color ?? '#ccc' }} />
              <button
                onClick={() => startEdit(category)}
                className="px-3 py-1 text-xs rounded-lg border border-(--border-primary) text-(--text-secondary) hover:text-(--accent-cyan) hover:border-(--accent-cyan)/50 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => deleteMutation.mutate({ id: category.id })}
                className="px-3 py-1 text-xs rounded-lg border border-red-400/30 text-red-400 hover:bg-red-400/10 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </GlassCard>
      ))}

      {showForm ? (
        <GlassCard glow="purple">
          <h3 className="text-sm font-semibold text-(--text-primary) mb-4">
            {editingId ? 'Edit Category' : 'Add Category'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-(--text-muted) mb-1 font-mono">Name</label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full bg-(--bg-primary) border border-(--border-primary) rounded-lg px-3 py-2 text-sm text-(--text-primary) focus:outline-none focus:border-(--accent-purple)/50"
              />
            </div>
            <div>
              <label className="block text-xs text-(--text-muted) mb-1 font-mono">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="e.g. technology"
                className="w-full bg-(--bg-primary) border border-(--border-primary) rounded-lg px-3 py-2 text-sm text-(--text-primary) focus:outline-none focus:border-(--accent-purple)/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-(--text-muted) mb-1 font-mono">Color</label>
                <input
                  type="color"
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                  className="w-full h-10 rounded-lg border border-(--border-primary)"
                />
              </div>
              <div>
                <label className="block text-xs text-(--text-muted) mb-1 font-mono">Icon</label>
                <input
                  type="text"
                  value={icon}
                  onChange={(event) => setIcon(event.target.value)}
                  placeholder="e.g. ⚽"
                  className="w-full bg-(--bg-primary) border border-(--border-primary) rounded-lg px-3 py-2 text-sm text-(--text-primary) focus:outline-none focus:border-(--accent-purple)/50"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 text-sm rounded-lg bg-(--accent-purple)/20 text-(--accent-purple) border border-(--accent-purple)/40 hover:bg-(--accent-purple)/30 transition-colors disabled:opacity-50"
              >
                {editingId ? 'Update Category' : 'Add Category'}
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
          + Add Category
        </button>
      )}
    </div>
  );
}
