
import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, Loader2, Minimize2, Maximize2, Terminal, Activity, Zap } from 'lucide-react';
import { chatWithGemini } from '../services/geminiService';
import { Exhibit } from '../types';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

interface LegalChatbotProps {
  exhibits: Exhibit[];
}

const LegalChatbot: React.FC<LegalChatbotProps> = ({ exhibits }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: "SYSTEM_ACTIVE // FDSJ-739-24 core engaged. State your tactical query." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const context = exhibits.map(e => `[${e.exhibitNumber}] ${e.description} (${e.category}) - ${e.legalRelevance}`).join('\n');
      const response = await chatWithGemini(userMsg, context);
      setMessages(prev => [...prev, { role: 'bot', content: response || "ERROR: RESPONSE_NULL. RETRYING..." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'bot', content: "CORE_FAILURE: UNABLE_TO_SYNTHESIZE_STRATEGY." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-10 right-10 bg-blue-600 text-white p-5 rounded-[2.5rem] shadow-[0_0_50px_rgba(37,99,235,0.5)] hover:bg-blue-500 transition-all flex items-center gap-4 z-50 group hover:scale-110 active:scale-95 duration-500 border border-white/20"
      >
        <div className="relative">
          <Bot size={28} className="group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-4 border-blue-600 animate-pulse"></div>
        </div>
        <span className="font-black text-xs uppercase tracking-[0.3em]">Core Console</span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-10 right-10 w-[460px] bg-black border border-white/10 rounded-[3.5rem] shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col z-50 transition-all duration-700 overflow-hidden ${isMinimized ? 'h-24' : 'h-[700px]'}`}>
      {/* Header - Terminal Style */}
      <div className="bg-slate-900/80 p-8 flex items-center justify-between border-b border-white/5 backdrop-blur-2xl">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-blue-600/20 rounded-[1.5rem] border border-blue-600/30">
            <Terminal className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">PLACED // CORE</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            </div>
            <h4 className="text-lg font-black text-white uppercase tracking-tighter italic mt-1">Pro-Counsel v1.0.4</h4>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-3 hover:bg-white/10 rounded-2xl transition-all">
            {isMinimized ? <Maximize2 size={18} className="text-slate-400" /> : <Minimize2 size={18} className="text-slate-400" />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all">
            <X size={18} className="text-slate-400" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat Feed - Deep Dark, Max Contrast */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 bg-black custom-scrollbar selection:bg-blue-600/50">
            <div className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] mb-6">
               <Activity size={12} className="text-blue-500/50" />
               E2E Encryption: Verified • Node ID: FDSJ-739
            </div>

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[92%] p-7 rounded-[2.5rem] text-sm leading-relaxed transition-all shadow-2xl ${
                  msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-600/20' 
                  : 'bg-slate-900/50 text-slate-100 border border-white/10 rounded-tl-none font-mono text-[14px] italic'
                }`}>
                  <div className="flex items-center gap-3 mb-4 opacity-40">
                    {msg.role === 'user' ? <User size={14} /> : <Zap size={14} className="text-blue-400 fill-blue-400" />}
                    <span className="uppercase tracking-[0.3em] font-black text-[9px]">
                      {msg.role === 'user' ? 'LITIGANT_TERMINAL' : 'CORE_STRATEGIST'}
                    </span>
                  </div>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-900/30 border border-white/5 p-6 rounded-[2.5rem] rounded-tl-none shadow-xl">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-300"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input - High Tech Command Line */}
          <div className="p-8 border-t border-white/5 bg-slate-900/20">
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-600/5 blur-2xl group-focus-within:bg-blue-600/15 transition-all rounded-[2rem]"></div>
              <input 
                type="text" 
                placeholder="[ ENTER COMMAND OR TACTICAL QUERY ]"
                className="relative w-full pl-8 pr-16 py-6 bg-black border border-white/10 rounded-[2rem] focus:outline-none focus:border-blue-500/50 text-xs font-black tracking-[0.2em] text-white placeholder:text-slate-800 transition-all shadow-inner uppercase"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 disabled:opacity-30 transition-all shadow-2xl active:scale-90"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="mt-5 flex justify-between items-center px-4">
               <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em]">Vault_Sync: 100% Secure</span>
               <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em]">Protocol: NB_FSA_v4.2</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LegalChatbot;
