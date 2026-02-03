
import React, { useState, useCallback, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ExhibitList from './components/ExhibitList';
import CaseTimeline from './components/CaseTimeline';
import ForensicsAnalysis from './components/ForensicsAnalysis';
import CounselPrepRoom from './components/CounselPrepRoom';
import AffidavitForge from './components/AffidavitForge';
import TruthSniper from './components/TruthSniper';
import LegalChatbot from './components/LegalChatbot';
import SystemParams from './components/SystemParams';
import ExhibitBook from './components/ExhibitBook';
import CommunicationVault from './components/CommunicationVault'; // New import
import { Exhibit, ExhibitCategory, Incident } from './types';
import { CASE_DEFAULTS, CATEGORY_COLORS } from './constants';
import { processExhibitFile, deepImageAnalysis } from './services/geminiService';
import { db } from './services/db';
import { 
  Plus, 
  Search, 
  Loader2, 
  ExternalLink,
  ClipboardList,
  Sparkles,
  Trash2,
  ShieldCheck,
  Zap,
  Heart,
  Scale,
  Book,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB limit for single file processing

const App: React.FC = () => {
  const [exhibits, setExhibits] = useState<Exhibit[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<ExhibitCategory | 'all'>('all');
  const [legacyMode, setLegacyMode] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [committedAffidavit, setCommittedAffidavit] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedExhibits = await db.exhibits.toArray();
        setExhibits(storedExhibits);
      } catch (err) {
        console.error("Failed to load IndexedDB data:", err);
      }
    };
    loadData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const generateHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const newExhibits: Exhibit[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_FILE_SIZE) {
        showToast(`File ${file.name} exceeds 25MB limit.`, 'error');
        continue;
      }

      const fileHash = await generateHash(file);
      const reader = new FileReader();

      await new Promise<void>((resolve) => {
        reader.onload = async (event) => {
          const base64 = (event.target?.result as string).split(',')[1];
          try {
            const currentCount = exhibits.length + newExhibits.length;
            const extracted = await processExhibitFile(
              base64, 
              file.type, 
              file.name, 
              currentCount
            );

            let deepCaption = extracted.caption || '';
            if (file.type.startsWith('image/')) {
               try {
                 const analysis = await deepImageAnalysis(base64, file.type);
                 if (analysis) deepCaption = analysis;
               } catch (imageErr: any) {
                 console.warn('Multimodal image analysis failed', imageErr);
               }
            }
            
            const exhibit: Exhibit = {
              id: Math.random().toString(36).substr(2, 9),
              exhibitNumber: extracted.exhibitNumber || `${currentCount + 1}A`,
              date: extracted.date || new Date().toLocaleDateString(),
              category: (extracted.category as ExhibitCategory) || ExhibitCategory.INTEGRITY,
              description: extracted.description || file.name,
              legalRelevance: extracted.legalRelevance || '',
              bestInterestFactor: extracted.bestInterestFactor,
              reflection: extracted.reflection,
              contradictionNote: extracted.contradictionNote,
              caption: deepCaption,
              fileUrl: event.target?.result as string,
              fileName: file.name,
              fileType: file.type,
              fileHash: fileHash,
              priority: extracted.priority || 5,
              witnesses: extracted.witnesses || [],
              status: 'processed',
              perjuryFlag: extracted.perjuryFlag,
              bestInterestMapping: extracted.bestInterestMapping
            };
            
            await db.exhibits.add(exhibit);
            newExhibits.push(exhibit);
            
            showToast(`Exhibit ${exhibit.exhibitNumber} Secured: ${file.name}`);
          } catch (error: any) {
            console.error('Error processing file:', error);
            showToast(`Core processing failed for ${file.name}`, 'error');
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }

    setExhibits(prev => [...prev, ...newExhibits]);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setActiveTab('exhibits');
  };

  const handleForensicToExhibit = async (incident: Incident) => {
    const newExhibit: Exhibit = {
      id: Math.random().toString(36).substr(2, 9),
      exhibitNumber: `F-${exhibits.length + 1}`,
      date: incident.date || new Date().toLocaleDateString(),
      category: incident.category || ExhibitCategory.OBSTRUCTION,
      description: `Forensic Extraction: ${incident.witness} Incident`,
      legalRelevance: incident.legalNarrative || '',
      caption: `Auto-extracted via Forensic Expert tool. Witness: ${incident.witness}. Perjury Risk: ${incident.perjuryFlag ? 'HIGH' : 'LOW'}.`,
      fileUrl: '',
      fileName: 'forensic_extract.txt',
      fileType: 'text/plain',
      priority: incident.priority || 5,
      witnesses: [incident.witness],
      status: incident.perjuryFlag ? 'flagged' : 'processed',
      perjuryFlag: incident.perjuryFlag
    };
    await db.exhibits.add(newExhibit);
    setExhibits(prev => [...prev, newExhibit]);
    showToast(`Incident converted to Exhibit ${newExhibit.exhibitNumber}`);
  };

  const deleteExhibit = async (id: string) => {
    if (confirm('Are you sure you want to delete this exhibit?')) {
      await db.exhibits.delete(id);
      setExhibits(prev => prev.filter(ex => ex.id !== id));
      showToast('Exhibit purged from record.');
    }
  };

  const filteredExhibits = exhibits.filter(ex => {
    const matchesSearch = ex.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ex.exhibitNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || ex.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const renderContent = () => {
    if (legacyMode) {
      return (
        <div className="max-w-4xl mx-auto space-y-20 py-20 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="text-center space-y-8">
            <div className="inline-flex p-6 bg-pink-100 rounded-full text-pink-500 shadow-xl shadow-pink-200">
              <Heart size={64} className="fill-pink-500" />
            </div>
            <h2 className="text-7xl font-serif italic text-slate-100 tracking-tight">To Harper...</h2>
            <div className="flex items-center justify-center gap-4 text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">
              <div className="w-12 h-px bg-slate-800"></div>
              Your Legacy Journey
              <div className="w-12 h-px bg-slate-800"></div>
            </div>
            <p className="text-slate-400 font-medium text-xl max-w-2xl mx-auto leading-relaxed">
              This isn't just about courtrooms. This is the truth I kept safe for you, so you'll always know how hard I fought for your stability.
            </p>
          </div>
          
          <div className="space-y-32">
            {exhibits.filter(ex => ex.reflection).length === 0 ? (
               <div className="text-center py-32 bg-slate-900 rounded-[4rem] border border-white/5 shadow-sm flex flex-col items-center">
                 <Book className="w-16 h-16 text-slate-800 mb-6" />
                 <p className="text-slate-600 font-medium italic text-lg">Your legacy reflections will bloom here as evidence is processed.</p>
               </div>
            ) : (
              exhibits.filter(ex => ex.reflection).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((ex, idx) => (
                <div key={ex.id} className="relative group max-w-2xl mx-auto">
                   <div className="absolute -left-20 top-0 bottom-0 w-px bg-gradient-to-b from-pink-500/50 via-pink-500/10 to-transparent"></div>
                   <div className="absolute -left-[102px] top-0 w-12 h-12 bg-slate-900 border-2 border-pink-500 rounded-full flex items-center justify-center text-pink-500 font-black shadow-lg group-hover:scale-125 transition-transform group-hover:bg-pink-500 group-hover:text-white group-hover:border-pink-500 duration-500">
                     {idx + 1}
                   </div>
                   <div className="space-y-6">
                     <div className="flex items-center gap-3">
                       <span className="text-[10px] font-black text-pink-400 uppercase tracking-[0.3em]">{ex.date}</span>
                       <div className="h-px flex-1 bg-pink-500/10"></div>
                     </div>
                     <p className="text-3xl font-serif leading-relaxed text-slate-100 first-letter:text-5xl first-letter:font-black first-letter:text-pink-500 group-hover:text-white transition-colors">
                       "{ex.reflection}"
                     </p>
                     <div className="pt-4 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-500">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-white shadow-lg border border-white/5">
                          <ShieldCheck size={14} className="text-pink-400" />
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Digital Timestamp Secured • FDSJ-739-24</p>
                     </div>
                   </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard exhibits={exhibits} onUploadClick={() => fileInputRef.current?.click()} />;
      
      case 'exhibits':
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-sm">
              <div className="flex-1 relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search the record..." 
                  className="w-full pl-14 pr-6 py-4 bg-slate-950 border border-white/5 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <select 
                  className="bg-slate-950 border border-white/5 rounded-[1.5rem] px-6 py-4 text-xs font-black uppercase tracking-widest focus:outline-none cursor-pointer text-slate-400 hover:text-white transition-colors"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as any)}
                >
                  <option value="all">ALL CATEGORIES</option>
                  {Object.keys(CATEGORY_COLORS).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <ExhibitList exhibits={filteredExhibits} onDelete={deleteExhibit} onEdit={(ex) => console.log('Edit', ex)} />
          </div>
        );

      case 'comms': return <CommunicationVault />; // Integrated the new tab
      case 'prep': return <CounselPrepRoom exhibits={exhibits} />;
      case 'affidavit': return <AffidavitForge exhibits={exhibits} onCommit={(draft) => {
        setCommittedAffidavit(draft);
        showToast("Affidavit Secured to Exhibit Book.");
      }} />;
      case 'sniper': return <TruthSniper exhibits={exhibits} />;
      case 'forensics': return <ForensicsAnalysis onConvertToExhibit={handleForensicToExhibit} />;
      case 'timeline': return <CaseTimeline exhibits={exhibits} />;
      case 'params': return <SystemParams />;
      case 'toc': return <ExhibitBook exhibits={exhibits} affidavitDraft={committedAffidavit} />;

      case 'prompts':
        return (
          <div className="max-w-4xl mx-auto space-y-12 pb-20">
            <div className="bg-slate-900 rounded-[4rem] p-16 text-white shadow-2xl overflow-hidden relative group border border-white/5">
              <div className="relative z-10">
                <h2 className="text-6xl font-black mb-6 tracking-tighter leading-tight italic">Forensic Intelligence<br/>Prompt Library</h2>
                <p className="text-slate-400 mb-12 font-medium text-xl max-w-xl leading-relaxed">
                  Engineered prompts specifically for the New Brunswick Family Court system.
                </p>
                <div className="flex gap-6">
                  <a href="https://aistudio.google.com" target="_blank" className="bg-blue-600 text-white px-10 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest flex items-center gap-4 hover:bg-blue-500 transition-all shadow-2xl active:scale-95">
                    Open AI Studio <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div className="p-20 text-center text-slate-600 font-bold uppercase tracking-widest">Section under development.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex relative overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="ml-64 flex-1 p-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 to-slate-950">
        <header className="flex items-center justify-between mb-12 print:hidden">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                {legacyMode ? 'The Legacy Journey' :
                 activeTab === 'dashboard' ? 'Evidence Command' : 
                 activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/([A-Z])/g, ' $1')}
              </h1>
              <p className="text-slate-500 text-sm font-bold mt-2 flex items-center gap-3 uppercase tracking-[0.2em]">
                Ref: <span className="font-black text-blue-500">{CASE_DEFAULTS.caseNumber}</span> • {CASE_DEFAULTS.parties}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLegacyMode(!legacyMode)}
              className={`flex items-center gap-3 px-8 py-5 rounded-[1.5rem] font-black text-xs transition-all border-2 group shadow-xl ${
                legacyMode 
                ? 'bg-pink-600 border-pink-600 text-white' 
                : 'bg-slate-900 border-white/5 text-slate-400 hover:text-pink-500 hover:border-pink-500 shadow-slate-200/50'
              }`}
            >
              {legacyMode ? <Scale className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
              {legacyMode ? 'SWITCH TO LITIGATION' : 'HARPER\'S LEGACY'}
            </button>

            <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*,.pdf" onChange={handleFileUpload} />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="bg-blue-600 text-white px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-blue-500 transition-all shadow-2xl disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              {isProcessing ? 'Processing...' : 'Upload Evidence'}
            </button>
          </div>
        </header>

        <div className="animate-in fade-in duration-700">
          {renderContent()}
        </div>

        {isProcessing && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-50 flex items-center justify-center p-6">
            <div className="bg-slate-900 rounded-[4rem] shadow-2xl p-16 max-w-lg w-full text-center space-y-8 transform animate-in zoom-in-95 duration-500 border border-white/5">
              <div className="w-28 h-28 bg-blue-600/10 text-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4 relative overflow-hidden border border-blue-600/20">
                <Loader2 className="w-12 h-12 animate-spin relative z-10" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-white flex items-center justify-center gap-3 tracking-tighter italic">
                   PLACED // ANALYZING
                </h2>
                <p className="text-slate-500 text-lg leading-relaxed font-medium">
                  Hashing file metadata and verifying <span className="font-black text-blue-500">Chain of Custody</span>.
                </p>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-4 mt-8 overflow-hidden p-1 border border-white/5">
                <div className="bg-blue-600 h-full rounded-full animate-progress shadow-neon"></div>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-bottom-10 fade-in duration-500 print:hidden">
            <div className={`flex items-center gap-4 px-8 py-5 rounded-[2rem] shadow-2xl border-2 backdrop-blur-xl ${
              toast.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-100' : 'bg-rose-950/80 border-rose-500/30 text-rose-100'
            }`}>
              {toast.type === 'success' ? <CheckCircle className="text-emerald-500" /> : <AlertCircle className="text-rose-500" />}
              <span className="font-black text-xs uppercase tracking-widest">{toast.message}</span>
            </div>
          </div>
        )}
      </main>

      <div className="print:hidden">
        <LegalChatbot exhibits={exhibits} />
      </div>
      
      <style>{`
        .shadow-neon { box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); }
        @keyframes progress {
          0% { width: 0%; transform: translateX(-100%); }
          100% { width: 100%; transform: translateX(100%); }
        }
        .animate-progress { animation: progress 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default App;
