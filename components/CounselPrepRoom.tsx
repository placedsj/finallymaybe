
import React, { useState } from 'react';
import { Exhibit, ExhibitCategory } from '../types';
import { ShieldAlert, Calendar, MessageSquare, FileText, ChevronRight } from 'lucide-react';

export const ObstructionCalendar = ({ exhibits }: { exhibits: Exhibit[] }) => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  return (
    <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          COMMUNICATION DENSITY & OBSTRUCTION LOG
        </h3>
        <span className="text-[10px] text-slate-500 font-mono tracking-tighter">REF: NB-FSA-S17</span>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map(day => {
          // Fix: Use ExhibitCategory enum for comparison and ensure properly scoped check
          const hasObs = exhibits.some(e => {
            const dayStr = day < 10 ? '0' + day : day.toString();
            const dateMatch = (e.date.includes(`-${dayStr}-`) || e.date.startsWith(dayStr));
            return dateMatch && e.category === ExhibitCategory.OBSTRUCTION;
          });
          
          return (
            <div 
              key={day} 
              className={`h-9 w-full rounded-md flex items-center justify-center text-[10px] font-bold border transition-all duration-300 cursor-default ${
                hasObs 
                ? 'bg-red-600/90 border-red-400 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] animate-pulse' 
                : 'bg-slate-800/50 border-slate-700/50 text-slate-500 hover:border-slate-600'
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-4 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm bg-red-600"></div>
          Obstruction Detected
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm bg-slate-800"></div>
          Standard Density
        </div>
      </div>
    </div>
  );
};

export const NarrativeGenerator = ({ exhibits }: { exhibits: Exhibit[] }) => {
  const generateBrief = () => {
    const safety = exhibits.filter(e => e.priority >= 8 && (e.category === ExhibitCategory.VIOLENCE || e.category === ExhibitCategory.SUBSTANCE));
    const obs = exhibits.filter(e => e.category === ExhibitCategory.OBSTRUCTION);
    const perjury = exhibits.filter(e => e.perjuryFlag);
    
    return `CASE RECONSTRUCTION (NB FSA s.17)\n\n` +
           `I. PHYSICAL SAFETY & ENVIRONMENT\nDocumented threats: ${safety.length}\nCritical Incidents:\n${safety.map(e => `• [${e.exhibitNumber}] ${e.legalRelevance}`).join("\n")}\n\n` +
           `II. COOPERATION & ACCESS\nTotal Obstruction Events: ${obs.length}\nSummary: Parental alienation and communication interference detected in s.17(d) assessment.\n\n` +
           `III. INTEGRITY & PERJURY RISK\nFlagged Contradictions: ${perjury.length}\nThese exhibits directly challenge claims of consistent safety protocol adherence.`;
  };

  return (
    <div className="p-5 bg-slate-900 rounded-2xl border border-blue-900/30 shadow-2xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-blue-400 text-[11px] font-black uppercase tracking-[0.2em]">AI Court Narrative Suite</h3>
        <ShieldAlert className="w-4 h-4 text-blue-500/50" />
      </div>
      <div className="relative flex-1 group">
        <textarea 
          className="w-full h-full bg-black/40 text-slate-300 p-4 text-[11px] rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500/30 leading-relaxed font-mono custom-scrollbar resize-none" 
          readOnly 
          value={generateBrief()} 
        />
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="bg-blue-600 text-white p-2 rounded-lg text-[10px] font-bold shadow-lg">COPY BRIEF</button>
        </div>
      </div>
    </div>
  );
};

export const WitnessPrep = ({ exhibits }: { exhibits: Exhibit[] }) => {
  const [witness, setWitness] = useState('Jane');
  const filtered = exhibits.filter(e => e.witnesses?.includes(witness));

  return (
    <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <h3 className="text-white text-sm font-bold">WITNESS PREP: {witness.toUpperCase()}</h3>
        </div>
        <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
          {['Jane', 'Emma', 'Self'].map(w => (
            <button
              key={w}
              onClick={() => setWitness(w)}
              className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                witness === w ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-600 gap-2">
            <FileText className="w-8 h-8 opacity-20" />
            <p className="text-[10px] uppercase font-black tracking-widest italic opacity-50">No Evidence Mapped</p>
          </div>
        ) : (
          filtered.map(e => (
            <div key={e.id} className="group p-3 bg-black/40 rounded-xl border border-slate-800/50 hover:border-indigo-500/30 transition-all cursor-default">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-mono text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {e.exhibitNumber}
                </span>
                <span className="text-[10px] font-bold text-slate-500">{e.date}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug group-hover:text-white transition-colors">
                {e.description}
              </p>
              <div className="mt-2 pt-2 border-t border-slate-800/50 flex items-center justify-between">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Relevance: s.17</span>
                <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-indigo-400 transition-colors" />
              </div>
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
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <header className="p-6 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,1)]"></div>
              EVIDENCE COMMAND: FDSJ-739-24
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 italic">
              "Best Interests of the Child" • Automated Litigation Suite
            </p>
          </div>
          <div className="flex gap-2">
            <div className="px-3 py-1 bg-slate-800 rounded-full border border-slate-700 text-[10px] text-slate-400 font-bold">
              SYSTEM: ACTIVE
            </div>
          </div>
        </header>
        
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-950">
          <div className="space-y-6">
            <ObstructionCalendar exhibits={exhibits} />
            <WitnessPrep exhibits={exhibits} />
          </div>
          <div className="h-full">
            <NarrativeGenerator exhibits={exhibits} />
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 px-2">
        <div className="flex-1 h-px bg-slate-800"></div>
        <span className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em]">Secure Forensic Protocol v2.5.0</span>
        <div className="flex-1 h-px bg-slate-800"></div>
      </div>
    </div>
  );
};

export default CounselPrepRoom;
