export const DEFAULT_WORKFLOW_MODE = 'scheduled' as const;
export const DEFAULT_SCHEDULE_INTERVAL = 1800; // 30 minutes in seconds
export const DEFAULT_CONTINUOUS_INTERVAL = 90; // seconds
export const DEFAULT_ARTICLE_LENGTH = 'medium' as const;
export const DEFAULT_MAX_RETRIES = 1;

export const ARTICLE_LENGTHS: Record<string, number> = {
  short: 300,
  medium: 600,
  long: 1200,
};

export const TOKEN_PREFIX = 'jrn_';
