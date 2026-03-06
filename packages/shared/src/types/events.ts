export interface ArticlePublishedEvent {
  event: 'article:published';
  data: {
    articleId: string;
    title: string;
    slug: string;
    reporterId: string;
    categoryId: string;
  };
}

export interface ArticleInReviewEvent {
  event: 'article:in_review';
  data: {
    articleId: string;
    title: string;
    reporterId: string;
  };
}

export interface AgentGeneratingEvent {
  event: 'agent:generating';
  data: {
    reporterId: string;
    reporterName: string;
    categoryId: string;
  };
}

export interface AgentStatusEvent {
  event: 'agent:status';
  data: {
    reporterId: string;
    status: 'idle' | 'generating' | 'reviewing' | 'error';
    message?: string;
  };
}

export interface HeartbeatEvent {
  event: 'heartbeat';
  data: {
    timestamp: number;
  };
}

export type SSEEvent =
  | ArticlePublishedEvent
  | ArticleInReviewEvent
  | AgentGeneratingEvent
  | AgentStatusEvent
  | HeartbeatEvent;
