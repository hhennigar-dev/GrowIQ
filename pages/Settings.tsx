import React, { useState, useEffect } from 'react';
import { Youtube, Database, Save, RefreshCw, Key } from 'lucide-react';

const HARDCODED_KEY = 'AIzaSyBZfTg06fuKvIv8nCBFBBCfKVvNjJxVif8';

export const Settings: React.FC = () => {
  const [channelHandle, setChannelHandle] = useState('@HoggoYT');
  const [youtubeApiKey, setYoutubeApiKey] = useState(HARDCODED_KEY);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedHandle = localStorage.getItem('growiq_channel_handle');
    const savedKey = localStorage.getItem('growiq_youtube_api_key');
    if (savedHandle) setChannelHandle(savedHandle);
    if (savedKey) setYoutubeApiKey(savedKey);
  }, []);

  const handleSave = () => {
    localStorage.setItem('growiq_channel_handle', channelHandle);
    localStorage.setItem('growiq_youtube_api_key', youtubeApiKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    window.location.reload(); // Reload to re-trigger API service initialization
  };

  const handleSync = () => {
    handleSave();
    alert(`Syncing live data for ${channelHandle}...`);
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Settings & Integrations</h2>
        <p className="text-gray-500">Connect your data sources to power the intelligence engine.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8">
            <h3 className="font-bold text-emerald-900 flex items-center gap-2 mb-4">
                <span className="text-xl">🚀</span> Quick Setup Active
            </h3>
            <p className="text-sm text-emerald-800 opacity-90 leading-relaxed">
              The application is currently using your provided Google Cloud API key: <code className="bg-emerald-100 px-1 rounded font-bold">AIzaSy...Vif8</code>. 
              Fetching logic is enabled for outlier detection and channel analytics.
            </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center">
                        <Youtube size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">YouTube Connection</h3>
                        <p className="text-sm text-gray-500">Connecting to: <span className="font-bold text-emerald-600">{channelHandle}</span></p>
                    </div>
                </div>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full">LIVE</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Channel Handle</label>
                    <input 
                        type="text" 
                        placeholder="@HoggoYT" 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-medium text-gray-800"
                        value={channelHandle}
                        onChange={(e) => setChannelHandle(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">API Key</label>
                    <div className="relative">
                        <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="password" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all font-mono text-gray-700"
                            value={youtubeApiKey}
                            onChange={(e) => setYoutubeApiKey(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            {isSaved && (
                <div className="flex items-center text-emerald-600 text-sm font-bold animate-in fade-in slide-in-from-right-2 mr-4">
                    Settings saved successfully!
                </div>
            )}
            <button 
                onClick={() => { setChannelHandle('@HoggoYT'); setYoutubeApiKey(HARDCODED_KEY); localStorage.clear(); }}
                className="px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
            >
                Reset Default
            </button>
            <button 
                onClick={handleSave}
                className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 flex items-center justify-center gap-2 shadow-lg shadow-gray-200 transition-all active:scale-95"
            >
                <Save size={18} /> Save & Reload
            </button>
             <button 
                onClick={handleSync}
                className="px-8 py-3 bg-emerald-800 text-white font-bold rounded-xl hover:bg-emerald-900 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
            >
                <RefreshCw size={18} /> Sync Data Now
            </button>
        </div>
      </div>
    </div>
  );
};
