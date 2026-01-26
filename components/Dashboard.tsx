
import React, { useMemo } from 'react';
import { Exhibit } from '../types';
import { AreaChart, Area, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';
import { ShieldCheck, ShieldAlert, FilePlus, AlertCircle, Activity, ArrowRight, Zap, Target, Layers, ChevronRight } from 'lucide-react';
import BestInterestScorecard from './BestInterestScorecard';
import EvidenceCommand from './EvidenceCommand';

interface DashboardProps {
  exhibits: Exhibit[];
  onUploadClick: () => void;
}

const IntegrityGauge = ({ value }: { value: number }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center group">
      <svg className="w-64 h-64 -rotate-90">
        <circle
          cx="128"
          cy="128"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          className="text-slate-800"
        />
        <circle
          cx="128"
          cy="128"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset }}
          strokeLinecap="round"
          fill="transparent"
          className="text-blue-500 transition-all duration-1000 ease-out shadow-neon"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Integrity</span>
        <span className="text-5xl font-black text-white tracking-tighter">{value}%</span>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ exhibits, onUploadClick }) => {
  const trendData = useMemo(() => {
    // Simulated data but scaled for high-volume visualization
    return [
      { time: '01', val: -20 }, { time: '02', val: -45 }, { time: '03', val: -30 },
      { time: '04', val: -60 }, { time: '05', val: -40 }, { time: '06', val: -100 },
      { time: '07', val: -70 }, { time: '08', val: -10 },
    ];
  }, []);

  const integrity = exhibits.length > 0 ? 100 : 0;
  const perjuryCount = exhibits.filter(e => e.perjuryFlag).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* PLACED Banner Hero */}
      <div className="relative bg-slate-900 rounded-[4rem] p-16 overflow-hidden border border-white/5 shadow-2xl group">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 opacity-10 group-hover:opacity-20 transition-all duration-1000 pointer-events-none">
          <Activity size={400} className="text-blue-500" />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-lg">System: Active</div>
              <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Capacity // 500+ Record Safe</div>
            </div>
            <h2 className="text-7xl font-black tracking-tighter text-white mb-8 leading-[0.85] italic">PLACED:<br/>Forensic Command<br/>Scale Tested.</h2>
            <p className="text-slate-400 text-2xl font-medium leading-relaxed mb-12 max-w-2xl">
              Engineered to process and visualize over <span className="text-blue-500 font-black">500 exhibits</span> with immutable verification and rapid search protocols.
            </p>
            <div className="flex gap-6">
              <button onClick={onUploadClick} className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-4 group/btn">
                Ingest Record Batch <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
          
          <div className="bg-slate-950/60 p-12 rounded-[4rem] border border-white/5 backdrop-blur-3xl shadow-inner group/gauge">
             <IntegrityGauge value={integrity} />
             <p className="text-[10px] font-black text-center text-slate-500 uppercase tracking-[0.5em] mt-6 group-hover:text-blue-500 transition-colors">Forensic Verification Active</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Evidence Volume Node */}
        <div className="bg-slate-900 p-12 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                <Layers className="text-blue-500" />
                Evidence Density
              </h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">Active Multi-Batch Chronology Scan</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-blue-500 tracking-tighter italic">{exhibits.length}</p>
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Locked Records</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                <Area type="step" dataKey="val" stroke="#3b82f6" strokeWidth={5} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-10 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Real-time Chronology Verification</span>
            </div>
            <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest font-mono">NODE_HASH: 0x2447...OK</span>
          </div>
        </div>

        {/* Tactical Perjury Matrix */}
        <div className="bg-slate-900 p-12 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
             <div className="w-[500px] h-[500px] border-2 border-rose-500 rounded-full animate-ping"></div>
             <div className="absolute w-[400px] h-[400px] border border-rose-500/50 rounded-full"></div>
             <div className="absolute w-[300px] h-[300px] border border-rose-500/30 rounded-full"></div>
          </div>
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-center justify-between mb-16">
              <h3 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-4">
                <Target className="text-rose-600" />
                Integrity Sniper
              </h3>
              <div className="flex items-center gap-3 bg-rose-600 px-4 py-1.5 rounded-full shadow-lg">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                <span className="text-[9px] font-black text-white tracking-widest uppercase">Targeting Deception</span>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center py-10">
              <div className="text-9xl font-black text-rose-500 tracking-tighter transition-transform group-hover:scale-110 duration-1000 drop-shadow-[0_0_30px_rgba(244,63,94,0.3)]">{perjuryCount}</div>
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] mt-4 italic">High-Confidence Perjury Detections</p>
            </div>

            <div className="mt-auto flex justify-center gap-6 pt-10 border-t border-white/5">
               <div className="flex flex-col items-center gap-2">
                 <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center shadow-inner group-hover:border-rose-500/30 transition-all">
                   <ShieldCheck className="text-blue-500 w-6 h-6" />
                 </div>
                 <span className="text-[8px] font-black text-slate-700 uppercase">Verified</span>
               </div>
               <div className="flex flex-col items-center gap-2">
                 <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center shadow-inner group-hover:border-amber-500/30 transition-all">
                   <Zap className="text-amber-500 w-6 h-6" />
                 </div>
                 <span className="text-[8px] font-black text-slate-700 uppercase">Active</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <BestInterestScorecard exhibits={exhibits} />
      <EvidenceCommand exhibits={exhibits} />

      <div className="pt-24 pb-12 text-center relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <p className="text-slate-600 text-[12px] font-black uppercase tracking-[0.6em] mb-6 italic">Built for Harper. Scale-Tested for the Truth.</p>
        <div className="flex justify-center gap-10 opacity-10">
          <div className="w-24 h-px bg-white"></div>
          <div className="w-2 rounded-full h-1 bg-white"></div>
          <div className="w-24 h-px bg-white"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
