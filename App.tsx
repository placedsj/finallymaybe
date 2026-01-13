
import React, { useState, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ExhibitList from './components/ExhibitList';
import CaseTimeline from './components/CaseTimeline';
import { Exhibit, ExhibitCategory } from './types';
import { CASE_DEFAULTS, CATEGORY_COLORS } from './constants';
import { processExhibitFile } from './services/geminiService';
import { 
  Plus, 
  Upload, 
  Search, 
  Filter, 
  Loader2, 
  ExternalLink,
  ClipboardList,
  CheckCircle2,
  FileText
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [exhibits, setExhibits] = useState<Exhibit[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<ExhibitCategory | 'all'>('all');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const newExhibits: Exhibit[] = [...exhibits];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      const processFile = new Promise<void>((resolve) => {
        reader.onload = async (event) => {
          const base64 = (event.target?.result as string).split(',')[1];
          try {
            const extracted = await processExhibitFile(
              base64, 
              file.type, 
              file.name, 
              newExhibits.length
            );
            
            const exhibit: Exhibit = {
              id: Math.random().toString(36).substr(2, 9),
              exhibitNum: extracted.exhibitNum || `A-${newExhibits.length + 1}`,
              date: extracted.date || new Date().toLocaleDateString(),
              category: extracted.category || ExhibitCategory.INTEGRITY,
              description: extracted.description || file.name,
              legalRelevance: extracted.legalRelevance || '',
              caption: extracted.caption || '',
              chainOfCustody: extracted.chainOfCustody!,
              fileData: event.target?.result as string,
              fileName: file.name
            };
            
            newExhibits.push(exhibit);
          } catch (error) {
            console.error('Error processing file:', error);
          }
          resolve();
        };
      });
      
      reader.readAsDataURL(file);
      await processFile;
    }

    setExhibits(newExhibits);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setActiveTab('exhibits');
  };

  const deleteExhibit = (id: string) => {
    setExhibits(prev => prev.filter(ex => ex.id !== id));
  };

  const filteredExhibits = exhibits.filter(ex => {
    const matchesSearch = ex.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ex.exhibitNum.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || ex.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard exhibits={exhibits} onUploadClick={() => fileInputRef.current?.click()} />;
      
      case 'exhibits':
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search exhibits by name or number..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <Filter className="w-4 h-4" />
                  <span>Category:</span>
                </div>
                <select 
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as any)}
                >
                  <option value="all">All Categories</option>
                  {Object.values(ExhibitCategory).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <ExhibitList 
              exhibits={filteredExhibits} 
              onDelete={deleteExhibit}
              onEdit={(ex) => console.log('Edit', ex)} 
            />
          </div>
        );

      case 'timeline':
        return <CaseTimeline exhibits={exhibits} />;

      case 'toc':
        return (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 legal-font max-w-4xl mx-auto min-h-[800px]">
            <div className="text-center mb-10 border-b pb-8">
              <h2 className="text-2xl font-bold uppercase tracking-widest mb-2">Exhibit Book Table of Contents</h2>
              <p className="text-sm font-bold">{CASE_DEFAULTS.court}</p>
              <p className="text-sm">Case No: {CASE_DEFAULTS.caseNumber}</p>
              <p className="text-sm italic">{CASE_DEFAULTS.parties}</p>
            </div>
            
            <div className="space-y-8">
              {Object.values(ExhibitCategory).map(cat => {
                const catExhibits = exhibits.filter(ex => ex.category === cat);
                if (catExhibits.length === 0) return null;
                return (
                  <div key={cat}>
                    <h3 className="text-lg font-bold border-b-2 border-slate-900 mb-4 pb-1 uppercase">{cat}</h3>
                    <div className="space-y-3">
                      {catExhibits.map((ex, idx) => (
                        <div key={ex.id} className="flex justify-between items-baseline group cursor-default">
                          <div className="flex-1 flex items-baseline">
                            <span className="font-bold w-12">{ex.exhibitNum}</span>
                            <span className="text-sm">{ex.description}</span>
                            <div className="flex-1 mx-2 border-b border-dotted border-slate-300"></div>
                          </div>
                          <span className="text-sm font-bold">P. {1 + idx * 3}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'chain':
        return (
          <div className="space-y-4">
             {exhibits.map(ex => (
               <div key={ex.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <div className="flex items-center gap-3 mb-4">
                   <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                   <h3 className="font-bold text-slate-800">Exhibit {ex.exhibitNum}: Chain of Custody</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   <div>
                     <p className="text-xs font-bold text-slate-400 uppercase mb-1">Source</p>
                     <p className="text-sm text-slate-700">{ex.chainOfCustody.source}</p>
                   </div>
                   <div>
                     <p className="text-xs font-bold text-slate-400 uppercase mb-1">Date Obtained</p>
                     <p className="text-sm text-slate-700">{ex.chainOfCustody.dateObtained}</p>
                   </div>
                   <div>
                     <p className="text-xs font-bold text-slate-400 uppercase mb-1">Storage</p>
                     <p className="text-sm text-slate-700">{ex.chainOfCustody.custody}</p>
                   </div>
                   <div>
                     <p className="text-xs font-bold text-slate-400 uppercase mb-1">Authentication</p>
                     <p className="text-sm text-slate-700">{ex.chainOfCustody.authentication}</p>
                   </div>
                 </div>
               </div>
             ))}
          </div>
        );

      case 'prompts':
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-blue-600 rounded-2xl p-8 text-white shadow-lg overflow-hidden relative">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2">AI Studio Prompt Library</h2>
                <p className="text-blue-100 mb-6">Optimized prompts for New Brunswick Family Court preparation.</p>
                <div className="flex gap-4">
                  <a href="https://aistudio.google.com" target="_blank" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-50 transition-colors">
                    Open AI Studio <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 opacity-10">
                <ClipboardList className="w-64 h-64" />
              </div>
            </div>

            {[
              { title: "Prompt 1: Extraction & Categorization", desc: "Extract metadata from raw images and documents." },
              { title: "Prompt 2: Court-Ready Captions", desc: "Generate professional legal captions with best interest focus." },
              { title: "Prompt 3: Table of Contents", desc: "Organize 40+ exhibits into tiered sections." }
            ].map((p, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm group">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900">{p.title}</h3>
                    <p className="text-sm text-slate-500">{p.desc}</p>
                  </div>
                  <button className="bg-slate-100 text-slate-600 p-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                    <ClipboardList className="w-5 h-5" />
                  </button>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg font-mono text-xs text-slate-600 border border-slate-100 overflow-x-auto">
                  <code>{`You are a legal exhibit organizer for... [Click to Copy]`}</code>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return <div>Section under development.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="ml-64 flex-1 p-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {activeTab === 'dashboard' ? 'Case Dashboard' : activeTab === 'timeline' ? 'Case Timeline' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <p className="text-slate-500 text-sm">Case Reference: <span className="font-medium text-slate-700">{CASE_DEFAULTS.caseNumber}</span></p>
          </div>

          <div className="flex items-center gap-3">
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
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              {isProcessing ? 'Processing...' : 'Add Exhibit'}
            </button>
          </div>
        </header>

        {renderContent()}

        {isProcessing && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center space-y-4">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">AI Legal Processor</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                We are currently analyzing your documents, extracting key dates, and generating legal relevance based on the Family Services Act.
              </p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-6">
                <div className="bg-blue-600 h-1.5 rounded-full animate-progress" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
