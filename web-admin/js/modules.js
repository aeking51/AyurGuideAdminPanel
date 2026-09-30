/**
 * Sitaram Ayurveda Admin Website - Secondary Functional Modules:
 * Categories, Ingredients, Manufacturers, Import/Export, App Content, Reports, Audit Logs, Settings.
 */

const ModuleViews = {
  // Dashboard
  dashboard: (stats, categorySummary, recentProducts) => {
    return `
      <div class="space-y-6">
        <!-- Dashboard Greeting -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="font-serif text-2xl font-bold text-[#0F382C]">Executive Clinical Dashboard</h1>
            <p class="text-sm text-gray-500 mt-0.5">Sitaram Ayurveda Therapeutic Index Master Catalogue Overview.</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
              <span>Handbook Ed. 2026</span>
            </span>
            <a href="#products/add" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1B4D3E] text-white text-xs font-semibold hover:bg-[#0F382C] shadow-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              <span>Add Formulation</span>
            </a>
          </div>
        </div>

        <!-- 6 Core KPI Metric Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div class="bg-white p-4 rounded-xl border border-[#E2D9CC] shadow-xs">
            <p class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Products</p>
            <p class="font-serif text-2xl font-bold text-[#0F382C] mt-1">${stats.totalProducts}</p>
            <p class="text-[10px] text-gray-400 mt-0.5">In master catalogue</p>
          </div>
          <div class="bg-white p-4 rounded-xl border border-[#E2D9CC] shadow-xs">
            <p class="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Active</p>
            <p class="font-serif text-2xl font-bold text-emerald-700 mt-1">${stats.activeProducts}</p>
            <p class="text-[10px] text-emerald-600/70 mt-0.5">Live on Mobile App</p>
          </div>
          <div class="bg-white p-4 rounded-xl border border-[#E2D9CC] shadow-xs">
            <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Inactive</p>
            <p class="font-serif text-2xl font-bold text-gray-600 mt-1">${stats.inactiveProducts}</p>
            <p class="text-[10px] text-gray-400 mt-0.5">Internal drafts</p>
          </div>
          <div class="bg-white p-4 rounded-xl border border-[#E2D9CC] shadow-xs">
            <p class="text-[11px] font-bold text-[#9A7B38] uppercase tracking-wider">Categories</p>
            <p class="font-serif text-2xl font-bold text-[#9A7B38] mt-1">${stats.totalCategories}</p>
            <p class="text-[10px] text-gray-400 mt-0.5">From Handbook</p>
          </div>
          <div class="bg-white p-4 rounded-xl border border-[#E2D9CC] shadow-xs">
            <p class="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Ingredients</p>
            <p class="font-serif text-2xl font-bold text-purple-700 mt-1">${stats.totalIngredients}</p>
            <p class="text-[10px] text-gray-400 mt-0.5">Normalized botanicals</p>
          </div>
          <div class="bg-white p-4 rounded-xl border border-[#E2D9CC] shadow-xs">
            <p class="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Manufacturers</p>
            <p class="font-serif text-2xl font-bold text-blue-700 mt-1">${stats.totalManufacturers}</p>
            <p class="text-[10px] text-gray-400 mt-0.5">GMP certified units</p>
          </div>
        </div>

        <!-- 2 Column Layout: Category Summary & Recent Products -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Category Breakdown (5 Cols) -->
          <div class="lg:col-span-5 bg-white rounded-xl border border-[#E2D9CC] p-5 shadow-xs flex flex-col">
            <div class="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
              <h2 class="font-serif font-bold text-sm text-[#0F382C]">Category Distribution (All 24)</h2>
              <a href="#categories" class="text-xs text-[#1B4D3E] font-semibold hover:underline">Manage</a>
            </div>
            <div class="flex-1 overflow-y-auto max-h-96 pr-2 space-y-2 custom-scrollbar">
              ${categorySummary.map(c => `
                <div class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition text-xs">
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">${c.code}</span>
                    <span class="font-medium text-gray-800">${c.name}</span>
                  </div>
                  <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${c.productCount > 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-400'}">
                    ${c.productCount}
                  </span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Recent Products (7 Cols) -->
          <div class="lg:col-span-7 bg-white rounded-xl border border-[#E2D9CC] p-5 shadow-xs flex flex-col">
            <div class="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
              <h2 class="font-serif font-bold text-sm text-[#0F382C]">Recently Added & Modified Formulations</h2>
              <a href="#products" class="text-xs text-[#1B4D3E] font-semibold hover:underline">View All</a>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="text-gray-400 uppercase text-[10px] font-semibold border-b border-gray-100">
                  <tr>
                    <th class="py-2">Formulation</th>
                    <th class="py-2">Category</th>
                    <th class="py-2">Packing</th>
                    <th class="py-2 text-center">Status</th>
                    <th class="py-2 text-right">Date</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  ${recentProducts.slice(0, 6).map(p => `
                    <tr class="hover:bg-gray-50 transition">
                      <td class="py-2.5">
                        <a href="#products/view/${p.id}" class="font-serif font-bold text-[#0F382C] hover:underline">${p.name}</a>
                        <p class="font-mono text-[10px] text-gray-400">${p.code}</p>
                      </td>
                      <td class="py-2.5 text-gray-600">${p.category}</td>
                      <td class="py-2.5 text-gray-500">${(p.packings || [])[0] || '—'}</td>
                      <td class="py-2.5 text-center">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${p.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}">
                          ${p.status}
                        </span>
                      </td>
                      <td class="py-2.5 text-right text-gray-400 text-[10px]">
                        ${new Date(p.updatedAt || p.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // Categories CRUD Page
  categories: (categories) => {
    return `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="font-serif text-2xl font-bold text-[#0F382C]">Therapeutic Categories</h1>
            <p class="text-sm text-gray-500 mt-0.5">Manage all 24 classical categories dynamically. Stored in central database.</p>
          </div>
          <button onclick="App.showAddCategoryModal()" class="px-4 py-2 rounded-lg bg-[#1B4D3E] hover:bg-[#0F382C] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            <span>Add Category</span>
          </button>
        </div>

        <div class="bg-white rounded-xl border border-[#E2D9CC] shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-gray-700">
              <thead class="bg-[#F6F4EE] text-gray-600 uppercase font-semibold text-[10px] tracking-wider border-b border-[#E2D9CC]">
                <tr>
                  <th class="py-3.5 px-4 w-16 text-center">Order</th>
                  <th class="py-3.5 px-4">Category Name</th>
                  <th class="py-3.5 px-4">Code</th>
                  <th class="py-3.5 px-4">Handbook Description</th>
                  <th class="py-3.5 px-4 text-center">Products</th>
                  <th class="py-3.5 px-4 text-center">Status</th>
                  <th class="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                ${categories.map(c => `
                  <tr class="hover:bg-[#FBF9F5] transition">
                    <td class="py-3 px-4 text-center font-mono font-bold text-gray-400">${c.order}</td>
                    <td class="py-3 px-4 font-serif font-bold text-sm text-[#0F382C]">${c.name}</td>
                    <td class="py-3 px-4 font-mono text-[10px] bg-gray-50 px-2 py-0.5 rounded text-gray-600 inline-block mt-2">${c.code}</td>
                    <td class="py-3 px-4 text-gray-500 max-w-sm truncate" title="${c.description}">${c.description}</td>
                    <td class="py-3 px-4 text-center">
                      <span class="px-2.5 py-1 rounded-full text-xs font-bold ${c.productCount > 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-400'}">
                        ${c.productCount || 0}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-center">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}">
                        ${c.status}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-right">
                      <div class="flex items-center justify-end gap-1">
                        <button onclick="App.showEditCategoryModal('${c.id}')" class="p-1.5 text-gray-500 hover:text-blue-600 rounded" title="Edit">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button onclick="App.deleteCategory('${c.id}')" class="p-1.5 text-gray-500 hover:text-red-600 rounded" title="Delete">
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
      </div>
    `;
  },

  // Ingredients Master Registry
  ingredients: (ingredients) => {
    return `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="font-serif text-2xl font-bold text-[#0F382C]">Normalized Ingredients Registry</h1>
            <p class="text-sm text-gray-500 mt-0.5">Botanical taxonomy, Sanskrit nomenclature, and usage count across formulations.</p>
          </div>
          <button onclick="App.showAddIngredientModal()" class="px-4 py-2 rounded-lg bg-[#1B4D3E] hover:bg-[#0F382C] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            <span>Add Ingredient</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${ingredients.map(ing => `
            <div class="bg-white rounded-xl border border-[#E2D9CC] p-4 shadow-xs hover:border-[#1B4D3E] transition flex flex-col justify-between">
              <div>
                <div class="flex items-start justify-between">
                  <h3 class="font-serif font-bold text-base text-[#0F382C]">${ing.name}</h3>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800">
                    ${ing.productsCount} Formulations
                  </span>
                </div>
                <p class="text-xs text-gray-500 italic mt-0.5">${ing.botanicalName}</p>
                ${ing.sanskritName ? `<p class="text-xs text-[#9A7B38] font-serif mt-1 font-semibold">${ing.sanskritName}</p>` : ''}
              </div>

              <div class="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <button onclick="App.viewIngredientProducts('${ing.name}')" class="text-[#1B4D3E] font-semibold hover:underline flex items-center gap-1">
                  <span>View Products</span>
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
                <span class="text-[11px] text-gray-400">${ing.partUsed || 'Herb'}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // Manufacturers Management
  manufacturers: (manufacturers) => {
    return `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="font-serif text-2xl font-bold text-[#0F382C]">Licensed Manufacturing Units</h1>
            <p class="text-sm text-gray-500 mt-0.5">Ayush GMP certified manufacturing laboratories, regulatory contacts and addresses.</p>
          </div>
          <button onclick="App.showAddManufacturerModal()" class="px-4 py-2 rounded-lg bg-[#1B4D3E] hover:bg-[#0F382C] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            <span>Add Manufacturer</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${manufacturers.map(m => `
            <div class="bg-white rounded-xl border border-[#E2D9CC] p-5 shadow-xs space-y-3">
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="font-serif font-bold text-base text-[#0F382C]">${m.name}</h3>
                  <span class="font-mono text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded">${m.code}</span>
                </div>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">${m.status}</span>
              </div>

              <div class="text-xs space-y-1.5 text-gray-600">
                <p><strong>Ayush License:</strong> <span class="font-mono text-gray-800">${m.license}</span></p>
                <p><strong>Chief Authority:</strong> ${m.contactPerson}</p>
                <p><strong>Official Email:</strong> <a href="mailto:${m.email}" class="text-[#1B4D3E] underline">${m.email}</a></p>
                <p><strong>Phone:</strong> ${m.phone}</p>
                <p><strong>Facility Address:</strong> ${m.address}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // Excel / CSV Import System
  import: () => {
    return `
      <div class="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 class="font-serif text-2xl font-bold text-[#0F382C]">Therapeutic Index Bulk Excel Import</h1>
          <p class="text-sm text-gray-500 mt-0.5">Seamlessly import hundreds of classical formulations directly from Excel (.xlsx) or CSV.</p>
        </div>

        <!-- Import Process Step Progress Indicator -->
        <div class="bg-white p-4 rounded-xl border border-[#E2D9CC] shadow-xs flex items-center justify-between text-xs font-semibold">
          <div class="flex items-center gap-2 text-[#1B4D3E]">
            <span class="w-6 h-6 rounded-full bg-[#1B4D3E] text-white flex items-center justify-center text-xs">1</span>
            <span>Upload File</span>
          </div>
          <div class="w-12 h-0.5 bg-gray-200"></div>
          <div class="flex items-center gap-2 text-gray-400">
            <span class="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs">2</span>
            <span>Validation</span>
          </div>
          <div class="w-12 h-0.5 bg-gray-200"></div>
          <div class="flex items-center gap-2 text-gray-400">
            <span class="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs">3</span>
            <span>Preview & Commit</span>
          </div>
        </div>

        <!-- Download Template Banner -->
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-amber-100 text-amber-800">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <div>
              <p class="text-xs font-bold text-amber-900">Standard Therapeutic Index Excel Template</p>
              <p class="text-[11px] text-amber-700">Pre-formatted columns: Code, Name, Category, Classical Reference, Packing, Ingredients, Usage, Indications.</p>
            </div>
          </div>
          <button onclick="App.downloadExcelTemplate()" class="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-semibold shadow-xs shrink-0 flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            <span>Download Template (.csv)</span>
          </button>
        </div>

        <!-- File Upload Drag and Drop Zone -->
        <div class="bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-[#1B4D3E] p-8 text-center transition-all">
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
          <p class="font-serif font-bold text-base text-gray-700">Drag & Drop your Excel or CSV Catalogue file here</p>
          <p class="text-xs text-gray-400 mt-1">Supports .xlsx, .xls, .csv up to 10MB</p>
          <div class="mt-4">
            <label class="px-5 py-2.5 bg-[#1B4D3E] hover:bg-[#0F382C] text-white rounded-lg text-xs font-semibold cursor-pointer inline-flex items-center gap-2 shadow-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              <span>Select File from Computer</span>
              <input type="file" id="excel-file-input" accept=".xlsx, .xls, .csv" onchange="App.handleExcelUpload(event)" class="hidden">
            </label>
          </div>
        </div>

        <!-- Dynamic Import Preview Container -->
        <div id="import-preview-container" class="hidden space-y-4"></div>
      </div>
    `;
  },

  // Export Catalogue View
  export: (categories, ingredients) => {
    return `
      <div class="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 class="font-serif text-2xl font-bold text-[#0F382C]">Export Medicine Catalogue</h1>
          <p class="text-sm text-gray-500 mt-0.5">Download full master catalogue in Excel (.xlsx) or CSV formats with custom scope filters.</p>
        </div>

        <div class="bg-white rounded-xl border border-[#E2D9CC] p-6 shadow-xs space-y-5">
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">1. Scope of Export</label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label class="p-3 border rounded-xl flex items-center gap-2 cursor-pointer hover:bg-gray-50">
                <input type="radio" name="export-scope" value="all" checked class="text-[#1B4D3E] focus:ring-[#1B4D3E]">
                <span class="text-xs font-semibold text-gray-800">All Products</span>
              </label>
              <label class="p-3 border rounded-xl flex items-center gap-2 cursor-pointer hover:bg-gray-50">
                <input type="radio" name="export-scope" value="active" class="text-[#1B4D3E] focus:ring-[#1B4D3E]">
                <span class="text-xs font-semibold text-gray-800">Active Only</span>
              </label>
              <label class="p-3 border rounded-xl flex items-center gap-2 cursor-pointer hover:bg-gray-50">
                <input type="radio" name="export-scope" value="inactive" class="text-[#1B4D3E] focus:ring-[#1B4D3E]">
                <span class="text-xs font-semibold text-gray-800">Inactive Drafts</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">2. Optional Category Filter</label>
            <select id="export-cat-filter" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B4D3E] bg-white">
              <option value="">All 24 Categories</option>
              ${categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
            </select>
          </div>

          <div class="pt-3 border-t border-gray-100 flex items-center justify-end gap-3 flex-wrap">
            <button onclick="App.triggerExport('csv')" class="px-4 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              <span>Download CSV</span>
            </button>
            <button onclick="App.triggerExport('excel')" class="px-4 py-2.5 rounded-lg border border-[#1B4D3E] text-[#1B4D3E] hover:bg-emerald-50 text-xs font-semibold shadow-xs flex items-center gap-2">
              <svg class="w-4 h-4 text-[#DFB15B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              <span>Excel (.xlsx)</span>
            </button>
            <button onclick="App.triggerPdfExport()" class="px-5 py-2.5 rounded-lg bg-[#1B4D3E] hover:bg-[#0F382C] text-white text-xs font-semibold shadow-sm flex items-center gap-2">
              <svg class="w-4 h-4 text-[#DFB15B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              <span>Export PDF Report</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // App Content Management (For Future Android App)
  appContent: (banners, announcements, featuredProducts) => {
    return `
      <div class="space-y-6">
        <div>
          <h1 class="font-serif text-2xl font-bold text-[#0F382C]">Mobile App Content Governance</h1>
          <p class="text-sm text-gray-500 mt-0.5">Control promotional banners, featured product shelves, and clinical announcements for future Android User/Admin apps.</p>
        </div>

        <!-- Banners Section -->
        <div class="bg-white rounded-xl border border-[#E2D9CC] p-5 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 class="font-serif font-bold text-base text-[#0F382C]">Android App Promotional Banners</h2>
            <button onclick="App.showAddBannerModal()" class="text-xs font-semibold text-[#1B4D3E] hover:underline flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              <span>Add Banner</span>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${banners.map(b => `
              <div class="rounded-xl border border-gray-200 overflow-hidden shadow-xs relative group">
                <img src="${b.imageUrl}" class="w-full h-32 object-cover" alt="${b.title}">
                <div class="p-3 bg-white">
                  <div class="flex items-center justify-between">
                    <h4 class="font-bold text-xs text-[#0F382C]">${b.title}</h4>
                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800">${b.status}</span>
                  </div>
                  <p class="text-[11px] text-gray-500 mt-0.5 truncate">${b.subtitle}</p>
                  <p class="text-[10px] text-amber-800 mt-1">Target: ${b.targetType} → ${b.targetValue}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Announcements Section -->
        <div class="bg-white rounded-xl border border-[#E2D9CC] p-5 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 class="font-serif font-bold text-base text-[#0F382C]">Clinical Bulletins & Announcements</h2>
            <button onclick="App.showAddAnnouncementModal()" class="text-xs font-semibold text-[#1B4D3E] hover:underline flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              <span>Add Bulletin</span>
            </button>
          </div>

          <div class="space-y-2">
            ${announcements.map(a => `
              <div class="p-3 rounded-lg bg-gray-50 border border-gray-200 flex items-start justify-between gap-3 text-xs">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-gray-800">${a.title}</span>
                    <span class="px-1.5 py-0.2 rounded text-[10px] font-bold ${a.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}">${a.priority} Priority</span>
                  </div>
                  <p class="text-gray-600 mt-0.5 text-[11px]">${a.message}</p>
                </div>
                <span class="text-[10px] text-gray-400 shrink-0">${a.date}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  // Reports
  reports: (products, categories, ingredients) => {
    return `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="font-serif text-2xl font-bold text-[#0F382C]">Clinical Catalogue Analytics</h1>
            <p class="text-sm text-gray-500 mt-0.5">Statistical distributions, formulation readiness, and herbal usage frequency.</p>
          </div>
          <button onclick="App.exportReportCSV()" class="px-4 py-2 rounded-lg bg-[#1B4D3E] text-white text-xs font-semibold hover:bg-[#0F382C] flex items-center gap-1.5 shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            <span>Export Analytics CSV</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Category Breakdown Progress Bars -->
          <div class="bg-white rounded-xl border border-[#E2D9CC] p-5 shadow-xs space-y-3">
            <h3 class="font-serif font-bold text-sm text-[#0F382C]">Product Volume by Category</h3>
            <div class="space-y-2.5 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              ${categories.map(c => {
                const pct = products.length ? Math.round((c.productCount / products.length) * 100) : 0;
                return `
                  <div>
                    <div class="flex justify-between text-xs mb-1">
                      <span class="font-medium text-gray-700">${c.name}</span>
                      <span class="text-gray-400 font-mono">${c.productCount} (${pct}%)</span>
                    </div>
                    <div class="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div class="h-full bg-[#1B4D3E] rounded-full" style="width: ${pct}%"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Top Botanical Ingredients Frequency -->
          <div class="bg-white rounded-xl border border-[#E2D9CC] p-5 shadow-xs space-y-3">
            <h3 class="font-serif font-bold text-sm text-[#0F382C]">Top Utilized Classical Botanicals</h3>
            <div class="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              ${ingredients.slice(0, 10).map(ing => `
                <div class="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100 text-xs">
                  <div>
                    <p class="font-semibold text-gray-800">${ing.name}</p>
                    <p class="text-[10px] text-gray-400 italic">${ing.botanicalName}</p>
                  </div>
                  <span class="font-mono text-xs font-bold text-[#1B4D3E] bg-white px-2 py-0.5 rounded border border-gray-200">
                    ${ing.productsCount} formulations
                  </span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // Audit Logs View
  auditLogs: (logs) => {
    return `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="font-serif text-2xl font-bold text-[#0F382C]">Regulatory Audit Trail</h1>
            <p class="text-sm text-gray-500 mt-0.5">Immutable record of administrator actions, catalogue modifications and data exports.</p>
          </div>
          <button onclick="App.exportAuditCSV()" class="px-4 py-2 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5">
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            <span>Export Audit Log</span>
          </button>
        </div>

        <div class="bg-white rounded-xl border border-[#E2D9CC] shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-gray-700">
              <thead class="bg-[#F6F4EE] text-gray-600 uppercase font-semibold text-[10px] tracking-wider border-b border-[#E2D9CC]">
                <tr>
                  <th class="py-3 px-4">Timestamp</th>
                  <th class="py-3 px-4">Administrator</th>
                  <th class="py-3 px-4">Action</th>
                  <th class="py-3 px-4">Target Entity</th>
                  <th class="py-3 px-4">Modification Details</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 font-mono text-[11px]">
                ${logs.map(l => `
                  <tr class="hover:bg-gray-50 transition">
                    <td class="py-2.5 px-4 text-gray-400 shrink-0">${l.timestamp}</td>
                    <td class="py-2.5 px-4 font-sans font-semibold text-gray-800">${l.admin}</td>
                    <td class="py-2.5 px-4">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                        l.action.includes('ADD') || l.action.includes('CREATE') ? 'bg-emerald-50 text-emerald-800' :
                        l.action.includes('DELETE') ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'
                      }">${l.action}</span>
                    </td>
                    <td class="py-2.5 px-4 font-sans font-medium text-gray-700">${l.entity}</td>
                    <td class="py-2.5 px-4 font-sans text-gray-600 text-xs">${l.details}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // Settings & Central Database Synchronizer
  settings: (settings) => {
    return `
      <div class="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 class="font-serif text-2xl font-bold text-[#0F382C]">System Settings & Central Database</h1>
          <p class="text-sm text-gray-500 mt-0.5">Configure central database synchronization shared between Admin Website and Android applications.</p>
        </div>

        <!-- Central DB Sync Status Box -->
        <div class="bg-white rounded-xl border border-[#E2D9CC] p-6 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-gray-100 pb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
              </div>
              <div>
                <h3 class="font-serif font-bold text-base text-[#0F382C]">Central Cloud Database Connector</h3>
                <p class="text-xs text-emerald-700 font-medium">${settings.syncStatus}</p>
              </div>
            </div>
            <button onclick="App.testDbConnection()" class="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs">
              Test Connection
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Firestore / Backend Project ID</label>
              <input type="text" id="cfg-pid" value="${settings.firestoreProjectId}" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 font-mono">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">API Key / Authorization Token</label>
              <input type="password" id="cfg-key" value="${settings.firestoreApiKey}" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 font-mono">
            </div>
          </div>
          <button onclick="App.saveSettingsConfig()" class="px-4 py-2 bg-[#1B4D3E] hover:bg-[#0F382C] text-white rounded-lg text-xs font-semibold">
            Save Cloud Configuration
          </button>
        </div>

        <!-- Liquid Glass Motion & Visual Profiles Card -->
        <div class="bg-white rounded-xl border border-[#E2D9CC] p-6 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-gray-100 pb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <div>
                <h3 class="font-serif font-bold text-base text-[#0F382C]">Liquid Glass Motion Profiles</h3>
                <p class="text-xs text-gray-500">Configure real-time 3D parallax motion kinetics, card hover duration, and body[data-motion] attributes.</p>
              </div>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Current Body Attribute</span>
              <span id="settings-page-active-motion-attr" class="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block mt-0.5">
                data-motion="${(typeof App !== 'undefined' && App.motionMode) ? App.motionMode : 'default'}"
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Default -->
            <div 
              id="page-settings-motion-default"
              onclick="App.setParallaxMotionMode('default')"
              class="rounded-xl p-4 border transition cursor-pointer flex flex-col justify-between group hover:bg-emerald-50/50 ${(typeof App !== 'undefined' && App.motionMode === 'default') ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md' : 'bg-white border-gray-200'}">
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <span>🌿</span>
                    <span>Default Profile</span>
                  </span>
                  <span id="page-settings-check-default" class="${(typeof App !== 'undefined' && App.motionMode === 'default') ? '' : 'hidden'} text-xs font-bold text-emerald-600">✓ Active</span>
                </div>
                <div class="text-[10px] font-mono text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded w-fit">
                  data-motion="default"
                </div>
                <p class="text-xs text-gray-500 mt-1">
                  Balanced 150ms natural transition physics with smooth ease-out curves. Standard baseline for desktop.
                </p>
              </div>
              <div class="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                <span>Duration: <strong>150ms</strong></span>
                <span>Snap: <strong>320ms</strong></span>
              </div>
            </div>

            <!-- Snappy -->
            <div 
              id="page-settings-motion-snappy"
              onclick="App.setParallaxMotionMode('snappy')"
              class="rounded-xl p-4 border transition cursor-pointer flex flex-col justify-between group hover:bg-emerald-50/50 ${(typeof App !== 'undefined' && App.motionMode === 'snappy') ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md' : 'bg-white border-gray-200'}">
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <span>⚡</span>
                    <span>Snappy Profile</span>
                  </span>
                  <span id="page-settings-check-snappy" class="${(typeof App !== 'undefined' && App.motionMode === 'snappy') ? '' : 'hidden'} text-xs font-bold text-emerald-600">✓ Active</span>
                </div>
                <div class="text-[10px] font-mono text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded w-fit">
                  data-motion="snappy"
                </div>
                <p class="text-xs text-gray-500 mt-1">
                  High-speed 80ms micro-motion acceleration with crisp tilt reactions. Optimal for fast scanning.
                </p>
              </div>
              <div class="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                <span>Duration: <strong>80ms</strong></span>
                <span>Snap: <strong>220ms</strong></span>
              </div>
            </div>

            <!-- Fluid -->
            <div 
              id="page-settings-motion-fluid"
              onclick="App.setParallaxMotionMode('fluid')"
              class="rounded-xl p-4 border transition cursor-pointer flex flex-col justify-between group hover:bg-emerald-50/50 ${(typeof App !== 'undefined' && App.motionMode === 'fluid') ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md' : 'bg-white border-gray-200'}">
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <span>🌊</span>
                    <span>Fluid Profile</span>
                  </span>
                  <span id="page-settings-check-fluid" class="${(typeof App !== 'undefined' && App.motionMode === 'fluid') ? '' : 'hidden'} text-xs font-bold text-emerald-600">✓ Active</span>
                </div>
                <div class="text-[10px] font-mono text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded w-fit">
                  data-motion="fluid"
                </div>
                <p class="text-xs text-gray-500 mt-1">
                  Organic 350ms glide with deep magnetic return kinetics. Creates a luxurious liquid-glass sensation.
                </p>
              </div>
              <div class="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                <span>Duration: <strong>350ms</strong></span>
                <span>Snap: <strong>450ms</strong></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Factory Reset & Backup Card -->
        <div class="bg-white rounded-xl border border-[#E2D9CC] p-6 shadow-xs space-y-4">
          <h3 class="font-serif font-bold text-base text-[#0F382C]">Catalogue Snapshot & Backup</h3>
          <p class="text-xs text-gray-500">Download complete JSON snapshot of all 24 categories, products, ingredients and audit trails for disaster recovery.</p>

          <div class="flex flex-wrap items-center gap-3">
            <button onclick="App.downloadFullBackupJson()" class="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              <span>Download JSON Backup</span>
            </button>
            <button onclick="App.resetToHandbookDefaults()" class="px-4 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-700 flex items-center gap-1.5">
              <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              <span>Reset to Therapeutic Index Defaults</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // Clinical Media & Packaging Asset Gallery
  media: (assets) => {
    const defaultAssets = assets || [
      { id: 'm1', title: 'Classical Kashayam Amber Glass Bottle (450ml)', category: 'Packaging', url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800', size: '1.2 MB', dimensions: '1920x1080' },
      { id: 'm2', title: 'Raw Triphala Botanical Harvest', category: 'Botanicals', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800', size: '2.4 MB', dimensions: '2400x1600' },
      { id: 'm3', title: 'Pure Medicated Cow Ghee Processing Crucible', category: 'Manufacturing', url: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=800', size: '1.8 MB', dimensions: '2048x1365' },
      { id: 'm4', title: 'Classical Sesame Oil Thailam Dispenser', category: 'Packaging', url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800', size: '940 KB', dimensions: '1600x1200' },
      { id: 'm5', title: 'Fresh Haridra & Ashwagandha Roots', category: 'Botanicals', url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800', size: '3.1 MB', dimensions: '2800x1800' },
      { id: 'm6', title: 'Ayush Certified Laboratory Formulation Line', category: 'Manufacturing', url: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=800', size: '2.1 MB', dimensions: '1920x1280' }
    ];

    return `
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="font-serif text-2xl font-bold text-[#0F382C]">Clinical Media & Asset Library</h1>
            <p class="text-sm text-gray-500 mt-0.5">High-resolution pharmaceutical packaging photography, raw botanical species, and manufacturing unit imagery.</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="App.showAddMediaModal()" class="px-4 py-2 bg-[#1B4D3E] hover:bg-[#0F382C] text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              <span>Add Media Asset</span>
            </button>
          </div>
        </div>

        <!-- Filter bar -->
        <div class="bg-white p-4 rounded-xl border border-[#E2D9CC] shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Asset Filter:</span>
            <button class="px-3 py-1 bg-[#1B4D3E] text-white text-xs font-semibold rounded-full">All (${defaultAssets.length})</button>
            <button class="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-full">Packaging</button>
            <button class="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-full">Botanicals</button>
            <button class="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-full">Manufacturing</button>
          </div>
          <span class="text-xs text-gray-500 font-medium">Ready for Mobile App CDN caching</span>
        </div>

        <!-- Media Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          ${defaultAssets.map(a => `
            <div class="bg-white rounded-xl border border-[#E2D9CC] overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between">
              <div class="relative h-48 bg-gray-100 overflow-hidden">
                <img src="${a.url}" alt="${a.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                <span class="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  ${a.category}
                </span>
              </div>
              <div class="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h4 class="font-serif font-bold text-sm text-[#0F382C] line-clamp-1">${a.title}</h4>
                  <div class="flex items-center gap-3 text-[11px] text-gray-400 mt-1 font-mono">
                    <span>${a.dimensions}</span>
                    <span>•</span>
                    <span>${a.size}</span>
                  </div>
                </div>
                <div class="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <button onclick="navigator.clipboard.writeText('${a.url}'); App.showToast('Image URL copied to clipboard!', 'success');" class="text-xs font-semibold text-[#1B4D3E] hover:underline flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                    <span>Copy CDN URL</span>
                  </button>
                  <a href="${a.url}" target="_blank" class="p-1 text-gray-400 hover:text-gray-700" title="Open Full Size">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  </a>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // Supabase Cloud Database Management View
  supabase: (status) => {
    const isConfigured = status && status.configured;
    const isConnected = status && status.success;
    const projectUrl = (status && status.url) || '';

    return `
      <div class="space-y-6 max-w-5xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="p-2 rounded-lg bg-[#3ECF8E]/10 text-[#3ECF8E]">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
              </span>
              <h1 class="font-serif text-2xl font-bold text-[#0F382C]">Supabase Cloud Database</h1>
            </div>
            <p class="text-sm text-gray-500 mt-1">Managed cloud PostgreSQL storage, real-time sync, and external multi-device persistence.</p>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="App.copySupabaseSchema(this)" class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E2D9CC] text-[#0F382C] text-xs font-semibold hover:bg-gray-50 shadow-xs transition-colors">
              <svg class="w-4 h-4 text-[#1B4D3E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
              <span>Copy SQL Script</span>
            </button>
            <a href="/api/supabase/schema" download="supabase_schema.sql" class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E2D9CC] text-[#0F382C] text-xs font-semibold hover:bg-gray-50 shadow-xs transition-colors">
              <svg class="w-4 h-4 text-[#9A7B38]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              <span>Download (.SQL)</span>
            </a>
            <a href="https://supabase.com/dashboard/project/ksnsfilauqzxsegpjpdt/sql" target="_blank" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1B4D3E] text-white text-xs font-semibold hover:bg-[#0F382C] shadow-sm transition-colors">
              <span>Open Supabase SQL Editor</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </a>
          </div>
        </div>

        <!-- Connection Status Banner -->
        <div class="p-5 rounded-2xl border ${isConnected ? 'bg-emerald-50 border-emerald-200' : isConfigured ? 'bg-amber-50 border-amber-200' : 'bg-white border-[#E2D9CC]'} shadow-xs flex items-center justify-between gap-4">
          <div class="flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-xl ${isConnected ? 'bg-emerald-500 text-white' : isConfigured ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'} flex items-center justify-center shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ${isConnected 
                  ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>' 
                  : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>'}
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold ${isConnected ? 'text-emerald-900' : isConfigured ? 'text-amber-900' : 'text-gray-900'}">
                  ${isConnected ? 'Connected to Supabase Cloud' : isConfigured ? 'Connected (Pending Table Schema)' : 'Not Connected to Supabase'}
                </h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isConnected ? 'bg-emerald-100 text-emerald-800' : isConfigured ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}">
                  ${isConnected ? 'Live PostgreSQL' : isConfigured ? 'Setup Required' : 'Cloud Setup Required'}
                </span>
              </div>
              <p class="text-xs text-gray-600 mt-0.5">${status ? (status.message || status.error || 'Configure your Supabase credentials below to connect your cloud database.') : 'Configure credentials below.'}</p>
            </div>
          </div>
          <button onclick="App.checkSupabaseStatus()" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 shadow-2xs">
            Refresh Status
          </button>
        </div>

        <!-- 2-Column Grid: Config Form & Step-by-Step Guide -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Configuration Card -->
          <div class="lg:col-span-7 bg-white rounded-2xl border border-[#E2D9CC] shadow-xs p-6 space-y-5">
            <h2 class="font-serif text-lg font-bold text-[#0F382C]">Cloud Connection Credentials</h2>
            <form id="supabase-config-form" onsubmit="App.saveSupabaseConfig(event)" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Project URL</label>
                <div class="relative">
                  <input type="url" id="sb-url" required value="${projectUrl}" placeholder="https://your-project-ref.supabase.co" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1B4D3E] focus:border-transparent text-sm font-mono placeholder:text-gray-400">
                </div>
                <p class="text-[11px] text-gray-400 mt-1">Found in Supabase Dashboard -> Project Settings -> API</p>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Project API Key (Anon / Service Role Key)</label>
                <div class="relative">
                  <input type="password" id="sb-key" required placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." class="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1B4D3E] focus:border-transparent text-sm font-mono placeholder:text-gray-400">
                </div>
                <p class="text-[11px] text-gray-400 mt-1">Found under Project Settings -> API -> Project API keys ("anon public" or "service_role")</p>
              </div>

              <div class="pt-2 flex items-center gap-3">
                <button type="submit" id="btn-save-sb" class="px-5 py-2.5 rounded-xl bg-[#1B4D3E] hover:bg-[#0F382C] text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>Save & Test Connection</span>
                </button>
              </div>
            </form>

            <div class="pt-5 border-t border-gray-100 space-y-3">
              <h3 class="font-serif text-sm font-bold text-[#0F382C]">One-Click Migration</h3>
              <p class="text-xs text-gray-500">Push all categories, botanical ingredients, and master formulations directly into your Supabase tables.</p>
              <button onclick="App.triggerSupabaseMigration()" id="btn-migrate-sb" class="w-full py-3 px-4 rounded-xl bg-[#DFB15B] hover:bg-[#9A7B38] text-[#0F382C] hover:text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                <span>Synchronize All Master Data to Supabase</span>
              </button>
            </div>
          </div>

          <!-- Step-by-Step Instructions -->
          <div class="lg:col-span-5 bg-stone-50 rounded-2xl border border-[#E2D9CC] p-6 space-y-4">
            <h3 class="font-serif text-base font-bold text-[#0F382C] flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-[#1B4D3E] text-white flex items-center justify-center text-xs">i</span>
              <span>4-Step Supabase Setup</span>
            </h3>

            <div class="space-y-3.5 text-xs text-gray-600">
              <div class="flex items-start gap-2.5">
                <span class="w-5 h-5 rounded-full bg-white border border-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-700 shrink-0 mt-0.5">1</span>
                <div>
                  <p class="font-semibold text-gray-900">Create Free Supabase Project</p>
                  <p class="text-gray-500 mt-0.5">Sign up free at <a href="https://supabase.com" target="_blank" class="text-[#1B4D3E] font-medium underline">supabase.com</a> and click "New Project".</p>
                </div>
              </div>

              <div class="flex items-start gap-2.5">
                <span class="w-5 h-5 rounded-full bg-white border border-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-700 shrink-0 mt-0.5">2</span>
                <div>
                  <p class="font-semibold text-gray-900">Execute SQL Schema</p>
                  <p class="text-gray-500 mt-0.5">In your Supabase dashboard, open the <strong>SQL Editor</strong>, click <strong>New Query</strong>, and paste the contents of <a href="/api/supabase/schema" class="text-[#1B4D3E] underline font-medium">supabase_schema.sql</a>, then click <strong>Run</strong>.</p>
                </div>
              </div>

              <div class="flex items-start gap-2.5">
                <span class="w-5 h-5 rounded-full bg-white border border-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-700 shrink-0 mt-0.5">3</span>
                <div>
                  <p class="font-semibold text-gray-900">Copy API Credentials</p>
                  <p class="text-gray-500 mt-0.5">Go to <strong>Settings -> API</strong>. Copy the <strong>Project URL</strong> and <strong>anon/public Key</strong> and paste them in the form on the left.</p>
                </div>
              </div>

              <div class="flex items-start gap-2.5">
                <span class="w-5 h-5 rounded-full bg-white border border-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-700 shrink-0 mt-0.5">4</span>
                <div>
                  <p class="font-semibold text-gray-900">Click "Synchronize All Master Data"</p>
                  <p class="text-gray-500 mt-0.5">Your formulations will instantly sync to your cloud PostgreSQL database.</p>
                </div>
              </div>
            </div>

            <div class="p-3.5 rounded-xl bg-white border border-gray-200 text-[11px] text-gray-600 space-y-1">
              <p class="font-semibold text-gray-900">💡 Central Cloud Database</p>
              <p>Supabase PostgreSQL is the central single source of truth across the website admin panel and mobile application.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};

window.ModuleViews = ModuleViews;
