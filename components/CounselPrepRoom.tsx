
import React, { useState } from 'react';
import { Exhibit, ExhibitCategory } from '../types';
import { ShieldAlert, Calendar, MessageSquare, FileText, ChevronRight, Zap, Target, Scale } from 'lucide-react';

export const ObstructionCalendar = ({ exhibits }: { exhibits: Exhibit[] }) => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  return (
    <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-black text-sm flex items-center gap-3">
          <Calendar className="w-5 h-5 text-blue-500" />
          OBSTRUCTION DENSITY LOG
        </h3>
        <span className="text-[10px] text-slate-500 font-black tracking-widest uppercase bg-slate-800 px-3 py-1 rounded-full">REF: NB-FSA-S17</span>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const hasObs = exhibits.some(e => {
            const dayStr = day < 10 ? '0' + day : day.toString();
            return e.date.includes(dayStr) && e.category === ExhibitCategory.OBSTRUCTION;
          });
          
          return (
            <div 
              key={day} 
              className={`aspect-square rounded-xl flex items-center justify-center text-xs font-black border transition-all duration-300 ${
                hasObs 
                ? 'bg-red-600 border-red-400 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse' 
                : 'bg-slate-800/50 border-slate-700/50 text-slate-600'
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StrategyCards = ({ exhibits }: { exhibits: Exhibit[] }) => {
  const highPriority = exhibits.filter(e => e.priority >= 9);
  
  const strategies = [
    { title: "Safety Pivot", icon: <Target className="text-rose-400" />, desc: "Focus on the Sept 2025 assault to override standard access guidelines.", status: highPriority.length > 0 ? 'READY' : 'DATA REQ' },
    { title: "Integrity Attack", icon: <ShieldAlert className="text-amber-400" />, desc: "Use the Perjury Matrix to invalidate the Applicant's safety testimony.", status: exhibits.some(e => e.perjuryFlag) ? 'READY' : 'PENDING' },
    { title: "s.17 Health Factor", icon: <Scale className="text-emerald-400" />, desc: "Leverage stable housing and clean tests to demonstrate superior care capacity.", status: 'ACTIVE' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {strategies.map((s, i) => (
        <div key={i} className="bg-slate-800/50 border border-slate-700 p-5 rounded-[2rem] hover:border-blue-500/50 transition-all group">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-slate-900 rounded-xl group-hover:scale-110 transition-transform">{s.icon}</div>
            <span className={`text-[8px] font-black px-2 py-0.5 rounded ${s.status === 'READY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-700 text-slate-500'}`}>
              {s.status}
            </span>
          </div>
          <h4 className="text-white font-bold text-sm mb-1">{s.title}</h4>
          <p className="text-[10px] text-slate-400 leading-relaxed font-medium">{s.desc}</p>
        </div>
      ))}
    </div>
  );
};

export const WitnessPrep = ({ exhibits }: { exhibits: Exhibit[] }) => {
  const [witness, setWitness] = useState('Jane');
  const filtered = exhibits.filter(e => e.witnesses?.includes(witness));

  return (
    <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <h3 className="text-white font-black text-sm uppercase tracking-tighter">Witness Prep Suite</h3>
        </div>
        <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
          {['Jane', 'Emma', 'Self'].map(w => (
            <button
              key={w}
              onClick={() => setWitness(w)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                witness === w ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-4 opacity-50">
            <FileText size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest">No Evidence Mapped to {witness}</p>
          </div>
        ) : (
          filtered.map(e => (
            <div key={e.id} className="p-4 bg-black/40 rounded-2xl border border-slate-800/50 hover:border-indigo-500/30 transition-all cursor-default">
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                  #{e.exhibitNumber}
                </span>
                <span className="text-[10px] font-bold text-slate-600">{e.date}</span>
              </div>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">{e.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const CounselPrepRoom = ({ exhibits }: { exhibits: Exhibit[] }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="bg-slate-950 rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl p-10">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-10">
          <div>
            <div className="flex items-center gap-3 text-blue-500 mb-2">
              <Zap className="w-6 h-6 fill-blue-500" />
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Litigation Strategy Room</h1>
            </div>
            <p className="text-slate-500 text-sm font-medium tracking-wide">
              Case FDSJ-739-24 • Senior Counsel Intelligence Node
            </p>
          </div>
          <div className="flex gap-4">
             <div className="bg-slate-900 px-6 py-4 rounded-3xl border border-slate-800 text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Evidence Load</p>
                <p className="text-xl font-black text-white">{exhibits.length}</p>
             </div>
             <div className="bg-blue-600 px-6 py-4 rounded-3xl text-center shadow-lg shadow-blue-600/20">
                <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Strategic Readiness</p>
                <p className="text-xl font-black text-white">92%</p>
             </div>
          </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <StrategyCards exhibits={exhibits} />
            <ObstructionCalendar exhibits={exhibits} />
          </div>
          <div className="lg:col-span-4">
            <WitnessPrep exhibits={exhibits} />
          </div>
        </div>
        
        <div className="mt-12 p-8 bg-blue-600 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 group">
          <div className="flex items-center gap-5">
            <div className="bg-white/10 p-4 rounded-2xl group-hover:rotate-12 transition-transform">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <div>
              <p className="text-2xl font-black tracking-tighter">Ready for Court Briefing</p>
              <p className="text-blue-100 font-medium opacity-80">Synthesizing {exhibits.length} exhibits into s.17 Best Interest arguments.</p>
            </div>
          </div>
          <button className="bg-white text-blue-600 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl active:scale-95">
            Export Legal Strategy
          </button>
        </div>
      </div>
      
      <div className="text-center opacity-30 py-6">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">End Transmission • Secure Protocol FDSJ-739</span>
      </div>
    </div>
  );
};

export default CounselPrepRoom;
