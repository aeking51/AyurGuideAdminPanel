import React from 'react';
import { 
  FileText, 
  Edit3, 
  Trash2, 
  Plus, 
  Minus, 
  AlertCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Product } from '../../types';

interface ProductTableProps {
  products: Product[];
  onViewMonograph: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onUpdateStock: (id: string | number, delta: number) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onViewMonograph,
  onEditProduct,
  onDeleteProduct,
  onUpdateStock,
}) => {
  if (products.length === 0) {
    return (
      <div className="bg-[#0D281C]/70 rounded-2xl border border-[#23493C] p-12 text-center">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3 opacity-80" />
        <h3 className="text-lg font-serif font-bold text-gray-200">No Medicines Found</h3>
        <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
          No formulations match the current filter criteria or search query. Try resetting filters or creating a new product entry.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#0D281C]/80 rounded-2xl border border-[#23493C] overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-[#081C13]/90 text-[11px] uppercase font-semibold text-emerald-300/80 tracking-wider border-b border-[#23493C]">
            <tr>
              <th className="py-3 px-4">Medicine & Sanskrit</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Dosha & Clinical Target</th>
              <th className="py-3 px-3">Packaging</th>
              <th className="py-3 px-3 text-center">Stock Level</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#23493C]/50">
            {products.map((product) => {
              const isLowStock = (product.stockUnits || 0) < 25;
              const isOutOfStock = (product.stockUnits || 0) <= 0;

              return (
                <tr key={product.id} className="hover:bg-[#133829]/50 transition duration-150 group">
                  
                  {/* Medicine Identity */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-emerald-950 border border-emerald-800/80 shrink-0 relative">
                        <img 
                          src={product.imageUrl || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600"} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600";
                          }}
                        />
                        {product.featured && (
                          <div className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-amber-500 text-[#081C13]" title="Featured Formulation">
                            <Sparkles className="w-2.5 h-2.5 fill-current" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-gray-100 text-sm hover:text-emerald-300 cursor-pointer" onClick={() => onViewMonograph(product)}>
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

                  {/* Packaging */}
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1 max-w-[140px]">
                      {product.packings && product.packings.map((pkg, i) => (
                        <span key={i} className="text-[11px] px-1.5 py-0.5 rounded bg-[#081C13] text-gray-300 border border-[#23493C]">
                          {pkg}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Stock Level with Quick Stepper */}
                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex flex-col items-center">
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => onUpdateStock(product.id, -1)}
                          disabled={isOutOfStock}
                          className="w-5 h-5 rounded flex items-center justify-center bg-emerald-950 text-gray-300 hover:text-white hover:bg-emerald-800 border border-emerald-800 disabled:opacity-40"
                          title="Decrement 1 unit"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                          isOutOfStock
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : isLowStock
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {product.stockUnits ?? 0}
                        </span>
                        <button 
                          onClick={() => onUpdateStock(product.id, 1)}
                          className="w-5 h-5 rounded flex items-center justify-center bg-emerald-950 text-gray-300 hover:text-white hover:bg-emerald-800 border border-emerald-800"
                          title="Increment 1 unit"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-[9px] text-gray-500 mt-0.5 font-mono">
                        {product.batchNumber || 'Batch A1'}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                      product.status === 'Active'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                    }`}>
                      {product.status || 'Active'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onViewMonograph(product)}
                        className="p-1.5 rounded-lg bg-[#081C13] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/60 border border-[#23493C] transition"
                        title="Printable Monograph & Certificate"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEditProduct(product)}
                        className="p-1.5 rounded-lg bg-[#081C13] text-gray-300 hover:text-white hover:bg-emerald-900/60 border border-[#23493C] transition"
                        title="Edit Medicine Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(product)}
                        className="p-1.5 rounded-lg bg-[#081C13] text-red-400 hover:text-red-300 hover:bg-red-950/60 border border-[#23493C] transition"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
