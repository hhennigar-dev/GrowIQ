
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { Video } from '../types';

interface SparringPartnerProps {
  channelData?: any;
  myVideos?: Video[];
}

export const SparringPartner: React.FC<SparringPartnerProps> = ({ channelData, myVideos }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: "Ready to analyze. What growth opportunities are we hunting today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState<string[]>([
    "Thinking...",
    "Formulating response...", 
    "Taking a look...",
  ]);

  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  const chatInstanceRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
       interval = setInterval(() => {
           setLoadingTextIndex(prev => (prev + 1) % loadingMessages.length);
       }, 1500);
    } else {
       setLoadingTextIndex(0);
    }
    return () => clearInterval(interval);
  }, [isLoading, loadingMessages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    
    // Determine context-aware status messages
    const lowerInput = userText.toLowerCase();
    if (lowerInput.length < 15 && !lowerInput.includes('analyze') && !lowerInput.includes('video')) {
        setLoadingMessages(["Thinking...", "Formulating response..."]);
    } else if (lowerInput.includes('competitor') || lowerInput.includes('channel') || lowerInput.includes('trend')) {
        setLoadingMessages(["Fetching YouTube channel signals...", "Mapping local trends...", "Cross-referencing channel data..."]);
    } else if (lowerInput.includes('idea') || lowerInput.includes('title') || lowerInput.includes('brainstorm')) {
        setLoadingMessages(["Brainstorming high-CTR concepts...", "Testing psychological hooks...", "Synthesizing viral titles..."]);
    } else {
        setLoadingMessages(["Analyzing YouTube data...", "Synthesizing strategy...", "Looking at market signals..."]);
    }

    setIsLoading(true);

    try {
      // Fix: Create new instance before making an API call to ensure latest key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      if (!chatInstanceRef.current) {
        let systemContext = "You are an elite YouTube Growth Sparring Partner. You specialize in 'outlier' detection, viral content mechanics, and retention optimization. Help the user brainstorm ideas and analyze trends based on data. Be concise, strategic, and direct.";
        if (channelData) {
           systemContext += `\nThe user's channel is ${channelData.title} with roughly ${channelData.subscriberCount || 'unknown'} subscribers and they have a total of ${channelData.totalViews || 'unknown'} channel views. Their channel link is ${channelData.customUrl || 'unknown'}.`;
        }
        if (myVideos && myVideos.length > 0) {
           const topVideos = myVideos.slice(0, 5).map(v => `- Title: "${v.title}" | Views: ${v.views} | Thumbnail: ${v.thumbnail_url}`).join('\n');
           systemContext += `\n\nRecent Channel Uploads:\n${topVideos}\n\nUse this data representing their recent videos, titles, and performance to give better context to their questions. Do not bring it up unless relevant or prompted.`;
        }
        systemContext += `\nCRITICAL: Do NOT hallucinate that you are running a channel yourself, exploring different niches on your own channel, or actively fetching live internet data. You are advising the user based on their context. Do not pretend to run scripts or API tools within your text responses. Always be clear about your role as an AI Sparring Partner.`;

        chatInstanceRef.current = ai.chats.create({
          model: 'gemini-2.5-pro',
          config: {
            systemInstruction: systemContext,
          },
        });
      }

      const response: GenerateContentResponse = await chatInstanceRef.current.sendMessage({ message: userText });
      const responseText = response.text;
      
      if (responseText) {
        setMessages(prev => [...prev, { role: 'model', text: responseText }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I've encountered a logic loop. Please try again or reset our context." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    chatInstanceRef.current = null;
    setMessages([{ role: 'model', text: "Ready to analyze. What growth opportunities are we hunting today?" }]);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <Bot size={24} />
            </div>
            <div>
                <h3 className="font-bold text-gray-900">Sparring Partner</h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    Online • Gemini Powered
                </div>
            </div>
        </div>
        <button 
          onClick={handleReset}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-white transition-colors"
        >
            Reset Context
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'max-w-3xl'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
              msg.role === 'model' ? 'bg-emerald-100 text-emerald-600' : 'bg-white border border-emerald-100 overflow-hidden'
            }`}>
              {msg.role === 'model' ? <Bot size={16} /> : (
                 channelData?.thumbnail ? (
                   <img src={channelData.thumbnail} className="w-full h-full object-cover shadow-sm bg-white" />
                 ) : (
                   <div className="w-full h-full bg-emerald-800 flex items-center justify-center text-white text-[10px] font-bold">
                     ME
                   </div>
                 )
              )}
            </div>
            <div className={`p-4 rounded-2xl text-sm leading-relaxed border overflow-hidden break-words ${
              msg.role === 'model' 
                ? 'bg-gray-50 rounded-tl-none text-gray-700 border-gray-100 markdown-body' 
                : 'bg-emerald-800 text-white border-emerald-900 rounded-tr-none'
            }`}>
              {msg.role === 'model' ? <ReactMarkdown>{msg.text}</ReactMarkdown> : <span className="whitespace-pre-wrap">{msg.text}</span>}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 max-w-2xl">
            <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 mt-1">
              <Bot size={16} className="animate-pulse" />
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none border border-gray-100 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-gray-400" />
              <span className="text-xs text-gray-400 font-medium italic">{loadingMessages[loadingTextIndex]}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-100">
        <div className="relative">
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={isLoading}
                placeholder="Ask about trends, outliers, or ideas..."
                className="w-full pl-4 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm disabled:opacity-50"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                input.trim() && !isLoading ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-md shadow-emerald-200' : 'bg-gray-300 text-white cursor-not-allowed'
              }`}
            >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-2">AI can make mistakes. Verify important information.</p>
      </div>

    </div>
  );
};
