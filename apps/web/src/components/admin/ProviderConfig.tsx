'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { trpc } from '@/lib/trpc/client';

const PROVIDER_TYPES = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'google', label: 'Google AI' },
  { value: 'groq', label: 'Groq' },
  { value: 'ollama', label: 'Ollama (Local)' },
  { value: 'openrouter', label: 'OpenRouter' },
] as const;

type ProviderType = (typeof PROVIDER_TYPES)[number]['value'];

export function ProviderConfig() {
  const utils = trpc.useUtils();
  const { data: providers = [], isLoading } = trpc.providers.list.useQuery();
  const createMutation = trpc.providers.create.useMutation({
    onSuccess: () => utils.providers.list.invalidate(),
  });
  const deleteMutation = trpc.providers.delete.useMutation({
    onSuccess: () => utils.providers.list.invalidate(),
  });
  const testMutation = trpc.providers.testConnection.useMutation();

  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<ProviderType>('openai');
  const [formApiKey, setFormApiKey] = useState('');
  const [formBaseUrl, setFormBaseUrl] = useState('');
  const [testedIds, setTestedIds] = useState<Set<string>>(new Set());

  const handleAdd = async () => {
    const label = PROVIDER_TYPES.find((t) => t.value === formType)?.label ?? formType;
    await createMutation.mutateAsync({
      name: label,
      type: formType,
      apiKeyEnc: formApiKey || undefined,
      baseUrl: formBaseUrl || undefined,
      isLocal: formType === 'ollama',
    });
    setShowForm(false);
    setFormApiKey('');
    setFormBaseUrl('');
  };

  const handleTest = async (id: string) => {
    const result = await testMutation.mutateAsync({ id });
    if (result.success) {
      setTestedIds((prev) => new Set(prev).add(id));
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id });
  };

  if (isLoading) {
    return (
      <GlassCard>
        <div className="text-center py-4">
          <p className="text-(--text-muted) text-sm">Loading providers...</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {providers.map((provider) => (
        <GlassCard key={provider.id}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  testedIds.has(provider.id) ? 'bg-green-400' : 'bg-yellow-400'
                }`}
              />
              <div>
                <h3 className="text-sm font-semibold text-(--text-primary)">
                  {provider.name}
                </h3>
                <p className="text-xs text-(--text-muted) font-mono">
                  {provider.type}
                  {provider.baseUrl ? ` - ${provider.baseUrl}` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTest(provider.id)}
                disabled={testMutation.isPending}
                className="px-3 py-1 text-xs rounded-lg border border-(--border-primary) text-(--text-secondary) hover:text-(--accent-cyan) hover:border-(--accent-cyan)/50 transition-colors disabled:opacity-50"
              >
                {testMutation.isPending ? 'Testing...' : 'Test'}
              </button>
              <button
                onClick={() => handleDelete(provider.id)}
                className="px-3 py-1 text-xs rounded-lg border border-red-400/30 text-red-400 hover:bg-red-400/10 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </GlassCard>
      ))}

      {providers.length === 0 && !showForm && (
        <GlassCard>
          <div className="text-center py-4">
            <p className="text-(--text-muted) text-sm mb-2">No providers configured</p>
            <p className="text-(--text-muted) text-xs">Add an AI provider to get started</p>
          </div>
        </GlassCard>
      )}

      {showForm ? (
        <GlassCard glow="cyan">
          <h3 className="text-sm font-semibold text-(--text-primary) mb-4">Add Provider</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-(--text-muted) mb-1 font-mono">Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as ProviderType)}
                className="w-full bg-(--bg-primary) border border-(--border-primary) rounded-lg px-3 py-2 text-sm text-(--text-primary) focus:outline-none focus:border-(--accent-cyan)/50"
              >
                {PROVIDER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-(--text-muted) mb-1 font-mono">API Key</label>
              <input
                type="password"
                value={formApiKey}
                onChange={(e) => setFormApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-(--bg-primary) border border-(--border-primary) rounded-lg px-3 py-2 text-sm text-(--text-primary) font-mono focus:outline-none focus:border-(--accent-cyan)/50"
              />
            </div>

            {(formType === 'ollama' || formType === 'openrouter') && (
              <div>
                <label className="block text-xs text-(--text-muted) mb-1 font-mono">Base URL</label>
                <input
                  type="text"
                  value={formBaseUrl}
                  onChange={(e) => setFormBaseUrl(e.target.value)}
                  placeholder={formType === 'ollama' ? 'http://localhost:11434' : 'https://openrouter.ai/api/v1'}
                  className="w-full bg-(--bg-primary) border border-(--border-primary) rounded-lg px-3 py-2 text-sm text-(--text-primary) font-mono focus:outline-none focus:border-(--accent-cyan)/50"
                />
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={createMutation.isPending}
                className="px-4 py-2 text-sm rounded-lg bg-(--accent-cyan)/20 text-(--accent-cyan) border border-(--accent-cyan)/40 hover:bg-(--accent-cyan)/30 transition-colors disabled:opacity-50"
              >
                {createMutation.isPending ? 'Adding...' : 'Add Provider'}
              </button>
              <button
                onClick={() => setShowForm(false)}
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
          + Add Provider
        </button>
      )}
    </div>
  );
}
