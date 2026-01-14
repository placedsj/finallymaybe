
import React from 'react';
import { Exhibit } from '../types';
import { Clock, ShieldAlert, Heart, AlertTriangle } from 'lucide-react';

interface EvidenceCommandProps {
  exhibits: Exhibit[];
}

const EvidenceCommand: React.FC<EvidenceCommandProps> = ({ exhibits }) => {
  // Logic for the 129-Day Contempt Clock
  const contemptStart = new Date('2025-06-04');
  const daysOfContempt = Math.ceil(Math.abs(new Date().getTime() - contemptStart.getTime()) / (1000 * 60 * 60 * 24));

  const criticalExhibits = exhibits.filter(ex => ex.priority >= 8 || ex.perjuryFlag);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* THE CONTEMPT CLOCK */}
        <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden border border-slate-800 group">
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
              <span className="text-xs font-black uppercase tracking-[0.2em]">Active Access Denial Counter</span>
            </div>
            <div className="flex items-baseline gap-4">
              <h2 className="text-8xl font-black tracking-tighter transition-transform group-hover:scale-105 duration-500">{daysOfContempt}</h2>
              <span className="text-3xl font-bold text-slate-500 uppercase">Days</span>
            </div>
            <p className="mt-6 text-slate-400 font-medium max-w-sm leading-relaxed text-lg">
              Harper has been withheld from her father in direct violation of the March 22 Interim Order. This represents a systematic failure of parental responsibility.
            </p>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity pointer-events-none">
            <Clock size={280} className="-rotate-12" />
          </div>
        </div>

        {/* PERJURY HEATMAP SUMMARY */}
        <div className="bg-white p-10 rounded-[3rem] border-2 border-rose-100 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 text-rose-600">
              <ShieldAlert className="w-8 h-8" />
              <h3 className="font-black uppercase tracking-tighter text-2xl">Perjury Tracker</h3>
            </div>
            <span className="bg-rose-50 text-rose-600 px-4 py-1 rounded-full text-[10px] font-black uppercase border border-rose-100">
              {criticalExhibits.length} Flags Detected
            </span>
          </div>
          <div className="space-y-4 flex-1">
            {criticalExhibits.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50">
                <AlertTriangle size={48} />
                <p className="mt-2 font-bold uppercase tracking-widest text-xs">No active flags</p>
              </div>
            ) : (
              criticalExhibits.slice(0, 3).map(ex => (
                <div key={ex.id} className="p-5 bg-rose-50/50 rounded-3xl border border-rose-100 hover:bg-rose-50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Exhibit #{ex.exhibitNumber}</p>
                    <span className="text-[10px] font-bold text-slate-400">{ex.date}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 leading-tight mb-2">{ex.description}</p>
                  {ex.contradictionNote && (
                    <p className="text-[11px] text-rose-700 italic border-l-2 border-rose-200 pl-3">
                      "{ex.contradictionNote}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* LEGACY FEED (Letter to Harper Mode) */}
      <div className="bg-indigo-50 border-2 border-indigo-100 p-10 rounded-[3rem] shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3 text-indigo-600">
            <Heart className="w-8 h-8 fill-indigo-600" />
            <h3 className="font-black uppercase tracking-tighter text-2xl">Legacy Feed: Letters to Harper</h3>
          </div>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Parental Reflection Log</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {exhibits.filter(ex => ex.reflection).slice(0, 3).map(ex => (
            <div key={ex.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-indigo-100 hover:shadow-xl transition-all group">
              <div className="mb-4 flex items-center gap-2 opacity-50">
                <div className="w-8 h-0.5 bg-indigo-200"></div>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{ex.date}</span>
              </div>
              <p className="text-sm italic text-slate-700 font-medium leading-relaxed group-hover:text-indigo-900 transition-colors">
                "{ex.reflection}"
              </p>
              <div className="mt-6 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600">C</div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">From Dad</span>
              </div>
            </div>
          ))}
          {exhibits.filter(ex => ex.reflection).length === 0 && (
            <div className="col-span-3 py-12 text-center text-slate-400 font-bold italic uppercase text-xs tracking-[0.2em]">
              Process evidence to generate legacy reflections.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvidenceCommand;
