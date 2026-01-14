
import React, { useState } from 'react';
import { Target, ShieldAlert, CheckCircle, Search, Grid, AlertCircle } from 'lucide-react';
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
    <div className="space-y-6 animate-in zoom-in-95 duration-500 pb-20">
      <div className="bg-rose-600 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-rose-500 p-3 rounded-2xl shadow-lg">
                 <Target className="w-8 h-8 text-rose-100" />
              </div>
              <h2 className="text-4xl font-black tracking-tighter">The Truth Sniper</h2>
            </div>
            <button 
              onClick={() => setShowHeatmap(!showHeatmap)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-white/20 transition-all"
            >
              {showHeatmap ? 'View Scanner' : 'View Heatmap Grid'}
            </button>
          </div>
          <p className="text-rose-100 font-medium text-lg max-w-2xl">
            Auto-detecting perjury by scanning Applicant filings against your verified forensics.
          </p>
        </div>
        <Target className="absolute -right-10 -bottom-10 w-80 h-80 text-white/10 rotate-12" />
      </div>

      {!showHeatmap ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input: The Statement under scrutiny */}
          <div className="space-y-4">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Target className="w-4 h-4 text-rose-500" />
                  Target Statement / Affidavit Text
                </label>
              </div>
              <textarea 
                className="w-full h-80 p-6 bg-slate-50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-rose-500/10 outline-none transition-all text-sm font-medium leading-relaxed custom-scrollbar"
                placeholder="Paste the Applicant's claim here..."
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
              />
              <button 
                onClick={handleAnalysis}
                disabled={isSnipping || !statement.trim()}
                className="w-full mt-6 bg-slate-900 text-white py-5 rounded-[2rem] font-black flex items-center justify-center gap-3 hover:bg-rose-600 transition-all shadow-xl disabled:opacity-50"
              >
                {isSnipping ? 'SCANNING FOR PERJURY...' : 'EXECUTE FORENSIC SCAN'}
              </button>
            </div>
          </div>

          {/* Output: The Forensic Report */}
          <div className="min-h-[500px] flex flex-col">
            {isSnipping ? (
              <div className="flex-1 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center animate-pulse">
                <Search className="w-10 h-10 text-slate-300 animate-bounce" />
                <p className="font-black text-slate-400 uppercase tracking-widest text-xs mt-4">Cross-Referencing Exhibits...</p>
              </div>
            ) : results ? (
              <div className="flex-1 bg-white p-10 rounded-[2.5rem] border-2 border-rose-100 shadow-2xl overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-3 text-rose-600 font-black uppercase tracking-[0.2em] text-xs mb-8">
                  <ShieldAlert className="w-5 h-5" />
                  Forensic Contradiction Report
                </div>
                <div className="prose prose-slate max-w-none whitespace-pre-wrap text-sm font-medium text-slate-800 leading-relaxed legal-font">
                  {results}
                </div>
              </div>
            ) : (
              <div className="flex-1 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300 p-16 text-center">
                <Target size={48} className="opacity-20 mb-4" />
                <p className="font-black uppercase tracking-[0.3em] text-xs">Sniper Scope Clear</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* PERJURY HEATMAP GRID */
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl p-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex items-center gap-3 mb-10">
            <Grid className="text-rose-500 w-6 h-6" />
            <h3 className="text-2xl font-black tracking-tighter uppercase">Credibility Destruction Matrix</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Exhibit Ref</th>
                  <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Truth (Evidence)</th>
                  <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Applicant Counter-Claim</th>
                  <th className="text-center p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {contradictions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">
                      No Perjury Flags Mapped to Matrix
                    </td>
                  </tr>
                ) : (
                  contradictions.map((ex) => (
                    <tr key={ex.id} className="hover:bg-rose-50/30 transition-colors group">
                      <td className="p-4">
                        <span className="font-mono text-xs font-black text-rose-500 bg-rose-50 px-2 py-1 rounded">
                          {ex.exhibitNumber}
                        </span>
                      </td>
                      <td className="p-4 max-w-xs">
                        <p className="text-sm font-bold text-slate-900 leading-tight">{ex.description}</p>
                      </td>
                      <td className="p-4">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 italic">
                          "{ex.contradictionNote || 'Contradicts safety protocol filing.'}"
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <AlertCircle className="w-5 h-5 text-rose-500" />
                          <span className="text-[9px] font-black text-rose-600 uppercase">Perjury: High</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-10 p-6 bg-slate-900 rounded-[2rem] text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
               <ShieldAlert className="text-rose-500 w-8 h-8" />
               <div>
                 <p className="font-black text-lg">Total Credibility Impact: CRITICAL</p>
                 <p className="text-xs text-slate-400 font-medium tracking-wide">Pattern of deceptive conduct identified across {contradictions.length} categories.</p>
               </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Matrix Hash</p>
              <p className="text-[10px] font-mono text-slate-600">0xSNIPER_{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TruthSniper;
