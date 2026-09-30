/**
 * Sitaram Ayurveda Admin Website - Dashboard Component
 * Renders the 6 KPI cards and the 3 sections with proper loading, empty and error states.
 */

const DashboardView = {
  renderLoading: () => `
    <div class="space-y-6 animate-pulse">
      <div class="h-8 bg-gray-200 rounded w-1/3"></div>
      
      <!-- Skeleton 6 Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        ${[1, 2, 3, 4, 5, 6].map(() => `
          <div class="bg-white p-4 rounded-xl border border-[#E2D9CC] space-y-2">
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            <div class="h-8 bg-gray-200 rounded w-3/4"></div>
            <div class="h-2 bg-gray-100 rounded w-full"></div>
          </div>
        `).join('')}
      </div>

      <!-- Skeleton Sections -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-xl border border-[#E2D9CC] h-64"></div>
        <div class="bg-white p-6 rounded-xl border border-[#E2D9CC] h-64"></div>
      </div>
      <div class="bg-white p-6 rounded-xl border border-[#E2D9CC] h-64"></div>
    </div>
  `,

  renderError: (errorMsg) => `
    <div class="max-w-2xl mx-auto my-12 bg-white p-8 rounded-2xl border border-red-200 shadow-sm text-center space-y-4">
      <div class="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
      </div>
      <h3 class="font-serif font-bold text-lg text-gray-800">Failed to Load Dashboard Telemetry</h3>
      <p class="text-xs text-gray-500">${errorMsg || 'A network error occurred while retrieving backend metrics.'}</p>
      <button onclick="App.loadDashboardData()" class="px-5 py-2 bg-[#1B4D3E] text-white text-xs font-semibold rounded-lg hover:bg-[#0F382C]">
        Retry Connection
      </button>
    </div>
  `,

  renderSuccess: (metrics, recentProducts, recentlyUpdated, categorySummary) => {
    const currentMotion = (typeof App !== 'undefined' && App.motionMode) ? App.motionMode : (localStorage.getItem('glass_parallax_motion') || 'default');

    const totalMedicines = metrics.totalProducts ?? metrics.totalMedicines ?? 0;
    const publishedMedicines = metrics.activeProducts ?? metrics.publishedMedicines ?? 0;
    const draftMedicines = metrics.inactiveProducts ?? metrics.draftMedicines ?? 0;
    const totalCategories = metrics.categories ?? metrics.totalCategories ?? 0;

    return `
      <div class="space-y-6">
        <!-- Page Title & Header Banner -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">Catalogue Management</span>
              <span class="text-[11px] text-gray-500 font-medium">Ayurvedic Clinical Master</span>
            </div>
            <h1 class="font-serif text-2xl font-bold text-[#0F382C] mt-1">Medicine Catalogue Dashboard</h1>
            <p class="text-xs text-gray-500 mt-0.5">Centralized master metrics for classical Ayurvedic formulations and clinical monographs.</p>
          </div>
          <div class="flex flex-wrap items-center gap-2.5">
            <!-- Prominent Add New Medicine Button -->
            <button 
              type="button" 
              onclick="if (typeof openAddMedicineModal === 'function') { openAddMedicineModal(); } else if (typeof App !== 'undefined') { App.navigate('/admin/products#products/add'); } else { window.location.hash = 'medicinesTab'; }" 
              class="px-4 py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer ring-2 ring-emerald-400/30">
              <span class="text-sm">➕</span>
              <span>Add New Medicine</span>
            </button>

            <!-- Glass Card Parallax Motion & Tilt Controls -->
            <div class="flex flex-wrap items-center gap-2.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 backdrop-blur-md shadow-xs">
              <!-- Mode Toggle -->
              <div class="flex items-center gap-1.5">
                <span class="text-[11px] text-[#34D399] font-medium flex items-center gap-1 mr-0.5">
                  <svg class="w-3.5 h-3.5 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  <span class="hidden md:inline">Motion:</span>
                </span>
                <div class="inline-flex rounded-lg bg-black/30 p-0.5 border border-white/10 text-xs">
                  <button 
                    type="button" 
                    id="motion-toggle-default" 
                    onclick="App.setParallaxMotionMode('default')" 
                    class="px-2.5 py-1 text-xs ${currentMotion === 'default' ? 'font-bold rounded-lg bg-[#10B981] text-[#052414] shadow-sm' : 'font-semibold rounded-lg text-gray-400 hover:text-white'} transition-all flex items-center gap-1" 
                    title="Balanced natural physics (150ms hover duration)">
                    <span>🌿 Default</span>
                  </button>
                  <button 
                    type="button" 
                    id="motion-toggle-snappy" 
                    onclick="App.setParallaxMotionMode('snappy')" 
                    class="px-2.5 py-1 text-xs ${currentMotion === 'snappy' ? 'font-bold rounded-lg bg-[#10B981] text-[#052414] shadow-sm' : 'font-semibold rounded-lg text-gray-400 hover:text-white'} transition-all flex items-center gap-1" 
                    title="Fast, immediate response (80ms hover duration)">
                    <span>⚡ Snappy</span>
                  </button>
                  <button 
                    type="button" 
                    id="motion-toggle-fluid" 
                    onclick="App.setParallaxMotionMode('fluid')" 
                    class="px-2.5 py-1 text-xs ${currentMotion === 'fluid' ? 'font-bold rounded-lg bg-[#10B981] text-[#052414] shadow-sm' : 'font-semibold rounded-lg text-gray-400 hover:text-white'} transition-all flex items-center gap-1" 
                    title="Smooth, organic gliding tilt (350ms hover duration)">
                    <span>🌊 Fluid</span>
                  </button>
                </div>
              </div>

              <div class="hidden sm:block h-5 w-px bg-white/15"></div>

              <!-- Tilt Magnitude Slider -->
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1 text-[11px] text-amber-300 font-semibold" title="Adjust the 3D rotation intensity on hover">
                  <svg class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                  <span>Tilt:</span>
                  <span class="tilt-magnitude-display font-mono text-white text-[11px] w-9 text-right">${((typeof App !== 'undefined' && App.tiltMagnitude) ? App.tiltMagnitude : parseFloat(localStorage.getItem('glass_parallax_tilt') || '7.5')).toFixed(1)}°</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="20" 
                  step="0.5" 
                  value="${(typeof App !== 'undefined' && App.tiltMagnitude) ? App.tiltMagnitude : parseFloat(localStorage.getItem('glass_parallax_tilt') || '7.5')}" 
                  oninput="App.setTiltMagnitude(this.value)" 
                  class="tilt-magnitude-slider w-20 sm:w-24 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#10B981] focus:outline-none" 
                  title="Tilt magnitude: 0° (Flat) to 20° (Extreme 3D)" 
                />
              </div>
            </div>

            <button onclick="App.loadDashboardData()" class="p-2 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition" title="Refresh Dashboard Data">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            </button>
          </div>
        </div>

        <!-- The 4 Core Dashboard Summary Cards ONLY -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Card 1: Total Medicines -->
          <div class="liquid-glass-card p-5 rounded-2xl shadow-xs flex flex-col justify-between cursor-pointer transition hover:border-emerald-600/40" onclick="App.navigate('/admin/products')">
            <div class="flex items-center justify-between">
              <p class="text-xs font-bold text-moss-800 uppercase tracking-wider">Total Medicines</p>
              <span class="w-7 h-7 rounded-lg bg-moss-100 text-moss-800 flex items-center justify-center text-xs font-bold">💊</span>
            </div>
            <div class="my-2">
              <p class="font-serif text-3xl font-bold text-[#052115]">${totalMedicines}</p>
              <p class="text-[11px] text-emerald-700 font-medium mt-1">Master Classical Catalogue</p>
            </div>
            <div class="pt-2 border-t border-emerald-900/10 flex items-center justify-between text-xs text-moss-700 font-semibold">
              <span>View Catalogue</span>
              <span>→</span>
            </div>
          </div>

          <!-- Card 2: Published Medicines -->
          <div class="liquid-glass-card p-5 rounded-2xl shadow-xs flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <p class="text-xs font-bold text-emerald-800 uppercase tracking-wider">Published Medicines</p>
              <span class="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">🌐</span>
            </div>
            <div class="my-2">
              <p class="font-serif text-3xl font-bold text-emerald-800">${publishedMedicines}</p>
              <p class="text-[11px] text-emerald-600 font-medium mt-1">Live for Practitioners & Seekers</p>
            </div>
            <div class="pt-2 border-t border-emerald-900/10 flex items-center justify-between text-xs">
              <span class="inline-flex items-center gap-1.5 text-emerald-800 font-semibold text-[11px]">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Active in App
              </span>
            </div>
          </div>

          <!-- Card 3: Draft Medicines -->
          <div class="liquid-glass-card p-5 rounded-2xl shadow-xs flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <p class="text-xs font-bold text-amber-800 uppercase tracking-wider">Draft Medicines</p>
              <span class="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">📝</span>
            </div>
            <div class="my-2">
              <p class="font-serif text-3xl font-bold text-amber-800">${draftMedicines}</p>
              <p class="text-[11px] text-amber-700 font-medium mt-1">Internal Clinical Review</p>
            </div>
            <div class="pt-2 border-t border-amber-900/10 flex items-center justify-between text-xs">
              <span class="inline-flex items-center gap-1.5 text-amber-800 font-semibold text-[11px]">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                Staging & Review
              </span>
            </div>
          </div>

          <!-- Card 4: Total Categories -->
          <div class="liquid-glass-card p-5 rounded-2xl shadow-xs flex flex-col justify-between cursor-pointer transition hover:border-amber-600/40" onclick="App.navigate('/admin/categories')">
            <div class="flex items-center justify-between">
              <p class="text-xs font-bold text-[#854D0E] uppercase tracking-wider">Total Categories</p>
              <span class="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">🏷️</span>
            </div>
            <div class="my-2">
              <p class="font-serif text-3xl font-bold text-[#713F12]">${totalCategories}</p>
              <p class="text-[11px] text-[#854D0E] font-medium mt-1">Classical Dosage Forms</p>
            </div>
            <div class="pt-2 border-t border-amber-900/10 flex items-center justify-between text-xs text-[#854D0E] font-semibold">
              <span>Manage Categories</span>
              <span>→</span>
            </div>
          </div>
        </div>

        <!-- 2-Column Row: Recently Added Medicines & Recently Updated Medicines -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Section 1: Recently Added Medicines -->
          <div class="bg-white rounded-2xl border border-[#E2D9CC] p-5 shadow-xs flex flex-col">
            <div class="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
              <div class="flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full bg-[#1B4D3E]"></div>
                <h2 class="font-serif font-bold text-sm text-[#0F382C]">Recently Added Medicines</h2>
              </div>
              <button onclick="App.navigate('/admin/products')" class="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer">
                View All →
              </button>
            </div>

            <div class="flex-1">
              ${recentProducts.length === 0 ? `
                <div class="h-48 flex flex-col items-center justify-center text-center p-6 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                  <span class="text-2xl mb-1">🌿</span>
                  <p class="text-xs font-semibold text-gray-600">No Recent Medicines Recorded</p>
                  <p class="text-[11px] text-gray-400 mt-0.5">When new classical medicines are added, they will appear in this stream.</p>
                </div>
              ` : `
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs">
                    <thead class="text-gray-400 uppercase text-[10px] font-semibold border-b border-gray-100">
                      <tr>
                        <th class="py-2">Code</th>
                        <th class="py-2">Medicine Name</th>
                        <th class="py-2">Category</th>
                        <th class="py-2 text-center">Status</th>
                        <th class="py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                      ${recentProducts.map(p => `
                        <tr onclick="App.navigate('/admin/products#products/view/${p.id}')" class="medicine-table-row hover:bg-gray-50 transition cursor-pointer">
                          <td class="py-2.5 font-mono text-[11px] text-gray-500">${p.code || '—'}</td>
                          <td class="py-2.5 font-serif font-bold text-[#0F382C]">${p.name}</td>
                          <td class="py-2.5 text-gray-600">
                            <span class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-700">
                              ${p.category_name || 'General'}
                            </span>
                          </td>
                          <td class="py-2.5 text-center">
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${p.status === 'Active' || p.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}">
                              ${p.status === 'Active' || p.status === 'PUBLISHED' ? '● Published' : '○ Draft'}
                            </span>
                          </td>
                          <td class="py-2.5 text-right whitespace-nowrap">
                            <button onclick="event.stopPropagation(); App.openPrintableQRModal('${p.id}')" class="p-1 text-gray-500 hover:text-[#0F382C] hover:bg-[#DFB15B]/20 rounded transition" title="Printable QR Code">
                              <svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                            </button>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `}
            </div>
          </div>

          <!-- Section 2: Recently Updated Medicines -->
          <div class="bg-white rounded-2xl border border-[#E2D9CC] p-5 shadow-xs flex flex-col">
            <div class="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
              <div class="flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full bg-[#DFB15B]"></div>
                <h2 class="font-serif font-bold text-sm text-[#0F382C]">Recently Updated Medicines</h2>
              </div>
              <button onclick="App.navigate('/admin/products')" class="text-[11px] font-bold text-amber-800 hover:text-amber-900 cursor-pointer">
                Catalogue History →
              </button>
            </div>

            <div class="flex-1">
              ${recentlyUpdated.length === 0 ? `
                <div class="h-48 flex flex-col items-center justify-center text-center p-6 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                  <span class="text-2xl mb-1">⚡</span>
                  <p class="text-xs font-semibold text-gray-600">No Formulations Recently Modified</p>
                  <p class="text-[11px] text-gray-400 mt-0.5">Edits to classical formulations and indications will appear here.</p>
                </div>
              ` : `
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs">
                    <thead class="text-gray-400 uppercase text-[10px] font-semibold border-b border-gray-100">
                      <tr>
                        <th class="py-2">Code</th>
                        <th class="py-2">Medicine Name</th>
                        <th class="py-2">Category</th>
                        <th class="py-2 text-right">Modified</th>
                        <th class="py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                      ${recentlyUpdated.map(p => `
                        <tr onclick="App.navigate('/admin/products#products/view/${p.id}')" class="medicine-table-row hover:bg-gray-50 transition cursor-pointer">
                          <td class="py-2.5 font-mono text-[11px] text-gray-500">${p.code || '—'}</td>
                          <td class="py-2.5 font-serif font-bold text-[#0F382C]">${p.name}</td>
                          <td class="py-2.5 text-gray-600">
                            <span class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-700">
                              ${p.category_name || 'General'}
                            </span>
                          </td>
                          <td class="py-2.5 text-right text-gray-400 text-[10px]">
                            ${p.updated_at ? p.updated_at.split('T')[0] : 'Recent'}
                          </td>
                          <td class="py-2.5 text-right whitespace-nowrap">
                            <button onclick="event.stopPropagation(); App.openPrintableQRModal('${p.id}')" class="p-1 text-gray-500 hover:text-[#0F382C] hover:bg-[#DFB15B]/20 rounded transition" title="Printable QR Code">
                              <svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                            </button>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  }
};

window.DashboardView = DashboardView;
