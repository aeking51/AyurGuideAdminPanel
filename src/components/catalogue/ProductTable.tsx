import React, { useRef, useEffect, useState } from 'react';
import { 
  FileText, 
  Edit3, 
  Trash2, 
  AlertCircle,
  Sparkles,
  Camera,
  QrCode,
  Check,
  ChevronDown
} from 'lucide-react';
import { Product, Category } from '../../types';
import { AyurCheckbox } from '../common/AyurCheckbox';

interface ProductTableProps {
  products: Product[];
  categories?: Category[];
  totalFilteredCount?: number;
  selectedProductIds?: Set<string | number>;
  onToggleSelect?: (productId: string | number, isShiftKey?: boolean, index?: number) => void;
  onToggleSelectAll?: () => void;
  onSelectGroup?: (type: 'all' | 'page' | 'active' | 'inactive' | 'invert' | 'none') => void;
  onSelectCategoryGroup?: (categoryIdOrName: string | number) => void;
  onViewMonograph: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onShareProduct?: (product: Product) => void;
  onOpenNewProduct?: () => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  categories = [],
  totalFilteredCount,
  selectedProductIds = new Set(),
  onToggleSelect,
  onToggleSelectAll,
  onSelectGroup,
  onSelectCategoryGroup,
  onViewMonograph,
  onEditProduct,
  onDeleteProduct,
  onShareProduct,
  onOpenNewProduct,
}) => {
  const selectAllCheckboxRef = useRef<HTMLInputElement | null>(null);
  const [isGroupMenuOpen, setIsGroupMenuOpen] = useState(false);

  const selectedOnCurrentPageCount = products.filter(p => selectedProductIds.has(p.id)).length;
  const totalCount = products.length;
  const isAllSelected = totalCount > 0 && selectedOnCurrentPageCount === totalCount;
  const isSomeSelected = selectedOnCurrentPageCount > 0 && selectedOnCurrentPageCount < totalCount;

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = isSomeSelected;
    }
  }, [isSomeSelected]);

  if (products.length === 0) {
    return (
      <div className="bg-[#0D281C]/70 rounded-2xl border border-[#23493C] p-12 text-center">
        <AlertCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-80" />
        <h3 className="text-lg font-serif font-bold text-gray-200">No Formulations in Central Database</h3>
        <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto mb-4">
          The database is clean with no placeholder products. Start cataloging authentic classical Ayurvedic formulations.
        </p>
        {onOpenNewProduct && (
          <button
            onClick={onOpenNewProduct}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
          >
            <span>+ Add First Medicine</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#0D281C]/80 rounded-2xl border border-[#23493C] overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-[#081C13]/90 text-[11px] uppercase font-semibold text-emerald-300/80 tracking-wider border-b border-[#23493C]">
            <tr>
              
              {/* Select All Checkbox Column */}
              <th className="py-3 px-3 w-12 text-center">
                <div className="relative inline-flex items-center justify-center">
                  <AyurCheckbox
                    ref={selectAllCheckboxRef}
                    size="sm"
                    variant="botanical"
                    checked={isAllSelected}
                    indeterminate={isSomeSelected}
                    onChange={() => onToggleSelectAll && onToggleSelectAll()}
                    title={isAllSelected ? "Deselect Current Page Formulations" : "Select Current Page Formulations"}
                  />
                  {onSelectGroup && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsGroupMenuOpen(!isGroupMenuOpen);
                      }}
                      className="ml-1 p-0.5 rounded text-gray-400 hover:text-emerald-300 transition cursor-pointer"
                      title="Group Selection Options"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  )}

                  {/* Group Selection Dropdown */}
                  {isGroupMenuOpen && onSelectGroup && (
                    <div 
                      className="absolute left-0 top-full mt-1.5 w-60 max-h-72 overflow-y-auto rounded-xl bg-[#081C13] border border-[#23493C] shadow-2xl py-1 z-30 text-left normal-case tracking-normal divide-y divide-[#23493C]/40"
                      onMouseLeave={() => setIsGroupMenuOpen(false)}
                    >
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectGroup('page');
                            setIsGroupMenuOpen(false);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-gray-200 hover:bg-[#133829] flex items-center justify-between"
                        >
                          <span className="font-semibold">Select Current Page</span>
                          <span className="text-[10px] text-gray-400 font-mono">({totalCount})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectGroup('all');
                            setIsGroupMenuOpen(false);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-emerald-300 hover:bg-[#133829] flex items-center justify-between"
                        >
                          <span className="font-semibold">Select All Filtered</span>
                          <span className="text-[10px] text-emerald-400/80 font-mono">({totalFilteredCount ?? totalCount})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectGroup('active');
                            setIsGroupMenuOpen(false);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-emerald-300 hover:bg-[#133829] flex items-center justify-between"
                        >
                          <span>Select Active Only</span>
                          <span className="text-[10px] text-emerald-400/80 font-mono">
                            ({products.filter(p => p.status === 'Active').length})
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectGroup('inactive');
                            setIsGroupMenuOpen(false);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-amber-300 hover:bg-[#133829] flex items-center justify-between"
                        >
                          <span>Select Inactive / Draft</span>
                          <span className="text-[10px] text-amber-400/80 font-mono">
                            ({products.filter(p => p.status !== 'Active').length})
                          </span>
                        </button>
                      </div>

                      {/* Select by Category if provided */}
                      {categories.length > 0 && onSelectCategoryGroup && (
                        <div className="py-1">
                          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Select by Category
                          </div>
                          {categories.map(cat => {
                            const count = products.filter(p => 
                              String(p.categoryId) === String(cat.id) || 
                              (p.categoryName && p.categoryName.toLowerCase() === cat.name.toLowerCase())
                            ).length;
                            if (count === 0) return null;
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                  onSelectCategoryGroup(cat.id);
                                  setIsGroupMenuOpen(false);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-gray-300 hover:bg-[#133829] flex items-center justify-between truncate"
                              >
                                <span className="truncate">{cat.name}</span>
                                <span className="text-[10px] font-mono text-gray-400 ml-1.5 shrink-0">({count})</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectGroup('invert');
                            setIsGroupMenuOpen(false);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-teal-300 hover:bg-[#133829] flex items-center justify-between"
                        >
                          <span>Invert Selection</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectGroup('none');
                            setIsGroupMenuOpen(false);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-red-300 hover:bg-[#133829] flex items-center justify-between"
                        >
                          <span>Clear Selection</span>
                          {selectedProductIds.size > 0 && (
                            <span className="text-[10px] text-red-400 font-mono">({selectedProductIds.size})</span>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </th>

              <th className="py-3 px-3">Medicine & Sanskrit</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Dosha & Clinical Target</th>
              <th className="py-3 px-3">Packaging</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#23493C]/50">
            {products.map((product, index) => {
              const isSelected = selectedProductIds.has(product.id);

              return (
                <tr 
                  key={product.id} 
                  className={`transition duration-150 group ${
                    isSelected 
                      ? 'bg-[#103828]/80 border-l-[3px] border-l-emerald-400 shadow-[inset_0_1px_0_0_rgba(16,185,129,0.15)]' 
                      : 'hover:bg-[#133829]/40 border-l-[3px] border-l-transparent'
                  }`}
                >
                  
                  {/* Row Checkbox Column */}
                  <td className="py-3 px-3 text-center">
                    <AyurCheckbox
                      size="sm"
                      variant="botanical"
                      checked={isSelected}
                      onChange={(e) => {
                        const nativeEvent = e.nativeEvent as MouseEvent;
                        if (onToggleSelect) {
                          onToggleSelect(product.id, nativeEvent.shiftKey, index);
                        }
                      }}
                      title={`Select ${product.name} (Hold Shift+Click to range select)`}
                    />
                  </td>

                  {/* Medicine Identity */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-emerald-950 border border-emerald-800/80 shrink-0 relative">
                        <img 
                          src={product.imageUrl || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600"} 
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600";
                          }}
                        />
                        {product.images && product.images.length > 1 && (
                          <div 
                            className="absolute bottom-0.5 right-0.5 px-1 py-0.5 rounded bg-black/85 text-[8px] font-mono text-emerald-300 flex items-center gap-0.5 shadow-xs"
                            title={`${product.images.length} medicine photos`}
                          >
                            <Camera className="w-2.5 h-2.5" />
                            <span>{product.images.length}</span>
                          </div>
                        )}
                        {product.featured && (
                          <div className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-amber-500 text-[#081C13]" title="Featured Formulation">
                            <Sparkles className="w-2.5 h-2.5 fill-current" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span 
                            className="font-serif font-bold text-gray-100 text-sm hover:text-emerald-300 cursor-pointer" 
                            onClick={() => onViewMonograph(product)}
                          >
                            {product.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                            {product.code}
                          </span>
                        </div>
                        <p className="text-xs text-amber-200/90 font-serif truncate mt-0.5">
                          {product.sanskritName || 'Classical formulation'}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate max-w-xs mt-0.5">
                          {product.classicalReference}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                      {product.categoryName || 'Classical'}
                    </span>
                  </td>

                  {/* Dosha & Primary Benefit */}
                  <td className="py-3 px-3">
                    <div className="max-w-[200px]">
                      {product.targetDoshas && product.targetDoshas.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {product.targetDoshas.map((d, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/50 text-amber-300 border border-amber-800/40">
                              {d}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-300 line-clamp-1" title={product.primaryBenefit || product.indications}>
                        {product.primaryBenefit || product.indications}
                      </p>
                    </div>
                  </td>

                  {/* Packings */}
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {product.packings && product.packings.length > 0 ? (
                        product.packings.map((pkg, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-[#081C13] text-gray-300 border border-[#23493C]">
                            {pkg}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      product.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : product.status === 'Draft'
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                        : 'bg-gray-500/10 text-gray-400 border border-gray-500/30'
                    }`}>
                      {product.status || 'Active'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      
                      {/* Share QR Dialog Trigger */}
                      {onShareProduct && (
                        <button
                          onClick={() => onShareProduct(product)}
                          className="p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-900/60 transition cursor-pointer"
                          title="Generate QR code and sharing card"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      )}

                      {/* Clinical Monograph Button */}
                      <button
                        onClick={() => onViewMonograph(product)}
                        className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-950 transition cursor-pointer"
                        title="View Full Pharmacopoeial Monograph"
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => onEditProduct(product)}
                        className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-950 transition cursor-pointer"
                        title="Edit Formulation"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete Single Button */}
                      <button
                        onClick={() => onDeleteProduct(product)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 transition cursor-pointer"
                        title="Delete Formulation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
