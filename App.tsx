
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
  Scale
} from 'lucide-react';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB limit for single file processing

const App: React.FC = () => {
  const [exhibits, setExhibits] = useState<Exhibit[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<ExhibitCategory | 'all'>('all');
  const [legacyMode, setLegacyMode] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load exhibits from IndexedDB on mount
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

  // Utility to generate SHA-256 hash of a file for Chain of Custody
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
    const processedExhibits: Exhibit[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > MAX_FILE_SIZE) {
        alert(`File ${file.name} exceeds 25MB limit. Please compress for AI forensic processing.`);
        continue;
      }

      const fileHash = await generateHash(file);
      const reader = new FileReader();

      const processFile = new Promise<void>((resolve) => {
        reader.onload = async (event) => {
          const base64 = (event.target?.result as string).split(',')[1];
          try {
            const extracted = await processExhibitFile(
              base64, 
              file.type, 
              file.name, 
              exhibits.length + processedExhibits.length
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
              exhibitNumber: extracted.exhibitNumber || `${exhibits.length + processedExhibits.length + 1}A`,
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
              perjuryFlag: extracted.perjuryFlag
            };
            
            await db.exhibits.add(exhibit);
            processedExhibits.push(exhibit);
          } catch (error: any) {
            console.error('Error processing file:', error);
          }
          resolve();
        };
      });
      
      reader.readAsDataURL(file);
      await processFile;
    }

    setExhibits(prev => [...prev, ...processedExhibits]);
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
  };

  const deleteExhibit = async (id: string) => {
    if (confirm('Are you sure you want to delete this exhibit?')) {
      await db.exhibits.delete(id);
      setExhibits(prev => prev.filter(ex => ex.id !== id));
    }
  };

  const clearAllEvidence = async () => {
    if (confirm('WARNING: This will delete ALL evidence from this case and cannot be undone. Proceed?')) {
      await db.exhibits.clear();
      setExhibits([]);
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
        <div className="max-w-3xl mx-auto space-y-16 py-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="text-center space-y-4">
            <div className="inline-flex p-4 bg-pink-100 rounded-full text-pink-500 shadow-inner">
              <Heart size={48} className="fill-pink-500" />
            </div>
            <h2 className="text-5xl font-serif italic text-slate-800">To my daughter, Harper...</h2>
            <p className="text-slate-500 font-medium text-lg">A digital legacy of truth, documenting my stand for your future.</p>
          </div>
          
          <div className="space-y-24">
            {exhibits.filter(ex => ex.reflection).length === 0 ? (
               <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                 <p className="text-slate-400 font-medium italic">Your legacy reflections will appear here as you process evidence.</p>
               </div>
            ) : (
              exhibits.filter(ex => ex.reflection).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((ex, idx) => (
                <div key={ex.id} className="relative group">
                   <div className="absolute -left-12 top-0 bottom-0 w-px bg-gradient-to-b from-pink-300 via-pink-100 to-transparent"></div>
                   <div className="absolute -left-[54px] top-0 w-11 h-11 bg-white border-2 border-pink-200 rounded-full flex items-center justify-center text-pink-400 font-bold shadow-sm group-hover:scale-110 transition-transform">
                     {idx + 1}
                   </div>
                   <div className="pl-6">
                     <span className="text-xs font-black text-pink-400 uppercase tracking-widest">{ex.date}</span>
                     <p className="text-2xl font-serif leading-relaxed text-slate-700 mt-4 group-hover:text-slate-900 transition-colors">
                       "{ex.reflection}"
                     </p>
                     <div className="mt-8 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                          <ShieldCheck size={18} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Truth Log Entry</p>
                     </div>
                   </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-20 border-t border-slate-100 text-center">
             <div className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-2xl">
               <Zap className="text-yellow-400 fill-yellow-400 w-4 h-4" />
               End of Current Legacy Stream
             </div>
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search exhibits by description or factor..." 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <select 
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none cursor-pointer"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as any)}
                >
                  <option value="all">All Categories</option>
                  {Object.keys(CATEGORY_COLORS).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button 
                  onClick={clearAllEvidence}
                  className="p-3 text-slate-400 hover:text-red-600 transition-colors bg-slate-50 rounded-2xl border border-slate-200"
                  title="Clear All Evidence"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <ExhibitList 
              exhibits={filteredExhibits} 
              onDelete={deleteExhibit}
              onEdit={(ex) => console.log('Edit', ex)} 
            />
          </div>
        );

      case 'prep':
        return <CounselPrepRoom exhibits={exhibits} />;

      case 'affidavit':
        return <AffidavitForge exhibits={exhibits} />;

      case 'sniper':
        return <TruthSniper exhibits={exhibits} />;

      case 'forensics':
        return <ForensicsAnalysis onConvertToExhibit={handleForensicToExhibit} />;

      case 'timeline':
        return <CaseTimeline exhibits={exhibits} />;

      case 'toc':
        return (
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl p-12 legal-font max-w-4xl mx-auto min-h-[800px] relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-slate-900"></div>
            <div className="text-center mb-12 border-b-2 border-slate-100 pb-10">
              <h2 className="text-3xl font-black uppercase tracking-[0.3em] mb-4 text-slate-900">Exhibit Book Index</h2>
              <p className="text-sm font-bold text-slate-500 mb-1">{CASE_DEFAULTS.court}</p>
              <p className="text-sm font-black text-blue-600 mb-1">Case No: {CASE_DEFAULTS.caseNumber}</p>
              <p className="text-sm italic font-medium text-slate-600">{CASE_DEFAULTS.parties}</p>
            </div>
            
            <div className="space-y-12">
              {Object.keys(CATEGORY_COLORS).map(cat => {
                const catExhibits = exhibits.filter(ex => ex.category === cat);
                if (catExhibits.length === 0) return null;
                return (
                  <div key={cat} className="animate-in fade-in slide-in-from-left-4 duration-500">
                    <h3 className="text-xl font-black border-b-4 border-slate-900 mb-6 pb-2 uppercase tracking-tighter flex justify-between items-center">
                      <span>{cat}</span>
                      <span className="text-xs text-slate-400 font-bold tracking-widest">Section {cat.charAt(0)}</span>
                    </h3>
                    <div className="space-y-4">
                      {catExhibits.map((ex, idx) => (
                        <div key={ex.id} className="flex justify-between items-baseline group cursor-default hover:bg-slate-50 p-2 rounded-xl transition-colors">
                          <div className="flex-1 flex items-baseline">
                            <span className="font-black w-16 text-blue-600">{ex.exhibitNumber}</span>
                            <span className="text-base font-bold text-slate-800">{ex.description}</span>
                            <div className="flex-1 mx-4 border-b-2 border-dotted border-slate-200"></div>
                          </div>
                          <span className="text-sm font-black text-slate-900">P. {1 + idx * 3}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'prompts':
        return (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[3rem] p-12 text-white shadow-2xl overflow-hidden relative group">
              <div className="relative z-10">
                <h2 className="text-4xl font-black mb-4 tracking-tighter">AI Studio Prompt Lab</h2>
                <p className="text-blue-100 mb-8 font-medium text-lg max-w-xl">Forensic prompt templates engineered for the New Brunswick Family Court system.</p>
                <div className="flex gap-4">
                  <a href="https://aistudio.google.com" target="_blank" className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-blue-50 transition-all shadow-xl active:scale-95">
                    Open AI Studio <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                <ClipboardList className="w-96 h-96" />
              </div>
            </div>
          </div>
        );

      default:
        return <div>Section under development.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="ml-64 flex-1 p-10">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
                {legacyMode ? 'The Legacy Journey' :
                 activeTab === 'dashboard' ? 'Evidence Command' : 
                 activeTab === 'timeline' ? 'Case Chronology' : 
                 activeTab === 'forensics' ? 'Forensics Lab' : 
                 activeTab === 'prep' ? 'Litigation Prep' :
                 activeTab === 'affidavit' ? 'Affidavit Forge' :
                 activeTab === 'sniper' ? 'Truth Sniper' :
                 activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/([A-Z])/g, ' $1')}
              </h1>
              <p className="text-slate-500 text-sm font-bold mt-2 flex items-center gap-2 uppercase tracking-widest">
                Ref: <span className="font-black text-blue-600">{CASE_DEFAULTS.caseNumber}</span> • {CASE_DEFAULTS.parties}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLegacyMode(!legacyMode)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-xs transition-all border-2 group ${
                legacyMode 
                ? 'bg-pink-600 border-pink-600 text-white shadow-xl shadow-pink-200 hover:bg-pink-700' 
                : 'bg-white border-slate-200 text-slate-600 hover:border-pink-500 hover:text-pink-500 shadow-sm'
              }`}
            >
              {legacyMode ? <Scale className="w-4 h-4" /> : <Heart className="w-4 h-4 group-hover:scale-110 transition-transform" />}
              {legacyMode ? 'SWITCH TO LEGAL' : 'LEGACY MODE'}
            </button>

            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              multiple 
              accept="image/*,.pdf"
              onChange={handleFileUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
            >
              {isProcessing ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Plus className="w-6 h-6" />
              )}
              {isProcessing ? 'Processing...' : 'Upload Evidence'}
            </button>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderContent()}
        </div>

        {isProcessing && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] shadow-2xl p-12 max-w-md w-full text-center space-y-6 transform animate-in zoom-in duration-300">
              <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
                <Loader2 className="w-12 h-12 animate-spin relative z-10" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 flex items-center justify-center gap-3">
                 <Sparkles className="w-8 h-8 text-blue-500 animate-pulse" />
                 AI Forensic Analysis
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed px-4 font-medium">
                Our Senior Forensic Engine is hashing your files for <span className="font-bold text-slate-700">Chain of Custody</span> and running deep vision analysis using high-performance AI.
              </p>
              <div className="w-full bg-slate-100 rounded-full h-3 mt-6 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full animate-progress shadow-[0_0_15px_rgba(37,99,235,0.6)]"></div>
              </div>
            </div>
          </div>
        )}
      </main>

      <LegalChatbot exhibits={exhibits} />
      
      <style>{`
        @keyframes progress {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 70%; transform: translateX(0); }
          100% { width: 100%; transform: translateX(100%); }
        }
        .animate-progress {
          animation: progress 2.5s ease-in-out infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default App;
