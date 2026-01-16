
import React, { useState } from 'react';
import { Incident, ExhibitCategory } from '../types';
import { analyzeLegalForensics } from '../services/geminiService';
import { CATEGORY_COLORS } from '../constants';
import { 
  Search, 
  ShieldAlert, 
  MessageSquare, 
  Activity, 
  ArrowRight, 
  AlertCircle,
  FileSearch,
  CheckCircle2,
  Terminal
} from 'lucide-react';

interface ForensicsAnalysisProps {
  onConvertToExhibit: (incident: Incident) => void;
}

const ForensicsAnalysis: React.FC<ForensicsAnalysisProps> = ({ onConvertToExhibit }) => {
  const [inputText, setInputText] = useState('');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    try {
      const results = await analyzeLegalForensics(inputText);
      setIncidents(results as unknown as Incident[]);
    } catch (error) {
      console.error("Forensics Error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-slate-900 p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-4 uppercase italic tracking-tighter">
          <Terminal className="w-7 h-7 text-blue-500" />
          Forensic Data Ingestion
        </h3>
        <div className="relative group">
          <div className="absolute inset-0 bg-blue-600/5 blur-xl group-focus-within:bg-blue-600/10 transition-all rounded-[2rem]"></div>
          <textarea
            className="relative w-full h-64 p-8 bg-black border border-white/10 rounded-[2rem] focus:outline-none focus:border-blue-500/50 font-mono text-sm leading-relaxed text-slate-100 placeholder:text-slate-700 transition-all shadow-inner"
            placeholder="[ PASTE TEXT LOGS / WITNESS TRANSCRIPTS / EMAIL THREADS HERE ]"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>
        <div className="mt-6 flex justify-between items-center">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Protocol: Forensic_Extraction_v1</p>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !inputText.trim()}
            className="bg-blue-600 text-white px-10 py-5 rounded-[1.5rem] font-black flex items-center gap-3 hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/20 disabled:opacity-30 uppercase text-xs tracking-widest"
          >
            {isAnalyzing ? (
              <Activity className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            {isAnalyzing ? 'Analyzing Core Data...' : 'Execute Lab Scan'}
          </button>
        </div>
      </div>

      {incidents.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="font-black text-slate-400 uppercase tracking-[0.4em] text-[10px]">Extracted Evidence Fragments</h3>
            <span className="text-[10px] bg-slate-800 text-slate-400 font-black px-4 py-1 rounded-full">{incidents.length} NODES DETECTED</span>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {incidents.sort((a, b) => b.priority - a.priority).map((incident, idx) => (
              <div key={incident.id || idx} className="bg-slate-900 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl hover:border-blue-500/20 transition-all">
                <div className="flex flex-col md:flex-row">
                  {/* Left Priority Sidebar */}
                  <div className={`w-full md:w-2 ${incident.priority >= 8 ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)]' : incident.priority >= 5 ? 'bg-amber-500' : 'bg-blue-600'}`}></div>
                  
                  <div className="flex-1 p-8">
                    <div className="flex flex-wrap items-center justify-between gap-6 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-slate-950 rounded-xl text-[10px] font-black text-blue-500 border border-white/5 uppercase tracking-widest">
                          {incident.date}
                        </div>
                        <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border ${CATEGORY_COLORS[incident.category]}`}>
                          {incident.category}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                          <MessageSquare size={14} className="text-blue-600" />
                          Witness: <span className="text-slate-100">{incident.witness}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Priority</span>
                          <div className="w-32 h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-white/5">
                            <div 
                              className={`h-full rounded-full ${incident.priority >= 8 ? 'bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.4)]' : incident.priority >= 5 ? 'bg-amber-500' : 'bg-blue-600'}`}
                              style={{ width: `${incident.priority * 10}%` }}
                            ></div>
                          </div>
                        </div>
                        {incident.perjuryFlag && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-600/10 text-red-500 border border-red-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest animate-pulse">
                            <ShieldAlert size={12} />
                            Perjury Risk
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                      <div className="lg:col-span-3">
                        <div className="bg-slate-950 p-6 rounded-3xl border-l-4 border-blue-600/50">
                          <p className="text-sm text-slate-300 font-medium leading-relaxed italic">
                            "{incident.legalNarrative}"
                          </p>
                        </div>
                      </div>
                      <div className="flex items-end justify-end">
                        <button 
                          onClick={() => onConvertToExhibit(incident)}
                          className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-blue-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl active:scale-95"
                        >
                          <CheckCircle2 size={16} />
                          Secure to Record
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ForensicsAnalysis;
