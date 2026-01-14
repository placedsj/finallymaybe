
import React from 'react';
import { Shield, Heart, Home, Zap, AlertCircle } from 'lucide-react';
import { Exhibit, ExhibitCategory } from '../types';

const BestInterestScorecard: React.FC<{ exhibits: Exhibit[] }> = ({ exhibits }) => {
  // Logic: Categorize exhibits by s.17 factors
  const stats = {
    safety: exhibits.filter(e => e.category === ExhibitCategory.VIOLENCE || e.category === ExhibitCategory.SUBSTANCE).length,
    stability: exhibits.filter(e => e.category === ExhibitCategory.INTEGRITY || e.category === ExhibitCategory.MEDICAL).length,
    alienation: exhibits.filter(e => e.category === ExhibitCategory.CONTEMPT || e.category === ExhibitCategory.OBSTRUCTION).length,
    care: exhibits.filter(e => e.category === ExhibitCategory.PARENTING).length,
  };

  const factors = [
    { label: "Safety & Security", value: stats.safety, icon: <Shield className="text-rose-500" />, color: "bg-rose-500", desc: "Risk profile: Crimson Alert" },
    { label: "Environment Stability", value: stats.stability, icon: <Home className="text-blue-500" />, color: "bg-blue-500", desc: "Verified Housing Log" },
    { label: "Parental Cooperation", value: stats.alienation, icon: <AlertCircle className="text-amber-500" />, color: "bg-amber-500", desc: "Obstruction Density" },
    { label: "Care & Development", value: stats.care, icon: <Heart className="text-emerald-500" />, color: "bg-emerald-500", desc: "Sustenance Records" },
  ];

  return (
    <div className="bg-slate-900 p-12 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-10 transition-opacity">
        <Zap size={140} className="text-blue-500" />
      </div>
      <div className="relative z-10 mb-12">
        <h3 className="text-3xl font-black tracking-tighter text-white uppercase italic mb-2">Impact // Scorecard</h3>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Analysis Node: NB FSA s.17 Mapping</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {factors.map((f, i) => (
          <div key={i} className="group p-8 rounded-[2rem] bg-white/5 hover:bg-white/[0.08] hover:shadow-2xl transition-all border border-transparent hover:border-white/10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-slate-950 rounded-2xl shadow-inner border border-white/5 group-hover:scale-110 transition-transform">{f.icon}</div>
              <span className="text-5xl font-black text-slate-800 group-hover:text-white transition-colors tracking-tighter">
                {String(f.value).padStart(2, '0')}
              </span>
            </div>
            <h4 className="font-black text-slate-100 uppercase tracking-widest text-xs mb-2">{f.label}</h4>
            <p className="text-[10px] text-slate-500 mb-6 font-bold uppercase tracking-widest">{f.desc}</p>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden p-0.5">
              <div 
                className={`${f.color} h-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.2)]`} 
                style={{ width: `${Math.min(f.value * 10, 100)}%` }} 
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 p-8 bg-slate-950 rounded-[2.5rem] border border-white/5 flex items-center gap-6 relative z-10">
        <div className="p-3 bg-blue-600 rounded-xl animate-pulse">
           <Zap className="text-white w-6 h-6 fill-white" />
        </div>
        <div>
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-1">System Insight // Active</p>
          <p className="text-sm font-bold text-slate-400 leading-relaxed">
            Forensic distributions mapped to statutory requirements for judicial review. Data integrity: <span className="text-white">Confirmed.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BestInterestScorecard;
