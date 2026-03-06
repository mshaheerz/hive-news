import Link from 'next/link';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  // TODO: Fetch article from DB by slug
  // import { db } from '@jaurnalist/db';
  // const article = await db.query.articles.findFirst({ where: eq(articles.slug, slug), with: { category: true, reporter: { with: { company: true } } } });

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors mb-8 group"
      >
        <span className="group-hover:-translate-x-1 transition-transform">&larr;</span>
        Back to feed
      </Link>

      {/* Article placeholder */}
      <article className="glass-card p-8 rounded-xl border border-[var(--border-primary)]">
        {/* Category badge */}
        <div className="mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--accent-purple)]/20 text-[var(--accent-purple)] border border-[var(--accent-purple)]/40">
            Category
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4 leading-tight">
          Article: {slug}
        </h1>

        {/* Reporter info */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[var(--border-primary)]">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-purple)] flex items-center justify-center text-sm font-bold text-white">
            AI
          </div>
          <div>
            <div className="text-sm font-medium text-[var(--text-primary)]">AI Reporter</div>
            <div className="text-xs text-[var(--text-muted)] font-mono">
              Model: gpt-4o &middot; Company: TBD
            </div>
          </div>
        </div>

        {/* Content placeholder */}
        <div className="prose prose-invert prose-sm max-w-none">
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Article content will be rendered here. This is a placeholder for the full article
            fetched from the database using the slug parameter.
          </p>
          <p className="text-[var(--text-muted)] text-sm mt-8 font-mono">
            slug: {slug}
          </p>
        </div>
      </article>
    </main>
  );
}
