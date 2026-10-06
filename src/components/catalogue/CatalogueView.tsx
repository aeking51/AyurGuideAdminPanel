import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Download, 
  FileSpreadsheet, 
  Grid, 
  List, 
  Filter, 
  Sparkles, 
  RotateCcw,
  RefreshCw,
  Trash2,
  Check,
  CheckCircle2,
  X,
  AlertCircle,
  CheckSquare,
  ChevronDown,
  UploadCloud
} from 'lucide-react';
import { Product, Category } from '../../types';
import { ProductTable } from './ProductTable';
import { ProductCardsView } from './ProductCardsView';
import { SupabaseService } from '../../services/supabase';

interface CatalogueViewProps {
  products: Product[];
  categories: Category[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenNewProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onBulkDelete?: (ids: (number | string)[]) => void;
  onViewMonograph: (product: Product) => void;
  onShareProduct?: (product: Product) => void;
  onReload?: () => void;
  isReloading?: boolean;
}

export const CatalogueView: React.FC<CatalogueViewProps> = ({
  products,
  categories,
  searchQuery,
  setSearchQuery,
  onOpenNewProduct,
  onEditProduct,
  onDeleteProduct,
  onBulkDelete,
  onViewMonograph,
  onShareProduct,
  onReload,
  isReloading = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDosha, setSelectedDosha] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Multi-Selection State
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string | number>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isSelectMenuOpen, setIsSelectMenuOpen] = useState(false);
  const [isSyncingHerbs, setIsSyncingHerbs] = useState(false);
  const [syncHerbsNotice, setSyncHerbsNotice] = useState<string | null>(null);

  // Filter products memoized
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(q);
        const matchSanskrit = (product.sanskritName || '').toLowerCase().includes(q);
        const matchCode = (product.code || '').toLowerCase().includes(q);
        const matchIndications = (product.indications || '').toLowerCase().includes(q);
        const matchIngredients = (product.ingredients || []).some(item => {
          const str = typeof item === 'string' ? item : `${item.name} ${item.botanicalName || ''}`;
          return str.toLowerCase().includes(q);
        });

