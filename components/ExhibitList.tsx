
import React from 'react';
import { Exhibit, ExhibitCategory } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { MoreVertical, FileText, Download, Trash2, Edit2 } from 'lucide-react';

interface ExhibitListProps {
  exhibits: Exhibit[];
  onDelete: (id: string) => void;
  onEdit: (exhibit: Exhibit) => void;
}

const ExhibitList: React.FC<ExhibitListProps> = ({ exhibits, onDelete, onEdit }) => {
  if (exhibits.length === 0) {
    return (
      <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-600">No exhibits found</h3>
        <p className="text-slate-400">Upload your first file to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {exhibits.map((ex) => (
        <div key={ex.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                  {ex.exhibitNum}
                </span>
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${CATEGORY_COLORS[ex.category]}`}>
                  {ex.category}
                </span>
                <span className="text-slate-400 text-sm">{ex.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => onEdit(ex)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onDelete(ex.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h3 className="font-semibold text-slate-800 mb-1">{ex.description}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{ex.caption}</p>
                <div className="bg-slate-50 border-l-4 border-slate-200 p-3 rounded-r-lg">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Legal Relevance</p>
                  <p className="text-sm text-slate-700 font-medium italic">"{ex.legalRelevance}"</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 flex flex-col justify-center items-center relative overflow-hidden group/img">
                {ex.fileData ? (
                  <img 
                    src={ex.fileData} 
                    alt={ex.description} 
                    className="max-h-32 object-contain rounded shadow-sm transition-transform group-hover/img:scale-110"
                  />
                ) : (
                  <FileText className="w-10 h-10 text-slate-300" />
                )}
                <p className="text-[10px] text-slate-400 mt-2 truncate max-w-full">{ex.fileName}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExhibitList;
