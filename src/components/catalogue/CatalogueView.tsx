import React, { useState, useMemo, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import { Product, Category } from '../../types';
import { ProductTable } from './ProductTable';
import { ProductCardsView } from './ProductCardsView';
import { SupabaseService } from '../../services/supabase';

export type SortOption =
  | 'default'
  | 'name_asc'
  | 'name_desc'
  | 'code_asc'
  | 'code_desc'
  | 'category_asc'
  | 'category_desc'
  | 'created_desc'
  | 'created_asc'
  | 'updated_desc'
  | 'status_active'
  | 'status_inactive';

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'default', label: 'Default Order' },
  { value: 'name_asc', label: 'Product Name — A to Z' },
  { value: 'name_desc', label: 'Product Name — Z to A' },
  { value: 'code_asc', label: 'Product Code — Ascending' },
  { value: 'code_desc', label: 'Product Code — Descending' },
  { value: 'category_asc', label: 'Category — A to Z' },
  { value: 'category_desc', label: 'Category — Z to A' },
  { value: 'created_desc', label: 'Recently Added — Newest First' },
  { value: 'created_asc', label: 'Oldest Added — First' },
  { value: 'updated_desc', label: 'Recently Updated — Newest First' },
  { value: 'status_active', label: 'Status — Active First' },
  { value: 'status_inactive', label: 'Status — Inactive First' },
];

