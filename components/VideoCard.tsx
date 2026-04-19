import React from 'react';
import { Play, TrendingUp, BarChart2, PlusCircle } from 'lucide-react';
import { Video, CompetitorVideo, PerformanceTier, Idea } from '../types';

interface VideoCardProps {
  video: Video | CompetitorVideo;
  isCompetitor?: boolean;
  onAddIdea?: (idea: Idea) => void;
}

const getTierColor = (tier: PerformanceTier) => {
  switch (tier) {
    case 'Elite': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Strong': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Average': return 'bg-gray-100 text-gray-600 border-gray-200';
    case 'Weak': return 'bg-red-50 text-red-600 border-red-100';
    default: return 'bg-gray-100 text-gray-600';
  }
};

export const VideoCard: React.FC<VideoCardProps> = ({ video, isCompetitor = false, onAddIdea }) => {
  const handleSaveToIdeas = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onAddIdea) {
      onAddIdea({
        idea_id: Math.random().toString(36).substring(7),
        title: video.title,
        status: 'Backlog',
        score: video.outlier_score,
        thumbnail_url: video.thumbnail_url
      });
    }
  };

  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={video.thumbnail_url} 
          alt={video.title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
        
        {/* Tier Badge */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold border ${getTierColor(video.performance_tier)} shadow-sm`}>
          {video.performance_tier === 'Elite' && '🔥 '}
          {video.performance_tier}
        </div>

        {/* Play Overlay */}
        <a 
          href={`https://www.youtube.com/watch?v=${video.video_id}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <div className="w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-105 transition-transform cursor-pointer">
            <Play size={20} className="text-gray-900 fill-gray-900 ml-1" />
          </div>
        </a>

        {onAddIdea && (
            <button 
                onClick={handleSaveToIdeas}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur text-gray-700 hover:text-emerald-600 hover:bg-white border border-gray-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all focus:outline-none z-20"
                title="Save to Ideas"
            >
                <PlusCircle size={16} />
            </button>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          {isCompetitor && 'channel_avatar' in video && (
             <img src={video.channel_avatar} alt="avatar" className="w-8 h-8 rounded-full border border-gray-200" />
          )}
          <h4 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2 flex-1">
            {video.title}
          </h4>
        </div>
        
        {isCompetitor && 'channel_name' in video && (
            <p className="text-xs text-gray-500 mb-3 font-medium">{(video as CompetitorVideo).channel_name}</p>
        )}

        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="bg-gray-50 rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
              <TrendingUp size={12} />
              <span>Score</span>
            </div>
            <span className="text-lg font-bold text-gray-900">{video.outlier_score}x</span>
          </div>
          <div className="bg-gray-50 rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
              <BarChart2 size={12} />
              <span>Views</span>
            </div>
            <span className="text-lg font-bold text-gray-900">
              {video.views >= 1000000 ? (video.views / 1000000).toFixed(1) + 'M' : video.views >= 1000 ? (video.views / 1000).toFixed(1) + 'K' : video.views}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};