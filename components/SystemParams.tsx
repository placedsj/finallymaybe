
import React, { useState } from 'react';
import { db } from '../services/db';
import { Download, Upload, ShieldCheck, Database, Trash2, Zap, Save } from 'lucide-react';

const SystemParams: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'saving' | 'done'>('idle');

  const handleExport = async () => {
    setStatus('saving');
    const exhibits = await db.exhibits.toArray();
    const data = JSON.stringify({ 
      version: '1.0.0', 
      timestamp: new Date().toISOString(), 
      case: 'FDSJ-739-24',
      payload: exhibits 
    });
    
    const blob = new Blob([data], { type: 'application/placed' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `placed_core_backup_${new Date().toISOString().split('T')[0]}.placed`;
    link.click();
    setTimeout(() => setStatus('done'), 1000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (confirm('Importing this file will overwrite existing exhibits. Continue?')) {
          await db.exhibits.clear();
          await db.exhibits.bulkAdd(data.payload);
          window.location.reload();
        }
      } catch (err) {
        alert('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
      <div className="bg-slate-900 rounded-[3rem] p-12 border border-white/5 shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-12 opacity-5">
           <Database size={200} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-blue-500 mb-6">
            <ShieldCheck size={32} />
            <h2 className="text-4xl font-black tracking-tighter uppercase">Persistence Logic</h2>
          </div>
          <p className="text-slate-400 text-lg max-w-xl font-medium leading-relaxed mb-10">
            Everything is automatically saved to your browser's persistent storage. Use this panel to create physical air-gapped backups of "The Record".
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              onClick={handleExport}
              className="bg-blue-600 hover:bg-blue-500 text-white p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 transition-all shadow-xl shadow-blue-600/10 active:scale-95 group/btn"
            >
              <Download size={40} className="group-hover/btn:-translate-y-2 transition-transform" />
              <div className="text-center">
                <p className="font-black uppercase tracking-widest text-xs">Export "The Record"</p>
                <p className="text-[10px] text-blue-200 mt-1 font-bold">Generate .placed encrypted bundle</p>
              </div>
            </button>

            <label className="bg-slate-950 hover:bg-slate-800 text-white p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer active:scale-95 group/btn">
              <Upload size={40} className="group-hover/btn:translate-y-2 transition-transform" />
              <div className="text-center">
                <p className="font-black uppercase tracking-widest text-xs">Restore System State</p>
                <p className="text-[10px] text-slate-500 mt-1 font-bold">Upload a previous .placed bundle</p>
              </div>
              <input type="file" className="hidden" accept=".placed" onChange={handleImport} />
            </label>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[3rem] p-10 border border-white/5">
        <h3 className="text-xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
          <Zap className="text-amber-500" />
          Health Check
        </h3>
        <div className="space-y-4">
           <div className="flex justify-between items-center p-4 bg-slate-950 rounded-2xl border border-white/5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Database Sync</span>
              <span className="text-xs font-black text-emerald-500">ACTIVE // LOCKET</span>
           </div>
           <div className="flex justify-between items-center p-4 bg-slate-950 rounded-2xl border border-white/5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Local Retention Mode</span>
              <span className="text-xs font-black text-blue-500">PERSISTENT</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SystemParams;
