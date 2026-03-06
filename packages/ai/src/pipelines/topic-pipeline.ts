import type { CEOAgent, TopicAssignment } from '../agents/ceo-agent';

/**
 * Discover topics using the CEO agent.
 * Ensures topics are diverse and don't overlap with recently published articles.
 */
export async function discoverTopics(
  ceoAgent: CEOAgent,
  categories: string[],
  recentTitles: string[],
  count: number,
): Promise<TopicAssignment[]> {
  return ceoAgent.selectTopics({
    categories,
    recentTitles,
    count,
  });
}

/**
 * Discover topics for specific categories only.
 */
export async function discoverTopicsForCategories(
  ceoAgent: CEOAgent,
  targetCategories: string[],
  recentTitles: string[],
  countPerCategory: number = 1,
): Promise<TopicAssignment[]> {
  const totalCount = targetCategories.length * countPerCategory;

  const topics = await ceoAgent.selectTopics({
    categories: targetCategories,
    recentTitles,
    count: totalCount,
  });

  return topics;
}
