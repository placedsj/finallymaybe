
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
        <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden border border-white/5 group">
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-rose-500 mb-6">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Active Access Denial Node</span>
            </div>
            <div className="flex items-baseline gap-6">
              <h2 className="text-9xl font-black tracking-tighter transition-transform group-hover:scale-105 duration-700 text-white">{daysOfContempt}</h2>
              <span className="text-4xl font-bold text-slate-600 uppercase tracking-widest">Days</span>
            </div>
            <p className="mt-8 text-slate-400 font-medium max-w-sm leading-relaxed text-xl">
              Impediment period initiated by the Applicant. Direct violation of court safety protocols detected.
            </p>
          </div>
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-10 transition-all duration-1000 pointer-events-none">
            <Clock size={400} className="-rotate-12" />
          </div>
        </div>

        {/* PERJURY TRACKER - Sonar/Target scoped look */}
        <div className="bg-slate-900 p-12 rounded-[3.5rem] border border-white/5 shadow-2xl flex flex-col relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-rose-500/5 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div className="flex items-center gap-4 text-rose-500">
              <div className="p-3 bg-rose-500/10 rounded-2xl">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="font-black uppercase tracking-tighter text-3xl italic">Perjury // Tracker</h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Integrity Check</span>
              <p className="text-2xl font-black text-rose-600">!! FLAGS</p>
            </div>
          </div>
          <div className="space-y-4 flex-1 relative z-10">
            {criticalExhibits.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-30 gap-6">
                <AlertTriangle size={64} className="animate-pulse" />
                <p className="font-black uppercase tracking-[0.4em] text-xs italic">Scanner Clear // No Active Flags</p>
              </div>
            ) : (
              criticalExhibits.slice(0, 3).map(ex => (
                <div key={ex.id} className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-rose-500/30 transition-all group/card">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] group-hover/card:translate-x-1 transition-transform">Exhibit Blox #{ex.exhibitNumber}</p>
                    <span className="text-[9px] font-black text-slate-500 uppercase">{ex.date}</span>
                  </div>
                  <p className="text-base font-bold text-slate-200 leading-tight mb-3">{ex.description}</p>
                  {ex.contradictionNote && (
                    <p className="text-xs text-rose-400 font-medium border-l-2 border-rose-500/50 pl-4 py-1 italic">
                      "{ex.contradictionNote}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* LEGACY FEED - Polished for PLACED brand */}
      <div className="bg-slate-900 border border-white/5 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-500/5 pointer-events-none"></div>
        <div className="flex items-center justify-between mb-12 relative z-10">
          <div className="flex items-center gap-4 text-blue-500">
            <div className="p-3 bg-blue-500/10 rounded-2xl">
               <Heart className="w-8 h-8 fill-blue-500" />
            </div>
            <h3 className="font-black uppercase tracking-tighter text-3xl italic">Placed // Legacy</h3>
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Chronological Reflection Stream</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {exhibits.filter(ex => ex.reflection).slice(0, 3).map(ex => (
            <div key={ex.id} className="bg-white/5 p-10 rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 transition-all group shadow-xl">
              <div className="mb-6 flex items-center gap-4">
                <div className="w-12 h-px bg-blue-500/30"></div>
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{ex.date}</span>
              </div>
              <p className="text-lg font-serif italic text-slate-300 leading-relaxed group-hover:text-white transition-colors">
                "{ex.reflection}"
              </p>
              <div className="mt-8 flex items-center gap-4">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-blue-600/20">D</div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Authentication: Valid</span>
              </div>
            </div>
          ))}
          {exhibits.filter(ex => ex.reflection).length === 0 && (
            <div className="col-span-3 py-20 text-center text-slate-700 font-black italic uppercase text-xs tracking-[0.5em] animate-pulse">
              [ Awaiting Legacy Metadata Synthesis ]
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvidenceCommand;
