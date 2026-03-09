import { ArticleFeed } from '@/components/feed/ArticleFeed';
import { CategoryNav } from '@/components/feed/CategoryNav';
import { FeedHeader } from '@/components/feed/FeedHeader';
import { DEFAULT_CATEGORIES } from '@jaurnalist/shared';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  const activeCategory = DEFAULT_CATEGORIES.find(
    (c: { slug: string }) => c.slug === category
  );
  const categoryName = activeCategory?.name ?? category;

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <FeedHeader categoryName={categoryName} categoryColor={activeCategory?.color} />
      <CategoryNav categories={DEFAULT_CATEGORIES} activeSlug={category} />
      <div className="mt-6">
        <ArticleFeed categorySlug={category} />
      </div>
    </main>
  );
}
