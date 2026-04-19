import React, { useState, useEffect } from 'react';
import { OUTLIER_VIDEOS } from '../constants';
import { VideoCard } from '../components/VideoCard';
import { Filter, Search, Loader2 } from 'lucide-react';
import { searchNicheOutliers } from '../services/youtubeService';
import { CompetitorVideo, Idea, Video } from '../types';

const niches = [
    'Based on Your Uploads',
    'All Niches', 
    'Minecraft', 
    'AI Automations', 
    'No-Code Tools', 
    'Productivity', 
    'Technology', 
    'AI News',
    'Personal Finance',
    'Web Development',
    'Gaming Let\'s Plays',
    'Tech Reviews',
    'SaaS'
];

interface OutlierExplorerProps {
    onAddIdea?: (idea: Idea) => void;
    channelData?: any;
    myVideos?: Video[];
}

export const OutlierExplorer: React.FC<OutlierExplorerProps> = ({ onAddIdea, channelData, myVideos }) => {
    const [selectedNiche, setSelectedNiche] = useState('Based on Your Uploads');
    const [videos, setVideos] = useState<CompetitorVideo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sortMode, setSortMode] = useState<'score' | 'views'>('score');

    useEffect(() => {
        const fetchOutliers = async () => {
            setIsLoading(true);
            try {
                let query = selectedNiche;
                if (selectedNiche === 'All Niches') {
                    query = 'Minecraft OR "AI Automations" OR Technology OR Productivity';
                } else if (selectedNiche === 'Based on Your Uploads') {
                    if (myVideos && myVideos.length > 0) {
                        // Extract meaningful words, ignoring hashtags and short words
                        const cleanTitles = myVideos.slice(0, 3).map(v => {
                            return v.title
                                .replace(/#\w+/g, '') // remove hashtags
                                .replace(/[^\w\s]/g, '') // remove punctuation
                                .split(' ')
                                .filter(word => word.length > 3) // ignore small words like "how", "to", "the"
                                .slice(0, 4)
                                .join(' ');
                        }).filter(Boolean);
                        
                        query = cleanTitles.length > 0 ? cleanTitles.join(' OR ') : 'youtube growth OR content creation';
                    } else {
                        query = 'youtube growth OR content creation OR tutorial';
                    }
                } else if (selectedNiche === 'SaaS') {
                    query = '"Software as a Service" OR "SaaS startup" OR "SaaS tutorial" OR "micro saas"';
                }
                
                let dynamicOutliers = await searchNicheOutliers(query, 24);
                
                if (sortMode === 'views') {
                    dynamicOutliers.sort((a, b) => b.views - a.views);
                } else {
                    dynamicOutliers.sort((a, b) => b.outlier_score - a.outlier_score);
                }
                
                setVideos(dynamicOutliers);
            } catch (err) {
                console.error(err);
            }
            setIsLoading(false);
        };
        fetchOutliers();
    }, [selectedNiche]);

    return (
        <div className="pb-12">
            {/* Header Controls */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Outlier Explorer</h2>
                <p className="text-gray-500 mb-6">Discover viral videos from your competitors before they peak.</p>
                
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {niches.map(niche => (
                            <button
                                key={niche}
                                onClick={() => setSelectedNiche(niche)}
                                className={`
                                    whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all border
                                    ${selectedNiche === niche 
                                        ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }
                                `}
                            >
                                {niche}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => {
                                const newMode = sortMode === 'score' ? 'views' : 'score';
                                setSortMode(newMode);
                                setVideos(prev => [...prev].sort((a, b) => newMode === 'views' ? b.views - a.views : b.outlier_score - a.outlier_score));
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 shrink-0"
                        >
                            <Filter size={16} /> Sort: {sortMode === 'score' ? 'Top Score' : 'Most Views'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-emerald-600">
                    <Loader2 size={48} className="animate-spin mb-4" />
                    <p className="font-medium text-gray-500">Searching YouTube for {selectedNiche} outlines...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {videos.map((video) => (
                            <VideoCard key={video.video_id} video={video} isCompetitor onAddIdea={onAddIdea} />
                        ))}
                    </div>
                    
                    {videos.length === 0 && (
                        <div className="text-center py-20 text-gray-400">
                            <Search size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No outliers found for this niche recently.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};