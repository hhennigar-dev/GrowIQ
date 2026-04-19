import React, { useState, useEffect } from 'react';
import { RECOMMENDATIONS } from '../constants';
import { Recommendation, Video } from '../types';
import { PlayCircle, StopCircle, RefreshCw, Wand2, Check, Trash2, Edit2 } from 'lucide-react';
import { dashboardGenerateRecommendations } from '../services/geminiService';
import { DashboardCard } from '../components/DashboardCard';

interface RecommendationsProps {
  channelData?: any;
  myVideos?: Video[];
}

export const Recommendations: React.FC<RecommendationsProps> = ({ channelData, myVideos }) => {
    const [items, setItems] = useState<Recommendation[]>(() => {
        const saved = localStorage.getItem('growiq_recommendations');
        return saved ? JSON.parse(saved) : RECOMMENDATIONS;
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        localStorage.setItem('growiq_recommendations', JSON.stringify(items));
    }, [items]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            // Note: generateStrategicInsights doesn't exist, I added a dashboardGenerateRecommendations logic
            const newInsights = await dashboardGenerateRecommendations(channelData, myVideos);
            setItems(prev => [...newInsights, ...prev]);
        } catch(error) {
            console.error("Error generating insights", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDelete = (id: string) => {
        setItems(prev => prev.filter(p => p.recommendation_id !== id));
    };

    const handleEditSave = (id: string, newTitle: string, newDesc: string) => {
        setItems(prev => prev.map(p => p.recommendation_id === id ? { ...p, title: newTitle, description: newDesc } : p));
        setEditingId(null);
    };

    const getColumnContent = (category: 'START' | 'STOP' | 'CONTINUE') => {
        return items.filter(i => i.category === category);
    };

    return (
        <div className="pb-12 h-full flex flex-col">
             <div className="flex justify-between items-start mb-8 shrink-0">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Strategic AI Recommendations</h2>
                    <p className="text-gray-500">Data-backed suggestions to optimize your content strategy.</p>
                </div>
                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-all disabled:opacity-70"
                >
                    {isGenerating ? (
                        <RefreshCw size={20} className="animate-spin" />
                    ) : (
                        <Wand2 size={20} />
                    )}
                    {isGenerating ? 'Analyzing Market...' : 'Generate New Insights'}
                </button>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                {/* START Column */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 px-1 mb-2">
                        <PlayCircle className="text-emerald-500" />
                        <h3 className="font-bold text-gray-700 uppercase tracking-wide">Start</h3>
                    </div>
                    {getColumnContent('START').map(rec => (
                        <RecommendationCard key={rec.recommendation_id} rec={rec} onDelete={handleDelete} onEditSave={handleEditSave} isEditing={editingId === rec.recommendation_id} setEditingId={setEditingId} colorClass="bg-emerald-50 border-emerald-100" />
                    ))}
                    {getColumnContent('START').length === 0 && <EmptyState text="No new opportunities detected." />}
                </div>

                {/* STOP Column */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 px-1 mb-2">
                         <StopCircle className="text-red-500" />
                        <h3 className="font-bold text-gray-700 uppercase tracking-wide">Stop</h3>
                    </div>
                    {getColumnContent('STOP').map(rec => (
                        <RecommendationCard key={rec.recommendation_id} rec={rec} onDelete={handleDelete} onEditSave={handleEditSave} isEditing={editingId === rec.recommendation_id} setEditingId={setEditingId} colorClass="bg-red-50 border-red-100" />
                    ))}
                     {getColumnContent('STOP').length === 0 && <EmptyState text="No warnings at this time." />}
                </div>

                {/* CONTINUE Column */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 px-1 mb-2">
                         <RefreshCw className="text-blue-500" />
                        <h3 className="font-bold text-gray-700 uppercase tracking-wide">Continue</h3>
                    </div>
                     {getColumnContent('CONTINUE').map(rec => (
                        <RecommendationCard key={rec.recommendation_id} rec={rec} onDelete={handleDelete} onEditSave={handleEditSave} isEditing={editingId === rec.recommendation_id} setEditingId={setEditingId} colorClass="bg-blue-50 border-blue-100" />
                    ))}
                     {getColumnContent('CONTINUE').length === 0 && <EmptyState text="Keep doing what you're doing." />}
                </div>
             </div>
        </div>
    );
};

interface RecommendationCardProps {
    rec: Recommendation;
    onDelete: (id: string) => void;
    onEditSave: (id: string, title: string, desc: string) => void;
    isEditing: boolean;
    setEditingId: (id: string | null) => void;
    colorClass: string;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ rec, onDelete, onEditSave, isEditing, setEditingId, colorClass }) => {
    const [editTitle, setEditTitle] = useState(rec.title);
    const [editDesc, setEditDesc] = useState(rec.description);

    return (
        <div className={`p-6 rounded-[24px] border shadow-sm relative group bg-white hover:shadow-md transition-all`}>
            <div className={`absolute top-0 left-0 w-full h-1.5 ${rec.category === 'START' ? 'bg-emerald-500' : rec.category === 'STOP' ? 'bg-red-500' : 'bg-blue-500'} rounded-t-[24px]`}></div>
            
            <div className="flex justify-between items-start mb-3 mt-2 gap-2">
                {isEditing ? (
                    <input autoFocus value={editTitle} onChange={e=>setEditTitle(e.target.value)} className="font-bold text-gray-900 flex-1 outline-none border-b border-emerald-500 pb-1" />
                ) : (
                    <h4 className="font-bold text-gray-900 text-lg leading-tight flex-1">{rec.title}</h4>
                )}
                
                <div className={`text-[10px] font-bold px-2 py-1 rounded-lg ${colorClass} whitespace-nowrap`}>
                    {rec.confidence_score}% Conf.
                </div>
            </div>
            
            {isEditing ? (
                <textarea value={editDesc} onChange={e=>setEditDesc(e.target.value)} className="w-full text-gray-600 text-sm mb-4 leading-relaxed outline-none border border-gray-200 rounded p-2" rows={3} />
            ) : (
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {rec.description}
                </p>
            )}
            
            {rec.supporting_data && (
                <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Data Signal</p>
                    <p className="text-xs text-gray-700 font-mono">{rec.supporting_data}</p>
                </div>
            )}

            <div className="flex gap-2">
                {isEditing ? (
                    <button 
                        onClick={() => onEditSave(rec.recommendation_id, editTitle, editDesc)}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                    >
                        Save Strategy
                    </button>
                ) : (
                    <button 
                        onClick={() => setEditingId(rec.recommendation_id)}
                        className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-500 text-xs font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                    >
                        <Edit2 size={14} /> Customize
                    </button>
                )}
                <button 
                    onClick={() => onDelete(rec.recommendation_id)}
                    className="p-2 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};

const EmptyState = ({ text }: { text: string }) => (
    <div className="p-8 border-2 border-dashed border-gray-200 rounded-[24px] flex items-center justify-center text-center">
        <p className="text-gray-400 text-sm font-medium">{text}</p>
    </div>
);