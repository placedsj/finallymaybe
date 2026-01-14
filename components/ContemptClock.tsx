
import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface ContemptClockProps {
  startDate: string;
}

const ContemptClock: React.FC<ContemptClockProps> = ({ startDate }) => {
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white border-2 border-red-100 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-red-300 transition-all duration-500">
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity pointer-events-none">
        <Clock size={160} className="text-red-600 -rotate-12" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <AlertTriangle size={20} className="animate-pulse" />
          <span className="font-black uppercase tracking-wider text-xs">Active Access Denial Period</span>
        </div>
        <div className="flex items-baseline gap-2">
          <h2 className="text-7xl font-black text-slate-900 tracking-tighter">{diffDays}</h2>
          <span className="text-2xl font-bold text-slate-400 uppercase tracking-widest">Days</span>
        </div>
        <p className="text-slate-500 font-bold text-xs mt-3 max-w-xs leading-relaxed uppercase tracking-tighter">
          Elapsed since the 129-day contempt period initiated by the Applicant on <span className="text-red-600">{startDate}</span>.
        </p>
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status: Critical Non-Compliance</span>
          <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.6)]"></div>
        </div>
      </div>
    </div>
  );
};

export default ContemptClock;
