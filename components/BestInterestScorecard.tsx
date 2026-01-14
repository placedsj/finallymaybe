
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
    { label: "Safety & Security", value: stats.safety, icon: <Shield className="text-rose-500" />, color: "bg-rose-500", desc: "Evidence of assault/drug use." },
    { label: "Stability of Environment", value: stats.stability, icon: <Home className="text-emerald-500" />, color: "bg-emerald-500", desc: "Negative drug tests & home care." },
    { label: "Parental Cooperation", value: stats.alienation, icon: <AlertCircle className="text-amber-500" />, color: "bg-amber-500", desc: "Contempt & access denial (129 days)." },
    { label: "Care & Development", value: stats.care, icon: <Heart className="text-blue-500" />, color: "bg-blue-500", desc: "Provision of needs & pre-natals." },
  ];

  return (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl">
      <div className="mb-8">
        <h3 className="text-3xl font-black tracking-tighter text-slate-900">Judicial Impact Scorecard</h3>
        <p className="text-slate-500 font-medium">Mapping Evidence to NB Family Services Act s.17</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {factors.map((f, i) => (
          <div key={i} className="group p-6 rounded-3xl bg-slate-50 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm">{f.icon}</div>
              <span className="text-4xl font-black text-slate-200 group-hover:text-slate-900 transition-colors">
                {String(f.value).padStart(2, '0')}
              </span>
            </div>
            <h4 className="font-bold text-slate-900 mb-1">{f.label}</h4>
            <p className="text-xs text-slate-500 mb-4">{f.desc}</p>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className={`${f.color} h-full transition-all duration-1000`} 
                style={{ width: `${Math.min(f.value * 10, 100)}%` }} 
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-10 p-6 bg-slate-900 rounded-[2rem] text-white flex items-center gap-4">
        <Zap className="text-yellow-400 fill-yellow-400" />
        <p className="text-sm font-medium">
          <span className="font-black text-yellow-400 uppercase tracking-tighter">Forensic Insight:</span> This distribution provides the court with a clear 'Best Interests' trajectory based on verified filings.
        </p>
      </div>
    </div>
  );
};

export default BestInterestScorecard;
