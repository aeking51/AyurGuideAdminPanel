import React, { useState } from 'react';
import { 
  Plus, 
  Download, 
  FileSpreadsheet, 
  Grid, 
  List, 
  Filter, 
  Sparkles, 
  RotateCcw
} from 'lucide-react';
import { Product, Category } from '../../types';
import { ProductTable } from './ProductTable';
import { ProductCardsView } from './ProductCardsView';

interface CatalogueViewProps {
  products: Product[];
  categories: Category[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenNewProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onViewMonograph: (product: Product) => void;
}

export const CatalogueView: React.FC<CatalogueViewProps> = ({
  products,
  categories,
  searchQuery,
  setSearchQuery,
  onOpenNewProduct,
  onEditProduct,
  onDeleteProduct,
  onViewMonograph,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDosha, setSelectedDosha] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Filter products
  const filteredProducts = products.filter(product => {
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

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Code', 'Name', 'Sanskrit Name', 'Category', 'Status', 'Classical Reference', 'Indications'];
    const rows = filteredProducts.map(p => [
      `"${p.code || ''}"`,
      `"${p.name || ''}"`,
      `"${p.sanskritName || ''}"`,
      `"${p.categoryName || ''}"`,
      `"${p.status || ''}"`,
      `"${(p.classicalReference || '').replace(/"/g, '""')}"`,
      `"${(p.indications || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ayurguide_catalogue_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedDosha('ALL');
    setSelectedStatus('ALL');
  };

  return (
    <div className="space-y-4">
      
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
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'table' ? 'bg-emerald-800 text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'cards' ? 'bg-emerald-800 text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
                title="3D Flippable Cards View"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#081C13] border border-[#23493C] text-gray-200 text-xs font-semibold hover:text-white hover:bg-emerald-950/80 transition"
              title="Download CSV Spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            {/* Add Medicine Button */}
            <button
              onClick={onOpenNewProduct}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-xs font-bold hover:from-emerald-500 hover:to-emerald-600 transition shadow-md border border-emerald-500/30"
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
            {viewMode === 'table' ? 'Interactive High-Density Table' : 'Tactile 3D Cards View'}
          </span>
        </div>

      </div>

      {/* Main Content: Table or Cards */}
      {viewMode === 'table' ? (
        <ProductTable
          products={filteredProducts}
          onViewMonograph={onViewMonograph}
          onEditProduct={onEditProduct}
          onDeleteProduct={onDeleteProduct}
          onOpenNewProduct={onOpenNewProduct}
        />
      ) : (
        <ProductCardsView
          products={filteredProducts}
          onViewMonograph={onViewMonograph}
          onEditProduct={onEditProduct}
        />
      )}

    </div>
  );
};
