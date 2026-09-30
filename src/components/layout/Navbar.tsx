import React from 'react';
import { 
  BookOpen, 
  Layers, 
  Users, 
  History, 
  Database, 
  Sparkles,
  ShieldCheck,
  Search
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenNewProduct: () => void;
  syncStatus: { connected: boolean; lastSync?: string };
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  searchQuery,
  setSearchQuery,
  onOpenNewProduct,
  syncStatus
}) => {
  const navItems = [
    { id: 'catalogue', label: 'Catalogue', icon: BookOpen },
    { id: 'ingredients', label: 'Botanicals', icon: Sparkles },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'users', label: 'Practitioners & Users', icon: Users },
    { id: 'audit', label: 'Audit Trail', icon: History },
    { id: 'database', label: 'Cloud Supabase', icon: Database },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#081C13]/90 backdrop-blur-md border-b border-[#23493C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => setCurrentTab('catalogue')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-[#10B981] p-0.5 shadow-lg shadow-emerald-950/40">
              <div className="w-full h-full bg-[#0D281C] rounded-[10px] flex items-center justify-center text-emerald-400">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-lg text-emerald-100 tracking-wide">AyurGuide</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">Clinical Admin</span>
              </div>
              <p className="text-[11px] text-emerald-400/70 font-sans">Sitaram Classical Apothecary</p>
            </div>
          </div>

          {/* Search Box in Header */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-emerald-400/60 absolute left-3 top-2.5" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search formulations, Sanskrit names, indications..."
              className="w-full bg-[#0D281C]/80 border border-[#23493C] text-sm text-gray-200 placeholder-emerald-600/60 rounded-xl pl-9 pr-4 py-1.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Quick Action & User Info */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenNewProduct}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-xs font-semibold hover:from-emerald-500 hover:to-emerald-600 transition shadow-sm border border-emerald-500/30"
            >
              <span className="text-base leading-none font-bold">+</span>
              <span>New Medicine</span>
            </button>

            {/* Cloud Status Pill */}
            <div 
              onClick={() => setCurrentTab('database')} 
              className="cursor-pointer hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0D281C] border border-[#23493C] text-[11px] text-emerald-300 hover:border-emerald-600 transition"
              title="Supabase Central Database Status"
            >
              <div className={`w-2 h-2 rounded-full ${syncStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{syncStatus.connected ? 'Supabase Realtime Live' : 'Offline / Local'}</span>
            </div>

            {/* Admin Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#23493C]">
              <div className="w-8 h-8 rounded-full bg-emerald-900 border border-emerald-700 flex items-center justify-center text-xs font-bold text-emerald-200">
                JA
              </div>
              <div className="hidden xl:block text-left">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-gray-200">Jerin Admin</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-[10px] text-emerald-400/80">Lead Administrator</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 border-t border-[#23493C]/40 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  active
                    ? 'bg-emerald-800/40 text-emerald-300 border border-emerald-700/60 shadow-xs'
                    : 'text-gray-300 hover:text-white hover:bg-emerald-950/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-emerald-400' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
