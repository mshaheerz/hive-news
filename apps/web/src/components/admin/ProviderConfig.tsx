'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';

interface Provider {
  id: string;
  name: string;
  type: 'openai' | 'anthropic' | 'google' | 'ollama' | 'openrouter';
  apiKey: string;
  baseUrl?: string;
  connected: boolean;
}

const PROVIDER_TYPES = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'google', label: 'Google AI' },
  { value: 'ollama', label: 'Ollama (Local)' },
  { value: 'openrouter', label: 'OpenRouter' },
] as const;

export function ProviderConfig() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<Provider['type']>('openai');
  const [formApiKey, setFormApiKey] = useState('');
  const [formBaseUrl, setFormBaseUrl] = useState('');
  const [testing, setTesting] = useState<string | null>(null);

  const handleAdd = async () => {
    const newProvider: Provider = {
      id: crypto.randomUUID(),
      name: PROVIDER_TYPES.find((t) => t.value === formType)?.label ?? formType,
      type: formType,
      apiKey: formApiKey,
      baseUrl: formBaseUrl || undefined,
      connected: false,
    };

    // TODO: Save to DB via API
    setProviders((prev) => [...prev, newProvider]);
    setShowForm(false);
    setFormApiKey('');
    setFormBaseUrl('');
  };

  const handleTest = async (id: string) => {
    setTesting(id);
    // TODO: Call API to test connection
    await new Promise((r) => setTimeout(r, 1500));
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, connected: true } : p))
    );
    setTesting(null);
  };

  const handleDelete = (id: string) => {
    // TODO: Delete from DB via API
    setProviders((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Provider list */}
      {providers.map((provider) => (
        <GlassCard key={provider.id}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  provider.connected ? 'bg-green-400' : 'bg-red-400'
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
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                  provider.connected
                    ? 'bg-green-400/10 text-green-400 border border-green-400/30'
                    : 'bg-red-400/10 text-red-400 border border-red-400/30'
                }`}
              >
                {provider.connected ? 'Connected' : 'Disconnected'}
              </span>
              <button
                onClick={() => handleTest(provider.id)}
                disabled={testing === provider.id}
                className="px-3 py-1 text-xs rounded-lg border border-(--border-primary) text-(--text-secondary) hover:text-(--accent-cyan) hover:border-(--accent-cyan)/50 transition-colors disabled:opacity-50"
              >
                {testing === provider.id ? 'Testing...' : 'Test'}
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

      {/* Add form */}
      {showForm ? (
        <GlassCard glow="cyan">
          <h3 className="text-sm font-semibold text-(--text-primary) mb-4">Add Provider</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-(--text-muted) mb-1 font-mono">Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as Provider['type'])}
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

            {formType === 'ollama' && (
              <div>
                <label className="block text-xs text-(--text-muted) mb-1 font-mono">Base URL</label>
                <input
                  type="text"
                  value={formBaseUrl}
                  onChange={(e) => setFormBaseUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="w-full bg-(--bg-primary) border border-(--border-primary) rounded-lg px-3 py-2 text-sm text-(--text-primary) font-mono focus:outline-none focus:border-(--accent-cyan)/50"
                />
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="px-4 py-2 text-sm rounded-lg bg-(--accent-cyan)/20 text-(--accent-cyan) border border-(--accent-cyan)/40 hover:bg-(--accent-cyan)/30 transition-colors"
              >
                Add Provider
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
