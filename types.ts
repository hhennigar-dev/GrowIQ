// Performance Tiers
export type PerformanceTier = 'Elite' | 'Strong' | 'Average' | 'Weak';
export type TrendStatus = 'Rising' | 'Stable' | 'Declining';
export type IdeaStatus = 'Backlog' | 'Scripting' | 'Filming' | 'Editing' | 'Published';

// 3.1 Database Tables Representation
export interface Video {
  video_id: string;
  title: string;
  thumbnail_url: string;
  published_at: string;
  views: number;
  likes: number;
  comments_count: number;
  ctr: number;
  avg_view_duration: string;
  outlier_score: number;
  performance_tier: PerformanceTier;
  channel_name?: string;
}

export interface CompetitorVideo {
  video_id: string;
  channel_name: string;
  channel_avatar: string;
  title: string;
  thumbnail_url: string;
  published_at: string;
  views: number;
  view_velocity_48h: number; // views per hour in first 48h
  outlier_score: number;
  performance_tier: PerformanceTier;
  niche: string;
}

export interface Recommendation {
  recommendation_id: string;
  category: 'START' | 'STOP' | 'CONTINUE';
  title: string;
  description: string;
  confidence_score: number;
  supporting_data?: string;
}

export interface Trend {
  trend_id: string;
  topic_name: string;
  momentum_score: number;
  status: TrendStatus;
  video_count: number;
}

export interface Idea {
  idea_id: string;
  title: string;
  status: IdeaStatus;
  score: number;
  thumbnail_url?: string;
  notes?: string;
  source_url?: string;
}