function getPaginationItems(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: (number | 'ellipsis')[] = [];

  if (currentPage <= 4) {
    for (let i = 1; i <= 5; i++) {
      items.push(i);
    }
    items.push('ellipsis');
    items.push(totalPages);
  } else if (currentPage >= totalPages - 3) {
    items.push(1);
    items.push('ellipsis');
    for (let i = totalPages - 4; i <= totalPages; i++) {
      items.push(i);
    }
  } else {
    items.push(1);
    items.push('ellipsis');
    items.push(currentPage - 1);
    items.push(currentPage);
    items.push(currentPage + 1);
    items.push('ellipsis');
    items.push(totalPages);
  }

  return items;
}

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
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [pageSize, setPageSize] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Multi-Selection State
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string | number>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isSelectMenuOpen, setIsSelectMenuOpen] = useState(false);

  // 1. Filter products by search query, category, Dosha, and status
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // 1. Search Query (operates on the entire product collection)
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

  // 2. Sort filtered products (12 sorting options)
  const filteredSortedProducts = useMemo(() => {
    if (sortBy === 'default') {
      return filteredProducts;
    }

    return [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case 'name_asc': {
          const nameA = (a.name || '').trim();
          const nameB = (b.name || '').trim();
          return nameA.localeCompare(nameB, undefined, { sensitivity: 'base', numeric: true });
        }
        case 'name_desc': {
          const nameA = (a.name || '').trim();
          const nameB = (b.name || '').trim();
          return nameB.localeCompare(nameA, undefined, { sensitivity: 'base', numeric: true });
        }
        case 'code_asc': {
          const codeA = (a.code || '').trim();
          const codeB = (b.code || '').trim();
          return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
        }
        case 'code_desc': {
          const codeA = (a.code || '').trim();
          const codeB = (b.code || '').trim();
          return codeB.localeCompare(codeA, undefined, { numeric: true, sensitivity: 'base' });
        }
        case 'category_asc': {
          const catA = (a.categoryName || '').trim();
          const catB = (b.categoryName || '').trim();
          const cmp = catA.localeCompare(catB, undefined, { sensitivity: 'base' });
          if (cmp !== 0) return cmp;
          return (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' });
        }
        case 'category_desc': {
          const catA = (a.categoryName || '').trim();
          const catB = (b.categoryName || '').trim();
          const cmp = catB.localeCompare(catA, undefined, { sensitivity: 'base' });
          if (cmp !== 0) return cmp;
          return (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' });
        }
        case 'created_desc': {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          if (timeB !== timeA) return timeB - timeA;
          return Number(b.id || 0) - Number(a.id || 0);
        }
        case 'created_asc': {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          if (timeA !== timeB) return timeA - timeB;
          return Number(a.id || 0) - Number(b.id || 0);
        }
        case 'updated_desc': {
          const timeA = (a.updatedAt || a.createdAt) ? new Date(a.updatedAt || a.createdAt).getTime() : 0;
          const timeB = (b.updatedAt || b.createdAt) ? new Date(b.updatedAt || b.createdAt).getTime() : 0;
          if (timeB !== timeA) return timeB - timeA;
          return Number(b.id || 0) - Number(a.id || 0);
        }
        case 'status_active': {
          const getWeight = (status?: string) => {
            if (status === 'Active') return 0;
            if (status === 'Draft') return 1;
            return 2;
          };
          const diff = getWeight(a.status) - getWeight(b.status);
          if (diff !== 0) return diff;
          return (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' });
        }
        case 'status_inactive': {
          const getWeight = (status?: string) => {
            if (status === 'Inactive') return 0;
            if (status === 'Draft') return 1;
            return 2;
          };
          const diff = getWeight(a.status) - getWeight(b.status);
          if (diff !== 0) return diff;
          return (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' });
        }
        default:
          return 0;
      }
    });
  }, [filteredProducts, sortBy]);

  // 3. Pagination calculations
  const totalFilteredCount = filteredSortedProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFilteredCount);
  const startDisplay = totalFilteredCount === 0 ? 0 : startIndex + 1;
  const endDisplay = endIndex;

  // 4. Paginated product slice for the active page
  const currentPageProducts = useMemo(() => {
    return filteredSortedProducts.slice(startIndex, endIndex);
  }, [filteredSortedProducts, startIndex, endIndex]);

  // Reset pagination to Page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
    setLastSelectedIndex(null);
  }, [searchQuery]);

  // Ensure current page is valid when total pages changes (e.g. after adding/deleting products)
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Selected products array
  const selectedProductsList = useMemo(() => {
    return products.filter(p => selectedProductIds.has(p.id));
  }, [products, selectedProductIds]);

  // Toggle single item or Shift+Click range (scoped to current visible page to avoid cross-page confusion)
  const handleToggleSelect = (productId: string | number, isShiftKey = false, index?: number) => {
    const next = new Set(selectedProductIds);

    if (isShiftKey && lastSelectedIndex !== null && typeof index === 'number') {
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      for (let i = start; i <= end; i++) {
        if (currentPageProducts[i]) {
          next.add(currentPageProducts[i].id);
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

  // Toggle select all products on current page
  const handleToggleSelectPage = () => {
    const next = new Set(selectedProductIds);
    const allPageSelected = currentPageProducts.length > 0 && currentPageProducts.every(p => next.has(p.id));

    if (allPageSelected) {
      currentPageProducts.forEach(p => next.delete(p.id));
    } else {
      currentPageProducts.forEach(p => next.add(p.id));
    }

    setSelectedProductIds(next);
  };

  // Select groups (All filtered, Current Page, Active, Inactive, Invert, Clear)
  const handleSelectGroup = (type: 'all' | 'page' | 'active' | 'inactive' | 'invert' | 'none') => {
    const next = new Set(selectedProductIds);

    if (type === 'all') {
      filteredSortedProducts.forEach(p => next.add(p.id));
    } else if (type === 'page') {
      currentPageProducts.forEach(p => next.add(p.id));
    } else if (type === 'active') {
      filteredSortedProducts.forEach(p => {
        if (p.status === 'Active') next.add(p.id);
        else next.delete(p.id);
      });
    } else if (type === 'inactive') {
      filteredSortedProducts.forEach(p => {
        if (p.status !== 'Active') next.add(p.id);
        else next.delete(p.id);
      });
    } else if (type === 'invert') {
      currentPageProducts.forEach(p => {
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
    filteredSortedProducts.forEach(p => {
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
    filteredSortedProducts.forEach(p => {
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

  // Export all filtered (exports all matching records across all pages)
  const handleExportAllFiltered = () => {
    exportItemsToCSV(filteredSortedProducts, `ayur_index_catalogue_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  // Export only selected (preserves selected records across pages)
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
    setSortBy('default');
    setPageSize(20);
    setCurrentPage(1);
    setLastSelectedIndex(null);
  };

  const activeFilteredCount = useMemo(() => {
    return filteredSortedProducts.filter(p => p.status === 'Active').length;
  }, [filteredSortedProducts]);

  const inactiveFilteredCount = useMemo(() => {
    return filteredSortedProducts.filter(p => p.status !== 'Active').length;
  }, [filteredSortedProducts]);

  const selectedOnCurrentPageCount = useMemo(() => {
    return currentPageProducts.filter(p => selectedProductIds.has(p.id)).length;
  }, [currentPageProducts, selectedProductIds]);

  const isFiltered = Boolean(
    selectedCategory !== 'ALL' || 
    selectedDosha !== 'ALL' || 
    selectedStatus !== 'ALL' || 
    searchQuery.trim().length > 0
  );

  const handlePageChange = (newPage: number) => {
    const targetPage = Math.min(Math.max(1, newPage), totalPages);
    setCurrentPage(targetPage);
    setLastSelectedIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Actions Toolbar */}
      <div className="bg-[#0D281C]/90 rounded-2xl border border-[#23493C] p-4 shadow-lg space-y-3">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Controls on Left: Category | Dosha | Status | Sort By | Show */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
                setLastSelectedIndex(null);
              }}
              className="bg-[#081C13] border border-[#23493C] text-xs text-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
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
              onChange={(e) => {
                setSelectedDosha(e.target.value);
                setCurrentPage(1);
                setLastSelectedIndex(null);
              }}
              className="bg-[#081C13] border border-[#23493C] text-xs text-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
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
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
                setLastSelectedIndex(null);
              }}
              className="bg-[#081C13] border border-[#23493C] text-xs text-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active (Published)</option>
              <option value="Draft">Draft</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* Sort By Select */}
            <div className="flex items-center gap-1.5 bg-[#081C13] border border-[#23493C] rounded-xl px-2.5 py-1 focus-within:border-emerald-500">
              <label htmlFor="sort-by-select" className="text-xs text-gray-400 font-medium whitespace-nowrap">
                Sort By:
              </label>
              <select
                id="sort-by-select"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortOption);
                  setCurrentPage(1);
                  setLastSelectedIndex(null);
                }}
                className="bg-transparent text-xs text-gray-200 focus:outline-none cursor-pointer py-1"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-[#081C13] text-gray-200">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Show / Products Per Page Select */}
            <div className="flex items-center gap-1.5 bg-[#081C13] border border-[#23493C] rounded-xl px-2.5 py-1 focus-within:border-emerald-500">
              <label htmlFor="page-size-select" className="text-xs text-gray-400 font-medium whitespace-nowrap">
                Show:
              </label>
              <select
                id="page-size-select"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                  setLastSelectedIndex(null);
                }}
                className="bg-transparent text-xs text-gray-200 focus:outline-none cursor-pointer py-1 font-medium"
              >
                <option value={20} className="bg-[#081C13] text-gray-200">20 products</option>
                <option value={50} className="bg-[#081C13] text-gray-200">50 products</option>
                <option value={100} className="bg-[#081C13] text-gray-200">100 products</option>
              </select>
            </div>

            {/* Reset All */}
            {(searchQuery || selectedCategory !== 'ALL' || selectedDosha !== 'ALL' || selectedStatus !== 'ALL' || sortBy !== 'default' || pageSize !== 20) && (
              <button
                onClick={resetAllFilters}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-emerald-950/60 transition cursor-pointer"
                title="Reset all filters, sorting, and page size"
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
                disabled={isReloading}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#081C13] border border-[#23493C] text-emerald-300 text-xs font-semibold hover:text-white hover:bg-emerald-950/80 transition cursor-pointer disabled:opacity-50"
                title="Reload formulations live from Supabase public.products"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isReloading ? 'animate-spin' : ''}`} />
                <span>{isReloading ? 'Reloading...' : 'Reload Products'}</span>
              </button>
            )}

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
          <div className="flex flex-wrap items-center gap-2">
            <span>
              {totalFilteredCount === 0 ? (
                <span>Showing <strong className="text-emerald-400 font-bold">0</strong> {isFiltered ? 'matching ' : ''}products</span>
              ) : isFiltered ? (
                <span>Showing <strong className="text-emerald-400 font-bold">{startDisplay}–{endDisplay}</strong> of <strong className="text-white font-bold">{totalFilteredCount}</strong> matching products</span>
              ) : (
                <span>Showing <strong className="text-emerald-400 font-bold">{startDisplay}–{endDisplay}</strong> of <strong className="text-white font-bold">{totalFilteredCount}</strong> products</span>
              )}
              {isFiltered && totalFilteredCount > 0 && (
                <span className="text-gray-500 text-[11px] ml-1.5 font-mono">
                  (filtered from {products.length} total)
                </span>
              )}
            </span>
            {searchQuery && (
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                Keyword: "{searchQuery}"
              </span>
            )}
            {sortBy !== 'default' && (
              <span className="px-2 py-0.5 rounded bg-[#133829] text-teal-300 border border-[#23493C] text-[11px] font-mono">
                Sorted: {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            {totalPages > 1 && (
              <span className="text-emerald-400 font-semibold">
                Page {safeCurrentPage} of {totalPages}
              </span>
            )}
            <span className="text-emerald-400/80">
              {viewMode === 'table' ? 'Interactive High-Density Table with Multi-Selection' : 'Tactile 3D Cards View'}
            </span>
          </div>
        </div>

      </div>

      {/* Floating / Highlighted Bulk Selection Actions Toolbar */}
      {selectedProductIds.size > 0 && (
        <div className="bg-[#092217] border-2 border-emerald-500/70 rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Left: Selection Counter and Quick Group Selectors */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-700/80 font-bold text-xs shadow-inner">
              <Check className="w-3.5 h-3.5" />
              <span>{selectedProductIds.size} of {totalFilteredCount} Selected ({selectedOnCurrentPageCount} on this page)</span>
            </span>

            {/* Quick Group Selection Buttons */}
            <div className="flex flex-wrap items-center gap-1 text-[11px]">
              <span className="text-gray-400 mr-0.5">Select Group:</span>
              
              <button
                type="button"
                onClick={() => handleSelectGroup('page')}
                className="px-2 py-0.5 rounded-lg bg-[#081C13] hover:bg-[#133829] text-emerald-300 hover:text-white border border-[#23493C] transition cursor-pointer"
                title="Select all medicines on this page"
              >
                Page ({currentPageProducts.length})
              </button>

              <button
                type="button"
                onClick={() => handleSelectGroup('all')}
                className="px-2 py-0.5 rounded-lg bg-[#081C13] hover:bg-[#133829] text-gray-200 hover:text-white border border-[#23493C] transition cursor-pointer"
                title="Select all filtered medicines across all pages"
              >
                All ({totalFilteredCount})
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
                title="Invert current page selection"
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
          products={currentPageProducts}
          categories={categories}
          totalFilteredCount={totalFilteredCount}
          selectedProductIds={selectedProductIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectPage}
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
          products={currentPageProducts}
          categories={categories}
          totalFilteredCount={totalFilteredCount}
          selectedProductIds={selectedProductIds}
          onToggleSelect={(id) => handleToggleSelect(id)}
          onToggleSelectAll={handleToggleSelectPage}
          onSelectGroup={handleSelectGroup}
          onSelectCategoryGroup={handleSelectCategoryGroup}
          onViewMonograph={onViewMonograph}
          onEditProduct={onEditProduct}
          onDeleteProduct={onDeleteProduct}
          onShareProduct={onShareProduct}
        />
      )}

      {/* Pagination Controls */}
      <div className="bg-[#0D281C]/90 rounded-2xl border border-[#23493C] p-3.5 sm:p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Left: Product Range & Total Count */}
        <div className="flex items-center gap-2 text-gray-300 font-medium">
          <span>
            {totalFilteredCount === 0 ? (
              <span>Showing <strong className="text-emerald-400 font-bold">0</strong> {isFiltered ? 'matching ' : ''}products</span>
            ) : isFiltered ? (
              <span>
                Showing <strong className="text-emerald-400 font-bold">{startDisplay}–{endDisplay}</strong> of{' '}
                <strong className="text-white font-bold">{totalFilteredCount}</strong> matching products
              </span>
            ) : (
              <span>
                Showing <strong className="text-emerald-400 font-bold">{startDisplay}–{endDisplay}</strong> of{' '}
                <strong className="text-white font-bold">{totalFilteredCount}</strong> products
              </span>
            )}
          </span>
          {isFiltered && totalFilteredCount > 0 && (
            <span className="text-gray-500 text-[11px] font-mono hidden sm:inline">
              (out of {products.length} total)
            </span>
          )}
        </div>

        {/* Right: Pagination Navigation Controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
            
            {/* Previous Button */}
            <button
              type="button"
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#23493C] bg-[#081C13] text-gray-200 font-semibold hover:bg-emerald-950/80 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {/* Numbered Page Buttons with Ellipses */}
            {getPaginationItems(safeCurrentPage, totalPages).map((item, idx) => {
              if (item === 'ellipsis') {
                return (
                  <span 
                    key={`ellipsis-${idx}`} 
                    className="px-2 py-1 text-gray-500 font-mono select-none"
                  >
                    ...
                  </span>
                );
              }

              const pageNum = item as number;
              const isActive = pageNum === safeCurrentPage;

              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => handlePageChange(pageNum)}
                  className={`min-w-[32px] h-8 px-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md border border-emerald-500/50'
                      : 'bg-[#081C13] border border-[#23493C] text-gray-300 hover:text-white hover:bg-emerald-950/80'
                  }`}
                  title={`Page ${pageNum}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next Button */}
            <button
              type="button"
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage >= totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#23493C] bg-[#081C13] text-gray-200 font-semibold hover:bg-emerald-950/80 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              title="Next Page"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

          </div>
        )}

      </div>

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
