import React from 'react';
import { X, Printer, Download, Sparkles, QrCode, Camera } from 'lucide-react';
import { Product, IngredientItem } from '../../types';
import { resolveHerbDetails } from '../../utils/dravyagunaDirectory';

interface MonographModalProps {
  product: Product | null;
  onClose: () => void;
}

export const MonographModal: React.FC<MonographModalProps> = ({ product, onClose }) => {
  // Strictly display ingredients stored in Supabase record - no placeholder fallback
  const effectiveIngredients: IngredientItem[] = React.useMemo(() => {
    if (product?.ingredients && product.ingredients.length > 0) {
      return product.ingredients.map(item => {
        if (typeof item === 'string') {
          const resolved = resolveHerbDetails(item);
          return {
            name: resolved.name,
            botanicalName: resolved.botanicalName,
            sanskritName: resolved.sanskritName,
            partUsed: resolved.partUsed,
            classicalRole: resolved.therapeuticAction
          };
        }
        return item;
      });
    }
    return [];
  }, [product]);

  if (!product) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#FAF7F2] text-[#0F382C] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-[#DFB15B]/40">
        
        {/* Actions Bar (Hidden during print) */}
        <div className="no-print px-6 py-3 bg-[#081C13] border-b border-[#23493C] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              OFFICIAL PHARMACOPOEIAL MONOGRAPH
            </span>
            <span className="text-xs text-gray-300 font-mono">{product.code}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-600 transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Monograph</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Monograph Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#FAF7F2] text-[#062414] font-serif">
          
          {/* Header */}
          <div className="border-b-2 border-[#1B4D3E] pb-4 flex justify-between items-start gap-4">
            <div>
              <div className="text-[11px] font-sans tracking-widest uppercase font-bold text-[#1B4D3E]/80">
                Sitaram Ayurveda Clinical Apothecary
              </div>
              <h1 className="text-3xl font-bold text-[#0F382C] mt-1 font-serif">
                {product.name}
              </h1>
              <div className="text-base text-amber-900 font-serif mt-0.5">
                {product.sanskritName || 'Classical Ayurvedic Medicine'}
              </div>
              <div className="text-xs font-sans text-gray-600 mt-1">
                Classical Source: <strong className="text-gray-900">{product.classicalReference}</strong>
              </div>
            </div>

            {/* Batch & QR Box */}
            <div className="text-right border border-[#DFB15B] rounded-xl p-3 bg-white/80 shrink-0 shadow-xs">
              <div className="w-16 h-16 mx-auto bg-gray-100 border border-gray-300 rounded flex items-center justify-center mb-1">
                <QrCode className="w-12 h-12 text-[#1B4D3E]" />
              </div>
              <div className="text-[10px] font-mono text-gray-500">BATCH NO:</div>
              <div className="text-xs font-mono font-bold text-[#1B4D3E]">{product.batchNumber || 'SIT-2026-A1'}</div>
              <div className="text-[9px] font-sans text-gray-500">GMP Certified Release</div>
            </div>
          </div>

          {/* Quick Meta Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-sans text-xs">
            <div className="bg-white p-3 rounded-lg border border-[#E2D9CC]">
              <span className="text-[10px] uppercase text-gray-500 font-bold block">Category</span>
              <strong className="text-sm text-[#0F382C]">{product.categoryName || 'Formulation'}</strong>
            </div>
            <div className="bg-white p-3 rounded-lg border border-[#E2D9CC]">
              <span className="text-[10px] uppercase text-gray-500 font-bold block">Target Dosha</span>
              <strong className="text-sm text-amber-900">{product.targetDoshas?.join(', ') || 'Tridoshic'}</strong>
            </div>
            <div className="bg-white p-3 rounded-lg border border-[#E2D9CC]">
              <span className="text-[10px] uppercase text-gray-500 font-bold block">Standard Packings</span>
              <strong className="text-sm text-[#0F382C]">{product.packings?.join(', ') || '450 ml'}</strong>
            </div>
            <div className="bg-white p-3 rounded-lg border border-[#E2D9CC]">
              <span className="text-[10px] uppercase text-gray-500 font-bold block">Formulation Status</span>
              <strong className="text-sm text-emerald-800">{product.status || 'Active'} Published</strong>
            </div>
          </div>

          {/* Standardized Medicine Photo Documentation */}
          {(() => {
            const photos = product.images && product.images.length > 0 
              ? product.images 
              : (product.imageUrl ? [product.imageUrl] : []);
            
            if (photos.length === 0) return null;

            return (
              <div className="bg-white rounded-xl p-4 border border-[#E2D9CC] font-sans">
                <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2 mb-3">
                  <Camera className="w-4 h-4 text-[#1B4D3E]" />
                  <h3 className="font-serif font-bold text-sm text-[#0F382C]">
                    Standardized Pharmacopoeial Photo Documentation ({photos.length} {photos.length === 1 ? 'Angle' : 'Angles'})
                  </h3>
                </div>
                <div className={`grid gap-3 ${photos.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : photos.length === 2 ? 'grid-cols-2' : photos.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
                  {photos.map((img, i) => {
                    const captions = ['Packaging / Bottle', 'Formulation Label', 'Medicine Texture / Decoction', 'Batch Carton'];
                    return (
                      <div key={i} className="flex flex-col items-center text-center">
                        <div className="w-full aspect-square rounded-lg overflow-hidden border border-[#E2D9CC] bg-[#FAF7F2] mb-1">
                          <img 
                            src={img} 
                            alt={`Medicine Angle ${i + 1}`} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600';
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-600 font-medium">
                          {captions[i] || `Angle ${i + 1}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Clinical Therapeutic Overview */}
          <div className="bg-white rounded-xl p-5 border border-[#E2D9CC] space-y-3 font-sans">
            <h3 className="font-serif font-bold text-lg text-[#0F382C] border-b border-gray-100 pb-1">
              Therapeutic Action & Indications
            </h3>
            <div>
              <span className="text-xs font-bold text-gray-600 uppercase block mb-1">Primary Clinical Benefit</span>
              <p className="text-sm text-gray-800 leading-relaxed font-serif">
                {product.primaryBenefit || product.description}
              </p>
            </div>
            <div>
              <span className="text-xs font-bold text-gray-600 uppercase block mb-1">Indications (Roga Rogadhikara)</span>
              <p className="text-sm text-gray-800 leading-relaxed">
                {product.indications || "Indicated for metabolic imbalances, systemic detox, and constitutional harmony."}
              </p>
            </div>
          </div>

          {/* Botanical Ingredients Table */}
          <div className="bg-white rounded-xl p-5 border border-[#E2D9CC] font-sans">
            <h3 className="font-serif font-bold text-lg text-[#0F382C] border-b border-gray-100 pb-2 mb-3">
              Botanical Composition & Actives
            </h3>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 font-semibold uppercase text-[10px]">
                  <th className="py-2">Ingredient</th>
                  <th className="py-2">Botanical Source</th>
                  <th className="py-2">Part Used</th>
                  <th className="py-2">Therapeutic Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {effectiveIngredients.length > 0 ? (
                  effectiveIngredients.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-bold text-[#0F382C]">
                        {item.name}
                        {item.sanskritName && (
                          <span className="block text-[10px] text-amber-800 font-serif font-normal italic">
                            {item.sanskritName}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 italic text-gray-600">{item.botanicalName || '—'}</td>
                      <td className="py-2.5 text-gray-600">{item.partUsed || 'Standardized Part'}</td>
                      <td className="py-2.5 text-gray-700">{item.classicalRole || item.therapeuticAction || 'Classical active'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-500 italic">
                      No botanical ingredients are currently registered in Supabase for this formulation.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Posology & Administration */}
          <div className="bg-white rounded-xl p-5 border border-[#E2D9CC] space-y-3 font-sans text-xs">
            <h3 className="font-serif font-bold text-lg text-[#0F382C] border-b border-gray-100 pb-1">
              Posology & Dispensary Guidelines
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-bold text-gray-700 block mb-0.5">Recommended Clinical Dosage:</span>
                <p className="text-gray-600">{product.usage || "15-25 ml twice daily after food."}</p>
              </div>
              <div>
                <span className="font-bold text-gray-700 block mb-0.5">Anupana (Adjuvant Vehicle):</span>
                <p className="text-gray-600">Equal quantity of lukewarm boiled water, raw organic honey, or warm cow milk as directed by Vaidya.</p>
              </div>
            </div>
          </div>

          {/* Pharmacy Certificate Footer */}
          <div className="pt-6 border-t-2 border-[#1B4D3E] flex justify-between items-end font-sans text-xs text-gray-600">
            <div>
              <p>Formulation complies with <strong>Ayurvedic Pharmacopoeia of India (API)</strong></p>
              <p className="text-[11px] text-gray-500">Prepared according to Classical Treatises under GMP supervision.</p>
            </div>
            <div className="text-right">
              <div className="w-36 border-b border-gray-400 mb-1"></div>
              <p className="font-semibold text-gray-800">Chief Medical Administrator</p>
              <p className="text-[10px] text-gray-500">Sitaram Ayurveda Dispensary & Research</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
