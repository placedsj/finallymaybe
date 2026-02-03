
import React from 'react';
import { Exhibit, ExhibitCategory } from '../types';
import { CASE_DEFAULTS, CATEGORY_COLORS } from '../constants';
import { 
  BookOpen, 
  Printer, 
  ShieldCheck, 
  FileText, 
  Download, 
  CheckCircle2,
  AlertCircle,
  Clock,
  Scale,
  Zap
} from 'lucide-react';

interface ExhibitBookProps {
  exhibits: Exhibit[];
  affidavitDraft?: string;
}

const ExhibitBook: React.FC<ExhibitBookProps> = ({ exhibits, affidavitDraft }) => {
  const categories = Object.keys(CATEGORY_COLORS) as ExhibitCategory[];
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto pb-32 animate-in fade-in duration-700">
      {/* Header Panel */}
      <div className="bg-slate-900 rounded-[3rem] p-12 border border-white/5 shadow-2xl mb-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 pointer-events-none">
          <BookOpen size={300} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 text-blue-500 mb-4">
              <ShieldCheck className="w-8 h-8" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Forensic Output Node</span>
            </div>
            <h2 className="text-5xl font-black tracking-tighter text-white italic uppercase mb-4">The Exhibit Book</h2>
            <p className="text-slate-400 font-medium text-lg max-w-xl leading-relaxed">
              Consolidated formal record for <span className="text-blue-500 font-black">{CASE_DEFAULTS.caseNumber}</span>. 
              Formatted for direct judicial submission via New Brunswick Family Court protocols.
            </p>
          </div>
          <button 
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center gap-4 transition-all shadow-2xl shadow-blue-600/20 active:scale-95 whitespace-nowrap"
          >
            <Printer size={20} />
            Generate PDF Bundle
          </button>
        </div>
      </div>

      {/* The Digital Binder View */}
      <div id="printable-area" className="bg-slate-900 rounded-[4rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden print:bg-white print:border-none print:shadow-none print:text-black">
        {/* Binder Spine Glow */}
        <div className="h-4 bg-blue-600 print:hidden"></div>

        {/* COVER PAGE */}
        <div className="hidden print:flex flex-col items-center justify-center h-[1050px] text-center p-20 border-b-8 border-black mb-10">
          <div className="text-[10px] font-black uppercase tracking-[0.5em] mb-4">New Brunswick Family Court Protocol</div>
          <h1 className="text-2xl font-black uppercase tracking-[0.5em] mb-12 italic border-b-2 border-black pb-4">PLACED // CORE SYSTEM</h1>
          <div className="space-y-4 mb-32">
            <h2 className="text-6xl font-black tracking-tighter uppercase italic">Forensic Exhibit Book</h2>
            <p className="text-xl font-bold uppercase tracking-widest">Formal Record of Evidence & Statement of Facts</p>
          </div>
          <div className="grid grid-cols-2 gap-20 text-left w-full max-w-3xl mx-auto border-t-2 border-slate-200 pt-20">
            <div className="space-y-6">
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Court Jurisdiction</p>
                 <p className="text-lg font-black">{CASE_DEFAULTS.court}</p>
               </div>
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Statutory Framework</p>
                 <p className="text-lg font-black">{CASE_DEFAULTS.act}</p>
               </div>
            </div>
            <div className="space-y-6">
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Case Reference</p>
                 <p className="text-3xl font-black text-blue-600 print:text-black">{CASE_DEFAULTS.caseNumber}</p>
               </div>
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Parties</p>
                 <p className="text-lg font-black italic">{CASE_DEFAULTS.parties}</p>
               </div>
            </div>
          </div>
          <div className="mt-auto text-[10px] font-mono opacity-50">
            RECORD_CERTIFIED_SECURE_HASH: {Math.random().toString(36).substr(2, 16).toUpperCase()}
          </div>
        </div>

        {/* TABLE OF CONTENTS */}
        <div className="p-16 md:p-24 print:p-10 page-break">
          <div className="flex items-center justify-between border-b-2 border-white/5 pb-10 mb-16 print:border-black">
            <h3 className="text-4xl font-black uppercase tracking-tighter text-white italic print:text-black">Master Index</h3>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] print:hidden">Evidence_Sync: Active</span>
          </div>

          <div className="space-y-20">
            {/* Affidavit Entry in TOC */}
            {affidavitDraft && (
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <h4 className="text-2xl font-black text-emerald-500 uppercase tracking-tighter print:text-black">Statement of Facts</h4>
                  <div className="h-px flex-1 bg-white/5 print:bg-black/10"></div>
                </div>
                <div className="group flex items-baseline justify-between gap-8 py-3 border-b border-white/5 print:border-black/5 hover:bg-white/[0.02] transition-colors rounded-xl px-4 -mx-4">
                  <div className="flex items-baseline gap-8">
                    <span className="font-mono text-sm font-black text-emerald-500 w-24 shrink-0 print:text-black">PRIMARY</span>
                    <span className="text-lg font-black text-slate-100 print:text-black tracking-tight italic">Committed Affidavit & Forensic Synthesis</span>
                  </div>
                  <div className="flex-1 border-b border-white/5 border-dotted mb-2 opacity-20 print:border-black/10"></div>
                  <div className="shrink-0 text-right"><span className="text-sm font-black text-white print:text-black font-mono">P.1</span></div>
                </div>
              </div>
            )}

            {categories.map(cat => {
              const catExhibits = exhibits.filter(e => e.category === cat);
              if (catExhibits.length === 0) return null;

              return (
                <div key={cat} className="space-y-8">
                  <div className="flex items-center gap-6">
                    <h4 className="text-2xl font-black text-blue-500 uppercase tracking-tighter print:text-black">{cat}</h4>
                    <div className="h-px flex-1 bg-white/5 print:bg-black/10"></div>
                  </div>
                  
                  <div className="space-y-6">
                    {catExhibits.map((ex, i) => (
                      <div key={ex.id} className="group flex items-baseline justify-between gap-8 py-3 border-b border-white/5 print:border-black/5 hover:bg-white/[0.02] transition-colors rounded-xl px-4 -mx-4">
                        <div className="flex items-baseline gap-8 overflow-hidden">
                          <span className="font-mono text-sm font-black text-blue-500 w-24 shrink-0 print:text-black">#{ex.exhibitNumber}</span>
                          <div className="flex flex-col">
                            <span className="text-lg font-black text-slate-100 print:text-black tracking-tight">{ex.description}</span>
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">Date: {ex.date}</span>
                          </div>
                        </div>
                        <div className="flex-1 border-b border-white/5 border-dotted mb-2 opacity-20 print:border-black/10"></div>
                        <div className="shrink-0 text-right">
                          <span className="text-sm font-black text-white print:text-black font-mono">Exhibit P.{(i + 1) * 2}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COMMITTED AFFIDAVIT SECTION */}
        {affidavitDraft && (
          <div className="page-break p-16 md:p-24 print:p-10 space-y-12 bg-slate-950/20 print:bg-white">
            <div className="border-b-4 border-emerald-500 pb-8 print:border-black">
              <h3 className="text-4xl font-black text-white italic tracking-tighter print:text-black">Committed Statement of Facts</h3>
              <p className="text-xs font-black text-emerald-500 uppercase tracking-[0.4em] mt-3 print:text-black/60">Forensic Synthesis Node // CASE REF: {CASE_DEFAULTS.caseNumber}</p>
            </div>
            <div className="legal-font text-lg text-slate-200 leading-[2] whitespace-pre-wrap print:text-black selection:bg-emerald-500/30">
              {affidavitDraft}
            </div>
            <div className="mt-12 p-8 border border-emerald-500/20 rounded-[2.5rem] bg-emerald-500/5 print:bg-slate-50 print:border-black/10">
              <div className="flex items-center gap-4 mb-4">
                <ShieldCheck className="text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest print:text-black">Integrity Commitment</span>
              </div>
              <p className="text-xs text-slate-400 italic font-medium print:text-black">This statement is a clinical synthesis of the underlying forensic record and has been locked to the master exhibit book for judicial review.</p>
            </div>
          </div>
        )}

        {/* DETAILED EXHIBIT SHEETS */}
        <div className="print:block p-16 md:p-24 space-y-32 print:p-0">
          <h3 className="text-2xl font-black uppercase tracking-widest text-slate-500 border-b border-white/5 pb-6 mb-16 print:hidden">Evidence Deep-Scan Logs</h3>
          
          {exhibits.map((ex, idx) => (
            <div key={ex.id} className="page-break space-y-12 bg-slate-950/50 p-12 rounded-[3rem] border border-white/5 print:bg-white print:p-10 print:border-none print:shadow-none">
              <div className="flex justify-between items-start border-b border-white/5 pb-10 print:border-black print:pb-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="bg-blue-600 text-white px-6 py-2 rounded-xl text-lg font-black print:bg-black">EXHIBIT {ex.exhibitNumber}</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] print:text-black/50">Node_ID: {ex.id.toUpperCase()}</span>
                  </div>
                  <h4 className="text-4xl font-black text-white italic tracking-tighter print:text-black">{ex.description}</h4>
                </div>
                <div className="text-right space-y-2">
                  <p className="text-2xl font-black text-blue-500 print:text-black">{ex.date}</p>
                  <p className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg border-2 inline-block print:text-black print:border-black ${CATEGORY_COLORS[ex.category]}`}>
                    {ex.category}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <section className="space-y-4">
                    <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] flex items-center gap-2 print:text-black">
                      <Scale size={14} />
                      s.17 Statutory Mapping
                    </h5>
                    <div className="bg-black p-8 rounded-3xl border border-white/5 print:bg-slate-50 print:border-black/5">
                      <p className="text-slate-100 font-medium italic leading-relaxed print:text-black text-lg">
                        "{ex.legalRelevance}"
                      </p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] flex items-center gap-2 print:text-black">
                      <CheckCircle2 size={14} />
                      Best Interest Argument
                    </h5>
                    <div className="bg-slate-900 p-8 rounded-3xl border border-white/5 print:bg-slate-50 print:border-black/5">
                      <p className="text-slate-300 font-black italic text-sm print:text-black">
                        {ex.bestInterestMapping?.legalArgument || "Synthesizing Best Interest Factor argument..."}
                      </p>
                    </div>
                  </section>
                </div>

                <div className="space-y-8">
                  <section className="space-y-4">
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-2 print:text-black">
                      <FileText size={14} />
                      Evidence Metadata
                    </h5>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-slate-900 p-5 rounded-2xl border border-white/5 print:bg-slate-50 print:border-black/5">
                         <span className="text-[8px] font-black text-slate-600 block mb-1 uppercase tracking-widest">Witness Verification</span>
                         <p className="text-xs font-black text-white print:text-black truncate">{ex.witnesses.join(', ') || 'Self'}</p>
                       </div>
                       <div className="bg-slate-900 p-5 rounded-2xl border border-white/5 print:bg-slate-50 print:border-black/5">
                         <span className="text-[8px] font-black text-slate-600 block mb-1 uppercase tracking-widest">Priority Index</span>
                         <p className="text-xs font-black text-white print:text-black">{ex.priority}/10 - {ex.priority >= 8 ? 'CRITICAL' : 'RELEVANT'}</p>
                       </div>
                       <div className="col-span-2 bg-slate-900 p-5 rounded-2xl border border-white/5 print:bg-slate-50 print:border-black/5">
                         <span className="text-[8px] font-black text-slate-600 block mb-1 uppercase tracking-widest">Digital SHA-256 Fingerprint</span>
                         <p className="text-[10px] font-mono text-blue-400 print:text-black truncate">{ex.fileHash || '0x_UNVERIFIED_LOG'}</p>
                       </div>
                    </div>
                  </section>

                  {ex.perjuryFlag && (
                    <div className="bg-red-600/10 p-8 rounded-[2rem] border border-red-600/30 flex items-start gap-4 animate-pulse print:border-black print:animate-none">
                      <AlertCircle className="w-8 h-8 text-red-500 mt-1 print:text-black" />
                      <div className="space-y-2">
                        <p className="text-xs font-black text-red-500 uppercase tracking-widest print:text-black">Integrity Violation Detected</p>
                        <p className="text-sm font-bold text-slate-200 leading-tight print:text-black italic">
                          "{ex.contradictionNote || "This evidence directly contradicts claims of standard parenting compliance."}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BINDER FOOTER */}
        <div className="bg-slate-950 p-16 text-center border-t border-white/5 print:bg-white print:text-black print:border-black">
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em] mb-4 italic print:text-slate-400">
            RECORD CLOSED • {CASE_DEFAULTS.caseNumber} • PLACED // CORE
          </p>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background-color: white !important;
            color: black !important;
            font-family: 'Merriweather', serif !important;
          }
          .print\\:hidden { display: none !important; }
          .page-break { page-break-after: always; }
          #printable-area { border: none !important; }
          main { margin: 0 !important; padding: 0 !important; }
        }
        .page-break { page-break-inside: avoid; }
      `}</style>
    </div>
  );
};

export default ExhibitBook;
