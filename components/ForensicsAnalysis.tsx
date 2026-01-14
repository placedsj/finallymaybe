
import React, { useState } from 'react';
// Fixed: Incident interface now correctly imported from types
import { Incident, ExhibitCategory } from '../types';
import { analyzeLegalForensics } from '../services/geminiService';
import { CATEGORY_COLORS } from '../constants';
import { 
  Search, 
  ShieldAlert, 
  MessageSquare, 
  Activity, 
  ArrowRight, 
  AlertCircle,
  FileSearch,
  CheckCircle2
} from 'lucide-react';

interface ForensicsAnalysisProps {
  onConvertToExhibit: (incident: Incident) => void;
}

const ForensicsAnalysis: React.FC<ForensicsAnalysisProps> = ({ onConvertToExhibit }) => {
  const [inputText, setInputText] = useState('');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    try {
      const results = await analyzeLegalForensics(inputText);
      // Fixed: Mapped or casted forensic results to the Incident type
      setIncidents(results as unknown as Incident[]);
    } catch (error) {
      console.error("Forensics Error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-blue-600" />
          Raw Evidence Input
        </h3>
        <textarea
          className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm transition-all"
          placeholder="Paste text message logs, email threads, or witness transcripts here for legal forensics analysis..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !inputText.trim()}
            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? (
              <Activity className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            {isAnalyzing ? 'Analyzing Forensic Data...' : 'Run Forensic Analysis'}
          </button>
        </div>
      </div>

      {incidents.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 uppercase tracking-widest text-sm">Extracted Incident Log</h3>
            <span className="text-xs text-slate-400 font-bold">{incidents.length} INCIDENTS FOUND</span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {incidents.sort((a, b) => b.priority - a.priority).map((incident, idx) => (
              <div key={incident.id || idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row">
                  {/* Left Priority Sidebar */}
                  <div className={`w-full md:w-2 ${incident.priority >= 8 ? 'bg-red-500' : incident.priority >= 5 ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                  
                  <div className="flex-1 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="px-3 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600 border border-slate-200">
                          {incident.date}
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${CATEGORY_COLORS[incident.category]}`}>
                          {incident.category}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <MessageSquare className="w-3.5 h-3.5" />
                          Witness: <span className="text-slate-900 font-bold">{incident.witness}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Priority</span>
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${incident.priority >= 8 ? 'bg-red-500' : incident.priority >= 5 ? 'bg-amber-500' : 'bg-blue-500'}`}
                              style={{ width: `${incident.priority * 10}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold text-slate-700">{incident.priority}/10</span>
                        </div>
                        {incident.perjuryFlag && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded text-[10px] font-black uppercase animate-pulse">
                            <ShieldAlert className="w-3 h-3" />
                            Perjury Risk
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <p className="text-sm text-slate-700 font-medium bg-blue-50/50 p-3 rounded-lg border-l-4 border-blue-200 leading-relaxed italic">
                          "{incident.legalNarrative}"
                        </p>
                      </div>
                      <div className="flex items-end justify-end">
                        <button 
                          onClick={() => onConvertToExhibit(incident)}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Convert to Exhibit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {incidents.length === 0 && !isAnalyzing && (
        <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
          <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h4 className="text-slate-600 font-bold">No forensic data analyzed yet</h4>
          <p className="text-slate-400 text-sm">Paste logs above to start the extraction process.</p>
        </div>
      )}
    </div>
  );
};

export default ForensicsAnalysis;
