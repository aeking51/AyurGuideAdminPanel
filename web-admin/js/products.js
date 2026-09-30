/**
 * Sitaram Ayurveda Admin Website - Product Management Module
 */

const ProductViews = {
  // Products Table & Filter System
  list: (products, categories, filterState) => {
    const totalCount = products.length;
    const activeCount = products.filter(p => p.status === 'Active').length;
    const inactiveCount = totalCount - activeCount;

    return `
      <div class="space-y-6">
        <!-- Page Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="font-serif text-2xl font-bold text-[#0F382C]">Product Catalogue</h1>
            <p class="text-sm text-gray-500 mt-0.5">Manage Sitaram classical formulations, packing sizes, ingredients and clinical indications.</p>
          </div>
          <div class="flex items-center gap-2">
            <a href="#import" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-xs font-semibold hover:bg-gray-50 transition shadow-xs">
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              <span>Import Excel</span>
            </a>
            <a href="#export" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-xs font-semibold hover:bg-gray-50 transition shadow-xs">
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              <span>Export</span>
            </a>
            <button onclick="App.triggerPdfExport()" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#DFB15B] bg-[#FBF9F5] text-[#1B4D3E] text-xs font-semibold hover:bg-[#F3EFE6] transition shadow-xs">
              <svg class="w-4 h-4 text-[#DFB15B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              <span>PDF Report</span>
            </button>
            <a href="#products/add" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1B4D3E] text-white text-xs font-semibold hover:bg-[#0F382C] transition shadow-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              <span>New Product</span>
            </a>
          </div>
        </div>

        <!-- Filter & Search Console -->
        <div class="bg-white rounded-xl border border-[#E2D9CC] p-4 shadow-xs space-y-3">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
            <!-- Search Box -->
            <div class="md:col-span-4 relative">
              <input type="text" id="product-search-input" value="${filterState.search || ''}" 
                oninput="App.onProductSearch(this.value)" 
                placeholder="Search name, code, Arjuna, Diabetes, Arshas..." 
                class="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B4D3E] focus:border-[#1B4D3E] outline-none">
              <svg class="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>

            <!-- Dynamic Category Filter -->
            <div class="md:col-span-3">
              <select id="product-category-filter" onchange="App.onProductCategoryFilter(this.value)" 
                class="w-full py-2 px-3 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B4D3E] focus:border-[#1B4D3E] outline-none bg-white">
                <option value="">All Categories (${categories.length})</option>
                ${categories.map(c => `
                  <option value="${c.name}" ${filterState.category === c.name ? 'selected' : ''}>${c.name} (${c.productCount || 0})</option>
                `).join('')}
              </select>
            </div>

            <!-- Status Filter -->
            <div class="md:col-span-2">
              <select id="product-status-filter" onchange="App.onProductStatusFilter(this.value)" 
                class="w-full py-2 px-3 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B4D3E] focus:border-[#1B4D3E] outline-none bg-white">
                <option value="">All Statuses</option>
                <option value="Active" ${filterState.status === 'Active' ? 'selected' : ''}>Active (${activeCount})</option>
                <option value="Inactive" ${filterState.status === 'Inactive' ? 'selected' : ''}>Inactive (${inactiveCount})</option>
              </select>
            </div>

            <!-- Ingredient Filter -->
            <div class="md:col-span-2">
              <input type="text" id="product-ingredient-filter" value="${filterState.ingredient || ''}" 
                oninput="App.onProductIngredientFilter(this.value)" 
                placeholder="Filter by Ingredient..." 
                class="w-full py-2 px-3 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B4D3E] focus:border-[#1B4D3E] outline-none">
            </div>

            <!-- Clear Filters -->
            <div class="md:col-span-1 flex items-center">
              <button onclick="App.clearProductFilters()" title="Reset all filters" class="w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-100 transition">
                Clear
              </button>
            </div>
          </div>

          <!-- Active Filter Pills, Count & View Mode Switcher -->
          <div class="flex flex-wrap items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 gap-2">
            <div class="flex flex-wrap items-center gap-2">
              <span>Showing <strong>${products.length}</strong> of <strong>${totalCount}</strong> products</span>
              ${filterState.search ? `<span class="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">Keyword: "${filterState.search}"</span>` : ''}
              ${filterState.category ? `<span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">Category: ${filterState.category}</span>` : ''}
              ${filterState.status ? `<span class="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">Status: ${filterState.status}</span>` : ''}
              ${filterState.ingredient ? `<span class="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">Herb: ${filterState.ingredient}</span>` : ''}
            </div>

            <!-- View Switcher (3D Flippable Cards vs Table) -->
            <div class="flex items-center gap-1 bg-[#F6F4EE] p-1 rounded-xl border border-[#E2D9CC]">
              <button onclick="App.setProductViewMode('cards')" class="px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${((typeof App !== 'undefined' && App.productViewMode === 'cards') || typeof App === 'undefined') ? 'bg-[#0F382C] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'}">
                <span>⊞</span> <span>3D Cards</span>
              </button>
              <button onclick="App.setProductViewMode('table')" class="px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${(typeof App !== 'undefined' && App.productViewMode === 'table') ? 'bg-[#0F382C] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'}">
                <span>☰</span> <span>Table</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Bulk Action Floating Bar (shown when rows selected) -->
        <div id="bulk-action-bar" class="hidden bg-[#0F382C] text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-fade-in">
          <div class="flex items-center gap-3">
            <span class="text-xs font-semibold bg-[#DFB15B] text-[#0F382C] px-2.5 py-0.5 rounded-full" id="bulk-selected-count">0 Selected</span>
            <span class="text-xs text-white/80">Batch operations on selected products:</span>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="App.openBulkPrintQRModal()" class="px-3 py-1 bg-[#DFB15B] hover:bg-[#caa048] text-[#0F382C] rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
              <span>Print QR Labels</span>
            </button>
            <button onclick="App.onBulkActivate()" class="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium transition">Bulk Activate</button>
            <button onclick="App.onBulkDeactivate()" class="px-3 py-1 bg-amber-700 hover:bg-amber-600 text-white rounded-lg text-xs font-medium transition">Bulk Deactivate</button>
            <button onclick="App.showBulkCategoryModal()" class="px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition">Change Category</button>
            <button onclick="App.onBulkDelete()" class="px-3 py-1 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition">Delete</button>
          </div>
        </div>

        ${(typeof App !== 'undefined' && App.productViewMode === 'table') ? `
        <!-- Products Table View -->
        <div class="bg-white rounded-xl border border-[#E2D9CC] shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-gray-700">
              <thead class="bg-[#F6F4EE] text-gray-600 uppercase font-semibold text-[10px] tracking-wider border-b border-[#E2D9CC]">
                <tr>
                  <th class="py-3.5 px-4 w-10">
                    <input type="checkbox" id="select-all-products" onchange="App.toggleSelectAllProducts(this.checked)" class="rounded border-gray-300 text-[#1B4D3E] focus:ring-[#1B4D3E]">
                  </th>
                  <th class="py-3.5 px-4">Product Name & Code</th>
                  <th class="py-3.5 px-4">Category</th>
                  <th class="py-3.5 px-4">Packing</th>
                  <th class="py-3.5 px-4 max-w-xs">Main Ingredients</th>
                  <th class="py-3.5 px-4 max-w-xs">Indications</th>
                  <th class="py-3.5 px-4 text-center">Status</th>
                  <th class="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                ${products.length === 0 ? `
                  <tr>
                    <td colspan="8" class="py-12 text-center text-gray-400">
                      <div class="max-w-sm mx-auto space-y-2">
                        <svg class="w-10 h-10 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <p class="font-medium text-gray-600">No products match your criteria</p>
                        <p class="text-xs text-gray-400">Try clearing active search terms or category filters.</p>
                        <button onclick="App.clearProductFilters()" class="text-xs text-[#1B4D3E] font-semibold underline">Reset filters</button>
                      </div>
                    </td>
                  </tr>
                ` : products.map(p => `
                  <tr class="medicine-table-row hover:bg-[#FBF9F5] transition-colors group cursor-pointer">
                    <td class="py-3 px-4">
                      <input type="checkbox" data-product-id="${p.id}" onchange="App.onProductRowCheckboxChange()" class="product-row-checkbox rounded border-gray-300 text-[#1B4D3E] focus:ring-[#1B4D3E]">
                    </td>
                    <td class="py-3 px-4">
                      <div class="flex items-center gap-3">
                        <img src="${p.imageUrl || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=80'}" class="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0 border border-gray-200" alt="${p.name}">
                        <div>
                          <a href="#products/view/${p.id}" class="font-serif font-bold text-sm text-[#0F382C] hover:text-[#1B4D3E] hover:underline">${p.name}</a>
                          <div class="flex items-center gap-1.5 mt-0.5">
                            <span class="font-mono text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">${p.code}</span>
                            ${p.classicalReference ? `<span class="text-[10px] text-amber-800 italic truncate max-w-[150px]">• ${p.classicalReference}</span>` : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="py-3 px-4">
                      <span class="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#1B4D3E]/10 text-[#0F382C] border border-[#1B4D3E]/20">
                        ${p.category}
                      </span>
                    </td>
                    <td class="py-3 px-4">
                      <div class="flex flex-wrap gap-1">
                        ${(p.packings || []).map(pk => `<span class="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px]">${pk}</span>`).join('')}
                      </div>
                    </td>
                    <td class="py-3 px-4 max-w-xs">
                      <p class="truncate text-gray-600" title="${(p.ingredients || []).join(', ')}">
                        ${(p.ingredients || []).slice(0, 3).join(', ')}${(p.ingredients || []).length > 3 ? ` <span class="text-[10px] text-gray-400 font-semibold">+${p.ingredients.length - 3}</span>` : ''}
                      </p>
                    </td>
                    <td class="py-3 px-4 max-w-xs">
                      <p class="truncate text-gray-600" title="${p.indications || ''}">${p.indications || '—'}</p>
                    </td>
                    <td class="py-3 px-4 text-center">
                      <button onclick="App.toggleProductStatus('${p.id}')" title="Click to toggle status" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition ${
                        p.status === 'Active' 
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }">
                        <span class="w-1.5 h-1.5 rounded-full ${p.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}"></span>
                        <span>${p.status}</span>
                      </button>
                    </td>
                    <td class="py-3 px-4 text-right">
                      <div class="flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100">
                        <button type="button" onclick="App.flipProductCard('${p.id}')" class="secondary-info-btn text-[11px] py-1 px-2 mr-1" title="Inspect granular ingredients">ℹ️ Info</button>
                        <button onclick="event.stopPropagation(); App.openPrintableQRModal('${p.id}')" class="p-1.5 text-gray-500 hover:text-[#0F382C] hover:bg-[#DFB15B]/20 rounded-md transition" title="Printable QR Code & Monograph">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                        </button>
                        <a href="#products/view/${p.id}" class="p-1.5 text-gray-500 hover:text-[#1B4D3E] hover:bg-gray-100 rounded-md" title="View Dossier">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        </a>
                        <a href="#products/edit/${p.id}" class="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-md" title="Edit Formulation">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </a>
                        <button onclick="App.deleteProduct('${p.id}')" class="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-md" title="Delete Product">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
        ` : `
        <!-- Products 3D Glass Cards View (with Magnetic Parallax & Card Flip) -->
        ${products.length === 0 ? `
          <div class="py-16 text-center text-gray-400 bg-white/60 rounded-2xl border border-dashed border-gray-300">
            <p class="font-medium text-gray-600">No products match your criteria</p>
            <p class="text-xs text-gray-400 mt-1">Try resetting the search or category filters.</p>
            <button onclick="App.clearProductFilters()" class="mt-2 text-xs text-[#1B4D3E] font-semibold underline">Reset filters</button>
          </div>
        ` : `
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="products-cards-grid">
            ${products.map(p => `
              <div class="liquid-glass-card has-flip rounded-2xl min-h-[440px] flex flex-col justify-between" data-product-id="${p.id}">
                <!-- FRONT FACE -->
                <div class="glass-card-front p-5 flex flex-col justify-between h-full">
                  <div>
                    <div class="flex items-start justify-between gap-2 mb-2">
                      <span class="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#1B4D3E]/10 text-[#0F382C] border border-[#1B4D3E]/20 uppercase tracking-wider">
                        ${p.category}
                      </span>
                      <button onclick="App.toggleProductStatus('${p.id}')" title="Click to toggle status" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition ${
                        p.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                      }">
                        <span class="w-1.5 h-1.5 rounded-full ${p.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}"></span>
                        <span>${p.status}</span>
                      </button>
                    </div>

                    <div class="flex items-center gap-3 mb-3">
                      <img src="${p.imageUrl || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=80'}" class="w-12 h-12 rounded-xl object-cover bg-gray-100 shrink-0 border border-gray-200 shadow-2xs" alt="${p.name}">
                      <div class="min-w-0">
                        <a href="#products/view/${p.id}" class="font-serif font-bold text-base text-[#0F382C] hover:text-[#1B4D3E] hover:underline truncate block">${p.name}</a>
                        <span class="font-mono text-[10px] text-gray-500 bg-white/80 px-1.5 py-0.5 rounded border border-gray-200">${p.code}</span>
                      </div>
                    </div>

                    ${p.classicalReference ? `<p class="text-xs text-amber-800 font-medium italic mb-2">📜 ${p.classicalReference}</p>` : ''}

                    <div class="text-xs text-gray-600 line-clamp-2 mb-2.5">
                      ${p.indications || 'Classical formulation restoring tridosha equilibrium.'}
                    </div>

                    <div class="flex flex-wrap gap-1">
                      ${(p.packings || []).map(pk => `<span class="px-1.5 py-0.5 bg-gray-100/80 text-gray-700 rounded text-[10px] font-medium border border-gray-200/60">${pk}</span>`).join('')}
                    </div>
                  </div>

                  <div class="border-t border-black/5 pt-3 mt-3">
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-1">
                        <button onclick="event.stopPropagation(); App.openPrintableQRModal('${p.id}')" class="p-1.5 text-gray-500 hover:text-[#0F382C] hover:bg-[#DFB15B]/20 rounded-md transition" title="Printable QR Code">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                        </button>
                        <a href="#products/view/${p.id}" class="p-1.5 text-gray-500 hover:text-[#1B4D3E] hover:bg-gray-100 rounded-md" title="View Dossier">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        </a>
                        <a href="#products/edit/${p.id}" class="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-md" title="Edit Product">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </a>
                      </div>
                      <!-- Secondary Info Button to trigger card flip -->
                      <button type="button" class="secondary-info-btn glass-card-info-btn" data-action="flip-card" title="Click to flip card and view granular ingredients">
                        <span>ℹ️</span> <span>Info & Herbs</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- BACK FACE (Granular Botanical Ingredient Details) -->
                <div class="glass-card-back p-4 flex flex-col justify-between h-full text-left">
                  <div class="flex-1 overflow-y-auto custom-scroll pr-1">
                    <div class="flex items-center justify-between border-b border-gray-200/80 pb-2 mb-2.5">
                      <div class="flex items-center gap-1.5">
                        <span class="text-xs">🌿</span>
                        <span class="text-[11px] font-bold text-[#0F382C] uppercase tracking-wider">Granular Botanical Herbs</span>
                      </div>
                      <div class="flex items-center gap-1.5">
                        <button type="button" class="glass-card-flip-back-btn" data-action="flip-card" title="Flip back to front view">
                          <span>↩ Back</span>
                        </button>
                      </div>
                    </div>

                    <div class="mb-2">
                      <h4 class="font-serif font-bold text-sm text-[#0F382C]">${p.name}</h4>
                      <p class="text-[11px] text-emerald-800 font-medium italic">${p.classicalReference || 'Classical Ayurvedic Pharmacopoeia'}</p>
                    </div>

                    <div class="space-y-1.5 mt-2">
                      ${(p.ingredients && p.ingredients.length > 0) ? p.ingredients.map((ing, idx) => `
                        <div class="p-2 rounded-lg bg-white/85 border border-emerald-900/10 shadow-2xs text-[11px]">
                          <div class="flex items-center justify-between">
                            <span class="font-bold text-[#0F382C]">${ing}</span>
                            <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-bold">Herbal Extract #${idx + 1}</span>
                          </div>
                          <div class="text-[10px] text-gray-500 mt-0.5 italic">Standardized botanical extract with active phytoconstituents</div>
                        </div>
                      `).join('') : `
                        <div class="text-xs text-gray-500 p-2 bg-gray-50 rounded">Pure Ayurvedic single-compound formulation adhering to AYUSH standards.</div>
                      `}
                    </div>

                    ${p.usage ? `
                      <div class="mt-2.5 p-2 rounded-lg bg-emerald-50/70 border border-emerald-200/70 text-[10px] text-emerald-950">
                        <span class="font-bold uppercase text-[9px] text-emerald-800">Dosage Guidance:</span> ${p.usage}
                      </div>
                    ` : ''}
                  </div>

                  <div class="pt-2 border-t border-gray-200/80 flex items-center justify-end mt-2">
                    <button type="button" class="glass-card-flip-back-btn" data-action="flip-card">
                      <span>↩ Return to Card</span>
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
        `}
      </div>
    `;
  },

  // Dedicated Add / Edit Product Full-Page Form
  form: (isEdit, product, categories) => {
    const p = product || {
      id: '',
      code: SitaramDB.getNextProductCode(),
      name: '',
      category: 'Arishtam',
      classicalReference: '',
      packings: ['450 ml'],
      ingredients: [],
      usage: '',
      indications: '',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600',
      status: 'Active',
      featured: false
    };

    return `
      <div class="max-w-5xl mx-auto space-y-6">
        <!-- Breadcrumb & Actions -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-xs text-gray-500">
            <a href="#products" class="hover:text-[#1B4D3E]">Products</a>
            <span>/</span>
            <span class="text-gray-900 font-semibold">${isEdit ? 'Edit Product' : 'Add New Product'}</span>
          </div>
          <a href="#products" class="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            <span>Back to Products</span>
          </a>
        </div>

        <div class="flex items-center justify-between border-b border-[#E2D9CC] pb-4">
          <div>
            <h1 class="font-serif text-2xl font-bold text-[#0F382C]">${isEdit ? `Edit: ${p.name}` : 'New Formulation Entry'}</h1>
            <p class="text-xs text-gray-500 mt-0.5">Please ensure classical references, ingredients, and Ayurvedic terminology match the Therapeutic Index Handbook verbatim.</p>
          </div>
          <div class="flex items-center gap-3">
            <button type="button" onclick="window.history.back()" class="px-4 py-2 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="button" onclick="App.saveProductForm(${isEdit}, '${p.id}')" class="px-5 py-2 rounded-lg bg-[#1B4D3E] hover:bg-[#0F382C] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              <span>${isEdit ? 'Update Product' : 'Save & Publish Product'}</span>
            </button>
          </div>
        </div>

        <form id="product-editor-form" onsubmit="event.preventDefault(); App.saveProductForm(${isEdit}, '${p.id}');" class="space-y-6">
          <!-- Section 1: Basic Formulation Information -->
          <div class="bg-white rounded-xl border border-[#E2D9CC] p-6 shadow-xs space-y-4">
            <h2 class="font-serif font-bold text-base text-[#0F382C] flex items-center gap-2 border-b border-gray-100 pb-3">
              <span class="w-6 h-6 rounded-full bg-[#1B4D3E]/10 text-[#1B4D3E] text-xs flex items-center justify-center font-bold">1</span>
              <span>Basic Information</span>
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Product Code *</label>
                <input type="text" id="f-code" required value="${p.code}" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B4D3E] focus:border-[#1B4D3E] font-mono">
                <p class="text-[11px] text-gray-400 mt-1">Unique catalogue identifier (e.g. SA-00022)</p>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Product Name *</label>
                <input type="text" id="f-name" required value="${p.name}" placeholder="e.g. Medicine Name" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B4D3E] focus:border-[#1B4D3E]">
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Category *</label>
                <select id="f-category" required class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B4D3E] focus:border-[#1B4D3E] bg-white">
                  ${categories.map(c => `<option value="${c.name}" ${p.category === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Classical Reference / Source</label>
                <input type="text" id="f-reference" value="${p.classicalReference || ''}" placeholder="e.g. Ashtangahrudayam, Bhaishajya Ratnavali" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B4D3E] focus:border-[#1B4D3E]">
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Status *</label>
                <select id="f-status" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B4D3E] focus:border-[#1B4D3E] bg-white">
                  <option value="Active" ${p.status === 'Active' ? 'selected' : ''}>Active (Visible to future Mobile App)</option>
                  <option value="Inactive" ${p.status === 'Inactive' ? 'selected' : ''}>Inactive (Internal Draft)</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">App Feature Shelf</label>
                <label class="flex items-center gap-2 mt-2.5 cursor-pointer">
                  <input type="checkbox" id="f-featured" ${p.featured ? 'checked' : ''} class="rounded border-gray-300 text-[#1B4D3E] focus:ring-[#1B4D3E]">
                  <span class="text-xs text-gray-700 font-medium">Highlight in Mobile App Featured Carousel</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Section 2: Packings & Sizes -->
          <div class="bg-white rounded-xl border border-[#E2D9CC] p-6 shadow-xs space-y-4">
            <div class="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 class="font-serif font-bold text-base text-[#0F382C] flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-[#1B4D3E]/10 text-[#1B4D3E] text-xs flex items-center justify-center font-bold">2</span>
                <span>Available Packings</span>
              </h2>
              <button type="button" onclick="App.addPackingRow()" class="text-xs font-semibold text-[#1B4D3E] hover:underline flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                <span>Add Packing Size</span>
              </button>
            </div>

            <div id="packing-container" class="space-y-2">
              ${(p.packings || ['450 ml']).map((pk, idx) => `
                <div class="flex items-center gap-2 packing-row">
                  <input type="text" value="${pk}" placeholder="e.g. 450 ml, 200 ml, 60 Tablets" class="packing-input flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B4D3E]">
                  <button type="button" onclick="this.parentElement.remove()" class="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50" title="Remove">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Section 3: Normalized Main Ingredients -->
          <div class="bg-white rounded-xl border border-[#E2D9CC] p-6 shadow-xs space-y-4">
            <div class="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 class="font-serif font-bold text-base text-[#0F382C] flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-[#1B4D3E]/10 text-[#1B4D3E] text-xs flex items-center justify-center font-bold">3</span>
                <span>Main Ingredients</span>
              </h2>
              <button type="button" onclick="App.addIngredientRow()" class="text-xs font-semibold text-[#1B4D3E] hover:underline flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                <span>Add Herb / Botanical</span>
              </button>
            </div>

            <p class="text-xs text-gray-500">Each ingredient is indexed separately to empower deep clinical searches by single herb (e.g. searching Arjuna finds all relevant products).</p>

            <div id="ingredient-container" class="space-y-2">
              ${(p.ingredients || []).length > 0 ? (p.ingredients).map((ing, idx) => `
                <div class="flex items-center gap-2 ingredient-row">
                  <span class="text-xs text-gray-400 font-mono w-6 text-center">${idx + 1}.</span>
                  <input type="text" value="${ing}" placeholder="e.g. Abhaya (Terminalia chebula)" class="ingredient-input flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B4D3E]">
                  <button type="button" onclick="this.parentElement.remove()" class="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50" title="Remove">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              `).join('') : `
                <div class="flex items-center gap-2 ingredient-row">
                  <span class="text-xs text-gray-400 font-mono w-6 text-center">1.</span>
                  <input type="text" value="" placeholder="e.g. Guduchi (Tinospora cordifolia)" class="ingredient-input flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B4D3E]">
                  <button type="button" onclick="this.parentElement.remove()" class="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              `}
            </div>
          </div>

          <!-- Section 4: Posology, Usage & Clinical Indications -->
          <div class="bg-white rounded-xl border border-[#E2D9CC] p-6 shadow-xs space-y-4">
            <h2 class="font-serif font-bold text-base text-[#0F382C] flex items-center gap-2 border-b border-gray-100 pb-3">
              <span class="w-6 h-6 rounded-full bg-[#1B4D3E]/10 text-[#1B4D3E] text-xs flex items-center justify-center font-bold">4</span>
              <span>Posology & Indications</span>
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Usage & Dosage *</label>
                <textarea id="f-usage" required rows="4" placeholder="e.g. 15 to 25 ml twice daily after food or as directed by the physician." class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B4D3E]">${p.usage || ''}</textarea>
                <p class="text-[11px] text-gray-400 mt-1">Preserve exact clinical dosage instructions.</p>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Indications *</label>
                <textarea id="f-indications" required rows="4" placeholder="e.g. Arshas, Udara, Mutra vibanda, Agnimandya, Jwara" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B4D3E]">${p.indications || ''}</textarea>
                <p class="text-[11px] text-gray-400 mt-1">Preserve classical terminology (e.g. Arshas, Vibanda, Prameha).</p>
              </div>
            </div>
          </div>

          <!-- Section 5: Description & Image -->
          <div class="bg-white rounded-xl border border-[#E2D9CC] p-6 shadow-xs space-y-4">
            <h2 class="font-serif font-bold text-base text-[#0F382C] flex items-center gap-2 border-b border-gray-100 pb-3">
              <span class="w-6 h-6 rounded-full bg-[#1B4D3E]/10 text-[#1B4D3E] text-xs flex items-center justify-center font-bold">5</span>
              <span>Visuals & Monograph Details</span>
            </h2>

            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Clinical Monograph / Description</label>
              <textarea id="f-desc" rows="3" placeholder="Overview of biological action, dosha impact (e.g. Tridoshahara), and pharmacological profile." class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B4D3E]">${p.description || ''}</textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Product Image URL</label>
                <input type="text" id="f-image" value="${p.imageUrl || ''}" oninput="document.getElementById('f-img-preview').src = this.value" placeholder="https://..." class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B4D3E]">
                <div class="mt-2 flex items-center gap-2">
                  <label class="px-3 py-1.5 rounded border border-gray-300 text-xs font-medium cursor-pointer hover:bg-gray-50 flex items-center gap-1">
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span>Upload Local File</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onchange="App.handleImageUpload(event)" class="hidden">
                  </label>
                  <span class="text-[11px] text-gray-400">JPG, PNG, WebP up to 5MB</span>
                </div>
              </div>

              <div class="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <img id="f-img-preview" src="${p.imageUrl || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300'}" class="w-20 h-20 rounded-lg object-cover bg-white border border-gray-200" alt="Preview">
                <div>
                  <p class="text-xs font-bold text-gray-700">Dossier Image Preview</p>
                  <p class="text-[11px] text-gray-400 mt-0.5">Will be optimized and cached for future Android client applications.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Actions -->
          <div class="flex items-center justify-end gap-3 pt-4">
            <button type="button" onclick="window.history.back()" class="px-6 py-2.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" class="px-8 py-2.5 rounded-lg bg-[#1B4D3E] hover:bg-[#0F382C] text-white text-xs font-semibold shadow-md flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              <span>${isEdit ? 'Save Changes' : 'Publish Product'}</span>
            </button>
          </div>
        </form>
      </div>
    `;
  },

  // Full Clinical Dossier Details View
  details: (p) => {
    return `
      <div class="max-w-5xl mx-auto space-y-6">
        <!-- Top Nav -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-xs text-gray-500">
            <a href="#products" class="hover:text-[#1B4D3E]">Products</a>
            <span>/</span>
            <span class="text-gray-900 font-semibold">${p.name}</span>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="App.openPrintableQRModal('${p.id}')" class="px-3 py-1.5 rounded-lg bg-[#DFB15B] text-[#0F382C] text-xs font-bold hover:bg-[#c99f48] flex items-center gap-1.5 shadow-xs transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
              <span>Print QR Label</span>
            </button>
            <button onclick="window.print()" class="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
              <span>Print Dossier</span>
            </button>
            <a href="#products/edit/${p.id}" class="px-4 py-1.5 rounded-lg bg-[#1B4D3E] text-white text-xs font-semibold hover:bg-[#0F382C] flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              <span>Edit Product</span>
            </a>
          </div>
        </div>

        <!-- Hero Card -->
        <div class="bg-white rounded-2xl border border-[#E2D9CC] overflow-hidden shadow-sm">
          <div class="bg-gradient-to-r from-[#0F382C] to-[#1B4D3E] p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <img src="${p.imageUrl || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=150'}" class="w-16 h-16 rounded-xl object-cover ring-2 ring-[#DFB15B]" alt="${p.name}">
              <div>
                <div class="flex items-center gap-2">
                  <h1 class="font-serif text-2xl font-bold tracking-wide">${p.name}</h1>
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${p.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-gray-500/20 text-gray-300'}">
                    ${p.status}
                  </span>
                </div>
                <div class="flex flex-wrap items-center gap-3 text-xs text-white/80 mt-1">
                  <span class="font-mono bg-white/10 px-2 py-0.5 rounded">${p.code}</span>
                  <span>•</span>
                  <span>Category: <strong>${p.category}</strong></span>
                  ${p.classicalReference ? `<span>•</span><span class="italic text-[#DFB15B]">Ref: ${p.classicalReference}</span>` : ''}
                </div>
              </div>
            </div>
          </div>

          <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Left 2 Cols: Clinical Information -->
            <div class="md:col-span-2 space-y-6">
              <!-- Indications -->
              <div>
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Therapeutic Indications (Rogadhikara)</h3>
                <div class="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70 text-sm text-gray-800 leading-relaxed font-serif">
                  ${p.indications || 'Not specified.'}
                </div>
              </div>

              <!-- Posology & Usage -->
              <div>
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Dosage & Administration (Matra & Sevana Vidhi)</h3>
                <div class="p-4 rounded-xl bg-[#F6F4EE] border border-[#E2D9CC] text-sm text-gray-800 leading-relaxed">
                  ${p.usage || 'Consult an Ayurvedic physician.'}
                </div>
              </div>

              <!-- Main Ingredients -->
              <div>
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Normalized Main Ingredients (${(p.ingredients || []).length})</h3>
                <div class="flex flex-wrap gap-2">
                  ${(p.ingredients || []).map(ing => `
                    <span class="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-medium flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                      <span>${ing}</span>
                    </span>
                  `).join('')}
                </div>
              </div>

              <!-- Monograph Description -->
              ${p.description ? `
                <div>
                  <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Clinical Monograph Notes</h3>
                  <p class="text-sm text-gray-600 leading-relaxed bg-white border border-gray-100 p-4 rounded-xl">${p.description}</p>
                </div>
              ` : ''}
            </div>

            <!-- Right Col: Metadata & Packings -->
            <div class="space-y-6">
              <!-- Available Packings -->
              <div class="bg-[#FBF9F5] p-4 rounded-xl border border-[#E2D9CC]">
                <h3 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Available Packings</h3>
                <div class="space-y-1.5">
                  ${(p.packings || []).map(pk => `
                    <div class="flex items-center justify-between p-2 rounded bg-white border border-gray-200 text-xs">
                      <span class="font-medium text-gray-800">${pk}</span>
                      <span class="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">Classical Packing</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Metadata audit block -->
              <div class="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs text-gray-500">
                <div class="flex justify-between">
                  <span>Product Code:</span>
                  <span class="font-mono font-semibold text-gray-700">${p.code}</span>
                </div>
                <div class="flex justify-between">
                  <span>Manufacturer:</span>
                  <span class="text-gray-700 font-medium">${p.manufacturer || 'Sitaram Ayurveda Pvt. Ltd.'}</span>
                </div>
                <div class="flex justify-between">
                  <span>Created:</span>
                  <span>${p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}</span>
                </div>
                <div class="flex justify-between">
                  <span>Last Updated:</span>
                  <span>${p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '—'}</span>
                </div>
              </div>

              <!-- Quick Status Action -->
              <button onclick="App.toggleProductStatus('${p.id}', true)" class="w-full py-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 text-xs font-semibold text-gray-700 transition">
                Toggle ${p.status === 'Active' ? 'to Inactive' : 'to Active'}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};

window.ProductViews = ProductViews;
