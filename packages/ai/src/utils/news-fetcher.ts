/* eslint-disable @typescript-eslint/no-explicit-any */
import { XMLParser } from 'fast-xml-parser';

// These globals exist at runtime in Node 18+ but aren't in the ES2022 lib
declare const fetch: any;
declare const AbortController: any;
declare const setTimeout: any;
declare const clearTimeout: any;

export interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
}

const RSS_FEEDS: Record<string, { url: string; name: string }[]> = {
  technology: [
    { url: 'https://feeds.reuters.com/reuters/technologyNews', name: 'Reuters Tech' },
    { url: 'https://feeds.arstechnica.com/arstechnica/index', name: 'Ars Technica' },
    { url: 'https://techcrunch.com/feed/', name: 'TechCrunch' },
  ],
  politics: [
    { url: 'https://feeds.reuters.com/Reuters/PoliticsNews', name: 'Reuters Politics' },
    { url: 'https://feeds.bbci.co.uk/news/politics/rss.xml', name: 'BBC Politics' },
    { url: 'https://feeds.npr.org/1014/rss.xml', name: 'NPR Politics' },
  ],
  science: [
    { url: 'https://feeds.reuters.com/reuters/scienceNews', name: 'Reuters Science' },
    { url: 'https://www.sciencedaily.com/rss/all.xml', name: 'Science Daily' },
  ],
  business: [
    { url: 'https://feeds.reuters.com/reuters/businessNews', name: 'Reuters Business' },
    { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', name: 'BBC Business' },
  ],
  health: [
    { url: 'https://feeds.reuters.com/reuters/healthNews', name: 'Reuters Health' },
  ],
  sports: [
    { url: 'https://www.espn.com/espn/rss/news', name: 'ESPN' },
    { url: 'https://feeds.bbci.co.uk/sport/rss.xml', name: 'BBC Sport' },
  ],
  entertainment: [
    { url: 'https://feeds.reuters.com/reuters/entertainmentNews', name: 'Reuters Entertainment' },
  ],
  world: [
    { url: 'https://feeds.reuters.com/Reuters/worldNews', name: 'Reuters World' },
    { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', name: 'BBC World' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', name: 'Al Jazeera' },
  ],
};

const FETCH_TIMEOUT_MS = 5000;
const DEFAULT_ITEMS_PER_CATEGORY = 4;

const parser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: true,
});

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '').trim();
}

async function fetchFeed(
  feedUrl: string,
  feedName: string,
  category: string,
): Promise<NewsItem[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(feedUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Jaurnalist/1.0 (News Aggregator)' },
    });

    if (!response.ok) return [];

    const xml = await response.text();
    const parsed = parser.parse(xml);

    const channel = parsed?.rss?.channel ?? parsed?.feed;
    if (!channel) return [];

    const items = channel.item ?? channel.entry ?? [];
    const itemArray = Array.isArray(items) ? items : [items];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return itemArray.slice(0, 10).map((item: any) => ({
      title: stripHtml(String(item.title ?? '')),
      description: stripHtml(
        String(item.description ?? item.summary ?? item['media:description'] ?? ''),
      ).slice(0, 500),
      link: String(item.link?.['@_href'] ?? item.link ?? ''),
      pubDate: String(item.pubDate ?? item.published ?? item.updated ?? ''),
      source: feedName,
      category,
    }));
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

function deduplicateByTitle(items: NewsItem[]): NewsItem[] {
  const seen = new Map<string, NewsItem>();
  for (const item of items) {
    const normalized = item.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    if (!normalized) continue;

    // Simple dedup: skip if we already have a title with >70% word overlap
    let isDupe = false;
    for (const [existingKey] of seen) {
      const existingWords = new Set(existingKey.split(/\s+/));
      const newWords = normalized.split(/\s+/);
      const overlap = newWords.filter((w) => existingWords.has(w)).length;
      if (overlap / Math.max(existingWords.size, newWords.length) > 0.7) {
        isDupe = true;
        break;
      }
    }

    if (!isDupe) {
      seen.set(normalized, item);
    }
  }
  return Array.from(seen.values());
}

export async function fetchNewsForCategories(
  categories: string[],
  itemsPerCategory: number = DEFAULT_ITEMS_PER_CATEGORY,
): Promise<NewsItem[]> {
  const allItems: NewsItem[] = [];

  const feedPromises: Promise<NewsItem[]>[] = [];
  for (const category of categories) {
    const normalizedCat = category.toLowerCase();
    const feeds = RSS_FEEDS[normalizedCat];
    if (!feeds) continue;

    for (const feed of feeds) {
      feedPromises.push(fetchFeed(feed.url, feed.name, normalizedCat));
    }
  }

  const results = await Promise.allSettled(feedPromises);

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allItems.push(...result.value);
    }
  }

  // Deduplicate
  const unique = deduplicateByTitle(allItems);

  // Limit per category
  const perCategory = new Map<string, NewsItem[]>();
  for (const item of unique) {
    const existing = perCategory.get(item.category) ?? [];
    if (existing.length < itemsPerCategory) {
      existing.push(item);
      perCategory.set(item.category, existing);
    }
  }

  return Array.from(perCategory.values()).flat();
}

export function formatNewsContext(items: NewsItem[]): string {
  if (items.length === 0) return '';

  const grouped = new Map<string, NewsItem[]>();
  for (const item of items) {
    const list = grouped.get(item.category) ?? [];
    list.push(item);
    grouped.set(item.category, list);
  }

  const sections: string[] = [];
  for (const [category, categoryItems] of grouped) {
    const lines = categoryItems.map(
      (item) =>
        `- "${item.title}" (${item.source})\n  ${item.description}\n  Source: ${item.link}`,
    );
    sections.push(`[${category.toUpperCase()}]\n${lines.join('\n')}`);
  }

  return sections.join('\n\n');
}
