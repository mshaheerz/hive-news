import { WorkflowToggle } from '@/components/admin/WorkflowToggle';
import Link from 'next/link';

export default function WorkflowPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <Link
          href="/dashboard"
          className="text-xs text-(--text-muted) hover:text-(--accent-cyan) transition-colors font-mono mb-2 inline-block"
        >
          &larr; Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-(--text-primary)">Workflow Settings</h1>
        <p className="text-sm text-(--text-muted) mt-1">
          Configure how and when articles are generated
        </p>
      </header>
      <WorkflowToggle />
    </main>
  );
}
