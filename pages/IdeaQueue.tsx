import React, { useState } from 'react';
import { Plus, MoreHorizontal, Trash2, Edit2, Play } from 'lucide-react';
import { Idea } from '../types';

interface IdeaQueueProps {
  ideas: Idea[];
  onOpenAddIdea: () => void;
  onUpdateIdea: (idea: Idea) => void;
  onDeleteIdea: (ideaId: string) => void;
  onSortIdeas: () => void;
}

const columns = [
  { id: 'Backlog', label: 'BACKLOG' },
  { id: 'Scripting', label: 'SCRIPTING' },
  { id: 'Filming', label: 'FILMING' },
  { id: 'Editing', label: 'EDITING' },
  { id: 'Published', label: 'PUBLISHED' },
];

export const IdeaQueue: React.FC<IdeaQueueProps> = ({ ideas, onOpenAddIdea, onUpdateIdea, onDeleteIdea, onSortIdeas }) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const moveIdea = (idea: Idea, newStatus: string) => {
    onUpdateIdea({ ...idea, status: newStatus as any });
    setActiveMenuId(null);
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
           <h2 className="text-3xl font-bold text-gray-800 mb-2">Idea Library</h2>
           <p className="text-gray-500">Save outliers and track production status • Scored with AI</p>
        </div>
        <div className="flex gap-2">
            <button onClick={onSortIdeas} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                Sort by Score
            </button>
        </div>
      </div>

      {/* Input Placeholder (Visual only per screenshot) */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-center mb-8">
        <div className="bg-gray-100 p-2 rounded-lg text-gray-400">
            <Plus size={20} />
        </div>
        <input 
            type="text" 
            placeholder="Paste YouTube URL here..." 
            className="flex-1 bg-transparent outline-none text-gray-600 placeholder-gray-400"
        />
        <button onClick={onOpenAddIdea} className="bg-emerald-700 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-emerald-800 transition-colors">
            + Add
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-4 md:gap-6 min-w-[800px] md:min-w-[1200px] h-full pb-2 px-1">
            {columns.map(col => {
                const colIdeas = ideas.filter(i => i.status === col.id);
                return (
                    <div key={col.id} className="w-64 md:flex-1 flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                            <span className="text-xs font-bold text-gray-500 tracking-wider">{col.label}</span>
                            <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{colIdeas.length}</span>
                        </div>
                        
                        <div 
                            className={`flex-1 ${colIdeas.length === 0 ? 'border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50' : ''}`}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                const ideaId = e.dataTransfer.getData('text/plain');
                                const idea = ideas.find(i => i.idea_id === ideaId);
                                if (idea && idea.status !== col.id) {
                                  moveIdea(idea, col.id);
                                }
                            }}
                        >
                             {colIdeas.map(idea => (
                                <div 
                                    key={idea.idea_id} 
                                    draggable
                                    onDragStart={(e) => e.dataTransfer.setData('text/plain', idea.idea_id)}
                                    className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing mb-3 group"
                                >
                                    <div className="flex justify-between items-start mb-2 relative">
                                        <h4 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2">{idea.title}</h4>
                                        <div className="relative">
                                          <button 
                                              onClick={() => setActiveMenuId(activeMenuId === idea.idea_id ? null : idea.idea_id)}
                                              className="text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
                                          >
                                              <MoreHorizontal size={16} />
                                          </button>
                                          {activeMenuId === idea.idea_id && (
                                              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-100 shadow-xl rounded-xl py-1 z-10 flex flex-col items-start">
                                                  <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase w-full border-b border-gray-50">Move to</div>
                                                  {columns.map(c => (
                                                    idea.status !== c.id && (
                                                      <button key={c.id} onClick={() => moveIdea(idea, c.id)} className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700">
                                                        {c.label}
                                                      </button>
                                                    )
                                                  ))}
                                                  <div className="w-full border-t border-gray-50 my-1"></div>
                                                  <button onClick={() => onDeleteIdea(idea.idea_id)} className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-1">
                                                    <Trash2 size={12} /> Delete
                                                  </button>
                                              </div>
                                          )}
                                        </div>
                                    </div>
                                    
                                    {/* Badges */}
                                    <div className="flex gap-2 mb-3">
                                        <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded">Outlier Analysis</span>
                                        {idea.status === 'Scripting' && <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded">Comment Request</span>}
                                    </div>

                                    {/* Thumbnail Preview if exists */}
                                    {idea.thumbnail_url && (
                                        <div className="w-full h-24 rounded-lg overflow-hidden mb-3 relative">
                                            <img src={idea.thumbnail_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                            <div className="absolute top-1 right-1 bg-black/70 text-white text-[10px] font-bold px-1.5 rounded">
                                                {idea.score}x
                                            </div>
                                        </div>
                                    )}
                                </div>
                             ))}
                             {colIdeas.length === 0 && (
                                <div className="h-full flex items-center justify-center text-gray-300 text-xs font-medium">
                                    No ideas in {col.id}
                                </div>
                             )}
                        </div>
                    </div>
                )
            })}
        </div>
      </div>

    </div>
  );
};