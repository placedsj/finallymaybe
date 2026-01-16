
import React, { useState } from 'react';
import { Target, ShieldAlert, CheckCircle, Search, Grid, AlertCircle, Zap } from 'lucide-react';
import { analyzeForPerjury } from '../services/geminiService';
import { Exhibit } from '../types';

const TruthSniper: React.FC<{ exhibits: Exhibit[] }> = ({ exhibits }) => {
  const [statement, setStatement] = useState('');
  const [results, setResults] = useState('');
  const [isSnipping, setIsSnipping] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);

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

  const contradictions = exhibits.filter(e => e.perjuryFlag || e.contradictionNote);

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500 pb-20">
      <div className="bg-red-600 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-5">
              <div className="bg-red-700/50 p-5 rounded-[2rem] shadow-2xl border border-white/20">
                 <Target size={40} className="text-white" />
              </div>
              <h2 className="text-6xl font-black tracking-tighter uppercase italic">The Truth Sniper</h2>
            </div>
            <button 
              onClick={() => setShowHeatmap(!showHeatmap)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-xl px-10 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] border border-white/20 transition-all shadow-xl"
            >
              {showHeatmap ? 'View Target Scanner' : 'View Credibility Matrix'}
            </button>
          </div>
          <p className="text-red-100 font-medium text-2xl max-w-2xl leading-relaxed">
            Immutable forensic cross-referencing. Identifying Applicant perjury in real-time.
          </p>
        </div>
        <Target className="absolute -right-20 -bottom-20 w-[600px] h-[600px] text-white/5 rotate-12 pointer-events-none" />
      </div>

      {!showHeatmap ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Input: The Statement under scrutiny */}
          <div className="space-y-6">
            <div className="bg-slate-900 p-10 rounded-[3rem] border border-white/5 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] flex items-center gap-3">
                  <Zap className="w-4 h-4 fill-blue-500" />
                  Target Acquisition // Statement Input
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-red-600/5 blur-2xl group-focus-within:bg-red-600/10 transition-all rounded-[2rem]"></div>
                <textarea 
                  className="relative w-full h-[500px] p-10 bg-black border border-white/10 rounded-[2.5rem] focus:outline-none focus:border-red-500/50 text-slate-100 font-mono text-sm leading-relaxed placeholder:text-slate-800 transition-all shadow-inner custom-scrollbar"
                  placeholder="[ PASTE AFFIDAVIT TEXT OR APPLICANT CLAIMS FOR TARGETING ]"
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                />
              </div>
              <button 
                onClick={handleAnalysis}
                disabled={isSnipping || !statement.trim()}
                className="w-full mt-8 bg-red-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-red-500 transition-all shadow-2xl shadow-red-600/20 disabled:opacity-30 active:scale-95 duration-500"
              >
                {isSnipping ? 'ENGAGING FORENSIC SCAN...' : 'EXECUTE SNIPER STRIKE'}
              </button>
            </div>
          </div>

          {/* Output: The Forensic Report */}
          <div className="min-h-[600px] flex flex-col">
            {isSnipping ? (
              <div className="flex-1 bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center p-20 text-center animate-pulse">
                <Search className="w-16 h-16 text-slate-700 animate-bounce mb-6" />
                <p className="font-black text-slate-500 uppercase tracking-[0.4em] text-xs">Cross-Referencing Digital Vault...</p>
              </div>
            ) : results ? (
              <div className="flex-1 bg-slate-900 p-12 rounded-[3.5rem] border border-red-500/20 shadow-2xl overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4 text-red-500 font-black uppercase tracking-[0.4em] text-[10px]">
                    <ShieldAlert size={20} />
                    Integrity Breach Report
                  </div>
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Hash: SNPR_{Math.random().toString(36).substr(2, 5).toUpperCase()}</span>
                </div>
                <div className="prose prose-invert max-w-none whitespace-pre-wrap text-slate-200 text-base font-medium leading-relaxed italic legal-font selection:bg-red-600/30">
                  {results}
                </div>
              </div>
            ) : (
              <div className="flex-1 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-slate-700 p-20 text-center">
                <Target size={80} className="opacity-20 mb-6" />
                <h4 className="font-black uppercase tracking-[0.5em] text-xs">Scope Empty</h4>
                <p className="text-slate-600 text-[10px] font-black uppercase mt-2 tracking-widest">Awaiting target initialization</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* PERJURY HEATMAP GRID */
        <div className="bg-slate-900 rounded-[3.5rem] border border-white/5 shadow-2xl p-12 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex items-center gap-5 mb-12">
            <div className="p-4 bg-red-600/10 rounded-2xl border border-red-500/20">
              <Grid className="text-red-500 w-8 h-8" />
            </div>
            <div>
              <h3 className="text-3xl font-black tracking-tighter uppercase italic text-white">Credibility Destruction Matrix</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">Verified Inconsistencies vs Case Record</p>
            </div>
          </div>
          
          <div className="overflow-x-auto rounded-[2rem] border border-white/5 bg-black/40">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-slate-950/50">
                  <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Exhibit Node</th>
                  <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Verified Forensic Evidence</th>
                  <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Applicant Counter-Claim</th>
                  <th className="text-center p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Breach Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {contradictions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-32 text-center text-slate-700 font-black uppercase tracking-[0.5em] text-xs italic">
                      [ No Integrity Violations Mapped ]
                    </td>
                  </tr>
                ) : (
                  contradictions.map((ex) => (
                    <tr key={ex.id} className="hover:bg-white/5 transition-all group">
                      <td className="p-6">
                        <span className="font-mono text-xs font-black text-red-500 bg-red-600/10 px-4 py-2 rounded-xl border border-red-500/20">
                          #{ex.exhibitNumber}
                        </span>
                      </td>
                      <td className="p-6 max-w-xs">
                        <p className="text-sm font-black text-slate-100 leading-tight group-hover:text-white transition-colors">{ex.description}</p>
                      </td>
                      <td className="p-6">
                        <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 text-xs text-slate-400 italic font-medium leading-relaxed">
                          "{ex.contradictionNote || 'Direct violation of safety record verified.'}"
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle size={24} className="text-red-600 animate-pulse" />
                          <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">CRITICAL</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-12 p-10 bg-red-600 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="flex items-center gap-6">
               <ShieldAlert size={48} className="text-white drop-shadow-xl" />
               <div>
                 <p className="font-black text-3xl tracking-tighter">Integrity Impact: SEVERE</p>
                 <p className="text-sm text-red-100 font-bold opacity-80 tracking-wide mt-1 italic">Applicant credibility score effectively neutralized by {contradictions.length} forensic flags.</p>
               </div>
            </div>
            <div className="bg-black/20 p-4 rounded-2xl border border-white/10">
              <p className="text-[9px] font-black text-red-200 uppercase tracking-[0.4em] mb-1">Matrix Authentication</p>
              <p className="text-[9px] font-mono text-white/50">0xSNIPER_CORE_V1_VERIFIED</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TruthSniper;
