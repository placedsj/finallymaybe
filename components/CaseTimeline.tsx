
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
      <div className="bg-slate-900 border-2 border-dashed border-white/10 rounded-[3rem] p-24 text-center max-w-2xl mx-auto mt-10">
        <div className="w-20 h-20 bg-slate-950 text-slate-700 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <Calendar className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-black text-slate-200 uppercase tracking-tighter italic">Case Chronology Unpopulated</h3>
        <p className="text-slate-500 font-medium mt-4">
          Add exhibits with valid dates to generate a high-contrast visual timeline for judicial review.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Presentation Header */}
      <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl border border-white/15 overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mb-3">
                <Clock className="w-4 h-4" />
                Evidence Trail Node
              </div>
              <h2 className="text-4xl font-black tracking-tighter uppercase italic">FDSJ-739-24 Chronology</h2>
              <p className="text-slate-400 text-base mt-2 max-w-md font-medium">
                Automated reconstruction of incidents mapped to s.17 Best Interests of the Child factors.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {Object.entries(categorySummary).map(([cat, count]) => (
                <button 
                  key={cat}
                  onClick={() => setActiveFilter(cat as ExhibitCategory)}
                  className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border-2 text-[10px] font-black transition-all shadow-lg ${
                    activeFilter === cat 
                    ? 'bg-blue-600 border-blue-500 text-white' 
                    : 'bg-slate-950 border-white/5 text-slate-500 hover:border-blue-500/50 hover:text-white'
                  }`}
                >
                  <span className="opacity-70">{cat}</span>
                  <span className="bg-white/10 px-2 py-0.5 rounded-lg">{count}</span>
                </button>
              ))}
              {activeFilter !== 'ALL' && (
                <button 
                  onClick={() => setActiveFilter('ALL')}
                  className="px-5 py-2.5 rounded-2xl bg-slate-800 text-white text-[10px] font-black uppercase hover:bg-slate-700 transition-colors shadow-lg"
                >
                  Reset Map
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 opacity-5 pointer-events-none">
          <Clock className="w-80 h-80" />
        </div>
      </div>

      <div className="relative py-12 px-6">
        {/* Vertical Spine */}
        <div className="absolute left-10 md:left-1/2 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500 via-slate-800 to-slate-800 -translate-x-1/2 rounded-full opacity-50"></div>

        <div className="space-y-20">
          {filteredExhibits.map((ex, index) => {
            const isEven = index % 2 === 0;
            
            return (
              <div 
                key={ex.id} 
                className={`relative flex flex-col md:flex-row items-start md:items-center group ${isEven ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Visual Dot */}
                <div className="absolute left-10 md:left-1/2 w-6 h-6 rounded-full border-4 border-slate-950 shadow-[0_0_15px_rgba(59,130,246,0.5)] -translate-x-1/2 z-20 transition-all duration-500 group-hover:scale-150 ring-4 ring-white/5"
                     style={{ backgroundColor: getCategoryHex(ex.category) }}>
                </div>

                {/* Card Content */}
                <div className={`w-full md:w-[45%] ml-20 md:ml-0 transition-all duration-700 transform group-hover:-translate-y-3`}>
                  <div className="bg-slate-900 rounded-[2.5rem] border border-white/15 shadow-2xl overflow-hidden hover:border-blue-500/30">
                    <div className="h-2.5 w-full shadow-inner" style={{ backgroundColor: getCategoryHex(ex.category) }}></div>
                    
                    <div className="p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black text-slate-100 bg-black px-4 py-1.5 rounded-xl border border-white/10 uppercase tracking-widest">
                            {ex.date}
                          </span>
                          <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border ${CATEGORY_COLORS[ex.category]}`}>
                            {ex.category}
                          </span>
                        </div>
                        {ex.priority >= 8 && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-red-600/20 text-red-500 rounded-xl text-[10px] font-black border border-red-500/30 animate-pulse">
                            <AlertTriangle className="w-4 h-4" />
                            CRITICAL
                          </div>
                        )}
                      </div>
                      
                      <h4 className="text-2xl font-black text-white mb-5 leading-tight tracking-tighter italic">
                        <span className="text-blue-500 font-mono text-sm mr-3 opacity-60">#{ex.exhibitNumber}</span>
                        {ex.description}
                      </h4>
                      
                      <div className="bg-black rounded-2xl p-6 border border-white/5 relative group/legal">
                        <div className="flex items-start gap-4">
                          <div className="mt-1.5 p-1 bg-blue-600/10 rounded border border-blue-500/20">
                            <ArrowRight className="w-3 h-3 text-blue-500" />
                          </div>
                          <p className="text-sm text-slate-100 font-medium leading-relaxed italic">
                            "{ex.legalRelevance}"
                          </p>
                        </div>
                        <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Protocol: NB_FSA_S17</span>
                          {ex.witnesses && ex.witnesses.length > 0 && (
                            <div className="flex -space-x-3">
                              {ex.witnesses.map((w, i) => (
                                <div key={i} title={w} className="w-7 h-7 rounded-xl bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[9px] font-black text-blue-300 shadow-xl">
                                  {w.charAt(0)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {ex.perjuryFlag && (
                        <div className="mt-6 p-4 bg-red-600/10 rounded-2xl border border-red-500/30 flex items-center gap-4">
                          <ShieldAlert className="w-5 h-5 text-red-500" />
                          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Integrity Violation Tracked</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Desktop Date Marker */}
                <div className={`hidden md:flex w-[45%] ${isEven ? 'justify-start ml-16' : 'justify-end mr-16'}`}>
                  <div className="bg-slate-950 px-8 py-4 rounded-3xl border border-white/10 text-sm font-black text-slate-500 uppercase tracking-[0.4em] group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all duration-500 shadow-2xl">
                    {ex.date}
                  </div>
                </div>
              </div>
            );
          })}
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
    default: return '#3b82f6';
  }
};

export default CaseTimeline;
