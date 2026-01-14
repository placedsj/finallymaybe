
import React, { useState } from 'react';
import { Target, ShieldAlert, CheckCircle, Search } from 'lucide-react';
import { analyzeForPerjury } from '../services/geminiService';
import { Exhibit } from '../types';

const TruthSniper: React.FC<{ exhibits: Exhibit[] }> = ({ exhibits }) => {
  const [statement, setStatement] = useState('');
  const [results, setResults] = useState('');
  const [isSnipping, setIsSnipping] = useState(false);

  const handleAnalysis = async () => {
    if (!statement.trim()) return;
    setIsSnipping(true);
    try {
      const analysis = await analyzeForPerjury(statement, exhibits);
      setResults(analysis || "No direct contradictions found with current evidence.");
    } catch (err) {
      console.error(err);
      setResults("Forensic scan failed. Please check connectivity.");
    } finally {
      setIsSnipping(false);
    }
  };

  return (
    <div className="space-y-6 animate-in zoom-in-95 duration-500 pb-20">
      <div className="bg-rose-600 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-rose-500 p-3 rounded-2xl shadow-lg">
               <Target className="w-8 h-8 text-rose-100" />
            </div>
            <h2 className="text-4xl font-black tracking-tighter">The Truth Sniper</h2>
          </div>
          <p className="text-rose-100 font-medium text-lg max-w-2xl">
            Automatically identifying direct contradictions and perjury risks in Applicant filings by cross-referencing your verified forensic database.
          </p>
        </div>
        <Target className="absolute -right-10 -bottom-10 w-80 h-80 text-white/10 rotate-12" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input: The Statement under scrutiny */}
        <div className="space-y-4">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-500" />
                Target Statement / Affidavit Text
              </label>
              <span className="text-[10px] font-bold text-slate-300">Case FDSJ-739-24</span>
            </div>
            <textarea 
              className="w-full h-80 p-6 bg-slate-50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-rose-500/10 outline-none transition-all text-sm font-medium leading-relaxed custom-scrollbar"
              placeholder="Paste her affidavit text, Facebook claims, or message logs here (e.g., 'I have never used drugs around Harper' or 'Craig is violent')..."
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
            />
            <button 
              onClick={handleAnalysis}
              disabled={isSnipping || !statement.trim()}
              className="w-full mt-6 bg-slate-900 text-white py-5 rounded-[2rem] font-black flex items-center justify-center gap-3 hover:bg-rose-600 transition-all shadow-xl hover:shadow-rose-600/20 disabled:opacity-50 active:scale-95 transform"
            >
              {isSnipping ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                  <span className="tracking-widest uppercase text-xs">Scanning for Perjury...</span>
                </div>
              ) : (
                <>
                  <Target size={20} />
                  Execute Forensic Scan
                </>
              )}
            </button>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 flex items-center gap-4">
             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100">
               <ShieldAlert size={20} />
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Database Context</p>
               <p className="text-xs font-bold text-slate-700">Scanning {exhibits.length} Verified Exhibits for Contradictions</p>
             </div>
          </div>
        </div>

        {/* Output: The Forensic Report */}
        <div className="min-h-[500px] flex flex-col">
          {isSnipping ? (
            <div className="flex-1 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center animate-pulse">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                 <Search className="w-10 h-10 text-slate-300 animate-bounce" />
              </div>
              <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Cross-Referencing Exhibits...</p>
            </div>
          ) : results ? (
            <div className="flex-1 bg-white p-10 rounded-[2.5rem] border-2 border-rose-100 shadow-2xl relative overflow-hidden overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-8 sticky top-0 bg-white/80 backdrop-blur-md pb-4 border-b border-rose-50">
                <div className="flex items-center gap-3 text-rose-600 font-black uppercase tracking-[0.2em] text-xs">
                  <ShieldAlert className="w-5 h-5" />
                  Forensic Contradiction Report
                </div>
                <button 
                   onClick={() => window.print()}
                   className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                   <CheckCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="prose prose-slate max-w-none whitespace-pre-wrap text-sm font-medium text-slate-800 leading-relaxed legal-font">
                {results}
              </div>
              <div className="mt-12 pt-6 border-t border-rose-100 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] flex justify-between">
                 <span>Report Hash: {Math.random().toString(36).substring(7)}</span>
                 <span>Case FDSJ-739-24 Forensic</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300 p-16 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                 <Target size={48} className="opacity-20" />
              </div>
              <p className="font-black uppercase tracking-[0.3em] text-xs mb-2">Sniper Scope is Clear</p>
              <p className="text-sm font-medium italic max-w-xs">
                Paste an Applicant statement in the target panel to identify lies contradicted by verified evidence.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TruthSniper;
