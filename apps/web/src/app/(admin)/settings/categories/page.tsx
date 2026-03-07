'use client';

import Link from 'next/link';
import { CategoryManager } from '@/components/admin/CategoryManager';

export default function CategoriesPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <Link
          href="/dashboard"
          className="text-xs text-(--text-muted) hover:text-(--accent-cyan) transition-colors font-mono mb-2 inline-block"
        >
          &larr; Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-(--text-primary)">Categories</h1>
        <p className="text-sm text-(--text-muted) mt-1">Manage the topic categories reporters can cover</p>
      </header>
      <CategoryManager />
    </main>
  );
}
