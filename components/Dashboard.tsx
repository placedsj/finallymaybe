
import React from 'react';
import { Exhibit, ExhibitCategory } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertCircle, FilePlus, Users, Scale } from 'lucide-react';
import { CATEGORY_COLORS } from '../constants';

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
    { label: 'High Priority', value: exhibits.filter(e => [ExhibitCategory.VIOLENCE, ExhibitCategory.SUBSTANCE].includes(e.category)).length, icon: AlertCircle, color: 'text-red-600' },
    { label: 'Parties Involved', value: '2', icon: Users, color: 'text-slate-600' },
    { label: 'Legal Citations', value: exhibits.filter(e => e.legalRelevance.includes('Act')).length, icon: Scale, color: 'text-emerald-600' },
  ];

  const barColors = {
    [ExhibitCategory.VIOLENCE]: '#ef4444',
    [ExhibitCategory.SUBSTANCE]: '#a855f7',
    [ExhibitCategory.CONTEMPT]: '#f59e0b',
    [ExhibitCategory.FINANCIAL]: '#10b981',
    [ExhibitCategory.PARENTING]: '#3b82f6',
    [ExhibitCategory.INTEGRITY]: '#64748b',
    [ExhibitCategory.MEDICAL]: '#06b6d4',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Metrics</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            Evidence Distribution
            <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded">By Category</span>
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryCounts} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 12, fontWeight: 500 }} 
                  width={100} 
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                  {categoryCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[entry.name as ExhibitCategory]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3 flex-1">
            <button 
              onClick={onUploadClick}
              className="flex items-center gap-4 p-4 border border-blue-100 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-left"
            >
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <FilePlus className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-blue-900">Upload New Evidence</p>
                <p className="text-xs text-blue-700">Auto-process images and documents with AI</p>
              </div>
            </button>
            <button className="flex items-center gap-4 p-4 border border-slate-100 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-left">
              <div className="bg-slate-700 p-2 rounded-lg text-white">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Generate Witness List</p>
                <p className="text-xs text-slate-600">Cross-reference exhibits with testimony</p>
              </div>
            </button>
            <button className="flex items-center gap-4 p-4 border border-emerald-100 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors text-left">
              <div className="bg-emerald-600 p-2 rounded-lg text-white">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-emerald-900">Draft Affidavit</p>
                <p className="text-xs text-emerald-700">Start a court-ready filing based on evidence</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
