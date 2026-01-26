
import React from 'react';
import { 
  Files, 
  LayoutDashboard, 
  BookOpen,
  Settings,
  HelpCircle,
  Clock,
  ScanSearch,
  Briefcase,
  PenTool,
  Target,
  MessageSquare
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const PLACEDLogo = () => (
  <div className="relative w-10 h-10 flex items-center justify-center">
    <div className="absolute inset-0 bg-blue-600 rounded-lg rotate-3 shadow-lg"></div>
    <div className="absolute inset-0 bg-blue-500 rounded-lg -rotate-3 border border-white/20 shadow-xl flex items-center justify-center">
      <span className="text-white font-black text-xl italic">P</span>
    </div>
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'exhibits', label: 'The Record', icon: Files },
    { id: 'comms', label: 'Comm Log', icon: MessageSquare },
    { id: 'affidavit', label: 'Forge Node', icon: PenTool },
    { id: 'sniper', label: 'Perjury Sniper', icon: Target },
    { id: 'prep', label: 'Strategy Room', icon: Briefcase },
    { id: 'forensics', label: 'Forensic Lab', icon: ScanSearch },
    { id: 'timeline', label: 'Chronology', icon: Clock },
    { id: 'toc', label: 'Index Book', icon: BookOpen },
    { id: 'prompts', label: 'Prompt Lab', icon: HelpCircle },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 p-6 flex flex-col z-40 border-r border-white/5 shadow-2xl">
      <div className="flex items-center gap-4 mb-12">
        <PLACEDLogo />
        <div>
          <h1 className="font-black text-xl leading-none tracking-tighter text-white uppercase italic">PLACED //</h1>
          <p className="text-[10px] text-blue-400 font-black tracking-[0.3em] uppercase mt-1">CORE SYSTEM</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 translate-x-1' 
                : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <item.icon className={`w-5 h-5 transition-transform duration-500 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className="font-bold text-xs uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="pt-6 border-t border-white/5 mt-auto">
        <button 
          onClick={() => setActiveTab('params')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
            activeTab === 'params' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-200'
          }`}
        >
          <Settings className={`w-5 h-5 group-hover:rotate-90 transition-transform duration-500 ${activeTab === 'params' ? 'text-blue-500' : ''}`} />
          <span className="font-bold text-xs uppercase tracking-widest">System Params</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
