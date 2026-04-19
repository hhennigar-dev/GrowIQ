import { Video, CompetitorVideo, Recommendation, Trend, Idea } from './types';

// Mocking HoggoYT data (Gaming/Minecraft niche based on handle assumption, or generic tech if preferred, sticking to user request context)
export const MY_VIDEOS: Video[] = [
  {
    video_id: 'v1',
    title: 'I Built a Civilization in Minecraft Hardcore',
    thumbnail_url: 'https://picsum.photos/seed/minecraft1/640/360',
    published_at: '2024-05-20',
    views: 45200, // Good outlier
    likes: 3200,
    comments_count: 450,
    ctr: 14.0,
    avg_view_duration: '12:12',
    outlier_score: 3.01,
    performance_tier: 'Elite'
  },
  {
    video_id: 'v2',
    title: '100 Days in a Zombie Apocalypse',
    thumbnail_url: 'https://picsum.photos/seed/zombie/640/360',
    published_at: '2024-05-15',
    views: 12500, // Average
    likes: 800,
    comments_count: 120,
    ctr: 8.0,
    avg_view_duration: '08:30',
    outlier_score: 0.83,
    performance_tier: 'Average'
  },
  {
    video_id: 'v3',
    title: 'The Secret to Infinite Diamonds',
    thumbnail_url: 'https://picsum.photos/seed/diamonds/640/360',
    published_at: '2024-05-01',
    views: 89000, // Massive outlier
    likes: 5600,
    comments_count: 1200,
    ctr: 18.2,
    avg_view_duration: '04:45',
    outlier_score: 5.93,
    performance_tier: 'Elite'
  },
];

export const OUTLIER_VIDEOS: CompetitorVideo[] = [
  {
    video_id: 'c1',
    channel_name: 'Dream',
    channel_avatar: 'https://picsum.photos/seed/dream/50/50',
    title: 'Minecraft Speedrunner VS 5 Hunters',
    thumbnail_url: 'https://picsum.photos/seed/speedrun/640/360',
    published_at: '2 days ago',
    views: 1500000,
    view_velocity_48h: 50000,
    outlier_score: 9.9,
    performance_tier: 'Elite',
    niche: 'Gaming'
  },
  {
    video_id: 'c2',
    channel_name: 'Technoblade',
    channel_avatar: 'https://picsum.photos/seed/techno/50/50',
    title: 'The Great Potato War',
    thumbnail_url: 'https://picsum.photos/seed/potato/640/360',
    published_at: '5 days ago',
    views: 900000,
    view_velocity_48h: 12000,
    outlier_score: 9.4,
    performance_tier: 'Elite',
    niche: 'Gaming'
  },
  {
    video_id: 'c3',
    channel_name: 'TommyInnit',
    channel_avatar: 'https://picsum.photos/seed/tommy/50/50',
    title: 'I Met Wilbur Soot in Real Life',
    thumbnail_url: 'https://picsum.photos/seed/wilbur/640/360',
    published_at: '1 week ago',
    views: 750000,
    view_velocity_48h: 8000,
    outlier_score: 7.8,
    performance_tier: 'Elite',
    niche: 'Gaming'
  }
];

export const INITIAL_IDEAS: Idea[] = [
  {
    idea_id: 'i1',
    title: 'How to Scrape Websites into Notion with AI',
    status: 'Backlog',
    score: 8.5,
    thumbnail_url: 'https://picsum.photos/seed/idea1/640/360',
    source_url: 'https://youtube.com/...'
  },
  {
    idea_id: 'i2',
    title: 'n8n vs Make: The Ultimate 2024 Showdown',
    status: 'Scripting',
    score: 9.2,
    thumbnail_url: 'https://picsum.photos/seed/idea2/640/360'
  },
  {
    idea_id: 'i3',
    title: 'Building a Lead Gen Agent from Scratch',
    status: 'Filming',
    score: 7.9,
    thumbnail_url: 'https://picsum.photos/seed/idea3/640/360'
  }
];

export const RECOMMENDATIONS: Recommendation[] = [
  {
    recommendation_id: 'r1',
    category: 'START',
    title: 'Hardcore Survival Challenges',
    description: 'High demand in adjacent niches. Your audience engagement on "Civilization" suggests strong fit.',
    confidence_score: 92,
    supporting_data: 'Avg competitor view velocity: 15k/hr'
  },
  {
    recommendation_id: 'r2',
    category: 'STOP',
    title: 'Generic Let\'s Plays',
    description: 'Market saturation reached 95%. Retention is 40% lower than edited storytelling.',
    confidence_score: 88,
    supporting_data: 'Declining momentum -25% WoW'
  }
];

export const TRENDS: Trend[] = [
  { trend_id: 't1', topic_name: '100 Days Challenge', momentum_score: 2.4, status: 'Rising', video_count: 145 },
  { trend_id: 't2', topic_name: 'Modded Hardcore', momentum_score: 1.8, status: 'Rising', video_count: 89 },
  { trend_id: 't3', topic_name: 'SMP Drama', momentum_score: 0.6, status: 'Declining', video_count: 520 },
];

export const CHANNEL_AVG_VIEWS = 15000; // Hardcoded baseline for outlier calcs