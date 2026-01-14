
import React from 'react';
import { Exhibit, ExhibitCategory } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertCircle, FilePlus, Users, Scale, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { CATEGORY_COLORS } from '../constants';
import EvidenceCommand from './EvidenceCommand';
import BestInterestScorecard from './BestInterestScorecard';

interface DashboardProps {
  exhibits: Exhibit[];
  onUploadClick: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ exhibits, onUploadClick }) => {
  const categoryCounts = Object.values(ExhibitCategory).map(cat => ({
    name: cat,
    count: exhibits.filter(ex => ex.category === cat).length
  }));

  const stats = [
    { label: 'Total Exhibits', value: exhibits.length, icon: FilePlus, color: 'text-blue-600' },
    { label: 'Critical Safety Events', value: exhibits.filter(e => [ExhibitCategory.VIOLENCE, ExhibitCategory.SUBSTANCE].includes(e.category)).length, icon: AlertCircle, color: 'text-red-600' },
    { label: 's.17 Arguments', value: exhibits.filter(e => e.bestInterestMapping).length, icon: Scale, color: 'text-emerald-600' },
    { label: 'Integrity Flags', value: exhibits.filter(e => e.perjuryFlag).length, icon: ShieldCheck, color: 'text-rose-600' },
  ];

  const barColors: Record<string, string> = {
    [ExhibitCategory.VIOLENCE]: '#ef4444',
    [ExhibitCategory.SUBSTANCE]: '#a855f7',
    [ExhibitCategory.CONTEMPT]: '#f59e0b',
    [ExhibitCategory.FINANCIAL]: '#10b981',
    [ExhibitCategory.PARENTING]: '#3b82f6',
    [ExhibitCategory.INTEGRITY]: '#64748b',
    [ExhibitCategory.MEDICAL]: '#06b6d4',
    [ExhibitCategory.OBSTRUCTION]: '#f97316',
    [ExhibitCategory.CUSTODY]: '#6366f1',
    [ExhibitCategory.PERJURY]: '#f43f5e',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <EvidenceCommand exhibits={exhibits} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-700 to-blue-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 opacity-10 pointer-events-none transition-transform group-hover:scale-110 duration-700">
            <Scale size={320} />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-2 text-blue-300 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                <Zap className="w-4 h-4" />
                Sole Custody Juggernaut Strategy
              </div>
              <h3 className="text-4xl font-black tracking-tighter mb-6 leading-tight">Harper's Safety is<br/>Priority One</h3>
              <p className="text-blue-100/80 text-lg max-w-xl font-medium leading-relaxed">
                Case FDSJ-739-24 represents a critical intervention required to remove a child from a high-conflict, criminally unstable environment.
              </p>
            </div>
            
            <div className="mt-10 flex flex-wrap gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 text-xs font-bold border border-white/20 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                Assault Charge: SEPT 2025 (FILED)
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 text-xs font-bold border border-white/20 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                Drug Test: NEGATIVE (CRAIG)
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-6 h-6 ${stat.color} group-hover:scale-110 transition-transform`} />
              </div>
              <div>
                <p className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BestInterestScorecard exhibits={exhibits} />

        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl flex flex-col">
          <h3 className="font-black text-slate-900 text-xl mb-10 uppercase tracking-tighter flex items-center justify-between">
            <span>Evidence Profile Distribution</span>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-4 py-1 rounded-full border border-slate-200 uppercase tracking-widest">NB-FSA s.17</span>
          </h3>
          <div className="h-[400px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryCounts} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} 
                  width={110} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', padding: '16px' }}
                />
                <Bar dataKey="count" radius={[0, 12, 12, 0]} barSize={32}>
                  {categoryCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[entry.name] || '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-black text-2xl mb-2 uppercase tracking-tighter italic">Forensic Operations</h3>
            <p className="text-slate-400 text-sm mb-10 font-medium">Documenting the Applicant's criminal conduct for the court.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={onUploadClick}
                className="flex items-center justify-between p-6 bg-blue-600 rounded-3xl hover:bg-blue-500 transition-all group shadow-xl shadow-blue-600/20 active:scale-95"
              >
                <div className="flex items-center gap-5">
                  <div className="bg-white/10 p-3 rounded-xl">
                    <FilePlus className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-lg">Ingest Evidence</p>
                    <p className="text-[10px] text-blue-200 font-black uppercase tracking-widest">Process s.17 factors</p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
              </button>

              <button className="flex items-center justify-between p-6 bg-slate-800 rounded-3xl hover:bg-slate-700 transition-all group border border-slate-700 shadow-xl active:scale-95">
                <div className="flex items-center gap-5">
                  <div className="bg-white/10 p-3 rounded-xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-lg">Cross-Examine</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Detect Perjury Risk</p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
              </button>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-800 flex items-center justify-between text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
            <span>Security Level: Legal Grade</span>
            <span>v4.0.0-JUGGERNAUT</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
