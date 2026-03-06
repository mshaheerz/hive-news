export type ArticleStatus = 'draft' | 'in_review' | 'approved' | 'rejected' | 'published';

export interface Article {
  id: string;
  companyId: string;
  reporterId: string;
  categoryId: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  status: ArticleStatus;
  tokensUsed?: number;
  generationMs?: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type ReviewAction = 'approved' | 'rejected' | 'revision_requested' | 'flagged_duplicate';

export interface ReviewLog {
  id: string;
  articleId: string;
  reviewerId: string;
  action: ReviewAction;
  feedback?: string;
  score?: number;
  isDuplicate: boolean;
  duplicateOfId?: string;
  tokensUsed?: number;
  createdAt: Date;
}
