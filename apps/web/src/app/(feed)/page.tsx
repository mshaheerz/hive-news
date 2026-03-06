import { ArticleFeed } from '@/components/feed/ArticleFeed';
import { CategoryNav } from '@/components/feed/CategoryNav';
import { DEFAULT_CATEGORIES } from '@jaurnalist/shared';
import Link from 'next/link';

export default function FeedPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-purple)] bg-clip-text text-transparent">
            Jaurnalist
          </Link>
          <p className="text-sm text-[var(--text-secondary)] mt-1">AI-Powered News</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse-glow" />
          <span className="text-xs text-green-400 font-mono">LIVE</span>
        </div>
      </header>
      <CategoryNav categories={DEFAULT_CATEGORIES} />
      <div className="mt-6">
        <ArticleFeed />
      </div>
    </main>
  );
}
