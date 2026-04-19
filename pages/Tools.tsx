import React, { useState, useEffect } from 'react';
import { Settings, PenTool, Lightbulb, Hash, Search, Copy, CheckCircle2, ChevronLeft, Pin, FileText, Image, Mail, HelpCircle, Target, History, Trash2 } from 'lucide-react';
import { generateToolOutput } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface ToolsProps {}

type ToolType = 'hub' | 'tag_generator' | 'idea_generator' | 'title_analyzer' | 'description_writer' | 'community_post' | 'script_outline' | 'thumbnail_brainstormer' | 'sponsor_pitch' | 'faq_generator' | 'missing_topics';

interface ToolHistoryEntry {
    id: string;
    toolType: string;
    input: string;
    output: string;
    timestamp: number;
}

export const Tools: React.FC<ToolsProps> = () => {
    const [currentTool, setCurrentTool] = useState<ToolType>('hub');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    
    // State for pinned tools
    const [pinnedTools, setPinnedTools] = useState<string[]>(() => {
        const saved = localStorage.getItem('growiq_pinned_tools');
        return saved ? JSON.parse(saved) : [];
    });

    const [toolHistory, setToolHistory] = useState<ToolHistoryEntry[]>(() => {
        const saved = localStorage.getItem('growiq_tool_history');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('growiq_pinned_tools', JSON.stringify(pinnedTools));
    }, [pinnedTools]);

    useEffect(() => {
        localStorage.setItem('growiq_tool_history', JSON.stringify(toolHistory));
    }, [toolHistory]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const togglePin = (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // prevent triggering the tool card click
        setPinnedTools(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    };

    const deleteHistoryEntry = (id: string) => {
        setToolHistory(prev => prev.filter(entry => entry.id !== id));
    };

    const runTool = async (type: string) => {
        setIsGenerating(true);
        const result = await generateToolOutput(type, input);
        setOutput(result);
        
        // Save to history
        const newEntry: ToolHistoryEntry = {
            id: Date.now().toString(),
            toolType: type,
            input,
            output: result,
            timestamp: Date.now()
        };
        setToolHistory(prev => [newEntry, ...prev]);
        setIsGenerating(false);
    };

    const renderHub = () => {
        if (showHistory) {
            return (
                <div className="max-w-6xl mx-auto pb-12 px-4 sm:px-6">
                    <div className="mb-6 flex items-center justify-between">
                        <button onClick={() => setShowHistory(false)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-emerald-700 transition-colors">
                            <ChevronLeft size={16} /> Back to Tools
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900">Your Tool History</h2>
                    </div>
                    {toolHistory.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">No tool history found. Generate something to see it here!</div>
                    ) : (
                        <div className="space-y-4">
                            {toolHistory.map(entry => (
                                <div key={entry.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{entry.toolType.replace('_', ' ')}</span>
                                            <p className="mt-2 text-sm font-bold text-gray-700 break-words line-clamp-1">{entry.input}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400">{new Date(entry.timestamp).toLocaleString()}</span>
                                            <button onClick={() => deleteHistoryEntry(entry.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl text-sm border border-gray-200">
                                        <div className="markdown-body text-gray-700">
                                            <ReactMarkdown>{entry.output}</ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )
        }

        const allTools = [
            { id: 'tag_generator', icon: <Hash size={24}/>, title: 'SEO Tag Generator', desc: 'Instantly generate exhaustive optimized YouTube tags from your title.' },
            { id: 'idea_generator', icon: <Lightbulb size={24}/>, title: 'Viral Idea Generator', desc: 'Get 5 proven, high-CTR hyper-creative video concepts for your niche.' },
            { id: 'title_analyzer', icon: <Search size={24}/>, title: 'Title Hook Analyzer', desc: 'Score your titles clickability before you publish with feedback.' },
            { id: 'description_writer', icon: <PenTool size={24}/>, title: 'Smart Description', desc: 'Generate SEO-rich YouTube descriptions automatically.' },
            { id: 'community_post', icon: <Mail size={24}/>, title: 'Community Post Writer', desc: 'Write engaging community posts to drive channel interaction.' },
            { id: 'script_outline', icon: <FileText size={24}/>, title: 'Script Outline', desc: 'Build a high-retention 4-part script structure for your idea.' },
            { id: 'thumbnail_brainstormer', icon: <Image size={24}/>, title: 'Thumbnail Concepts', desc: 'Get 3 high-impact visual thumbnail ideas focusing on psychology.' },
            { id: 'sponsor_pitch', icon: <Lightbulb size={24}/>, title: 'Sponsorship Pitch', desc: 'Draft a professional cold email to pitch a brand for sponsorship.' },
            { id: 'faq_generator', icon: <HelpCircle size={24}/>, title: 'FAQ Generator', desc: 'Generate the top 5 burning questions in your niche to answer.' },
            { id: 'missing_topics', icon: <Target size={24}/>, title: 'Missing Topics', desc: 'Identify trending concepts your competitors have ignored.' }
        ];

        // Sort so pinned are first
        const sortedTools = [...allTools].sort((a, b) => {
            const aPinned = pinnedTools.includes(a.id);
            const bPinned = pinnedTools.includes(b.id);
            return (aPinned === bPinned) ? 0 : aPinned ? -1 : 1;
        });

        return (
            <div className="max-w-6xl mx-auto pb-12 px-4 sm:px-6">
                <div className="mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Creator Tools</h2>
                        <p className="text-gray-500 text-sm sm:text-base">A suite of AI-powered mini-tools to accelerate your production workflow.</p>
                    </div>
                    <button onClick={() => setShowHistory(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors">
                        <History size={16} /> View History
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {sortedTools.map(tool => {
                        const isPinned = pinnedTools.includes(tool.id);
                        return (
                            <div key={tool.id} onClick={() => { setCurrentTool(tool.id as ToolType); setInput(''); setOutput(''); }} className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all cursor-pointer group relative">
                                <button 
                                    onClick={(e) => togglePin(tool.id, e)} 
                                    className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isPinned ? 'text-emerald-500 bg-emerald-50' : 'text-gray-300 hover:text-gray-500 hover:bg-gray-100 opacity-0 group-hover:opacity-100'}`}
                                >
                                    <Pin size={16} fill={isPinned ? 'currentColor' : 'none'}/>
                                </button>
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    {tool.icon}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{tool.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{tool.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderTool = () => {
        let title, desc, placeholder, action;
        if (currentTool === 'tag_generator') {
            title = 'SEO Tag Generator'; desc = 'Paste your video title to get a massive exhaustive list of comma-separated SEO tags ready to copy.'; placeholder = 'e.g., How to build a modern React dashboard in 10 minutes'; action = 'Generate SEO Tags'; 
        } else if (currentTool === 'idea_generator') {
            title = 'Viral Idea Generator'; desc = 'Enter a broad topic or keyword, and we will generate 5 proven video concepts utilizing AI that breaks the mold.'; placeholder = 'e.g., Productivity tools, Minecraft speedrun, Solo travel'; action = 'Generate Virality'; 
        } else if (currentTool === 'title_analyzer') {
            title = 'Title Hook Analyzer'; desc = 'Analyze your title for maximum CTR potential and feedback on how to improve it.'; placeholder = 'e.g., I Built a Secret Base in Minecraft'; action = 'Analyze Title';
        } else if (currentTool === 'description_writer') {
            title = 'Smart Description Writer'; desc = 'We will craft a highly-optimized 150-word description containing a solid hook and strong SEO properties.'; placeholder = 'e.g., Guide on fixing the YouTube algorithm bugs.'; action = 'Write Description';
        } else if (currentTool === 'community_post') {
            title = 'Community Post Writer'; desc = 'Provide a topic and we will generate an engaging text post for your community tab.'; placeholder = 'e.g., Working on a huge 100 days video right now...'; action = 'Write Post';
        } else if (currentTool === 'script_outline') {
            title = 'Video Script Outline'; desc = 'Input an idea to get a 4-part pacing and retention outline for your script.'; placeholder = 'e.g., Why Apple Magic Mouse is poorly designed'; action = 'Draft Outline';
        } else if (currentTool === 'thumbnail_brainstormer') {
            title = 'Thumbnail Brainstormer'; desc = 'Get 3 high-impact visual concepts based on viewer psychology.'; placeholder = 'e.g., How I survived 50 hours in Antarctica'; action = 'Brainstorm';
        } else if (currentTool === 'sponsor_pitch') {
            title = 'Sponsorship Pitch'; desc = 'Generate a tight, professional cold email outline to pitch a sponsor your latest concept.'; placeholder = 'e.g., A video reviewing the latest smart homes technology'; action = 'Draft Pitch';
        } else if (currentTool === 'faq_generator') {
            title = 'FAQ Generator'; desc = 'Find the 5 most un-answered questions around your topic that you can answer visually.'; placeholder = 'e.g., Setup instructions for an ergonomic chair'; action = 'Generate FAQs';
        } else if (currentTool === 'missing_topics') {
            title = 'Missing Topics Identifier'; desc = 'Enter your niche, and we will find trending topics your competitors have neglected.'; placeholder = 'e.g., Notion templates for students'; action = 'Find Opportunities';
        } else {
             title = 'Unknown'; desc = ''; placeholder = ''; action = 'Generate'; 
        }

        return (
            <div className="max-w-4xl mx-auto pb-12 px-4 sm:px-6">
                <button onClick={() => setCurrentTool('hub')} className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-emerald-700 transition-colors">
                    <ChevronLeft size={16} /> Back to Tools
                </button>
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
                    <p className="text-gray-500 mb-8 text-sm sm:text-base">{desc}</p>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Input</label>
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && input && !isGenerating) runTool(currentTool); }}
                                placeholder={placeholder}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-medium text-gray-800"
                            />
                        </div>
                        <button 
                            onClick={() => runTool(currentTool)}
                            disabled={!input || isGenerating}
                            className="w-full sm:w-auto px-6 py-3 bg-emerald-800 text-white font-bold rounded-xl hover:bg-emerald-900 disabled:opacity-50 transition-all"
                        >
                            {isGenerating ? 'Generating...' : action}
                        </button>

                        {output && (
                            <div className="pt-6 border-t border-gray-100 mt-6 animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex justify-between items-center mb-2">
                                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Output</label>
                                     <button onClick={() => handleCopy(output)} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                                         {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />} {copied ? 'Copied!' : 'Copy to Clipboard'}
                                     </button>
                                </div>
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium">
                                    <div className="markdown-body text-gray-700">
                                        <ReactMarkdown>{output}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return currentTool === 'hub' ? renderHub() : renderTool();
};
