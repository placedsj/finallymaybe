
import React, { useState, useRef, useEffect, memo } from 'react';
import { FixedSizeList as List, ListChildComponentProps, areEqual } from 'react-window';
import { Exhibit, ExhibitCategory } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { 
  FileText, 
  Download, 
  Trash2, 
  Edit2, 
  Users, 
  AlertCircle, 
  MapPin, 
  ShieldAlert,
  Calendar,
  Zap,
  Loader2
} from 'lucide-react';
import { fastEvidenceSummary } from '../services/geminiService';

interface ExhibitListProps {
  exhibits: Exhibit[];
  onDelete: (id: string) => void;
  onEdit: (exhibit: Exhibit) => void;
}

const CARD_HEIGHT = 600; // Fixed height for virtualization

const ExhibitRow = memo(({ index, style, data }: ListChildComponentProps) => {
  const { exhibits, onDelete, onEdit, loadingSummaries, summaries, handleFastSummary } = data;
  const ex = exhibits[index];

  return (
    <div style={{ ...style, paddingBottom: '24px', paddingRight: '12px' }}>
      <div className="bg-slate-900 h-full rounded-[2.5rem] border border-white/15 shadow-2xl hover:border-blue-500/40 transition-all group overflow-hidden flex flex-col">
        <div className="flex flex-1 overflow-hidden">
          {/* Priority Strip */}
          <div className={`w-3 flex-shrink-0 ${ex.priority >= 8 ? 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)]' : ex.priority >= 5 ? 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-blue-600'}`}></div>

          <div className="flex-1 p-8 flex flex-col overflow-hidden">
            <div className="flex items-start justify-between mb-6 flex-shrink-0">
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-black text-sm text-blue-400 bg-blue-500/10 px-5 py-2 rounded-xl border border-blue-500/30 uppercase tracking-[0.2em]">
                  #{ex.exhibitNumber}
                </span>
                <span className={`text-[11px] font-black uppercase px-4 py-2 rounded-xl border-2 shadow-sm ${CATEGORY_COLORS[ex.category]}`}>
                  {ex.category}
                </span>
                <div className="flex items-center gap-3 text-slate-200 text-xs font-black uppercase tracking-widest ml-2">
                  <Calendar size={16} className={ex.priority >= 8 ? "text-red-500" : "text-blue-500"} />
                  {ex.date}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleFastSummary(ex.id, ex.description, ex.legalRelevance)}
                  disabled={loadingSummaries[ex.id]}
                  className="p-4 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-lg active:scale-90"
                  title="AI Summary"
                >
                  {loadingSummaries[ex.id] ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                </button>
                <button onClick={() => onEdit(ex)} className="p-4 bg-white/5 text-slate-300 hover:text-white hover:bg-white/15 rounded-2xl transition-all shadow-lg">
                  <Edit2 className="w-5 h-5" />
                </button>
                <button onClick={() => onDelete(ex.id)} className="p-4 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-lg active:scale-90">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mb-6 flex-shrink-0">
              <h4 className="text-3xl font-black text-white mb-4 tracking-tighter italic leading-none line-clamp-2" title={ex.description}>{ex.description}</h4>
              <div className="bg-black p-6 rounded-[2rem] border border-blue-500/20 shadow-inner max-h-40 overflow-y-auto custom-scrollbar">
                <p className="text-base text-slate-100 font-medium leading-relaxed italic border-l-4 border-blue-600/50 pl-6">
                  {ex.legalRelevance}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
               {summaries[ex.id] && (
                <div className="mb-6 p-6 bg-blue-600/10 rounded-[2rem] border border-blue-500/30 flex items-start gap-5 animate-in slide-in-from-left-4">
                  <Zap className="w-6 h-6 text-blue-400 mt-1 fill-blue-400/20 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.5em] block mb-3">Judicial Strategy Insight</span>
                    <p className="text-lg font-black text-white italic leading-relaxed">{summaries[ex.id]}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-8 pt-6 border-t border-white/10 mt-auto flex-shrink-0">
              {ex.witnesses && ex.witnesses.length > 0 && (
                <div className="flex items-center gap-4 bg-slate-950 px-5 py-3 rounded-2xl border border-white/5">
                  <Users className="w-5 h-5 text-slate-400" />
                  <div className="flex -space-x-3">
                    {ex.witnesses.map((w: string, i: number) => (
                      <div key={i} className="w-10 h-10 rounded-xl bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-xs font-black text-blue-300 shadow-2xl" title={w}>
                        {w.charAt(0)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ex.perjuryFlag && (
                <div className="flex items-center gap-3 px-6 py-3 bg-red-600/20 text-red-500 border border-red-500/40 rounded-2xl text-xs font-black uppercase tracking-[0.2em] animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                  <ShieldAlert size={18} />
                  Integrity Violation
                </div>
              )}

              <div className="ml-auto">
                <a
                  href={ex.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 px-8 py-4 bg-slate-950 text-slate-200 hover:text-white hover:bg-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest border border-white/10 transition-all shadow-2xl active:scale-95"
                >
                  <Download className="w-5 h-5 text-blue-500" />
                  Secure Link: {ex.fileName}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}, areEqual);

const ExhibitList: React.FC<ExhibitListProps> = ({ exhibits, onDelete, onEdit }) => {
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [loadingSummaries, setLoadingSummaries] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 800 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          // Calculate height to fill screen or use fixed
          height: Math.max(800, window.innerHeight - 300)
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    // Small delay to ensure parent layout is ready
    setTimeout(updateDimensions, 100);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleFastSummary = async (id: string, desc: string, rel: string) => {
    if (loadingSummaries[id]) return;
    setLoadingSummaries(prev => ({ ...prev, [id]: true }));
    try {
      const summary = await fastEvidenceSummary(desc, rel);
      if (summary) {
        setSummaries(prev => ({ ...prev, [id]: summary }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingSummaries(prev => ({ ...prev, [id]: false }));
    }
  };

  if (exhibits.length === 0) {
    return (
      <div className="bg-slate-900/50 border-2 border-dashed border-white/10 rounded-[3rem] p-24 text-center">
        <FileText className="w-16 h-16 text-slate-600 mx-auto mb-6" />
        <h3 className="text-2xl font-black text-slate-200 uppercase tracking-tighter italic">The record is void.</h3>
        <p className="text-slate-400 font-medium mt-2">Awaiting forensic ingestion or analysis stream.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <List
        height={dimensions.height}
        itemCount={exhibits.length}
        itemSize={CARD_HEIGHT}
        width={dimensions.width}
        itemData={{
          exhibits,
          onDelete,
          onEdit,
          loadingSummaries,
          summaries,
          handleFastSummary
        }}
      >
        {ExhibitRow}
      </List>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default ExhibitList;
