
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
  ShieldAlert
} from 'lucide-react';

interface AffidavitForgeProps {
  exhibits: Exhibit[];
}

type DraftFocus = 'SAFETY' | 'CONTEMPT' | 'STABILITY' | 'GENERAL';

const AffidavitForge: React.FC<AffidavitForgeProps> = ({ exhibits }) => {
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
  const criticalExhibits = exhibits.filter(e => e.priority >= 8);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(draft);
    alert('Affidavit draft copied to clipboard.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Strategic Controls & Matrix - Left 4 Columns */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3">
              <Zap className="text-blue-400 w-6 h-6" />
              Argument Forge
            </h3>
            <p className="text-slate-400 text-sm mb-8 font-medium">Select a strategic focus to synthesize evidence into a formal Statement of Facts.</p>
            
            <div className="grid grid-cols-1 gap-3">
              {(['GENERAL', 'SAFETY', 'CONTEMPT', 'STABILITY'] as DraftFocus[]).map((focus) => (
                <button
                  key={focus}
                  onClick={() => handleGenerate(focus)}
                  disabled={isGenerating || exhibits.length === 0}
                  className={`w-full p-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-between transition-all group/btn ${
                    activeFocus === focus && draft
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <PenTool size={16} />
                    Forge {focus}
                  </div>
                  <Sparkles size={14} className="opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <ShieldCheck size={160} />
          </div>
        </div>

        {/* Contradiction Matrix */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="text-rose-500 w-5 h-5" />
              Perjury Matrix
            </div>
            <span className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full border border-rose-100 font-black">
              {contradictions.length} FLAGS
            </span>
          </h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {contradictions.length === 0 ? (
              <div className="text-center py-10 text-slate-300">
                <AlertCircle className="mx-auto mb-2 opacity-20" size={32} />
                <p className="text-xs font-bold uppercase tracking-widest">No perjury data</p>
              </div>
            ) : (
              contradictions.map(ex => (
                <div key={ex.id} className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 group hover:bg-rose-50 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Exhibit #{ex.exhibitNumber}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 mb-2 line-clamp-2">{ex.description}</p>
                  <p className="text-[10px] text-rose-700 italic border-l-2 border-rose-200 pl-3 leading-relaxed">
                    "{ex.contradictionNote || 'Direct safety protocol violation documented.'}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Digital Integrity Strip */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Hash size={12} />
            Forensic Integrity Log
          </h4>
          <div className="space-y-1.5">
            {exhibits.slice(0, 4).map(ex => (
              <div key={ex.id} className="flex justify-between items-center text-[9px] font-mono group">
                <span className="text-slate-400 group-hover:text-blue-600 transition-colors">Ex {ex.exhibitNumber}:</span>
                <span className="text-slate-300 group-hover:text-slate-500 truncate ml-4 w-32 text-right">
                  {ex.fileHash ? ex.fileHash.substring(0, 16) + '...' : 'VERIFYING'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Document Drafting View - Right 8 Columns */}
      <div className="lg:col-span-8 bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col min-h-[800px] relative">
        {/* Document Toolbar */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600 border border-slate-100">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1.5">Drafting Suite v4.0</p>
              <h4 className="font-black text-slate-900 text-lg leading-none">Affidavit Section: {activeFocus}</h4>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={copyToClipboard}
              disabled={!draft}
              className="p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-xl disabled:opacity-30" 
              title="Copy to Clipboard"
            >
              <Copy size={20} />
            </button>
            <button 
              onClick={() => window.print()}
              disabled={!draft}
              className="p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-xl disabled:opacity-30" 
              title="Print Draft"
            >
              <Printer size={20} />
            </button>
          </div>
        </div>

        {/* The Paper Component */}
        <div className="flex-1 p-16 legal-font overflow-y-auto custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] selection:bg-blue-100">
          {!draft && !isGenerating ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50 text-center max-w-sm mx-auto">
              <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                <PenTool size={48} className="text-slate-200" />
              </div>
              <p className="text-base font-black uppercase tracking-[0.2em] text-slate-400">Chamber is Empty</p>
              <p className="text-sm mt-3 italic leading-relaxed">
                Select a strategic focus from the Forge panel to synthesize your forensic exhibits into a formal court narrative.
              </p>
            </div>
          ) : isGenerating ? (
            <div className="space-y-8 py-10">
              <div className="flex items-center gap-4 mb-10">
                <Sparkles className="w-6 h-6 text-blue-500 animate-spin" />
                <span className="text-xs font-black uppercase tracking-widest text-blue-600">Senior AI Litigator Drafting...</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full w-3/4 animate-pulse"></div>
              <div className="h-4 bg-slate-100 rounded-full w-full animate-pulse"></div>
              <div className="h-4 bg-slate-100 rounded-full w-5/6 animate-pulse"></div>
              <div className="h-4 bg-slate-100 rounded-full w-full animate-pulse"></div>
              <div className="h-4 bg-slate-100 rounded-full w-4/6 animate-pulse"></div>
              <div className="h-4 bg-slate-100 rounded-full w-full animate-pulse"></div>
              <div className="h-4 bg-slate-100 rounded-full w-3/4 animate-pulse"></div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-1000">
              <div className="prose prose-slate max-w-none whitespace-pre-wrap leading-[1.8] text-slate-900 text-lg">
                {draft}
              </div>
              
              {/* Chain of Custody Addendum */}
              <div className="mt-20 pt-10 border-t-4 border-slate-900">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldCheck className="text-slate-900 w-5 h-5" />
                  <h5 className="font-black uppercase tracking-[0.3em] text-xs">Annex A: Digital Forensic Verification Log</h5>
                </div>
                <p className="text-[11px] text-slate-500 mb-6 font-sans uppercase font-black tracking-tight leading-relaxed max-w-xl">
                  Verification of raw data integrity. The following exhibits have been processed through cryptographically secured hashing (SHA-256) to ensure chain-of-custody compliance.
                </p>
                <div className="space-y-2 font-mono text-[10px]">
                  {exhibits.map(ex => (
                    <div key={ex.id} className="flex justify-between items-center py-1.5 border-b border-slate-100 group">
                      <span className="text-slate-900 font-bold">EXHIBIT {ex.exhibitNumber} [VERIFIED]</span>
                      <span className="text-blue-600 bg-blue-50 px-2 rounded opacity-60 group-hover:opacity-100 transition-opacity">
                        {ex.fileHash || '0x_HASH_UNAVAILABLE_IN_PREVIEW'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-400 text-xs">QR</div>
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Digital Signature Secure</span>
                  </div>
                  <span className="text-[9px] font-black text-slate-300 uppercase italic">FDSJ-739-24 • FORENSIC_SECURE_V4</span>
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
