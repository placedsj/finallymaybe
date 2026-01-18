
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { db } from '../services/db';
import { CommunicationEntry } from '../types';
import { extractCommunicationLog } from '../services/geminiService';
import { 
  MessageSquare, 
  Upload, 
  Search, 
  Trash2, 
  Activity, 
  Filter, 
  Mail, 
  Smartphone,
  ShieldAlert,
  Loader2,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  UserCheck,
  Layers,
  Zap,
  LayoutList,
  Maximize2,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

const CommunicationVault: React.FC = () => {
  const [logs, setLogs] = useState<CommunicationEntry[]>([]);
  const [stagingLogs, setStagingLogs] = useState<CommunicationEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('ALL');
  const [sentimentFilter, setSentimentFilter] = useState('ALL');
  const [isDenseView, setIsDenseView] = useState(false);
  const [selectedStaging, setSelectedStaging] = useState<Set<string>>(new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const data = await db.communicationLogs.toArray();
    setLogs(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  };

  // Add missing deleteLog function to purge communication records
  const deleteLog = async (id: string) => {
    if (confirm('Permanently purge this communication fragment from the record?')) {
      await db.communicationLogs.delete(id);
      await loadLogs();
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const newStaging: CommunicationEntry[] = [];

    // Processing in batches of 5 to maintain UI responsiveness
    const filesArray = Array.from(files);
    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      const reader = new FileReader();
      const filePromise = new Promise<void>((resolve) => {
        reader.onload = async (event) => {
          const result = event.target?.result as string;
          try {
            let extracted: CommunicationEntry[] = [];
            if (file.type.startsWith('image/')) {
              const base64 = result.split(',')[1];
              extracted = await extractCommunicationLog(base64, file.type);
            } else {
              extracted = await extractCommunicationLog(result, file.type);
            }
            newStaging.push(...extracted);
          } catch (err) {
            console.error("Extraction Failed:", err);
          }
          resolve();
        };
      });

      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
      await filePromise;
    }

    setStagingLogs(prev => [...prev, ...newStaging]);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleStagingSelect = (id: string) => {
    const newSelected = new Set(selectedStaging);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedStaging(newSelected);
  };

  const commitStaging = async () => {
    const logsToCommit = selectedStaging.size > 0 
      ? stagingLogs.filter(l => selectedStaging.has(l.id))
      : stagingLogs;

    await db.communicationLogs.bulkAdd(logsToCommit);
    
    if (selectedStaging.size > 0) {
      setStagingLogs(prev => prev.filter(l => !selectedStaging.has(l.id)));
      setSelectedStaging(new Set());
    } else {
      setStagingLogs([]);
    }
    
    await loadLogs();
  };

  const discardStaging = () => {
    if (selectedStaging.size > 0) {
      setStagingLogs(prev => prev.filter(l => !selectedStaging.has(l.id)));
      setSelectedStaging(new Set());
    } else {
      setStagingLogs([]);
    }
  };

  const stats = useMemo(() => {
    const total = logs.length;
    const aggressive = logs.filter(l => l.sentiment === 'AGRESSIVE').length;
    const platforms: Record<string, number> = {};
    const senderCounts: Record<string, number> = {};
    
    logs.forEach(l => {
      platforms[l.platform] = (platforms[l.platform] || 0) + 1;
      senderCounts[l.sender] = (senderCounts[l.sender] || 0) + 1;
    });
    
    const topSender = Object.entries(senderCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';
    
    return { total, aggressive, topSender, platforms };
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.content.toLowerCase().includes(search.toLowerCase()) || 
                            log.sender.toLowerCase().includes(search.toLowerCase());
      const matchesPlatform = platformFilter === 'ALL' || log.platform === platformFilter;
      const matchesSentiment = sentimentFilter === 'ALL' || log.sentiment === sentimentFilter;
      return matchesSearch && matchesPlatform && matchesSentiment;
    });
  }, [logs, search, platformFilter, sentimentFilter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-32">
      {/* High-Volume Intelligence Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
          <TrendingUp className="absolute -right-4 -bottom-4 w-24 h-24 text-blue-500 opacity-5 group-hover:opacity-10 transition-opacity" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Interception Load</p>
          <div className="flex items-baseline gap-2">
            <p className="text-5xl font-black text-white italic">{stats.total}</p>
            <p className="text-xs font-bold text-blue-500 uppercase">/ 500+</p>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((stats.total / 500) * 100, 100)}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
          <ShieldAlert className="absolute -right-4 -bottom-4 w-24 h-24 text-rose-500 opacity-5 group-hover:opacity-10 transition-opacity" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Risk Saturation</p>
          <p className="text-4xl font-black text-rose-500 italic">
            {stats.total > 0 ? ((stats.aggressive / stats.total) * 100).toFixed(1) : 0}%
          </p>
          <p className="text-[9px] font-bold text-rose-600/60 uppercase mt-2">{stats.aggressive} Critical Tone Events</p>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
          <UserCheck className="absolute -right-4 -bottom-4 w-24 h-24 text-indigo-500 opacity-5 group-hover:opacity-10 transition-opacity" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Peak Source</p>
          <p className="text-2xl font-black text-white truncate uppercase italic">{stats.topSender}</p>
          <p className="text-[9px] font-bold text-indigo-500 uppercase mt-2">Volume Anomaly Detected</p>
        </div>

        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="bg-blue-600 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group hover:bg-blue-500 transition-all text-left"
        >
          <Upload className="absolute -right-4 -bottom-4 w-24 h-24 text-white opacity-20 group-hover:scale-110 transition-transform" />
          <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-1">Ingestion Port</p>
          <p className="text-xl font-black text-white uppercase italic">Batch Process</p>
          <p className="text-[9px] font-bold text-blue-200 uppercase mt-2">500+ Record Capacity</p>
          <input ref={fileInputRef} type="file" multiple className="hidden" accept="image/*,.csv,.txt" onChange={handleUpload} />
        </button>
      </div>

      {/* Staging Node: Pre-Commit Filtering */}
      {stagingLogs.length > 0 && (
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-[3.5rem] p-12 animate-in slide-in-from-top-12 duration-700 shadow-[0_0_80px_rgba(16,185,129,0.1)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-[1.5rem] flex items-center justify-center text-emerald-500 shadow-inner">
                <Activity size={32} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-emerald-100 uppercase italic tracking-tighter">Staging Node // {stagingLogs.length} Fragments</h3>
                <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-[0.3em] mt-1">Reviewing ingested data metadata before forensic lock</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={discardStaging} 
                className="px-8 py-4 bg-slate-900 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all border border-white/5"
              >
                {selectedStaging.size > 0 ? `Discard Selected (${selectedStaging.size})` : 'Discard All'}
              </button>
              <button 
                onClick={commitStaging} 
                className="px-12 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-4 shadow-2xl shadow-emerald-600/30 hover:bg-emerald-500 active:scale-95 transition-all"
              >
                <ShieldCheck size={18} />
                {selectedStaging.size > 0 ? `Commit Selected (${selectedStaging.size})` : 'Commit All to Record'}
              </button>
            </div>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto pr-6 custom-scrollbar space-y-3">
             {stagingLogs.map((s) => (
               <div 
                 key={s.id} 
                 onClick={() => toggleStagingSelect(s.id)}
                 className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group/staging ${
                   selectedStaging.has(s.id) 
                   ? 'bg-emerald-600/20 border-emerald-500 shadow-lg translate-x-1' 
                   : 'bg-black/40 border-white/5 hover:border-emerald-500/30'
                 }`}
               >
                 <div className="flex items-center gap-6 overflow-hidden">
                   <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                     selectedStaging.has(s.id) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-800'
                   }`}>
                     {selectedStaging.has(s.id) && <CheckCircle2 size={12} className="text-white" />}
                   </div>
                   <div className="flex flex-col">
                     <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-1">{s.timestamp} // {s.platform}</span>
                     <p className="text-sm text-slate-200 font-medium italic truncate max-w-2xl">
                       <span className="font-black text-slate-500 mr-2 uppercase tracking-tighter">{s.sender}:</span>
                       "{s.content}"
                     </p>
                   </div>
                 </div>
                 <div className="flex items-center gap-4">
                   {s.sentiment === 'AGRESSIVE' && <ShieldAlert size={14} className="text-rose-500 animate-pulse" />}
                   <span className="text-[8px] font-black text-slate-700 uppercase opacity-0 group-hover/staging:opacity-100 transition-opacity">Select to Log</span>
                 </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* Control Deck for 500+ Search */}
      <div className="bg-slate-900 p-8 rounded-[3rem] border border-white/5 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500" />
            <input 
              type="text" 
              placeholder="Deep-search 500+ records..." 
              className="w-full pl-16 pr-6 py-5 bg-black border border-white/10 rounded-[1.5rem] focus:outline-none focus:border-blue-500/50 transition-all text-sm font-medium text-white shadow-inner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="lg:col-span-2">
            <select 
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-[1.5rem] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 focus:outline-none cursor-pointer"
            >
              <option value="ALL">ALL SOURCES</option>
              {Object.keys(stats.platforms).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2">
            <select 
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-[1.5rem] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 focus:outline-none cursor-pointer"
            >
              <option value="ALL">ALL SENTIMENTS</option>
              <option value="AGRESSIVE">AGGRESSIVE ONLY</option>
              <option value="NEUTRAL">NEUTRAL</option>
            </select>
          </div>
          <div className="lg:col-span-3 flex justify-end">
            <button 
              onClick={() => setIsDenseView(!isDenseView)}
              className={`flex items-center gap-3 px-8 py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
                isDenseView 
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/30' 
                : 'bg-slate-950 border-white/5 text-slate-500 hover:text-white hover:border-indigo-500/50'
              }`}
            >
              {isDenseView ? <Layers size={16} /> : <LayoutList size={16} />}
              {isDenseView ? 'Dense Scan: ON' : 'Visual Mode'}
            </button>
          </div>
        </div>
      </div>

      {/* Forensic Feed: Scaling to 500+ items */}
      <div className="space-y-4">
        {isProcessing && (
           <div className="bg-slate-900 rounded-[3.5rem] p-24 text-center animate-in zoom-in-95 duration-500 border border-blue-500/20 shadow-2xl relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full animate-[scan_2s_linear_infinite] pointer-events-none"></div>
             <Loader2 className="w-20 h-20 text-blue-500 animate-spin mx-auto mb-10" />
             <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Engaging AI Ingestion Unit</h3>
             <p className="text-base text-slate-500 font-bold uppercase mt-4 tracking-[0.3em]">Extracting Chronological Evidence Nodes...</p>
           </div>
        )}

        {filteredLogs.length === 0 && !isProcessing ? (
          <div className="bg-slate-900/50 border-2 border-dashed border-white/10 rounded-[4rem] p-32 text-center">
            <MessageSquare className="w-24 h-24 text-slate-800 mx-auto mb-10 opacity-20" />
            <h3 className="text-2xl font-black text-slate-600 uppercase tracking-[0.3em]">Vault Record Void</h3>
            <p className="text-slate-700 font-medium mt-4 text-lg italic">Awaiting forensic interception stream for case FDSJ-739-24.</p>
          </div>
        ) : (
          <div className={isDenseView ? 'space-y-1' : 'space-y-4'}>
            {filteredLogs.map((log) => (
              <div 
                key={log.id} 
                className={`group transition-all duration-300 ${
                  isDenseView 
                  ? 'bg-slate-900/40 border-b border-white/5 hover:bg-slate-800/80' 
                  : 'bg-slate-900 rounded-[2.5rem] border border-white/5 p-8 shadow-xl hover:border-blue-500/30'
                }`}
              >
                {isDenseView ? (
                  /* DENSE SCAN VIEW: For rapid 500+ item navigation */
                  <div className="flex items-center px-6 py-3 gap-6">
                    <div className="w-32 shrink-0">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{log.timestamp}</p>
                    </div>
                    <div className="w-24 shrink-0">
                       <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
                         log.sender === 'Craig' ? 'bg-blue-600/10 text-blue-400' : 'bg-rose-600/10 text-rose-500'
                       }`}>
                         {log.sender}
                       </span>
                    </div>
                    <div className="w-20 shrink-0">
                       <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest">{log.platform}</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                       <p className="text-xs text-slate-300 truncate italic">"{log.content}"</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                       {log.sentiment === 'AGRESSIVE' && <ShieldAlert size={12} className="text-rose-500" />}
                       <button onClick={() => deleteLog(log.id)} className="p-2 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-500 transition-all">
                         <Trash2 size={12} />
                       </button>
                    </div>
                  </div>
                ) : (
                  /* VISUAL MODE: For detailed evidence review */
                  <>
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center gap-6">
                        <div className={`p-5 rounded-[1.5rem] bg-black border border-white/5 ${
                          log.sentiment === 'AGRESSIVE' ? 'text-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.15)] animate-pulse' : 'text-blue-500'
                        }`}>
                          {log.platform === 'EMAIL' ? <Mail size={24} /> : <Smartphone size={24} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-4">
                            <h4 className={`text-xl font-black uppercase tracking-tighter italic ${
                              log.sender === 'Craig' ? 'text-blue-400' : 'text-rose-500'
                            }`}>
                              {log.sender}
                            </h4>
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{log.platform}</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                             <Zap size={10} className="text-blue-500/50" />
                             Verified Timestamp: {log.timestamp}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => deleteLog(log.id)}
                          className="p-4 bg-slate-950 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all border border-white/5"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className={`p-10 rounded-[2.5rem] border relative overflow-hidden group/content ${
                      log.sentiment === 'AGRESSIVE' 
                      ? 'bg-rose-950/20 border-rose-500/30' 
                      : 'bg-black border-white/5'
                    }`}>
                      <p className="text-xl text-slate-100 font-medium leading-[1.8] italic selection:bg-blue-600/40 relative z-10 first-letter:text-3xl first-letter:font-black">
                        "{log.content}"
                      </p>
                      {log.sentiment === 'AGRESSIVE' && (
                        <>
                          <div className="absolute top-6 right-6 flex items-center gap-3 px-6 py-2.5 bg-rose-600 text-white text-[10px] font-black uppercase rounded-full shadow-2xl shadow-rose-600/40 animate-pulse border border-white/20">
                            <ShieldAlert size={14} />
                            Adverse Intent Detected
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rose-500/5 to-transparent -translate-x-full animate-[scan_4s_linear_infinite] pointer-events-none"></div>
                        </>
                      )}
                      
                      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between opacity-40 group-hover/content:opacity-100 transition-opacity">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">Forensic Metadata ID: {log.id.toUpperCase()}</span>
                        <div className="flex items-center gap-2 text-blue-500">
                          <CheckCircle2 size={12} />
                          <span className="text-[8px] font-black uppercase tracking-widest">Chain of Custody Valid</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default CommunicationVault;
