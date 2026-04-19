import React, { useState } from 'react';
import { X, Search, Loader2, Save, TrendingUp } from 'lucide-react';
import { CHANNEL_AVG_VIEWS } from '../constants';
import { Idea } from '../types';
import { getVideoDetails } from '../services/youtubeService';

interface AddIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (idea: Idea) => void;
}

export const AddIdeaModal: React.FC<AddIdeaModalProps> = ({ isOpen, onClose, onSave }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analyzedVideo, setAnalyzedVideo] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!url) return;
    setIsLoading(true);
    
    const details = await getVideoDetails(url);
    if (details) {
      const outlierScore = (details.views / CHANNEL_AVG_VIEWS).toFixed(2);
      setAnalyzedVideo({
        ...details,
        outlierScore: outlierScore
      });
    } else {
      alert("Could not fetch video details. Check the URL or API quota.");
    }
    
    setIsLoading(false);
  };

  const handleSave = () => {
    if (analyzedVideo) {
      onSave({
        idea_id: `new-${Date.now()}`,
        title: analyzedVideo.title,
        status: 'Backlog',
        score: parseFloat(analyzedVideo.outlierScore),
        thumbnail_url: analyzedVideo.thumbnail_url,
        source_url: url
      });
      onClose();
      setUrl('');
      setAnalyzedVideo(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Analyze Outlier Potential</h2>
            <p className="text-gray-500 text-sm">Paste a YouTube URL to calculate real performance score.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="https://youtube.com/watch?v=..." 
                className="w-full pl-4 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-800 placeholder-gray-400"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={20} />
              </div>
            </div>
            <button 
              onClick={handleAnalyze}
              disabled={isLoading || !url}
              className="bg-emerald-800 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'Analyze'}
            </button>
          </div>

          {analyzedVideo && (
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex flex-col md:flex-row gap-6">
                <img src={analyzedVideo.thumbnail_url} alt="Thumbnail" className="w-full md:w-48 aspect-video rounded-lg object-cover shadow-sm border border-gray-200" />
                <div className="flex-1 space-y-2">
                  <h3 className="font-bold text-lg text-gray-900 leading-tight">{analyzedVideo.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="font-bold text-gray-700">{analyzedVideo.views.toLocaleString()} views</span>
                    <span>•</span>
                    <span>Avg: {CHANNEL_AVG_VIEWS.toLocaleString()}</span>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200/50 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Outlier Score</span>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-4xl font-black ${parseFloat(analyzedVideo.outlierScore) > 1.5 ? 'text-emerald-600' : 'text-gray-400'}`}>
                                {analyzedVideo.outlierScore}x
                            </span>
                        </div>
                    </div>
                    {parseFloat(analyzedVideo.outlierScore) > 2 && (
                        <div className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
                            <TrendingUp size={14} /> HIGH VELOCITY
                        </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-3 font-semibold text-gray-600 hover:bg-gray-200/50 rounded-xl transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={!analyzedVideo} className="px-8 py-3 bg-emerald-800 text-white font-bold rounded-xl hover:bg-emerald-900 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center gap-2">
            <Save size={18} /> Save to Ideas
          </button>
        </div>
      </div>
    </div>
  );
};
