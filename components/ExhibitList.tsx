
import React, { useState } from 'react';
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

const ExhibitList: React.FC<ExhibitListProps> = ({ exhibits, onDelete, onEdit }) => {
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [loadingSummaries, setLoadingSummaries] = useState<Record<string, boolean>>({});

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
      <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-600">No exhibits found</h3>
        <p className="text-slate-400">Upload your first file or run forensic analysis to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {exhibits.map((ex) => (
        <div key={ex.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden">
          <div className="flex">
            {/* Priority Strip */}
            <div className={`w-1.5 ${ex.priority >= 8 ? 'bg-red-500' : ex.priority >= 5 ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
            
            <div className="flex-1 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                    {ex.exhibitNumber}
                  </span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${CATEGORY_COLORS[ex.category]}`}>
                    {ex.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                    {/* Fix: className must be a string. Use a ternary operator to prevent potential boolean evaluation. */}
                    <Calendar className={ex.priority >= 8 ? "w-4 h-4 text-red-500" : "w-4 h-4"} />
                    {ex.date}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleFastSummary(ex.id, ex.description, ex.legalRelevance)}
                    disabled={loadingSummaries[ex.id]}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="AI Summary"
                  >
                    {loadingSummaries[ex.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  </button>
                  <button onClick={() => onEdit(ex)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(ex.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-lg font-bold text-slate-900 mb-1">{ex.description}</h4>
                <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-slate-100 pl-3">
                  {ex.legalRelevance}
                </p>
              </div>

              {summaries[ex.id] && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-start gap-3 animate-in slide-in-from-left-2">
                  <Zap className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">Judicial Impact</span>
                    <p className="text-xs font-bold text-blue-900">{summaries[ex.id]}</p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-50">
                {ex.witnesses && ex.witnesses.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <div className="flex -space-x-2">
                      {ex.witnesses.map((w, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600" title={w}>
                          {w.charAt(0)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {ex.perjuryFlag && (
                  <div className="flex items-center gap-1.5 text-rose-600 text-xs font-bold">
                    <ShieldAlert className="w-4 h-4" />
                    PERJURY RISK
                  </div>
                )}

                <div className="ml-auto">
                  <a 
                    href={ex.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    {ex.fileName}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExhibitList;
