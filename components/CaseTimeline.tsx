
import React, { useState, useMemo } from 'react';
import { Exhibit, ExhibitCategory } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { 
  Calendar, 
  AlertTriangle, 
  Filter, 
  ChevronDown, 
  Clock, 
  ArrowRight,
  ShieldAlert,
  Search
} from 'lucide-react';

interface CaseTimelineProps {
  exhibits: Exhibit[];
}

const CaseTimeline: React.FC<CaseTimelineProps> = ({ exhibits }) => {
  const [activeFilter, setActiveFilter] = useState<ExhibitCategory | 'ALL'>('ALL');

  const sortedExhibits = useMemo(() => {
    return [...exhibits].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });
  }, [exhibits]);

  const filteredExhibits = useMemo(() => {
    if (activeFilter === 'ALL') return sortedExhibits;
    return sortedExhibits.filter(ex => ex.category === activeFilter);
  }, [sortedExhibits, activeFilter]);

  const categorySummary = useMemo(() => {
    const summary: Record<string, number> = {};
    exhibits.forEach(ex => {
      summary[ex.category] = (summary[ex.category] || 0) + 1;
    });
    return summary;
  }, [exhibits]);

  if (exhibits.length === 0) {
    return (
      <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-16 text-center max-w-2xl mx-auto mt-10">
        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Case Chronology Unpopulated</h3>
        <p className="text-slate-500 mt-2">
          Add exhibits with valid dates and categories to generate a visual timeline for courtroom presentation.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Presentation Header & Summary */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl border border-slate-800 overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-2">
                <Clock className="w-4 h-4" />
                Case Chronology Report
              </div>
              <h2 className="text-3xl font-black tracking-tighter">FDSJ-739-2024 EVIDENCE TRAIL</h2>
              <p className="text-slate-400 text-sm mt-1 max-w-md">
                Automated chronological reconstruction of incidents related to s.17 Best Interests of the Child assessment.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {Object.entries(categorySummary).map(([cat, count]) => (
                <button 
                  key={cat}
                  onClick={() => setActiveFilter(cat as ExhibitCategory)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black transition-all ${
                    activeFilter === cat 
                    ? 'bg-blue-600 border-blue-500 text-white' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <span className="opacity-70">{cat}</span>
                  <span className="bg-white/10 px-1.5 py-0.5 rounded-md">{count}</span>
                </button>
              ))}
              {activeFilter !== 'ALL' && (
                <button 
                  onClick={() => setActiveFilter('ALL')}
                  className="px-3 py-1.5 rounded-xl bg-slate-700 text-white text-[10px] font-black uppercase hover:bg-slate-600 transition-colors"
                >
                  Clear Filter
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 opacity-10 pointer-events-none">
          <Clock className="w-64 h-64" />
        </div>
      </div>

      <div className="relative py-10 px-4">
        {/* Central Vertical Spine */}
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500/50 via-slate-200 to-slate-200 -translate-x-1/2 rounded-full"></div>

        <div className="space-y-16">
          {filteredExhibits.map((ex, index) => {
            const isEven = index % 2 === 0;
            const priorityColor = ex.priority >= 8 ? 'text-red-600 bg-red-50 border-red-100' : 'text-blue-600 bg-blue-50 border-blue-100';
            
            return (
              <div 
                key={ex.id} 
                className={`relative flex flex-col md:flex-row items-start md:items-center group ${isEven ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Visual Connector Dot */}
                <div className="absolute left-8 md:left-1/2 w-5 h-5 rounded-full border-4 border-white shadow-xl -translate-x-1/2 z-20 transition-all duration-300 group-hover:scale-150 ring-4 ring-slate-100/50"
                     style={{ backgroundColor: getCategoryHex(ex.category) }}>
                </div>

                {/* Timeline Card Content */}
                <div className={`w-full md:w-[45%] ml-16 md:ml-0 transition-all duration-500 transform group-hover:-translate-y-2`}>
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl overflow-hidden transition-all duration-300">
                    {/* Card Header Strip */}
                    <div className="h-2 w-full" style={{ backgroundColor: getCategoryHex(ex.category) }}></div>
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200 uppercase tracking-tighter">
                            {ex.date}
                          </span>
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border ${CATEGORY_COLORS[ex.category]}`}>
                            {ex.category}
                          </span>
                        </div>
                        {ex.priority >= 8 && (
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-black border border-red-100">
                            <AlertTriangle className="w-3 h-3" />
                            CRITICAL
                          </div>
                        )}
                      </div>
                      
                      <h4 className="text-lg font-black text-slate-900 mb-3 leading-tight">
                        <span className="text-blue-600 font-mono text-sm mr-2 opacity-60">#{ex.exhibitNumber}</span>
                        {ex.description}
                      </h4>
                      
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 relative group/legal">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 p-1 bg-white rounded border border-slate-200">
                            <ArrowRight className="w-3 h-3 text-blue-500" />
                          </div>
                          <p className="text-sm text-slate-700 font-medium leading-relaxed italic">
                            "{ex.legalRelevance}"
                          </p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-200/50 flex items-center justify-between">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Legal Arg: NB-FSA-S17</span>
                          {ex.witnesses && ex.witnesses.length > 0 && (
                            <div className="flex -space-x-2">
                              {ex.witnesses.map((w, i) => (
                                <div key={i} title={w} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-600">
                                  {w.charAt(0)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {ex.perjuryFlag && (
                        <div className="mt-4 p-3 bg-rose-50 rounded-xl border border-rose-100 flex items-center gap-3">
                          <ShieldAlert className="w-4 h-4 text-rose-500" />
                          <span className="text-[10px] font-black text-rose-600 uppercase">Inconsistency Detected with Statement Records</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Date Side-Marker (Desktop) */}
                <div className={`hidden md:flex w-[45%] ${isEven ? 'justify-start ml-12' : 'justify-end mr-12'}`}>
                  <div className="bg-slate-100/50 px-4 py-2 rounded-full border border-slate-200/50 text-sm font-black text-slate-400 uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all duration-300">
                    {ex.date}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Timeline Footer */}
      <div className="text-center py-10">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
          <Clock className="w-4 h-4 text-blue-400" />
          End of Current Evidence Trail
        </div>
      </div>
    </div>
  );
};

const getCategoryHex = (category: string): string => {
  switch (category.toUpperCase()) {
    case 'VIOLENCE': return '#ef4444'; 
    case 'SUBSTANCE': return '#a855f7'; 
    case 'CONTEMPT': return '#f59e0b'; 
    case 'FINANCIAL': return '#10b981'; 
    case 'PARENTING': return '#3b82f6'; 
    case 'INTEGRITY': return '#64748b'; 
    case 'MEDICAL': return '#06b6d4'; 
    case 'OBSTRUCTION': return '#f97316';
    case 'CUSTODY': return '#6366f1';
    case 'PERJURY': return '#f43f5e';
    default: return '#94a3b8';
  }
};

export default CaseTimeline;
