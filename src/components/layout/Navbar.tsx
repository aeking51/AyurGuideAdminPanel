import React, { useState } from 'react';
import { 
  BookOpen, 
  Layers, 
  Users, 
  History, 
  Database, 
  Sparkles,
  ShieldCheck,
  Search,
  UserCheck,
  UserX,
  ChevronDown,
  LogOut,
  LogIn,
  Check,
  X,
  RefreshCw,
  KeyRound
} from 'lucide-react';
import { User } from '../../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenNewProduct: () => void;
  syncStatus: { connected: boolean; lastSync?: string };
  activeUser: User | null;
  users: User[];
  onSelectUser: (user: User | null) => void;
  onReloadCurrentTab?: () => void;
  isReloading?: boolean;
  onChangePassword?: (user: User | null) => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  searchQuery,
  setSearchQuery,
  onOpenNewProduct,
  syncStatus,
  activeUser,
  users,
  onSelectUser,
  onReloadCurrentTab,
  isReloading = false,
  onChangePassword,
  onSignOut,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  const navItems = [
    { id: 'catalogue', label: 'Catalogue', icon: BookOpen },
    { id: 'ingredients', label: 'Herbs & Botanicals', icon: Sparkles },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'users', label: 'Practitioners & Users', icon: Users },
    { id: 'audit', label: 'Audit Trail', icon: History },
    { id: 'database', label: 'Cloud Supabase', icon: Database },
  ];

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    const email = customEmail.trim().toLowerCase();
    const name = customName.trim() || email.split('@')[0];
    onSelectUser({
      id: `user_${Date.now()}`,
      name,
      email,
      role: 'ADMIN',
      roleTitle: 'Clinical Administrator',
      status: 'Active',
      createdAt: new Date().toISOString()
    });
    setCustomEmail('');
    setCustomName('');
    setIsUserMenuOpen(false);
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return 'GU';
  };

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

          {/* Quick Action & User Session Switcher */}
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
              <span>{syncStatus.connected ? 'Supabase Live' : 'Offline'}</span>
            </div>

            {/* Active User Badge / Session Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 pl-2 border-l border-[#23493C] hover:opacity-90 transition focus:outline-none text-left"
                title="Click to switch active user or sign in as Guest user"
              >
                {activeUser ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-emerald-900 border border-emerald-600 flex items-center justify-center text-xs font-bold text-emerald-200 shrink-0">
                      {getInitials(activeUser.name, activeUser.email)}
                    </div>
                    <div className="hidden xl:block">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-gray-200 truncate max-w-[120px]">
                          {activeUser.name || activeUser.email}
                        </span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                      </div>
                      <span className="text-[10px] text-emerald-400/80 block truncate max-w-[120px]">
                        {activeUser.email}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-full bg-amber-950/90 border border-amber-600 flex items-center justify-center text-xs font-bold text-amber-300 shrink-0">
                      <UserX className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="hidden xl:block">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-amber-300">Guest user</span>
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                      </div>
                      <span className="text-[10px] text-gray-400 block">
                        No user logged in
                      </span>
                    </div>
                  </>
                )}
              </button>

              {/* User Switcher Dropdown Popover */}
              {isUserMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsUserMenuOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-[#081C13] border border-[#23493C] rounded-2xl shadow-2xl z-50 p-4 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    
                    {/* Header info */}
                    <div className="pb-3 border-b border-[#23493C]">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                          Active Audit Session
                        </span>
                        <button 
                          onClick={() => setIsUserMenuOpen(false)}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1 leading-snug">
                        Actions in catalog, categories, botanicals & profiles will be logged under this user identity in <code className="text-emerald-300 font-mono">public.audit_logs</code>.
                      </p>

                      <div className="mt-2.5 p-2 rounded-xl bg-[#0D281C] border border-[#23493C] flex items-center gap-2">
                        {activeUser ? (
                          <>
                            <div className="w-7 h-7 rounded-full bg-emerald-900 border border-emerald-600 flex items-center justify-center text-xs font-bold text-emerald-200">
                              {getInitials(activeUser.name, activeUser.email)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-100 truncate">{activeUser.name}</p>
                              <p className="text-[10px] text-emerald-400 font-mono truncate">{activeUser.email}</p>
                            </div>
                            <button
                              onClick={() => {
                                setIsUserMenuOpen(false);
                                if (onSignOut) {
                                  onSignOut();
                                } else {
                                  onSelectUser(null);
                                }
                              }}
                              className="px-2.5 py-1 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-[10px] font-medium flex items-center gap-1 cursor-pointer"
                              title="Sign out of Admin Panel"
                            >
                              <LogOut className="w-3 h-3" />
                              <span>Sign Out</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="w-7 h-7 rounded-full bg-amber-950 border border-amber-700 flex items-center justify-center text-xs font-bold text-amber-300">
                              <UserX className="w-3.5 h-3.5 text-amber-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-amber-300">Guest user</p>
                              <p className="text-[10px] text-gray-400">All actions audited as "Guest user"</p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Change Password Option (No Current Password Required) */}
                      {onChangePassword && (
                        <div className="mt-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              onChangePassword(activeUser);
                            }}
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#0D281C] hover:bg-emerald-950 border border-emerald-800/80 text-emerald-300 hover:text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                            title="Directly set a new password without entering current password"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Change Password</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 ml-1 font-mono">
                              No Old Password
                            </span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Switch to Registered User */}
                    <div className="py-3 border-b border-[#23493C]">
                      <span className="text-[11px] font-semibold text-gray-400 block mb-2">
                        Select Registered Practitioner / Admin:
                      </span>
                      {users.length === 0 ? (
                        <p className="text-xs text-gray-500 italic">No users registered in database profiles.</p>
                      ) : (
                        <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                          {users.map((u) => {
                            const isSelected = activeUser && String(activeUser.email) === String(u.email);
                            return (
                              <button
                                key={u.id}
                                onClick={() => {
                                  onSelectUser(u);
                                  setIsUserMenuOpen(false);
                                }}
                                className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition ${
                                  isSelected
                                    ? 'bg-emerald-950 border border-emerald-600 text-emerald-300 font-semibold'
                                    : 'bg-[#0D281C]/70 hover:bg-[#0D281C] text-gray-200 border border-transparent'
                                }`}
                              >
                                <div className="truncate pr-2">
                                  <div className="font-medium text-gray-100">{u.name}</div>
                                  <div className="text-[10px] text-gray-400 font-mono">{u.email}</div>
                                </div>
                                {isSelected ? (
                                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#081C13] text-gray-400 border border-[#23493C]">
                                    {u.role}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Quick Sign In with Custom Email */}
                    <form onSubmit={handleCustomLogin} className="pt-3 space-y-2">
                      <span className="text-[11px] font-semibold text-gray-400 block">
                        Or Sign In with Any Email:
                      </span>
                      <input
                        type="email"
                        required
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        placeholder="practitioner@sitaramayurveda.com"
                        className="w-full bg-[#0D281C] border border-[#23493C] rounded-lg px-2.5 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Practitioner Name (Optional)"
                        className="w-full bg-[#0D281C] border border-[#23493C] rounded-lg px-2.5 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="submit"
                        className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In & Audit Actions</span>
                      </button>
                    </form>

                  </div>
                </>
              )}
            </div>

            {/* Quick Sign Out button */}
            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-950/80 border border-rose-800/60 text-rose-300 hover:text-white text-xs font-semibold transition cursor-pointer"
                title="Sign out of Admin Panel"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Sign Out</span>
              </button>
            )}

          </div>
        </div>

        {/* Navigation Tabs & Reload Bar */}
        <div className="flex items-center justify-between border-t border-[#23493C]/40 py-1.5 gap-2">
          <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto no-scrollbar">
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

          {/* Quick Reload Button for active tab from Supabase */}
          {onReloadCurrentTab && (
            <button
              onClick={onReloadCurrentTab}
              disabled={isReloading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D281C] hover:bg-[#133829] border border-[#23493C] text-emerald-300 hover:text-emerald-200 text-xs font-medium transition shadow-xs shrink-0 cursor-pointer disabled:opacity-50"
              title="Reload items for this section from Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isReloading ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">
                {isReloading ? 'Reloading...' : `Reload ${navItems.find(n => n.id === currentTab)?.label || 'Items'}`}
              </span>
              <span className="md:hidden">
                {isReloading ? '...' : 'Reload'}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
