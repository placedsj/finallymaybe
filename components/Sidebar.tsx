
import React from 'react';
import { 
  Gavel, 
  Files, 
  ShieldCheck, 
  LayoutDashboard, 
  BookOpen,
  Settings,
  HelpCircle,
  Clock
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'exhibits', label: 'Exhibit List', icon: Files },
    { id: 'timeline', label: 'Case Timeline', icon: Clock },
    { id: 'chain', label: 'Chain of Custody', icon: ShieldCheck },
    { id: 'toc', label: 'Table of Contents', icon: BookOpen },
    { id: 'prompts', label: 'AI Prompt Library', icon: HelpCircle },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 p-4 flex flex-col">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Gavel className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">Exhibit Pro</h1>
          <p className="text-xs text-slate-400">FDSJ-739-2024</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="pt-6 border-t border-slate-800 mt-auto">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 transition-colors">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
