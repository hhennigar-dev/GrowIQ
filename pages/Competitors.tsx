import React, { useState, useEffect } from 'react';
import { AlertCircle, Zap, Loader2, CheckCircle2, PauseCircle } from 'lucide-react';
import { searchNicheOutliers, getApiQuota, getChannelIdByHandle, getChannelStats } from '../services/youtubeService';
import { Video } from '../types';

interface Channel {
  name: string;
  avatar: string;
  tracking: boolean;
}

interface CompetitorsProps {
  channelData?: any;
  myVideos?: Video[];
}

export const Competitors: React.FC<CompetitorsProps> = ({ channelData, myVideos }) => {
    const [channels, setChannels] = useState<Channel[]>(() => {
        const saved = localStorage.getItem('growiq_competitors');
        return saved ? JSON.parse(saved) : [];
    });
    const [isSeeding, setIsSeeding] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('active');

    useEffect(() => {
        localStorage.setItem('growiq_competitors', JSON.stringify(channels));
    }, [channels]);

    const activeCount = channels.filter(c => c.tracking).length;
    const inactiveCount = channels.filter(c => !c.tracking).length;

    const filteredChannels = channels.filter(c => {
        if (activeTab === 'all') return true;
        if (activeTab === 'active') return c.tracking;
        return !c.tracking;
    });

    const handleSeed = async () => {
        setIsSeeding(true);
        try {
            let query = 'youtube growth OR content creation';
            if (myVideos && myVideos.length > 0) {
                const cleanTitles = myVideos.slice(0, 3).map(v => {
                    return v.title
                        .replace(/#\w+/g, '') // remove hashtags
                        .replace(/[^\w\s]/g, '') // remove punctuation
                        .split(' ')
                        .filter(word => word.length > 3) // ignore small words
                        .slice(0, 3)
                        .join(' ');
                }).filter(Boolean);
                if (cleanTitles.length > 0) {
                    query = cleanTitles.join(' OR ');
                }
            } else if (channelData?.title) {
                query = `${channelData.title} niche`;
            }
            
            const outliers = await searchNicheOutliers(query, 30);
            const newChannels: Channel[] = [];
            
            const uniqueNames = Array.from(new Set(outliers.map((v: any) => v.channel_name)));
            
            for (const name of uniqueNames) {
                if (!channels.some(c => c.name === name as string)) {
                    const matched = outliers.find((v: any) => v.channel_name === name);
                    if (matched) {
                         newChannels.push({ name: name as string, avatar: matched.channel_avatar, tracking: true });
                    }
                }
            }
            
            setChannels(prev => [...prev, ...newChannels].slice(0, 50));
            setActiveTab('all');
        } catch (error) {
            console.error(error);
        }
        setIsSeeding(false);
    };

    const handleAddChannel = async () => {
        const handle = prompt("Enter the channel handle (e.g. @MrBeast):");
        if (!handle) return;
        
        setIsAdding(true);
        try {
            const id = await getChannelIdByHandle(handle);
            if (id) {
               const stats = await getChannelStats(id);
               if (stats && stats.title && !channels.some(c => c.name === stats.title)) {
                   setChannels(prev => [{ name: stats.title, avatar: stats.thumbnail, tracking: true }, ...prev]);
                   setActiveTab('active');
               } else {
                   alert("Channel already tracked or not found.");
               }
            } else {
               alert("Channel not found.");
            }
        } catch (e) {}
        setIsAdding(false);
    };

    const toggleTracking = (name: string) => {
        setChannels(prev => prev.map(c => c.name === name ? {...c, tracking: !c.tracking} : c));
    };

  return (
    <div className="h-full flex flex-col">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
           <h2 className="text-3xl font-bold text-gray-800 mb-2">Competitor Channels</h2>
           <p className="text-gray-500">Tracking {activeCount} active channels</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
             <div className="text-right hidden md:block">
                <p className="text-xs text-gray-400 font-bold uppercase">Mock API Quota</p>
                <p className="text-sm font-bold text-emerald-600">{(10000 - getApiQuota()).toLocaleString()} / 10,000</p>
             </div>
             <button 
                onClick={handleSeed}
                disabled={isSeeding}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50"
             >
                {isSeeding ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />} 
                {isSeeding ? 'Seeding...' : 'Seed Niche Channels'}
             </button>
             <button disabled={isAdding} onClick={handleAddChannel} className="px-4 py-2 bg-[#D95F17] text-white rounded-lg text-sm font-bold hover:bg-[#b54d10] disabled:opacity-50">
                {isAdding ? 'Adding...' : '+ Add Channel'}
             </button>
             <button onClick={() => { if(window.confirm('Clear all competitors?')) { setChannels([]); localStorage.removeItem('growiq_competitors'); } }} className="px-4 py-2 bg-white border border-gray-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50">
                Reset
             </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-gray-200 mb-8 overflow-x-auto scrollbar-hide">
        <button onClick={() => setActiveTab('all')} className={`pb-3 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'all' ? 'border-gray-800 text-gray-800' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>All ({channels.length})</button>
        <button onClick={() => setActiveTab('active')} className={`pb-3 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'active' ? 'border-[#D95F17] text-[#D95F17]' : 'border-transparent text-gray-500 hover:text-[#D95F17]'}`}>Active ({activeCount})</button>
        <button onClick={() => setActiveTab('inactive')} className={`pb-3 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'inactive' ? 'border-gray-800 text-gray-800' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>Inactive ({inactiveCount})</button>
      </div>

      {filteredChannels.length === 0 ? (
          /* Empty State */
          <div className="flex-1 bg-white rounded-3xl border border-gray-100 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                <AlertCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No channels found in this view</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
                Click "Seed Niche Channels" to automatically find the best competitors based on your recent uploads.
            </p>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
              {filteredChannels.map((ch, idx) => (
                  <div key={idx} onClick={() => toggleTracking(ch.name)} className={`bg-white rounded-2xl p-6 border ${ch.tracking ? 'border-gray-100 hover:border-emerald-100' : 'border-gray-50 hover:border-red-100 opacity-60'} shadow-sm flex items-center gap-4 transition-colors cursor-pointer group`}>
                      <img src={ch.avatar} alt={ch.name} className="w-16 h-16 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform" />
                      <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 truncate">{ch.name}</h4>
                          {ch.tracking ? (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold mt-1">
                                  <CheckCircle2 size={10} /> Active Tracking
                              </span>
                          ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold mt-1">
                                  <PauseCircle size={10} /> Ignored
                              </span>
                          )}
                      </div>
                  </div>
              ))}
          </div>
      )}

    </div>
  );
};