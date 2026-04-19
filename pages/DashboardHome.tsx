import React, { useState, useEffect } from 'react';
import { ArrowUpRight, TrendingUp, RefreshCw, PlusCircle, CheckCircle2, Clock } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { MY_VIDEOS } from '../constants';
import { Video, CompetitorVideo } from '../types';
import { searchNicheOutliers } from '../services/youtubeService';

interface DashboardHomeProps {
    onChangeView: (view: any) => void;
    onOpenAddIdea: () => void;
    dynamicVideos?: Video[];
    channelData?: any;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ onChangeView, onOpenAddIdea, dynamicVideos, channelData }) => {
  const videosToDisplay = dynamicVideos && dynamicVideos.length > 0 ? dynamicVideos : MY_VIDEOS;
  const latestVideo = videosToDisplay[0];
  
  const [outlierSignals, setOutlierSignals] = useState<CompetitorVideo[]>([]);

  useEffect(() => {
     let isMounted = true;
     searchNicheOutliers('AI Technology').then(data => {
         if (isMounted) setOutlierSignals(data);
     })
     return () => { isMounted = false; };
  }, []);
  
  // Calculate stats from full library
  const totalViews = videosToDisplay.reduce((sum, v) => sum + v.views, 0);
  const avgOutlier = videosToDisplay.length > 0 
    ? (videosToDisplay.reduce((sum, v) => sum + v.outlier_score, 0) / videosToDisplay.length).toFixed(2)
    : "1.00";

  // Chart data derived from real view counts of last 10 videos (or all if less)
  const chartData = [...videosToDisplay].reverse().slice(-10).map((v) => ({
    name: v.published_at,
    views: v.views
  }));

  return (
    <div className="pb-12 max-w-[1600px] mx-auto">
      
      {/* Welcome & Context Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Channel Pulse</h1>
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                    Analyzing <span className="font-semibold text-emerald-600">{videosToDisplay.length} videos</span> in your library.
                </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
                 <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 flex items-center gap-2 transition-colors"
                 >
                    <RefreshCw size={16} /> Force Sync
                 </button>
                 <button 
                    onClick={onOpenAddIdea}
                    className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-sm font-semibold hover:bg-emerald-900 shadow-lg shadow-emerald-200 flex items-center gap-2 transition-colors"
                 >
                    <PlusCircle size={18} /> New Analysis
                 </button>
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {/* Card 1: Total Views (Primary) */}
        <div className="bg-emerald-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-emerald-900/10 min-h-[180px] flex flex-col justify-between group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
            <div>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-emerald-100 text-sm font-medium">Lifetime Views</span>
                    <TrendingUp size={20} className="text-emerald-200" />
                </div>
                <h2 className="text-4xl font-bold">
                    {totalViews >= 1000000 ? (totalViews / 1000000).toFixed(1) + 'M' : totalViews >= 1000 ? (totalViews / 1000).toFixed(1) + 'K' : totalViews}
                </h2>
            </div>
            <div className="flex items-center gap-2 mt-4">
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                    <ArrowUpRight size={12} /> Total Assets
                </span>
                <span className="text-emerald-100 text-xs opacity-80">Synced Library</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20">
                <ResponsiveContainer width="100%" height="100%" className="outline-none focus:outline-none">
                    <AreaChart data={chartData} style={{ outline: 'none' }}>
                        <Area type="monotone" dataKey="views" stroke="#fff" fill="#fff" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Card 2: Average Outlier */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm min-h-[180px] flex flex-col justify-between relative overflow-hidden">
             <div className="absolute bottom-0 right-0 w-24 h-24 bg-gray-50 rounded-full blur-2xl -mr-6 -mb-6"></div>
             <div>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-gray-500 text-sm font-medium">Library Mean Outlier</span>
                    <div className="p-2 bg-gray-50 rounded-full text-gray-400">
                        <CheckCircle2 size={16} />
                    </div>
                </div>
                <h2 className="text-4xl font-bold text-gray-900">{avgOutlier}x</h2>
            </div>
            <div className="flex items-center gap-2">
                <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2 py-1 rounded-md">
                    Healthy
                </span>
                <span className="text-gray-400 text-xs">Standard Performance</span>
            </div>
        </div>

        {/* Card 3: Latest Outlier */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm min-h-[180px] flex flex-col justify-between relative overflow-hidden">
             <div className="absolute bottom-0 right-0 w-24 h-24 bg-gray-50 rounded-full blur-2xl -mr-6 -mb-6"></div>
             <div>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-gray-500 text-sm font-medium">Latest Multiplier</span>
                    <div className="p-2 bg-gray-50 rounded-full text-gray-400">
                        <TrendingUp size={16} />
                    </div>
                </div>
                <h2 className={`text-4xl font-bold ${latestVideo?.outlier_score >= 1.5 ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {latestVideo?.outlier_score || "0.0"}x
                </h2>
            </div>
            <div className="flex items-center gap-2">
                <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2 py-1 rounded-md">
                   New
                </span>
                <span className="text-gray-400 text-xs">Recent Velocity</span>
            </div>
        </div>

        {/* Card 4: Subscribers Count */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm min-h-[180px] flex flex-col justify-between relative overflow-hidden">
             <div className="absolute bottom-0 right-0 w-24 h-24 bg-gray-50 rounded-full blur-2xl -mr-6 -mb-6"></div>
             <div>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-gray-500 text-sm font-medium">Subscribers</span>
                    <div className="p-2 bg-gray-50 rounded-full text-gray-400">
                        <CheckCircle2 size={16} />
                    </div>
                </div>
                <h2 className="text-4xl font-bold text-gray-900">{channelData?.subscriberCount ? channelData.subscriberCount.toLocaleString() : '...'}</h2>
            </div>
            <div className="flex items-center gap-2">
                <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2 py-1 rounded-md">
                   Active
                </span>
                <span className="text-gray-400 text-xs truncate max-w-[120px]" title="YouTube API inherently rounds count">Total Audience*</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Feed: All Videos */}
        <div className="xl:col-span-3 space-y-6">
            <div className="flex items-center justify-between sticky top-0 bg-[#F4F7F6]/80 backdrop-blur-md py-4 z-10 -mx-4 px-4 rounded-xl">
                <h3 className="text-lg font-bold text-gray-900">Full Video Library Performance</h3>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400 font-medium italic">Showing {videosToDisplay.length} videos</span>
                    <button className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"><Clock size={16} /></button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videosToDisplay.map((video) => (
                    <div key={video.video_id} className="group cursor-pointer bg-white rounded-2xl p-2 border border-transparent hover:border-emerald-100 hover:shadow-lg transition-all duration-300">
                        <div className="relative aspect-video rounded-xl overflow-hidden mb-3 shadow-sm border border-gray-100">
                            <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className={`absolute top-2 right-2 ${video.outlier_score >= 1.5 ? 'bg-emerald-600' : 'bg-gray-500/80'} text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg`}>
                                {video.outlier_score}x Outlier
                            </div>
                            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                {video.views.toLocaleString()} VIEWS
                            </div>
                        </div>
                        <div className="px-1 pb-1">
                            <h4 className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-emerald-700 transition-colors h-10">
                                {video.title}
                            </h4>
                            <div className="flex items-center justify-between mt-3 text-[10px] text-gray-500 font-bold tracking-wider uppercase">
                                <span>{video.published_at}</span>
                                <span className={`${
                                    video.performance_tier === 'Elite' ? 'text-amber-600' : 
                                    video.performance_tier === 'Strong' ? 'text-emerald-600' : 'text-gray-400'
                                }`}>{video.performance_tier}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Sidebar: Market Signals */}
        <div className="xl:col-span-1">
            <div className="bg-white rounded-[24px] border border-gray-100 p-6 shadow-sm h-fit sticky top-24">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Niche Signals</h3>
                    <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2 py-1 rounded-full">Global</span>
                </div>
                
                <div className="space-y-5">
                    {outlierSignals.slice(0, 5).map((video) => (
                        <div key={video.video_id} className="flex gap-4 group cursor-pointer" onClick={() => window.open(`https://youtube.com/watch?v=${video.video_id}`, '_blank')}>
                            <div className="relative w-28 aspect-video rounded-xl overflow-hidden shrink-0 border border-gray-100">
                                <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                <div className={`absolute top-1 right-1 ${video.outlier_score >= 2.0 ? 'bg-emerald-600' : 'bg-gray-700'} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm`}>
                                    {video.outlier_score}x
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-gray-900 leading-snug line-clamp-2 mb-1 group-hover:text-emerald-600 transition-colors">
                                    {video.title}
                                </h4>
                                <p className="text-[10px] text-gray-400 font-medium">{video.channel_name}</p>
                            </div>
                        </div>
                    ))}
                    {outlierSignals.length === 0 && (
                        <div className="text-center text-gray-400 py-4 text-xs font-medium">Fetching active signals...</div>
                    )}
                </div>

                <button onClick={() => onChangeView('outliers')} className="w-full mt-8 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-100 transition-all">
                    Explore All Market Outliers
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
