
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2, Minimize2, Maximize2 } from 'lucide-react';
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
    { role: 'bot', content: "Pro-Counsel active. How can I assist with Case FDSJ-739-2024 today?" }
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
      setMessages(prev => [...prev, { role: 'bot', content: response || "I encountered an error processing that request." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'bot', content: "Communication error with Senior Counsel node." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-2xl shadow-2xl hover:bg-blue-700 transition-all flex items-center gap-2 z-50 animate-bounce"
        aria-label="Ask Pro-Counsel"
      >
        <Bot className="w-6 h-6" />
        <span className="font-bold">Ask Pro-Counsel</span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col z-50 transition-all overflow-hidden ${isMinimized ? 'h-16' : 'h-[600px]'}`}>
      <div className="bg-slate-900 p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-black text-xs uppercase tracking-widest">Pro-Counsel AI</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}>
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" aria-label="Close chat">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}>
                  <div className="flex items-center gap-1 mb-1 opacity-60">
                    {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    <span className="uppercase tracking-tighter font-black text-[10px]">
                      {msg.role === 'user' ? 'Counsel' : 'Pro-Counsel'}
                    </span>
                  </div>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 bg-white">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Type your question..."
                className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-xs font-medium transition-all"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[9px] text-slate-400 mt-2 text-center font-bold uppercase tracking-tighter">AI consultation may require human verification</p>
          </div>
        </>
      )}
    </div>
  );
};

export default LegalChatbot;
