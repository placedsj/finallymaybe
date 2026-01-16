
import React, { useState } from 'react';
import { Exhibit } from '../types';
import { generateAffidavitDraft } from '../services/geminiService';
import { 
  PenTool, 
  FileText, 
  Sparkles, 
  Copy, 
  Printer, 
  ShieldCheck, 
  AlertCircle,
  Hash,
  Download,
  Zap,
  ShieldAlert,
  Save
} from 'lucide-react';

interface AffidavitForgeProps {
  exhibits: Exhibit[];
  onCommit?: (draft: string) => void;
}

type DraftFocus = 'SAFETY' | 'CONTEMPT' | 'STABILITY' | 'GENERAL';

const AffidavitForge: React.FC<AffidavitForgeProps> = ({ exhibits, onCommit }) => {
  const [draft, setDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeFocus, setActiveFocus] = useState<DraftFocus>('GENERAL');

  const handleGenerate = async (focus: DraftFocus) => {
    setActiveFocus(focus);
    setIsGenerating(true);
    try {
      const result = await generateAffidavitDraft(exhibits, focus);
      setDraft(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const contradictions = exhibits.filter(e => e.contradictionNote || e.perjuryFlag);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(draft);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Strategic Controls - Left 4 Columns */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group border border-white/10">
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-6 flex items-center gap-4 uppercase italic tracking-tighter">
              <Zap className="text-blue-500 w-7 h-7" />
              Argument Forge
            </h3>
            <p className="text-slate-400 text-sm mb-10 font-medium leading-relaxed">Select a strategic focus to synthesize evidence into a formal Statement of Facts.</p>
            
            <div className="grid grid-cols-1 gap-4">
              {(['GENERAL', 'SAFETY', 'CONTEMPT', 'STABILITY'] as DraftFocus[]).map((focus) => (
                <button
                  key={focus}
                  onClick={() => handleGenerate(focus)}
                  disabled={isGenerating || exhibits.length === 0}
                  className={`w-full p-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-between transition-all group/btn border-2 ${
                    activeFocus === focus && draft
                    ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/30'
                    : 'bg-slate-950 border-white/5 text-slate-500 hover:bg-slate-800 hover:text-white hover:border-blue-500/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <PenTool size={18} />
                    {focus}
                  </div>
                  <Sparkles size={16} className="opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <ShieldCheck size={200} />
          </div>
        </div>

        {/* Perjury Matrix */}
        <div className="bg-slate-900 p-10 rounded-[3rem] border border-white/10 shadow-2xl">
          <h3 className="text-xl font-black text-white mb-8 flex items-center justify-between uppercase italic tracking-tighter">
            <div className="flex items-center gap-3">
              <ShieldAlert className="text-red-500 w-6 h-6" />
              Perjury Matrix
            </div>
            <span className="text-[10px] bg-red-600 text-white px-3 py-1 rounded-full font-black tracking-widest">
              {contradictions.length} FLAGS
            </span>
          </h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {contradictions.length === 0 ? (
              <div className="text-center py-16 text-slate-700">
                <AlertCircle className="mx-auto mb-4 opacity-20" size={48} />
                <p className="text-xs font-black uppercase tracking-[0.4em]">No perjury data</p>
              </div>
            ) : (
              contradictions.map(ex => (
                <div key={ex.id} className="p-6 bg-black rounded-3xl border border-white/5 group hover:border-red-500/30 transition-all">
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block mb-2">Exhibit #{ex.exhibitNumber}</span>
                  <p className="text-sm font-black text-slate-100 mb-3 leading-tight group-hover:text-white">{ex.description}</p>
                  <p className="text-xs text-slate-400 italic border-l-2 border-red-500/50 pl-5 leading-relaxed">
                    "{ex.contradictionNote || 'Direct safety protocol violation documented.'}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Document Drafting View - Right 8 Columns */}
      <div className="lg:col-span-8 bg-slate-900 rounded-[3.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col min-h-[900px] relative">
        {/* Document Toolbar */}
        <div className="p-8 border-b border-white/10 bg-slate-950/50 flex items-center justify-between sticky top-0 z-20 backdrop-blur-xl">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-600/10 rounded-2xl border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-inner">
              <FileText size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Drafting Suite v4.0</p>
              <h4 className="font-black text-white text-xl uppercase tracking-tighter italic">Affidavit: {activeFocus}</h4>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {onCommit && draft && (
              <button 
                onClick={() => onCommit(draft)}
                className="flex items-center gap-3 px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg active:scale-95"
              >
                <Save size={16} />
                Commit to Record
              </button>
            )}
            <button 
              onClick={copyToClipboard}
              disabled={!draft}
              className="p-4 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all rounded-2xl disabled:opacity-20 shadow-lg" 
              title="Copy to Clipboard"
            >
              <Copy size={20} />
            </button>
            <button 
              onClick={() => window.print()}
              disabled={!draft}
              className="p-4 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all rounded-2xl disabled:opacity-20 shadow-lg" 
              title="Print Draft"
            >
              <Printer size={20} />
            </button>
          </div>
        </div>

        {/* The Drafting Floor */}
        <div className="flex-1 p-16 legal-font overflow-y-auto custom-scrollbar bg-black/30 selection:bg-blue-600/50">
          {!draft && !isGenerating ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-8">
              <div className="w-28 h-28 rounded-[2.5rem] bg-slate-950 flex items-center justify-center border border-white/10 shadow-inner">
                <PenTool size={48} className="text-slate-800" />
              </div>
              <div className="space-y-4">
                <p className="text-xl font-black uppercase tracking-[0.3em] text-slate-500 italic">Chamber is Empty</p>
                <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                  Select a strategic focus to synthesize your forensic record into a clinical judicial narrative.
                </p>
              </div>
            </div>
          ) : isGenerating ? (
            <div className="space-y-12 py-10">
              <div className="flex items-center gap-6 mb-16">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-black uppercase tracking-[0.4em] text-blue-500 animate-pulse">Engaging AI Litigator // Synthesizing Node Data</span>
              </div>
              <div className="space-y-6">
                <div className="h-5 bg-slate-800 rounded-full w-3/4 animate-pulse"></div>
                <div className="h-5 bg-slate-800 rounded-full w-full animate-pulse"></div>
                <div className="h-5 bg-slate-800 rounded-full w-5/6 animate-pulse"></div>
                <div className="h-5 bg-slate-800 rounded-full w-full animate-pulse"></div>
                <div className="h-5 bg-slate-800 rounded-full w-4/6 animate-pulse"></div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-1000">
              <div className="prose prose-invert max-w-none whitespace-pre-wrap leading-[2] text-slate-100 text-lg font-medium selection:bg-blue-600/30">
                {draft}
              </div>
              
              {/* Addendum */}
              <div className="mt-24 pt-12 border-t-4 border-white/10">
                <div className="flex items-center gap-4 mb-8">
                  <ShieldCheck className="text-blue-500 w-6 h-6" />
                  <h5 className="font-black uppercase tracking-[0.5em] text-xs text-white">Forensic Verification Addendum</h5>
                </div>
                <p className="text-xs text-slate-500 mb-10 font-bold uppercase tracking-widest leading-relaxed max-w-2xl">
                  Digital integrity log: All cited exhibits have been processed through SHA-256 verification and secured via the PLACED // CORE vault protocol.
                </p>
                <div className="space-y-3 font-mono text-[11px]">
                  {exhibits.map(ex => (
                    <div key={ex.id} className="flex justify-between items-center py-3 border-b border-white/5 group hover:bg-white/[0.02] px-4 rounded-xl transition-all">
                      <span className="text-slate-200 font-black">EXHIBIT {ex.exhibitNumber} [SECURED]</span>
                      <span className="text-blue-400 font-mono opacity-60 group-hover:opacity-100 transition-opacity">
                        {ex.fileHash || '0x_HASH_UNAVAILABLE_IN_PREVIEW'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-16 flex items-center justify-between border-t border-white/5 pt-10">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center font-black text-slate-600 text-xs">HASH</div>
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Protocol: NB_FSA_v4.2_SECURE</span>
                  </div>
                  <span className="text-[9px] font-black text-slate-700 uppercase italic">SYSTEM REF: FDSJ-739-24</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AffidavitForge;