        if (!matchName && !matchSanskrit && !matchCode && !matchIndications && !matchIngredients) {
          return false;
        }
      }

      // 2. Category
      if (selectedCategory !== 'ALL') {
        if (String(product.categoryId) !== String(selectedCategory)) {
          return false;
        }
      }

      // 3. Dosha
      if (selectedDosha !== 'ALL') {
        if (!product.targetDoshas?.includes(selectedDosha) && product.doshaImpact?.indexOf(selectedDosha) === -1) {
          return false;
        }
      }

      // 4. Status
      if (selectedStatus !== 'ALL') {
        if (product.status !== selectedStatus) {
          return false;
        }
      }

      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedDosha, selectedStatus]);

  // Selected products array
  const selectedProductsList = useMemo(() => {
    return products.filter(p => selectedProductIds.has(p.id));
  }, [products, selectedProductIds]);

  // Toggle single item or Shift+Click range
  const handleToggleSelect = (productId: string | number, isShiftKey = false, index?: number) => {
    const next = new Set(selectedProductIds);

    if (isShiftKey && lastSelectedIndex !== null && typeof index === 'number') {
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      for (let i = start; i <= end; i++) {
        if (filteredProducts[i]) {
          next.add(filteredProducts[i].id);
        }
      }
    } else {
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      if (typeof index === 'number') {
        setLastSelectedIndex(index);
      }
    }

    setSelectedProductIds(next);
  };

  // Toggle select all filtered products
  const handleToggleSelectAll = () => {
    const allFilteredSelected = filteredProducts.length > 0 && filteredProducts.every(p => selectedProductIds.has(p.id));
    const next = new Set(selectedProductIds);

    if (allFilteredSelected) {
      filteredProducts.forEach(p => next.delete(p.id));
    } else {
      filteredProducts.forEach(p => next.add(p.id));
    }

    setSelectedProductIds(next);
  };

  // Select groups (Active, Inactive, Invert, Clear)
  const handleSelectGroup = (type: 'all' | 'active' | 'inactive' | 'invert' | 'none') => {
    const next = new Set(selectedProductIds);

    if (type === 'all') {
      filteredProducts.forEach(p => next.add(p.id));
    } else if (type === 'active') {
      filteredProducts.forEach(p => {
        if (p.status === 'Active') next.add(p.id);
        else next.delete(p.id);
      });
    } else if (type === 'inactive') {
      filteredProducts.forEach(p => {
        if (p.status !== 'Active') next.add(p.id);
        else next.delete(p.id);
      });
    } else if (type === 'invert') {
      filteredProducts.forEach(p => {
        if (next.has(p.id)) next.delete(p.id);
        else next.add(p.id);
      });
    } else if (type === 'none') {
      next.clear();
    }

    setSelectedProductIds(next);
  };

  // Select all products belonging to a specific category
  const handleSelectCategoryGroup = (catIdentifier: string | number) => {
    const next = new Set(selectedProductIds);
    filteredProducts.forEach(p => {
      const match = String(p.categoryId) === String(catIdentifier) || 
                    (p.categoryName && p.categoryName.toLowerCase() === String(catIdentifier).toLowerCase());
      if (match) {
        next.add(p.id);
      }
    });
    setSelectedProductIds(next);
  };

  // Select all products by Dosha
  const handleSelectDoshaGroup = (dosha: string) => {
    const next = new Set(selectedProductIds);
    filteredProducts.forEach(p => {
      if (p.targetDoshas?.includes(dosha) || p.doshaImpact?.includes(dosha)) {
        next.add(p.id);
      }
    });
    setSelectedProductIds(next);
  };

  // Generic CSV Exporter
  const exportItemsToCSV = (items: Product[], filename: string) => {
    const headers = ['Code', 'Name', 'Sanskrit Name', 'Category', 'Status', 'Classical Reference', 'Indications', 'Packings', 'Batch Number'];
    const rows = items.map(p => [
      `"${p.code || ''}"`,
      `"${p.name || ''}"`,
      `"${p.sanskritName || ''}"`,
      `"${p.categoryName || ''}"`,
      `"${p.status || ''}"`,
      `"${(p.classicalReference || '').replace(/"/g, '""')}"`,
      `"${(p.indications || '').replace(/"/g, '""')}"`,
      `"${(p.packings || []).join('; ')}"`,
      `"${p.batchNumber || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export all filtered
  const handleExportAllFiltered = () => {
    exportItemsToCSV(filteredProducts, `ayur_index_catalogue_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  // Export only selected
  const handleExportSelected = () => {
    if (selectedProductsList.length === 0) return;
    exportItemsToCSV(selectedProductsList, `ayur_index_selected_${selectedProductsList.length}_formulations_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  // Confirm bulk delete
  const confirmBulkDelete = () => {
    if (selectedProductIds.size === 0) return;
    if (onBulkDelete) {
      onBulkDelete(Array.from(selectedProductIds));
    }
    setSelectedProductIds(new Set());
    setIsBulkDeleteModalOpen(false);
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedDosha('ALL');
    setSelectedStatus('ALL');
  };

  const activeFilteredCount = useMemo(() => {
    return filteredProducts.filter(p => p.status === 'Active').length;
  }, [filteredProducts]);

  const inactiveFilteredCount = useMemo(() => {
    return filteredProducts.filter(p => p.status !== 'Active').length;
  }, [filteredProducts]);

  const handleStoreHerbsToSupabase = async () => {
    setIsSyncingHerbs(true);
    setSyncHerbsNotice(null);
    try {
      const res = await SupabaseService.syncAllPlaceholderDataToSupabase();
      setSyncHerbsNotice(res.message);
      if (onReload) onReload();
    } catch (err: any) {
      setSyncHerbsNotice(err.message || 'Failed to store herbs to Supabase.');
    } finally {
      setIsSyncingHerbs(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Sync Herbs Notice */}
      {syncHerbsNotice && (
        <div className="bg-emerald-950/90 border border-emerald-500/80 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-200 shadow-xl">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-medium">{syncHerbsNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncHerbsNotice(null)}
            className="text-gray-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Top Filter and Actions Toolbar */}
      <div className="bg-[#0D281C]/90 rounded-2xl border border-[#23493C] p-4 shadow-lg space-y-3">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Controls on Left */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#081C13] border border-[#23493C] text-xs text-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Categories ({categories.length})</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>

            {/* Dosha Select */}
            <select
              value={selectedDosha}
              onChange={(e) => setSelectedDosha(e.target.value)}
              className="bg-[#081C13] border border-[#23493C] text-xs text-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Doshas</option>
              <option value="Vata">Vata Pacifying</option>
              <option value="Pitta">Pitta Cooling</option>
              <option value="Kapha">Kapha Cleansing</option>
              <option value="Tridoshic">Tridoshic</option>
            </select>

            {/* Status Select */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#081C13] border border-[#23493C] text-xs text-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active (Published)</option>
              <option value="Draft">Draft</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* Clear All */}
            {(searchQuery || selectedCategory !== 'ALL' || selectedDosha !== 'ALL' || selectedStatus !== 'ALL') && (
              <button
                onClick={resetAllFilters}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-emerald-950/60"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

          </div>

          {/* Controls on Right: View Mode & Export */}
          <div className="flex items-center gap-2">
            
            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#081C13] border border-[#23493C] rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-emerald-800 text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'cards' ? 'bg-emerald-800 text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
                title="3D Flippable Cards View"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>

            {/* Reload Products */}
            {onReload && (
              <button
                onClick={onReload}
                disabled={isReloading || isSyncingHerbs}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#081C13] border border-[#23493C] text-emerald-300 text-xs font-semibold hover:text-white hover:bg-emerald-950/80 transition cursor-pointer disabled:opacity-50"
                title="Reload formulations live from Supabase public.products"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isReloading ? 'animate-spin' : ''}`} />
                <span>{isReloading ? 'Reloading...' : 'Reload Products'}</span>
              </button>
            )}

            {/* Store Herbs to Supabase */}
            <button
              onClick={handleStoreHerbsToSupabase}
              disabled={isSyncingHerbs || isReloading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#081C13] border border-emerald-600/70 text-emerald-200 text-xs font-semibold hover:text-white hover:bg-emerald-950/90 transition cursor-pointer disabled:opacity-50 shadow-sm"
              title="Store authentic classical formulation herbs (such as the 63 herbs for Dashamoolarishtam) and reference botanicals directly into Supabase"
            >
              <UploadCloud className={`w-3.5 h-3.5 text-emerald-400 ${isSyncingHerbs ? 'animate-bounce' : ''}`} />
              <span>{isSyncingHerbs ? 'Storing to Supabase...' : 'Store Herbs to Supabase'}</span>
            </button>

            {/* Quick Group Selection Options Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSelectMenuOpen(!isSelectMenuOpen)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  selectedProductIds.size > 0
                    ? 'bg-emerald-900/60 border-emerald-500 text-emerald-200'
                    : 'bg-[#081C13] border-[#23493C] text-gray-200 hover:text-white hover:bg-emerald-950/80'
                }`}
                title="Select all medicines or select groups by category/dosha"
              >
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>{selectedProductIds.size > 0 ? `Selected (${selectedProductIds.size})` : 'Select Options'}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {isSelectMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-1.5 w-60 max-h-80 overflow-y-auto rounded-2xl bg-[#081C13] border border-[#23493C] shadow-2xl py-1.5 z-40 text-left divide-y divide-[#23493C]/50"
                  onMouseLeave={() => setIsSelectMenuOpen(false)}
                >
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectGroup('all');
                        setIsSelectMenuOpen(false);
                      }}
                      className="w-full px-3.5 py-1.5 text-xs text-gray-200 hover:bg-[#133829] flex items-center justify-between"
                    >
                      <span className="font-semibold">Select All Filtered</span>
                      <span className="text-[10px] font-mono text-gray-400">({filteredProducts.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectGroup('active');
                        setIsSelectMenuOpen(false);
                      }}
                      className="w-full px-3.5 py-1.5 text-xs text-emerald-300 hover:bg-[#133829] flex items-center justify-between"
                    >
                      <span>Select Active Only</span>
                      <span className="text-[10px] font-mono text-emerald-400">({activeFilteredCount})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectGroup('inactive');
                        setIsSelectMenuOpen(false);
                      }}
                      className="w-full px-3.5 py-1.5 text-xs text-amber-300 hover:bg-[#133829] flex items-center justify-between"
                    >
                      <span>Select Inactive / Draft</span>
                      <span className="text-[10px] font-mono text-amber-400">({inactiveFilteredCount})</span>
                    </button>
                  </div>

                  {/* Select by Category */}
                  {categories.length > 0 && (
                    <div className="py-1">
                      <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Select by Category
                      </div>
                      {categories.map(cat => {
                        const count = filteredProducts.filter(p => 
                          String(p.categoryId) === String(cat.id) || 
                          (p.categoryName && p.categoryName.toLowerCase() === cat.name.toLowerCase())
                        ).length;
                        if (count === 0) return null;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              handleSelectCategoryGroup(cat.id);
                              setIsSelectMenuOpen(false);
                            }}
                            className="w-full px-3.5 py-1.5 text-xs text-gray-300 hover:bg-[#133829] flex items-center justify-between truncate"
                          >
                            <span className="truncate">{cat.name}</span>
                            <span className="text-[10px] font-mono text-emerald-400/80 ml-2">({count})</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Select by Dosha */}
                  <div className="py-1">
                    <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Select by Dosha
                    </div>
                    {['Vata', 'Pitta', 'Kapha', 'Tridoshic'].map(dosha => {
                      const count = filteredProducts.filter(p => 
                        p.targetDoshas?.includes(dosha) || p.doshaImpact?.includes(dosha)
                      ).length;
                      if (count === 0) return null;
                      return (
                        <button
                          key={dosha}
                          type="button"
                          onClick={() => {
                            handleSelectDoshaGroup(dosha);
                            setIsSelectMenuOpen(false);
                          }}
                          className="w-full px-3.5 py-1.5 text-xs text-gray-300 hover:bg-[#133829] flex items-center justify-between"
                        >
                          <span>{dosha} Pacifying</span>
                          <span className="text-[10px] font-mono text-amber-400/80 ml-2">({count})</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectGroup('invert');
                        setIsSelectMenuOpen(false);
                      }}
                      className="w-full px-3.5 py-1.5 text-xs text-teal-300 hover:bg-[#133829] flex items-center justify-between"
                    >
                      <span>Invert Selection</span>
                    </button>
                    {selectedProductIds.size > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectGroup('none');
                          setIsSelectMenuOpen(false);
                        }}
                        className="w-full px-3.5 py-1.5 text-xs text-red-300 hover:bg-[#133829] flex items-center justify-between"
                      >
                        <span>Clear Selection ({selectedProductIds.size})</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Export CSV (Exports Selected if any, or All Filtered) */}
            <button
              onClick={selectedProductIds.size > 0 ? handleExportSelected : handleExportAllFiltered}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#081C13] border border-[#23493C] text-gray-200 text-xs font-semibold hover:text-white hover:bg-emerald-950/80 transition cursor-pointer"
              title={selectedProductIds.size > 0 ? `Export ${selectedProductIds.size} Selected to CSV` : "Download All Filtered to CSV"}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {selectedProductIds.size > 0 ? `Export Selected (${selectedProductIds.size})` : 'Export CSV'}
              </span>
            </button>

            {/* Add Medicine Button */}
            <button
              onClick={onOpenNewProduct}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-xs font-bold hover:from-emerald-500 hover:to-emerald-600 transition shadow-md border border-emerald-500/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Medicine</span>
            </button>

          </div>

        </div>

        {/* Results Counter and Active Filter Tags */}
        <div className="flex flex-wrap items-center justify-between text-xs text-gray-400 pt-2 border-t border-[#23493C]/60 gap-2">
          <div className="flex items-center gap-2">
            <span>Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> formulations</span>
            {searchQuery && (
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                Keyword: "{searchQuery}"
              </span>
            )}
          </div>
          <span className="text-[11px] text-emerald-400/80 font-mono">
            {viewMode === 'table' ? 'Interactive High-Density Table with Multi-Selection' : 'Tactile 3D Cards View'}
          </span>
        </div>

      </div>

      {/* Floating / Highlighted Bulk Selection Actions Toolbar */}
      {selectedProductIds.size > 0 && (
        <div className="bg-[#092217] border-2 border-emerald-500/70 rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Left: Selection Counter and Quick Group Selectors */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-700/80 font-bold text-xs shadow-inner">
              <Check className="w-3.5 h-3.5" />
              <span>{selectedProductIds.size} of {filteredProducts.length} Selected</span>
            </span>

            {/* Quick Group Selection Buttons */}
            <div className="flex flex-wrap items-center gap-1 text-[11px]">
              <span className="text-gray-400 mr-0.5">Select Group:</span>
              
              <button
                type="button"
                onClick={() => handleSelectGroup('all')}
                className="px-2 py-0.5 rounded-lg bg-[#081C13] hover:bg-[#133829] text-gray-200 hover:text-white border border-[#23493C] transition cursor-pointer"
                title="Select all filtered medicines"
              >
                All ({filteredProducts.length})
              </button>

              <button
                type="button"
                onClick={() => handleSelectGroup('active')}
                className="px-2 py-0.5 rounded-lg bg-[#081C13] hover:bg-[#133829] text-emerald-300 hover:text-white border border-[#23493C] transition cursor-pointer"
                title="Select active medicines only"
              >
                Active ({activeFilteredCount})
              </button>

              <button
                type="button"
                onClick={() => handleSelectGroup('inactive')}
                className="px-2 py-0.5 rounded-lg bg-[#081C13] hover:bg-[#133829] text-amber-300 hover:text-white border border-[#23493C] transition cursor-pointer"
                title="Select inactive & draft medicines"
              >
                Inactive ({inactiveFilteredCount})
              </button>

              <button
                type="button"
                onClick={() => handleSelectGroup('invert')}
                className="px-2 py-0.5 rounded-lg bg-[#081C13] hover:bg-[#133829] text-teal-300 hover:text-white border border-[#23493C] transition cursor-pointer"
                title="Invert current selection"
              >
                Invert
              </button>
            </div>
          </div>

          {/* Right: Actions: Export Selected and Delete Selected */}
          <div className="flex items-center gap-2">
            
            {/* Export Selected Button */}
            <button
              type="button"
              onClick={handleExportSelected}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#081C13] hover:bg-[#133829] text-emerald-300 border border-emerald-600/60 text-xs font-semibold shadow-md transition cursor-pointer"
              title="Download CSV spreadsheet of selected medicines"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Selected ({selectedProductIds.size})</span>
            </button>

            {/* Delete Selected Button */}
            <button
              type="button"
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold shadow-md transition cursor-pointer"
              title="Permanently delete all selected medicines from database"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedProductIds.size})</span>
            </button>

            {/* Deselect All (X) */}
            <button
              type="button"
              onClick={() => handleSelectGroup('none')}
              className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-emerald-950 transition cursor-pointer"
              title="Clear Selection"
            >
              <X className="w-4 h-4" />
            </button>

          </div>

        </div>
      )}

      {/* Main Content: Table or Cards */}
      {viewMode === 'table' ? (
        <ProductTable
          products={filteredProducts}
          categories={categories}
          selectedProductIds={selectedProductIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onSelectGroup={handleSelectGroup}
          onSelectCategoryGroup={handleSelectCategoryGroup}
          onViewMonograph={onViewMonograph}
          onEditProduct={onEditProduct}
          onDeleteProduct={onDeleteProduct}
          onShareProduct={onShareProduct}
          onOpenNewProduct={onOpenNewProduct}
        />
      ) : (
        <ProductCardsView
          products={filteredProducts}
          categories={categories}
          selectedProductIds={selectedProductIds}
          onToggleSelect={(id) => handleToggleSelect(id)}
          onToggleSelectAll={handleToggleSelectAll}
          onSelectGroup={handleSelectGroup}
          onSelectCategoryGroup={handleSelectCategoryGroup}
          onViewMonograph={onViewMonograph}
          onEditProduct={onEditProduct}
          onDeleteProduct={onDeleteProduct}
          onShareProduct={onShareProduct}
        />
      )}

      {/* Bulk Deletion Confirmation Modal */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div 
            className="bg-[#081C13] border border-red-800/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-950/90 to-[#0A2217] px-6 py-4 border-b border-red-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-red-400">
                <div className="w-8 h-8 rounded-lg bg-red-950 border border-red-700/60 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-white leading-tight">
                    Delete {selectedProductIds.size} Formulations
                  </h3>
                  <p className="text-[10px] text-red-300/80 font-mono">
                    Permanent Supabase Database Removal
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-emerald-950 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-300 leading-relaxed">
                Are you sure you want to permanently delete the following <strong>{selectedProductIds.size}</strong> formulations from <span className="font-mono text-emerald-400">public.products</span> in Supabase?
              </p>

              {/* Selected Formulations Preview List */}
              <div className="max-h-44 overflow-y-auto bg-[#05140D] border border-[#23493C] rounded-xl p-3 divide-y divide-[#23493C]/40 text-xs">
                {selectedProductsList.slice(0, 10).map(p => (
                  <div key={p.id} className="py-1.5 flex items-center justify-between gap-2">
                    <span className="font-serif text-gray-200 truncate">{p.name}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 shrink-0">
                      {p.code}
                    </span>
                  </div>
                ))}
                {selectedProductsList.length > 10 && (
                  <div className="pt-2 text-center text-[11px] text-gray-400 italic font-mono">
                    ...and {selectedProductsList.length - 10} additional formulations
                  </div>
                )}
              </div>

              {/* Warning Callout */}
              <div className="bg-red-950/40 border border-red-900/60 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-300 leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <p>
                  This action is irreversible. Associated batch references, public canonical URLs, and QR code targets will be deactivated.
                </p>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsBulkDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#0D281C] text-gray-300 hover:text-white border border-[#23493C] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmBulkDelete}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold shadow-md transition cursor-pointer"
                >
                  Delete {selectedProductIds.size} Formulations
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
