export interface DefaultCategory {
  name: string;
  slug: string;
  color: string;
  icon: string;
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: 'Technology', slug: 'technology', color: '#3B82F6', icon: '💻' },
  { name: 'Politics', slug: 'politics', color: '#EF4444', icon: '🏛️' },
  { name: 'Science', slug: 'science', color: '#8B5CF6', icon: '🔬' },
  { name: 'Business', slug: 'business', color: '#10B981', icon: '💼' },
  { name: 'Health', slug: 'health', color: '#F59E0B', icon: '🏥' },
  { name: 'Entertainment', slug: 'entertainment', color: '#EC4899', icon: '🎬' },
  { name: 'Sports', slug: 'sports', color: '#F97316', icon: '⚽' },
  { name: 'World', slug: 'world', color: '#06B6D4', icon: '🌍' },
];
