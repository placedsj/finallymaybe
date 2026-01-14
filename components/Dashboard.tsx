
import React from 'react';
import { Exhibit } from '../types';
import { AreaChart, Area, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';
import { ShieldCheck, ShieldAlert, FilePlus, AlertCircle, Activity, ArrowRight, Zap, Target } from 'lucide-react';
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
  const trendData = [
    { time: '01', val: -20 }, { time: '02', val: -45 }, { time: '03', val: -30 },
    { time: '04', val: -60 }, { time: '05', val: -40 }, { time: '06', val: -100 },
    { time: '07', val: -70 }, { time: '08', val: -10 },
  ];

  const integrity = exhibits.length > 0 ? 100 : 0;
  const perjuryCount = exhibits.filter(e => e.perjuryFlag).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* PLACED Banner Hero */}
      <div className="relative bg-slate-900 rounded-[3rem] p-12 overflow-hidden border border-white/5 shadow-2xl group">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 opacity-10 group-hover:opacity-20 transition-all duration-1000">
          <Activity size={400} className="text-blue-500" />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white">System: Validated</div>
              <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">FDSJ-739-24 // SECURE_CORE</div>
            </div>
            <h2 className="text-6xl font-black tracking-tighter text-white mb-6 leading-[0.9]">PLACED:<br/>The only system<br/>built that is system-proof.</h2>
            <p className="text-slate-400 text-xl font-medium leading-relaxed mb-10 max-w-xl">
              Engineered for Harper. Built to dismantle deception using immutable forensic verification.
            </p>
            <div className="flex gap-4">
              <button onClick={onUploadClick} className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-3">
                Ingest Core Evidence <ArrowRight size={16} />
              </button>
            </div>
          </div>
          
          <div className="bg-slate-950/50 p-10 rounded-[3rem] border border-white/5 backdrop-blur-xl">
             <IntegrityGauge value={integrity} />
             <p className="text-[10px] font-black text-center text-slate-500 uppercase tracking-widest mt-4">Complete Case Audit Active</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Evidence Record Chart */}
        <div className="bg-slate-900 p-12 rounded-[3.5rem] border border-white/5 shadow-2xl">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black tracking-tighter text-white uppercase italic">Evidence // The Record</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">225 Day Chronology Scan</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-blue-500 tracking-tighter">225 days</p>
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Locked In</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <Area type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 flex justify-between items-center text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">
            <span>System Proof Build v1.0.4</span>
            <span>Block-ID: 0x2447...verified</span>
          </div>
        </div>

        {/* Perjury Tracker Sonar */}
        <div className="bg-slate-900 p-12 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
             <div className="w-80 h-80 border-2 border-rose-500 rounded-full animate-ping"></div>
             <div className="absolute w-60 h-60 border border-rose-500/50 rounded-full"></div>
             <div className="absolute w-40 h-40 border border-rose-500/30 rounded-full"></div>
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-12">
              <h3 className="text-2xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                <Target className="text-rose-500" />
                Perjury Tracker
              </h3>
              <span className="text-[10px] font-black bg-rose-600 px-3 py-1 rounded-full text-white tracking-widest uppercase">Scanning</span>
            </div>
            
            <div className="flex flex-col items-center justify-center py-6">
              <div className="text-7xl font-black text-rose-500 tracking-tighter mb-2">{perjuryCount}</div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Perjury Detections</p>
            </div>

            <div className="mt-12 flex justify-center gap-4">
               <div className="bg-slate-950 px-6 py-3 rounded-2xl border border-white/5 flex flex-col items-center">
                 <span className="text-[8px] font-black text-slate-600 uppercase mb-1">Locked In</span>
                 <ShieldCheck className="text-blue-500 w-5 h-5" />
               </div>
               <div className="bg-slate-950 px-6 py-3 rounded-2xl border border-white/5 flex flex-col items-center">
                 <span className="text-[8px] font-black text-slate-600 uppercase mb-1">Verified</span>
                 <Zap className="text-amber-500 w-5 h-5" />
               </div>
            </div>
          </div>
        </div>
      </div>

      <BestInterestScorecard exhibits={exhibits} />
      <EvidenceCommand exhibits={exhibits} />

      <div className="pt-20 pb-10 text-center">
        <p className="text-slate-600 text-[11px] font-black uppercase tracking-[0.5em] mb-4 italic">Built for Harper. System-Proof for the World.</p>
        <div className="flex justify-center gap-8 opacity-10">
          <div className="w-16 h-px bg-white"></div>
          <div className="w-16 h-px bg-white"></div>
          <div className="w-16 h-px bg-white"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
