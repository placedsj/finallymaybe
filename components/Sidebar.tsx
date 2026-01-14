
import React from 'react';
import { 
  Gavel, 
  Files, 
  ShieldCheck, 
  LayoutDashboard, 
  BookOpen,
  Settings,
  HelpCircle,
  Clock,
  ScanSearch,
  Briefcase,
  PenTool,
  Target
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'exhibits', label: 'Exhibit List', icon: Files },
    { id: 'affidavit', label: 'Affidavit Forge', icon: PenTool },
    { id: 'sniper', label: 'Truth Sniper', icon: Target },
    { id: 'prep', label: 'Counsel Prep Room', icon: Briefcase },
    { id: 'forensics', label: 'Legal Forensics', icon: ScanSearch },
    { id: 'timeline', label: 'Case Timeline', icon: Clock },
    { id: 'toc', label: 'Table of Contents', icon: BookOpen },
    { id: 'prompts', label: 'AI Prompt Library', icon: HelpCircle },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 p-4 flex flex-col z-40">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
          <Gavel className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight text-white">Exhibit Pro</h1>
          <p className="text-[10px] text-blue-400 font-black tracking-widest uppercase">FDSJ-739-2024</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="pt-6 border-t border-slate-800 mt-auto">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 transition-colors group">
          <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
          <span className="font-medium text-sm">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
