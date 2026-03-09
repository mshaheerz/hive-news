import { ArticleFeed } from '@/components/feed/ArticleFeed';
import { CategoryNav } from '@/components/feed/CategoryNav';
import { FeedHeader } from '@/components/feed/FeedHeader';
import { DEFAULT_CATEGORIES } from '@jaurnalist/shared';

export default function FeedPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <FeedHeader />
      <CategoryNav categories={DEFAULT_CATEGORIES} />
      <div className="mt-6">
        <ArticleFeed />
      </div>
    </main>
  );
}
