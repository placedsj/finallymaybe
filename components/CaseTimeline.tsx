
import React from 'react';
import { Exhibit } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { Calendar, AlertTriangle } from 'lucide-react';

interface CaseTimelineProps {
  exhibits: Exhibit[];
}

const CaseTimeline: React.FC<CaseTimelineProps> = ({ exhibits }) => {
  // Sort exhibits chronologically
  const sortedExhibits = [...exhibits].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateA - dateB;
  });

  if (exhibits.length === 0) {
    return (
      <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-600">Timeline unavailable</h3>
        <p className="text-slate-400">Add exhibits with dates to generate the case chronology.</p>
      </div>
    );
  }

  return (
    <div className="relative max-w-4xl mx-auto py-8">
      {/* Vertical line */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 -translate-x-1/2 hidden md:block"></div>

      <div className="space-y-12">
        {sortedExhibits.map((ex, index) => {
          const isEven = index % 2 === 0;
          
          return (
            <div key={ex.id} className={`relative flex items-center justify-between md:justify-normal group ${isEven ? 'md:flex-row-reverse' : ''}`}>
              {/* Desktop Dot */}
              <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full border-4 border-white shadow-sm -translate-x-1/2 z-10 hidden md:block transition-transform group-hover:scale-125"
                   style={{ backgroundColor: getCategoryHex(ex.category) }}>
              </div>

              {/* Mobile Line Marker */}
              <div className="absolute left-4 w-0.5 h-full bg-slate-200 -translate-x-1/2 top-4 md:hidden"></div>
              <div className="absolute left-4 w-3 h-3 rounded-full bg-slate-400 -translate-x-1/2 z-10 md:hidden"></div>

              {/* Content Card */}
              <div className={`w-full md:w-[45%] ml-10 md:ml-0 transition-all duration-300 transform group-hover:-translate-y-1`}>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{ex.date}</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${CATEGORY_COLORS[ex.category]}`}>
                      {ex.category}
                    </span>
                  </div>
                  
                  <h4 className="font-bold text-slate-900 mb-2">
                    <span className="text-blue-600 mr-2">[{ex.exhibitNum}]</span>
                    {ex.description}
                  </h4>
                  
                  <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-slate-100 pl-3">
                    {ex.legalRelevance}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                    <AlertTriangle className="w-3 h-3 text-slate-300" />
                    Priority Evidence
                  </div>
                </div>
              </div>

              {/* Spacer for desktop layout */}
              <div className="hidden md:block w-[45%]"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper to get hex colors matching the Tailwind classes in constants
const getCategoryHex = (category: string): string => {
  switch (category) {
    case 'Violence': return '#ef4444'; // red-500
    case 'Substance': return '#a855f7'; // purple-500
    case 'Contempt': return '#f59e0b'; // amber-500
    case 'Financial': return '#10b981'; // emerald-500
    case 'Parenting': return '#3b82f6'; // blue-500
    case 'Integrity': return '#64748b'; // slate-500
    case 'Medical': return '#06b6d4'; // cyan-500
    default: return '#94a3b8';
  }
};

export default CaseTimeline;
