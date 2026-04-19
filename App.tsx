import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Lightbulb, 
  Search, 
  Bell, 
  Menu,
  Users,
  MessageSquare,
  Settings as SettingsIcon,
  LogOut,
  Loader2,
  ChevronDown,
  Wrench
} from 'lucide-react';
import { DashboardHome } from './pages/DashboardHome';
import { OutlierExplorer } from './pages/OutlierExplorer';
import { IdeaQueue } from './pages/IdeaQueue';
import { Competitors } from './pages/Competitors';
import { SparringPartner } from './pages/SparringPartner';
import { Recommendations } from './pages/Recommendations';
import { Settings } from './pages/Settings';
import { SidebarItem } from './components/SidebarItem';
import { AddIdeaModal } from './components/AddIdeaModal';
import { INITIAL_IDEAS } from './constants';
import { Idea, Video } from './types';
import { getChannelIdByHandle, getChannelStats, getAllVideos } from './services/youtubeService';
import { Target } from 'lucide-react';

import { Tools } from './pages/Tools';
import { NotificationsView } from './pages/Notifications';
import { signInWithGoogle } from './services/firebase';
import { GoogleAuthProvider } from 'firebase/auth';

type View = 'dashboard' | 'outliers' | 'competitors' | 'ideas' | 'sparring' | 'settings' | 'recommendations' | 'tools' | 'notifications';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAddIdeaModalOpen, setIsAddIdeaModalOpen] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>(() => {
    const saved = localStorage.getItem('growiq_ideas');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [channelData, setChannelData] = useState<any>(null);
  const [myVideos, setMyVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<{id: number, title: string, message: string, read: boolean, time: string}[]>(() => {
    const saved = localStorage.getItem('growiq_notifications');
    if (saved) return JSON.parse(saved);
    return [
      { id: Date.now(), title: 'System Update', message: 'Growth Intelligence has been updated with real notifications and drag-and-drop ideas!', read: false, time: 'Just now' },
      { id: 1, title: 'New Competitor Outlier', message: 'A video in your niche just crossed 3x outlier score.', read: false, time: '10m ago' }
    ];
  });
  
  const addNotification = (title: string, message: string) => {
    setNotifications(prev => [{ id: Date.now(), title, message, read: false, time: 'Just now' }, ...prev]);
  };

  useEffect(() => {
    localStorage.setItem('growiq_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    localStorage.setItem('growiq_ideas', JSON.stringify(ideas));
  }, [ideas]);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  const fetchChannelDataFlow = async (handle: string, accessToken?: string) => {
      setIsLoading(true);
      try {
          const channelId = await getChannelIdByHandle(handle);
          let stats = null;
          
          if (channelId) {
             stats = await getChannelStats(channelId, accessToken);
          }

          if (stats) {
              setChannelData(stats);
              const videos = await getAllVideos(stats.uploadsPlaylistId);
              setMyVideos(videos);
          } else {
             // Handle fail silently or log
             console.error("Failed to load channel data array");
          }
      } catch (err) {
          console.error(err);
      } finally {
          setIsLoading(false);
      }
  };

  // Initial Fetch for HoggoYT
  useEffect(() => {
    const handle = localStorage.getItem('growiq_channel_handle') || '@HoggoYT';
    const savedToken = localStorage.getItem('growiq_access_token');
    fetchChannelDataFlow(handle, savedToken || undefined);
  }, []);

  const handleConnectGoogle = async () => {
      try {
          const result = await signInWithGoogle();
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential && credential.accessToken) {
              localStorage.setItem('growiq_access_token', credential.accessToken);
              const handle = localStorage.getItem('growiq_channel_handle') || '@HoggoYT';
              await fetchChannelDataFlow(handle, credential.accessToken);
              addNotification('Google Connected', 'Successfully connected via OAuth. Note: YouTube API still rounds counts due to API changes.');
          }
      } catch (err) {
          console.error(err);
          addNotification('Connection Failed', 'Failed to connect via Google.');
      }
  };

  const handleSaveIdea = (newIdea: Idea) => {
    setIdeas(prev => [newIdea, ...prev]);
  };

  const handleUpdateIdea = (updatedIdea: Idea) => {
    setIdeas(prev => prev.map(i => i.idea_id === updatedIdea.idea_id ? updatedIdea : i));
  };

  const handleDeleteIdea = (ideaId: string) => {
    setIdeas(prev => prev.filter(i => i.idea_id !== ideaId));
  };

  const handleSortIdeas = () => {
    setIdeas(prev => [...prev].sort((a, b) => b.score - a.score));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-gray-400">
          <Loader2 size={48} className="animate-spin mb-4 text-emerald-600" />
          <p className="font-medium">Fetching Channel Intelligence...</p>
          <p className="text-xs mt-2 opacity-60 italic">Pulling all video data & calculating outliers...</p>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <DashboardHome dynamicVideos={myVideos} channelData={channelData} onChangeView={setCurrentView} onOpenAddIdea={() => setIsAddIdeaModalOpen(true)} />;
      case 'outliers':
        return <OutlierExplorer onAddIdea={handleSaveIdea} channelData={channelData} myVideos={myVideos} />;
      case 'competitors':
        return <Competitors />;
      case 'ideas':
        return <IdeaQueue ideas={ideas} onOpenAddIdea={() => setIsAddIdeaModalOpen(true)} onUpdateIdea={handleUpdateIdea} onDeleteIdea={handleDeleteIdea} onSortIdeas={handleSortIdeas} />;
      case 'sparring':
        return <SparringPartner channelData={channelData} myVideos={myVideos} />;
      case 'recommendations':
        return <Recommendations channelData={channelData} myVideos={myVideos} />;
      case 'tools':
        return <Tools />;
      case 'notifications':
        return <NotificationsView notifications={notifications} setNotifications={setNotifications} />;
      case 'settings':
        return <Settings />;
      default:
        return <DashboardHome dynamicVideos={myVideos} channelData={channelData} onChangeView={setCurrentView} onOpenAddIdea={() => setIsAddIdeaModalOpen(true)} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F7F6]">
      <AddIdeaModal 
        isOpen={isAddIdeaModalOpen} 
        onClose={() => setIsAddIdeaModalOpen(false)}
        onSave={handleSaveIdea}
      />

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transition-all duration-300 ease-in-out flex flex-col shrink-0 ${isSidebarOpen ? 'translate-x-0 lg:ml-0' : '-translate-x-full lg:-ml-64'}`}>
        <div className="flex flex-col h-full">
          <div className="px-6 py-8">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-800 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/10">
                    <TrendingUp className="text-white w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-xl font-extrabold text-gray-900 leading-none tracking-tight">Growth</h1>
                    <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">Intelligence</span>
                </div>
            </div>
          </div>

          <div className="flex-1 px-4 overflow-y-auto">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-4 mt-2">Menu</div>
            <nav className="space-y-1">
                <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" isActive={currentView === 'dashboard'} onClick={() => { setCurrentView('dashboard'); if(window.innerWidth < 1024) setIsSidebarOpen(false); }} />
                <SidebarItem icon={<TrendingUp size={20} />} label="Outlier Explorer" isActive={currentView === 'outliers'} onClick={() => { setCurrentView('outliers'); if(window.innerWidth < 1024) setIsSidebarOpen(false); }} />
                <SidebarItem icon={<Target size={20} />} label="Recommendations" isActive={currentView === 'recommendations'} onClick={() => { setCurrentView('recommendations'); if(window.innerWidth < 1024) setIsSidebarOpen(false); }} />
                <SidebarItem icon={<Wrench size={20} />} label="Creator Tools" isActive={currentView === 'tools'} onClick={() => { setCurrentView('tools'); if(window.innerWidth < 1024) setIsSidebarOpen(false); }} />
                <SidebarItem icon={<Users size={20} />} label="Competitors" isActive={currentView === 'competitors'} onClick={() => { setCurrentView('competitors'); if(window.innerWidth < 1024) setIsSidebarOpen(false); }} />
                <SidebarItem icon={<Lightbulb size={20} />} label="Idea Queue" isActive={currentView === 'ideas'} count={ideas.length} onClick={() => { setCurrentView('ideas'); if(window.innerWidth < 1024) setIsSidebarOpen(false); }} />
                <SidebarItem icon={<MessageSquare size={20} />} label="Sparring Partner" isActive={currentView === 'sparring'} onClick={() => { setCurrentView('sparring'); if(window.innerWidth < 1024) setIsSidebarOpen(false); }} />
            </nav>

            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-4 mt-8">General</div>
            <nav className="space-y-1">
                <SidebarItem icon={<SettingsIcon size={20} />} label="Settings" isActive={currentView === 'settings'} onClick={() => { setCurrentView('settings'); if(window.innerWidth < 1024) setIsSidebarOpen(false); }} />
                <SidebarItem icon={<LogOut size={20} />} label="Logout" isActive={false} onClick={() => {}} />
            </nav>
          </div>

          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
              {channelData?.thumbnail ? (
                <img src={channelData.thumbnail} className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 bg-teal-800 rounded-full flex items-center justify-center text-white font-bold text-sm">US</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{channelData?.title || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{localStorage.getItem('growiq_channel_handle') || channelData?.customUrl || '@YourChannel'}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-white/50">
        <header className="h-20 flex items-center justify-between px-4 md:px-8 bg-transparent shrink-0 border-b border-gray-100 lg:border-none">
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="p-2 bg-white rounded-xl shadow-sm text-gray-600 lg:hidden"><Menu size={20} /></button>
            <span className="font-bold text-gray-800 hidden sm:block">Growth Intelligence</span>
          </div>

          <div className="hidden lg:flex items-center flex-1 max-w-xl mx-4">
             <div className="relative w-full group">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search task, outliers, or ideas..." 
                  className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm" 
                />
                {searchQuery.trim().length > 0 && (
                   <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50">
                       <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 px-2">Matching Ideas</p>
                       <div className="max-h-[300px] overflow-y-auto">
                       {ideas.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase())).map(idea => (
                          <div key={idea.idea_id} onClick={() => { setCurrentView('ideas'); setSearchQuery(''); }} className="px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer flex items-center gap-3">
                              <Lightbulb size={14} className="text-emerald-600" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{idea.title}</p>
                                <p className="text-xs text-gray-500">{idea.status}</p>
                              </div>
                          </div>
                       ))}
                       </div>
                       {ideas.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                          <div className="px-3 py-2 text-sm text-gray-500">No matching ideas found.</div>
                       )}
                   </div>
                )}
            </div>
          </div>

          <div className="flex items-center gap-6 ml-auto">
             <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Status</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Connected
                </span>
             </div>
             
             <div className="relative" ref={notificationsRef}>
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2 bg-white rounded-full text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-100 relative focus:outline-none"
                >
                    <Bell size={18} />
                    {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
                </button>
                {isNotificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden">
                    <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center">
                      <span className="font-bold text-gray-900 text-sm">Notifications</span>
                      <button onClick={() => setNotifications(prev => prev.map(n => ({...n, read: true})))} className="text-xs text-emerald-600 font-medium hover:text-emerald-700">Mark all read</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">No new notifications</div>
                      ) : (
                        notifications.slice(0, 3).map(notif => (
                          <div 
                            key={notif.id} 
                            className={`p-4 border-b border-gray-50 last:border-none transition-colors hover:bg-gray-50 cursor-pointer ${notif.read ? 'opacity-60' : 'bg-emerald-50/30'}`}
                            onClick={() => {
                              setNotifications(prev => prev.map(n => n.id === notif.id ? {...n, read: true} : n));
                            }}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="text-sm font-bold text-gray-900">{notif.title}</h4>
                              <span className="text-[10px] text-gray-400 font-medium">{notif.time}</span>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">{notif.message}</p>
                          </div>
                        ))
                      )}
                            {notifications.length > 3 && (
                               <div className="p-2 border-t border-gray-50 text-center">
                                  <button onClick={() => { setCurrentView('notifications'); setIsNotificationsOpen(false); }} className="text-xs text-gray-500 font-bold hover:text-emerald-700">View All Notifications</button>
                               </div>
                            )}
                    </div>
                  </div>
                )}
             </div>

             <div className="relative" ref={profileDropdownRef}>
               <button 
                 onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                 className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
               >
                 {channelData?.thumbnail ? (
                   <img src={channelData.thumbnail} className="w-8 h-8 rounded-full border border-emerald-100 object-cover shadow-sm bg-white" />
                 ) : (
                   <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-emerald-200">
                     {localStorage.getItem('growiq_channel_handle')?.charAt(1)?.toUpperCase() || 'M'}
                   </div>
                 )}
                 <ChevronDown size={14} className="text-gray-400" />
               </button>
               
               {isProfileDropdownOpen && (
                 <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                   <div className="px-4 py-2 border-b border-gray-50">
                     <p className="text-sm font-bold text-gray-900 truncate">{channelData?.title || 'User'}</p>
                     <p className="text-xs text-gray-500 truncate">{localStorage.getItem('growiq_channel_handle') || channelData?.customUrl || '@YourChannel'}</p>
                   </div>
                   {!localStorage.getItem('growiq_access_token') && (
                     <button onClick={() => { handleConnectGoogle(); setIsProfileDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2 font-medium">
                       Connect YouTube
                     </button>
                   )}
                   <button onClick={() => { setCurrentView('settings'); setIsProfileDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                     <SettingsIcon size={16} /> Settings
                   </button>
                   <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                     <LogOut size={16} /> Logout
                   </button>
                 </div>
               )}
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
