/**
 * Sitaram Ayurveda Admin Website - Views, Shell Layout & Navigation
 */

const Views = {
  // Login Screen
  login: () => `
    <div class="min-h-screen flex items-center justify-center liquid-glass-bg px-4 py-12">
      <div class="max-w-md w-full liquid-glass-panel rounded-3xl shadow-2xl border border-white/12 overflow-hidden">
        <!-- Header Banner with Traditional Ayurvedic Theme -->
        <div class="bg-black/30 p-8 text-center text-white relative border-b border-white/10">
          <div class="inline-flex p-3.5 rounded-2xl bg-[#10B981]/20 mb-3 backdrop-blur-md border border-[#10B981]/40 text-[#10B981] shadow-lg shadow-[#10B981]/20">
            <svg class="w-9 h-9 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
          </div>
          <h1 class="font-serif text-2xl font-bold tracking-wide text-[#F8FAFC]">SITARAM AYURVEDA</h1>
          <p class="text-[11px] uppercase tracking-widest text-[#34D399] mt-1 font-semibold">Therapeutic Index Admin Panel</p>
          <div class="mt-3 text-[11px] text-[#A7F3D0] bg-[#10B981]/15 py-1 px-3.5 rounded-full inline-flex items-center gap-1.5 border border-[#10B981]/30">
            <span class="glow-green-dot"></span>
            <span>Authorized Personnel Only</span>
          </div>
        </div>

        <!-- Login Form -->
        <form id="admin-login-form" class="p-8 space-y-5">
          <div id="login-error-box" class="hidden p-3 rounded-xl bg-red-900/40 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
            <svg class="w-4 h-4 shrink-0 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
            <span id="login-error-msg"></span>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Username or Email</label>
            <div class="relative">
              <input type="text" id="login-identifier" required 
                class="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-black/40 border border-white/15 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#10B981]/40 focus:border-[#10B981] outline-none transition" 
                placeholder="sys.jerin@gmail.com" value="sys.jerin@gmail.com">
              <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
          </div>

          <div>
            <div class="flex justify-between items-center mb-1.5">
              <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider">Password</label>
              <button type="button" onclick="App.showForgotPasswordPrompt()" class="text-xs text-[#34D399] font-medium hover:underline">Forgot password?</button>
            </div>
            <div class="relative">
              <input type="password" id="login-password" required 
                class="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-black/40 border border-white/15 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#10B981]/40 focus:border-[#10B981] outline-none transition" 
                placeholder="••••••••" value="admin123">
              <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
          </div>

          <button type="submit" id="btn-submit-login" class="w-full bg-[#10B981] hover:bg-[#059669] text-[#0A100C] py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#10B981]/30 flex justify-center items-center gap-2">
            <span>Sign In to Admin Portal</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </button>

          <div class="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
            <span>Server-side PBKDF2 Auth</span>
            <span class="text-[#34D399] font-medium">Sitaram Ayurveda Ltd</span>
          </div>
        </form>
      </div>
    </div>
  `,

  // Master Layout Shell (Header + Collapsible Sidebar + Content Container + Profile Menu)
  layout: (currentRoute, user, contentHtml) => {
    const admin = user || { name: 'Administrator', role: 'Staff', email: 'admin' };
    
    // Helper to render sidebar items
    const navItems = [
      { route: 'dashboard', label: 'Dashboard', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>' },
      { route: 'products', label: 'Products', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>' },
      { route: 'categories', label: 'Categories', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>' },
      { route: 'ingredients', label: 'Ingredients', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>' },
      { route: 'manufacturers', label: 'Manufacturers', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>' },
      { route: 'media', label: 'Media', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>' },
      { route: 'app-content', label: 'App Content', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>' },
      { route: 'reports', label: 'Reports', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>' },
      { route: 'supabase', label: 'Cloud DB (Supabase)', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path>' },
      { route: 'audit-logs', label: 'Audit Logs', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>' },
      { route: 'settings', label: 'Settings', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>' }
    ];

    const sidebarLinksHtml = navItems.map(item => {
      const active = currentRoute === item.route;
      return `
        <a href="/admin/${item.route}" onclick="App.navigate('/admin/${item.route}', event)" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            active 
              ? 'bg-[#10B981]/25 text-[#34D399] font-bold border-l-4 border-[#10B981] shadow-inner' 
              : 'text-gray-300 hover:bg-white/5 hover:text-white'
          }">
          <svg class="w-5 h-5 shrink-0 ${active ? 'text-[#10B981]' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">${item.icon}</svg>
          <span class="flex-1">${item.label}</span>
          ${item.route === 'categories' ? '<span class="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300 font-mono">24</span>' : ''}
        </a>
      `;
    }).join('');

    return `
      <div class="min-h-screen flex liquid-glass-bg font-sans antialiased text-[#F8FAFC]">
        <!-- Mobile Sidebar Overlay -->
        <div id="mobile-sidebar-backdrop" onclick="App.toggleSidebar()" class="fixed inset-0 bg-black/60 z-40 lg:hidden hidden backdrop-blur-sm"></div>

        <!-- Left Sidebar -->
        <aside id="main-sidebar" class="fixed lg:static inset-y-0 left-0 z-50 w-64 liquid-glass-panel text-white flex flex-col transition-transform duration-300 -translate-x-full lg:translate-x-0 shadow-2xl border-r border-white/10">
          <!-- Sidebar Header Branding -->
          <div class="p-6 border-b border-white/10 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#10B981] flex items-center justify-center text-[#0A100C] font-serif font-bold text-xl shadow-lg shadow-[#10B981]/30">
                SA
              </div>
              <div>
                <h2 class="font-serif font-bold text-base tracking-wide text-[#F8FAFC]">SITARAM</h2>
                <p class="text-[10px] uppercase tracking-wider text-[#34D399] font-semibold">Ayurveda Admin</p>
              </div>
            </div>
            <button onclick="App.toggleSidebar()" class="lg:hidden text-white/70 hover:text-white p-1">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <!-- Navigation Links -->
          <nav class="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 text-sm custom-scrollbar">
            ${sidebarLinksHtml}
          </nav>

          <!-- Sidebar Footer with Quick Admin Status -->
          <div class="p-4 border-t border-white/10 bg-black/30 flex items-center justify-between">
            <div class="flex items-center gap-2.5 overflow-hidden">
              <div class="w-8 h-8 rounded-full bg-[#10B981]/25 border border-[#10B981]/50 flex items-center justify-center text-xs font-bold text-[#34D399]">
                ${admin.name.charAt(0)}
              </div>
              <div class="truncate">
                <p class="text-xs font-semibold text-white truncate">${admin.name}</p>
                <p class="text-[10px] text-[#34D399] truncate">${admin.role}</p>
              </div>
            </div>
            <button onclick="SitaramAuth.logout()" title="Logout" class="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </button>
          </div>
        </aside>

        <!-- Main Content Column -->
        <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
          <!-- Top Header -->
          <header class="liquid-glass-panel border-b border-white/10 h-16 flex items-center justify-between px-6 shrink-0 z-30 shadow-md">
            <div class="flex items-center gap-3">
              <button onclick="App.toggleSidebar()" class="lg:hidden text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/5">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              </button>
              <div class="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                <span class="font-serif font-bold text-white">Sitaram Therapeutic Index</span>
                <span>/</span>
                <span class="capitalize text-[#34D399] font-semibold">${currentRoute}</span>
              </div>
            </div>

            <!-- Top Header Right: DB Status + Admin Profile Dropdown -->
            <div class="flex items-center gap-3">
              <div class="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill text-[#A7F3D0] border border-[#10B981]/30 text-xs font-medium">
                <span class="glow-green-dot"></span>
                <span>Central DB Live</span>
              </div>

              <!-- Admin Profile / Logout Menu Dropdown -->
              <div class="relative" id="admin-profile-menu-container">
                <button onclick="App.toggleProfileMenu()" class="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/5 transition border border-transparent hover:border-white/15">
                  <div class="w-8 h-8 rounded-full bg-[#10B981] text-[#0A100C] flex items-center justify-center text-xs font-bold shadow-md shadow-[#10B981]/30">
                    ${admin.name.charAt(0)}
                  </div>
                  <div class="hidden md:block text-left">
                    <p class="text-xs font-bold text-white leading-tight">${admin.name}</p>
                    <p class="text-[10px] text-gray-400 leading-tight">${admin.email}</p>
                  </div>
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>

                <!-- Profile Dropdown Menu -->
                <div id="admin-profile-dropdown" class="hidden absolute right-0 mt-2 w-56 liquid-glass-panel rounded-2xl shadow-2xl border border-white/15 py-2 z-50 animate-fade-in">
                  <div class="px-4 py-2 border-b border-white/10">
                    <p class="text-xs font-bold text-white">${admin.name}</p>
                    <p class="text-[11px] text-gray-400 truncate">${admin.email}</p>
                    <span class="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/30">${admin.role}</span>
                  </div>
                  <button type="button" onclick="App.openUserSettingsModal(); App.toggleProfileMenu();" class="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-emerald-300 hover:bg-white/5 hover:text-white transition">
                    <svg class="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                    <span>User Settings & Motion</span>
                  </button>
                  <a href="/admin/settings" onclick="App.navigate('/admin/settings', event); App.toggleProfileMenu();" class="flex items-center gap-2 px-4 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white">
                    <svg class="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
                    <span>System Settings</span>
                  </a>
                  <div class="border-t border-white/10 my-1"></div>
                  <button onclick="SitaramAuth.logout()" class="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 font-medium">
                    <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    <span>Secure Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          <!-- Main Content Body -->
          <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
            ${contentHtml}
          </main>
        </div>
      </div>

      <!-- User Settings & Motion Profiles Modal -->
      <div id="user-settings-panel-modal" class="fixed inset-0 bg-black/60 z-50 hidden flex items-center justify-center p-4 backdrop-blur-md">
        <div class="liquid-glass-panel rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-white/20 space-y-5 animate-fade-in custom-scrollbar max-h-[90vh] overflow-y-auto text-parchment-50">
          
          <!-- Panel Header -->
          <div class="flex items-center justify-between border-b border-white/10 pb-4">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-2xl bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 flex items-center justify-center text-lg font-bold shadow-inner">
                ⚙️
              </div>
              <div>
                <h3 class="font-serif font-bold text-lg text-white flex items-center gap-2">
                  <span>User Settings & Preferences</span>
                  <span class="text-xs font-sans px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">Liquid Glass</span>
                </h3>
                <p class="text-xs text-gray-300 opacity-90">Customize interactive 3D physics, motion kinetics, and portal preferences</p>
              </div>
            </div>
            <button onclick="App.closeUserSettingsModal()" class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white transition">
              ✕
            </button>
          </div>

          <!-- Current Admin Profile Card -->
          <div class="rounded-2xl p-4 bg-black/30 border border-white/10 flex items-center justify-between">
            <div class="flex items-center space-x-3.5">
              <div class="w-12 h-12 rounded-2xl bg-[#10B981] text-[#0A100C] font-bold flex items-center justify-center text-base shadow-md">
                ${admin.name.charAt(0)}
              </div>
              <div>
                <div class="text-sm font-bold text-white flex items-center gap-2">
                  <span>${admin.name}</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">${admin.role}</span>
                </div>
                <p class="text-xs text-gray-300">${admin.email}</p>
                <p class="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Active Administrative Session</span>
                </p>
              </div>
            </div>
            <div class="text-right">
              <div class="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Active Motion</div>
              <div id="spa-modal-active-motion-attr" class="text-xs font-mono font-bold text-emerald-300 bg-black/40 px-2 py-0.5 rounded border border-emerald-800 mt-1">
                data-motion="default"
              </div>
            </div>
          </div>

          <!-- MOTION PROFILES SECTION -->
          <div class="space-y-3">
            <div>
              <h4 class="text-xs font-bold text-[#34D399] uppercase tracking-wider flex items-center gap-1.5">
                <span>⚡</span>
                <span>Liquid Glass Motion Profiles</span>
              </h4>
              <p class="text-[11px] text-gray-300 opacity-90 mt-0.5">
                Updates the <code class="text-emerald-300">document.body[data-motion]</code> attribute in real time, altering hover response curves and magnetic card spring kinetics.
              </p>
            </div>

            <!-- 3 Profile Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              <!-- Default -->
              <div 
                id="spa-settings-motion-default"
                onclick="App.setParallaxMotionMode('default')"
                class="relative rounded-2xl p-3.5 border transition cursor-pointer flex flex-col justify-between group bg-white/5 hover:bg-white/10 border-white/10">
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-white flex items-center gap-1">
                      <span>🌿</span>
                      <span>Default</span>
                    </span>
                    <span id="spa-settings-check-default" class="hidden text-xs text-emerald-400 font-bold">✓</span>
                  </div>
                  <div class="text-[10px] font-mono text-emerald-300 bg-black/30 px-1.5 py-0.5 rounded w-fit">
                    data-motion="default"
                  </div>
                  <p class="text-[11px] text-gray-300 leading-snug">
                    Balanced natural physics with smooth cubic ease-out. Standard desktop baseline.
                  </p>
                </div>
                <div class="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-400">
                  <span>Duration: <strong class="text-white">150ms</strong></span>
                  <span>Snap: <strong class="text-white">320ms</strong></span>
                </div>
              </div>

              <!-- Snappy -->
              <div 
                id="spa-settings-motion-snappy"
                onclick="App.setParallaxMotionMode('snappy')"
                class="relative rounded-2xl p-3.5 border transition cursor-pointer flex flex-col justify-between group bg-white/5 hover:bg-white/10 border-white/10">
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-white flex items-center gap-1">
                      <span>⚡</span>
                      <span>Snappy</span>
                    </span>
                    <span id="spa-settings-check-snappy" class="hidden text-xs text-emerald-400 font-bold">✓</span>
                  </div>
                  <div class="text-[10px] font-mono text-emerald-300 bg-black/30 px-1.5 py-0.5 rounded w-fit">
                    data-motion="snappy"
                  </div>
                  <p class="text-[11px] text-gray-300 leading-snug">
                    Instant micro-motion reactivity with crisp 80ms card acceleration. High-speed multi-card review.
                  </p>
                </div>
                <div class="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-400">
                  <span>Duration: <strong class="text-white">80ms</strong></span>
                  <span>Snap: <strong class="text-white">220ms</strong></span>
                </div>
              </div>

              <!-- Fluid -->
              <div 
                id="spa-settings-motion-fluid"
                onclick="App.setParallaxMotionMode('fluid')"
                class="relative rounded-2xl p-3.5 border transition cursor-pointer flex flex-col justify-between group bg-white/5 hover:bg-white/10 border-white/10">
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-white flex items-center gap-1">
                      <span>🌊</span>
                      <span>Fluid</span>
                    </span>
                    <span id="spa-settings-check-fluid" class="hidden text-xs text-emerald-400 font-bold">✓</span>
                  </div>
                  <div class="text-[10px] font-mono text-emerald-300 bg-black/30 px-1.5 py-0.5 rounded w-fit">
                    data-motion="fluid"
                  </div>
                  <p class="text-[11px] text-gray-300 leading-snug">
                    Organic gliding momentum with soft magnetic deceleration. Authentic luxurious glass sensation.
                  </p>
                </div>
                <div class="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-400">
                  <span>Duration: <strong class="text-white">350ms</strong></span>
                  <span>Snap: <strong class="text-white">450ms</strong></span>
                </div>
              </div>

            </div>
          </div>

          <!-- TILT SENSITIVITY & LIVE PREVIEW -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
            <!-- Tilt Slider -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-gray-200 flex items-center gap-1">
                  <span>🔄</span>
                  <span>3D Tilt Angle Sensitivity</span>
                </span>
                <span id="spa-modal-tilt-display" class="font-mono text-xs font-bold text-emerald-300">7.5°</span>
              </div>
              <input 
                type="range" 
                id="spa-modal-tilt-slider"
                min="0" 
                max="20" 
                step="0.5" 
                value="7.5"
                oninput="App.setTiltMagnitude(this.value)"
                class="w-full h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
              />
              <div class="flex justify-between text-[10px] text-gray-400">
                <span>0° (Flat Glass)</span>
                <span>7.5° (Recommended)</span>
                <span>20° (Max Depth)</span>
              </div>
            </div>

            <!-- Live Test Card -->
            <div class="liquid-glass-card rounded-2xl p-3.5 flex items-center justify-between shadow-md" style="min-height: 80px;" title="Hover to test chosen motion dynamics!">
              <div>
                <div class="text-[10px] font-bold text-[#10B981] uppercase tracking-wider">Interactive Live Preview</div>
                <div class="text-xs font-serif font-bold text-white mt-0.5">Liquid Glass Feedback</div>
                <div class="text-[10px] text-gray-300">Hover your cursor to feel the tilt and spring</div>
              </div>
              <div class="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                🌿
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="pt-4 border-t border-white/10 flex items-center justify-between">
            <span class="text-[11px] text-gray-400">
              Preferences persist across sessions via local storage.
            </span>
            <button 
              type="button" 
              onclick="App.closeUserSettingsModal()" 
              class="px-5 py-2 text-xs font-semibold bg-[#10B981] hover:bg-emerald-400 text-[#052414] rounded-xl shadow transition">
              Done
            </button>
          </div>

        </div>
      </div>
    `;
  },

  // Module Placeholder View (for non-dashboard routes in this foundation step)
  placeholder: (title, description, iconSvg) => `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex items-center justify-between border-b border-[#E2D9CC] pb-4">
        <div>
          <h1 class="font-serif text-2xl font-bold text-[#0F382C]">${title}</h1>
          <p class="text-sm text-gray-500 mt-0.5">${description}</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-[#E2D9CC] p-12 text-center shadow-xs">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-amber-50 text-[#1B4D3E] flex items-center justify-center mb-4 border border-amber-200">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">${iconSvg}</svg>
        </div>
        <h3 class="font-serif font-bold text-lg text-gray-800">${title} Module Foundation Ready</h3>
        <p class="text-xs text-gray-500 max-w-md mx-auto mt-1.5 leading-relaxed">
          The routing, backend schema, and database models are configured. Detailed management tools will be activated in the subsequent implementation steps.
        </p>
        <div class="mt-6 flex justify-center gap-3">
          <a href="/admin/dashboard" onclick="App.navigate('/admin/dashboard', event)" class="px-4 py-2 rounded-lg bg-[#1B4D3E] text-white text-xs font-semibold hover:bg-[#0F382C] shadow-sm">
            Return to Dashboard
          </a>
        </div>
      </div>
    </div>
  `
};

window.Views = Views;
