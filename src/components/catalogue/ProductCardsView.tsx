import React, { useState } from 'react';
import { 
  RotateCw, 
  FileText, 
  Edit3, 
  Sparkles, 
  Plus, 
  Minus,
  Check,
  AlertTriangle
} from 'lucide-react';
import { Product } from '../../types';

interface ProductCardsViewProps {
  products: Product[];
  onViewMonograph: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onUpdateStock: (id: string | number, delta: number) => void;
}

export const ProductCardsView: React.FC<ProductCardsViewProps> = ({
  products,
  onViewMonograph,
  onEditProduct,
  onUpdateStock,
}) => {
  const [flippedCards, setFlippedCards] = useState<Record<string | number, boolean>>({});

  const toggleFlip = (id: string | number) => {
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => {
        const isFlipped = !!flippedCards[product.id];
        const isLowStock = (product.stockUnits || 0) < 25;

        return (
          <div key={product.id} className="h-[430px] w-full flip-card">
            <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
              
              {/* FRONT OF CARD */}
              <div className="flip-card-front bg-[#0D281C] border border-[#23493C] rounded-2xl p-5 flex flex-col justify-between shadow-xl">
                <div>
                  {/* Top Bar with Code & Category */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#081C13] text-emerald-400 border border-[#23493C]">
                      {product.code}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                      {product.categoryName || 'Formulation'}
                    </span>
                  </div>

                  {/* Image & Title */}
                  <div className="flex gap-4 items-start mb-3">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#081C13] border border-emerald-800/50 shrink-0 relative">
                      <img 
                        src={product.imageUrl || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600"} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600";
                        }}
                      />
                      {product.featured && (
                        <div className="absolute top-1 right-1 p-0.5 rounded-full bg-amber-500 text-[#081C13]">
                          <Sparkles className="w-2.5 h-2.5 fill-current" />
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
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400">Stock:</span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      isLowStock ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {product.stockUnits ?? 0}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
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
                      Key Botanical Ingredients
                    </span>
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                      {product.ingredients?.map((item, i) => {
                        const name = typeof item === 'string' ? item : item.name;
                        const role = typeof item === 'object' ? item.classicalRole : '';
                        return (
                          <div key={i} className="text-xs text-gray-300 flex items-start justify-between bg-[#0D281C]/70 px-2 py-1 rounded border border-[#23493C]/40">
                            <span className="font-medium text-emerald-300">{name}</span>
                            {role && <span className="text-[10px] text-gray-400 truncate max-w-[120px]">{role}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Usage & Anupana */}
                  <div className="bg-[#0D281C] p-2.5 rounded-xl border border-[#23493C] text-xs space-y-1 mb-2">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">Dosage & Vehicle (Anupana)</span>
                    <p className="text-gray-300 text-[11px] leading-relaxed">
                      {product.usage || "15-25 ml twice daily after meals with equal quantity of warm water."}
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
                  <button
                    onClick={() => onEditProduct(product)}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-[#0D281C] text-gray-200 hover:text-white border border-[#23493C]"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Edit Data</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateStock(product.id, -5)}
                      className="w-6 h-6 rounded bg-[#0D281C] text-gray-300 hover:text-white border border-[#23493C] flex items-center justify-center text-xs"
                      title="Deduct 5"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => onUpdateStock(product.id, 10)}
                      className="w-6 h-6 rounded bg-emerald-950 text-emerald-300 hover:text-white border border-emerald-800 flex items-center justify-center text-xs"
                      title="Add 10"
                    >
                      +10
                    </button>
                    <button
                      onClick={() => onViewMonograph(product)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
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
  );
};
