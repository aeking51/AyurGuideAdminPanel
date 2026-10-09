import React, { useState } from 'react';
import { 
  RotateCw, 
  FileText, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Check, 
  Camera,
  QrCode,
  ChevronDown,
  Layers
} from 'lucide-react';
import { Product, Category } from '../../types';
import { AyurCheckbox } from '../common/AyurCheckbox';

interface ProductCardsViewProps {
  products: Product[];
  categories?: Category[];
  totalFilteredCount?: number;
  selectedProductIds?: Set<string | number>;
  onToggleSelect?: (productId: string | number) => void;
  onToggleSelectAll?: () => void;
  onSelectGroup?: (type: 'all' | 'page' | 'active' | 'inactive' | 'invert' | 'none') => void;
  onSelectCategoryGroup?: (categoryIdOrName: string | number) => void;
  onViewMonograph: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  onShareProduct?: (product: Product) => void;
}

export const ProductCardsView: React.FC<ProductCardsViewProps> = ({
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
}) => {
  const [flippedCards, setFlippedCards] = useState<Record<string | number, boolean>>({});
  const [activePhotoIndices, setActivePhotoIndices] = useState<Record<string | number, number>>({});
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);

  const selectedOnCurrentPageCount = products.filter(p => selectedProductIds.has(p.id)).length;
  const isAllSelected = products.length > 0 && selectedOnCurrentPageCount === products.length;
  const isSomeSelected = selectedOnCurrentPageCount > 0 && selectedOnCurrentPageCount < products.length;

  const toggleFlip = (id: string | number) => {
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSelectPhoto = (productId: string | number, photoIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIndices(prev => ({
      ...prev,
      [productId]: photoIdx
    }));
  };

  if (products.length === 0) {
    return (
      <div className="bg-[#0D281C]/70 rounded-2xl border border-[#23493C] p-12 text-center col-span-full">
        <h3 className="text-lg font-serif font-bold text-gray-200">No Formulations in Central Database</h3>
        <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
          The central database contains no product cards. Create new medicines using the "+ New Medicine" button.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Cards View Quick Selection Bar */}
      {(onToggleSelectAll || onSelectGroup) && (
        <div className="bg-[#0D281C]/80 border border-[#23493C] rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            {onToggleSelectAll && (
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <AyurCheckbox
                  size="sm"
                  variant="botanical"
                  checked={isAllSelected}
                  indeterminate={isSomeSelected}
                  onChange={() => onToggleSelectAll()}
                  title={isAllSelected ? 'Deselect Page Cards' : `Select Page (${products.length})`}
                />
                <span className="font-semibold text-gray-200">
                  {isAllSelected ? 'Deselect Page' : `Select Page (${products.length})`}
                </span>
              </label>
            )}

            {/* Quick Group Selection Dropdown */}
            {onSelectGroup && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#081C13] hover:bg-[#133829] text-emerald-300 border border-[#23493C] transition cursor-pointer"
                >
                  <span>Select Group</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {isGroupDropdownOpen && (
                  <div 
                    className="absolute left-0 top-full mt-1 w-56 max-h-72 overflow-y-auto rounded-xl bg-[#081C13] border border-[#23493C] shadow-2xl py-1 z-30 divide-y divide-[#23493C]/40 text-left"
                    onMouseLeave={() => setIsGroupDropdownOpen(false)}
                  >
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectGroup('page');
                          setIsGroupDropdownOpen(false);
                        }}
                        className="w-full px-3 py-1.5 text-xs text-gray-200 hover:bg-[#133829] flex items-center justify-between"
                      >
                        <span className="font-semibold">Select Current Page</span>
                        <span className="text-[10px] text-gray-400 font-mono">({products.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectGroup('all');
                          setIsGroupDropdownOpen(false);
                        }}
                        className="w-full px-3 py-1.5 text-xs text-emerald-300 hover:bg-[#133829] flex items-center justify-between"
                      >
                        <span className="font-semibold">Select All Filtered</span>
                        <span className="text-[10px] text-emerald-400/80 font-mono">({totalFilteredCount ?? products.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectGroup('active');
                          setIsGroupDropdownOpen(false);
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
                          setIsGroupDropdownOpen(false);
                        }}
                        className="w-full px-3 py-1.5 text-xs text-amber-300 hover:bg-[#133829] flex items-center justify-between"
                      >
                        <span>Select Inactive / Draft</span>
                        <span className="text-[10px] text-amber-400/80 font-mono">
                          ({products.filter(p => p.status !== 'Active').length})
                        </span>
                      </button>
                    </div>

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
                                setIsGroupDropdownOpen(false);
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
                          setIsGroupDropdownOpen(false);
                        }}
                        className="w-full px-3 py-1.5 text-xs text-teal-300 hover:bg-[#133829] flex items-center justify-between"
                      >
                        <span>Invert Selection</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectGroup('none');
                          setIsGroupDropdownOpen(false);
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
            )}
          </div>

          <div className="text-[11px] text-gray-400 font-mono">
            {selectedProductIds.size > 0 ? (
              <span className="text-emerald-300 font-semibold">
                {selectedProductIds.size} of {totalFilteredCount ?? products.length} Selected ({selectedOnCurrentPageCount} on this page)
              </span>
            ) : (
              <span>Tap checkboxes on cards to select</span>
            )}
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => {
        const isFlipped = !!flippedCards[product.id];

        return (
          <div key={product.id} className="h-[430px] w-full flip-card">
            <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
              
              {/* FRONT OF CARD */}
              <div className={`flip-card-front bg-[#0D281C] rounded-2xl p-5 flex flex-col justify-between shadow-xl transition border ${
                selectedProductIds.has(product.id)
                  ? 'border-emerald-500 ring-2 ring-emerald-500/50 shadow-emerald-950/50'
                  : 'border-[#23493C]'
              }`}>
                <div>
                  {/* Top Bar with Selection Checkbox, Code & Category */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      {onToggleSelect && (
                        <AyurCheckbox
                          size="sm"
                          variant="card-badge"
                          shape="squircle"
                          checked={selectedProductIds.has(product.id)}
                          onChange={() => onToggleSelect(product.id)}
                          title={`Select ${product.name}`}
                        />
                      )}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#081C13] text-emerald-400 border border-[#23493C]">
                        {product.code}
                      </span>
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                      {product.categoryName || 'Formulation'}
                    </span>
                  </div>

                  {/* Image & Title */}
                  {(() => {
                    const photos = product.images && product.images.length > 0 ? product.images : [product.imageUrl || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600"];
                    const activeIdx = activePhotoIndices[product.id] !== undefined ? activePhotoIndices[product.id] : 0;
                    const safeActiveIdx = activeIdx < photos.length ? activeIdx : 0;
                    const activeImg = photos[safeActiveIdx] || photos[0];

                    return (
                      <div className="flex gap-4 items-start mb-3">
                        <div className="flex flex-col items-center gap-1.5 shrink-0">
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#081C13] border border-emerald-800/50 shrink-0 relative group/img">
                            <img 
                              src={activeImg} 
                              alt={product.name}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover transition duration-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600";
                              }}
                            />
                            {photos.length > 1 && (
                              <div className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/75 text-[9px] font-mono text-emerald-300 flex items-center gap-0.5">
                                <Camera className="w-2.5 h-2.5" />
                                <span>{safeActiveIdx + 1}/{photos.length}</span>
                              </div>
                            )}
                            {product.featured && (
                              <div className="absolute top-1 right-1 p-0.5 rounded-full bg-amber-500 text-[#081C13]">
                                <Sparkles className="w-2.5 h-2.5 fill-current" />
                              </div>
                            )}
                          </div>

                          {/* Mini thumbnails if group of photos */}
                          {photos.length > 1 && (
                            <div className="flex items-center gap-1">
                              {photos.map((_, pIdx) => (
                                <button
                                  key={pIdx}
                                  type="button"
                                  onClick={(e) => handleSelectPhoto(product.id, pIdx, e)}
                                  className={`w-3.5 h-3.5 rounded-full transition border cursor-pointer ${
                                    safeActiveIdx === pIdx 
                                      ? 'bg-emerald-400 border-white scale-110' 
                                      : 'bg-emerald-950 border-emerald-700/60 hover:bg-emerald-800'
                                  }`}
                                  title={`View photo ${pIdx + 1}`}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-serif font-bold text-base text-gray-100 hover:text-emerald-300 transition cursor-pointer" onClick={() => onViewMonograph(product)}>
                            {product.name}
                          </h4>
                          <p className="text-xs text-amber-200/90 font-serif truncate mt-0.5">
                            {product.sanskritName}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">
                            {product.classicalReference}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Primary Benefit Box */}
                  <div className="bg-[#081C13]/60 rounded-xl p-3 border border-[#23493C]/60 mb-3 text-xs">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block mb-1">
                      Clinical Benefit
                    </span>
                    <p className="text-gray-300 line-clamp-2">
                      {product.primaryBenefit || product.description}
                    </p>
                  </div>

                  {/* Dosha & Health Goals */}
                  <div className="flex flex-wrap gap-1.5">
                    {product.targetDoshas?.map((d, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/50">
                        {d}
                      </span>
                    ))}
                    {product.healthGoals?.slice(0, 2).map((g, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800/40">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Controls */}
                <div className="pt-3 border-t border-[#23493C] flex items-center justify-between">
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                    product.status === 'Active'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}>
                    {product.status || 'Active'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {onShareProduct && (
                      <button
                        onClick={() => onShareProduct(product)}
                        className="p-1.5 rounded-lg bg-[#081C13] text-teal-300 hover:text-white border border-teal-800/60 transition cursor-pointer"
                        title="QR / Share Link"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onViewMonograph(product)}
                      className="p-1.5 rounded-lg bg-[#081C13] text-emerald-400 hover:text-white border border-[#23493C] transition"
                      title="Monograph View"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleFlip(product.id)}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-emerald-900/60 text-emerald-300 hover:bg-emerald-800 border border-emerald-700/60 transition"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Flip Details</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* BACK OF CARD */}
              <div className="flip-card-back bg-[#081C13] border border-emerald-700/80 rounded-2xl p-5 flex flex-col justify-between shadow-2xl">
                <div>
                  <div className="flex items-center justify-between mb-3 border-b border-[#23493C] pb-2">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-emerald-200">{product.name}</h4>
                      <span className="text-[10px] text-gray-400 font-mono">Formulation Monograph Summary</span>
                    </div>
                    <button
                      onClick={() => toggleFlip(product.id)}
                      className="p-1.5 rounded-lg bg-[#0D281C] text-emerald-300 hover:text-white border border-[#23493C]"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Ingredients */}
                  <div className="mb-3">
                    <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block mb-1">
                      Key Botanical Ingredients ({product.ingredients?.length || 0})
                    </span>
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                      {product.ingredients && product.ingredients.length > 0 ? (
                        product.ingredients.map((item, i) => {
                          const name = typeof item === 'string' ? item : item.name;
                          const role = typeof item === 'object' ? item.classicalRole : '';
                          return (
                            <div key={i} className="text-xs text-gray-300 flex items-start justify-between bg-[#0D281C]/70 px-2 py-1 rounded border border-[#23493C]/40">
                              <span className="font-medium text-emerald-300 truncate">{name}</span>
                              {role && <span className="text-[10px] text-gray-400 truncate max-w-[120px] ml-1">{role}</span>}
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-[11px] text-gray-500 italic py-1">
                          No ingredients stored in database
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Usage & Anupana */}
                  <div className="bg-[#0D281C] p-2.5 rounded-xl border border-[#23493C] text-xs space-y-1 mb-2">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">Dosage & Vehicle (Anupana)</span>
                    <p className="text-gray-300 text-[11px] leading-relaxed">
                      {product.usage || "As directed by physician."}
                    </p>
                  </div>

                  {/* Available Sizes */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span className="text-[10px] uppercase font-semibold">Packings:</span>
                    {product.packings?.map((p, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-[#0D281C] text-emerald-300 border border-[#23493C] text-[10px]">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Back Controls */}
                <div className="pt-2 border-t border-[#23493C] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onEditProduct(product)}
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-[#0D281C] text-gray-200 hover:text-white border border-[#23493C] transition"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Edit</span>
                    </button>
                    {onDeleteProduct && (
                      <button
                        onClick={() => onDeleteProduct(product)}
                        className="p-1.5 rounded-lg bg-[#0D281C] text-red-400 hover:text-red-300 hover:bg-red-950/60 border border-[#23493C] transition"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onShareProduct && (
                      <button
                        onClick={() => onShareProduct(product)}
                        className="p-1.5 rounded-lg bg-[#0D281C] text-teal-300 hover:text-white border border-[#23493C] transition cursor-pointer"
                        title="QR / Share Link"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onViewMonograph(product)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                    >
                      Full Monograph
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
};
