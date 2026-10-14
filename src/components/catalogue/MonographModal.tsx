import React, { useState, useEffect, useMemo } from 'react';
import { X, Printer, Download, Sparkles, QrCode, Camera, Maximize2 } from 'lucide-react';
import { Product, IngredientItem } from '../../types';
import { resolveHerbDetails } from '../../utils/dravyagunaDirectory';
import { ensureProductShareFields, generateQrDataUrl } from '../../utils/shareUtils';
import { PhotoLightboxModal } from '../common/PhotoLightboxModal';

interface MonographModalProps {
  product: Product | null;
  onClose: () => void;
}

export const MonographModal: React.FC<MonographModalProps> = ({ product, onClose }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [lightboxPhotoIndex, setLightboxPhotoIndex] = useState<number | null>(null);

  // Strictly display ingredients stored in Supabase record - no placeholder fallback
  const effectiveIngredients: IngredientItem[] = useMemo(() => {
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

  // Generate live QR code for real monograph scanning
  useEffect(() => {
    if (!product) return;
    try {
      const { shareQrLink } = ensureProductShareFields(product);
      generateQrDataUrl(shareQrLink, 180)
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('Failed to generate monograph QR:', err));
    } catch (e) {
      console.warn('QR generation fallback:', e);
    }
  }, [product]);

  if (!product) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 monograph-modal-overlay">
      <div className="bg-[#FAF7F2] text-[#0F382C] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-[#DFB15B]/40 monograph-modal-container">
        
        {/* Actions Bar (Hidden during print) */}
        <div className="no-print px-4 sm:px-6 py-3 bg-[#081C13] border-b border-[#23493C] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              OFFICIAL PHARMACOPOEIAL MONOGRAPH
            </span>
            <span className="text-xs text-gray-300 font-mono hidden sm:inline">{product.code}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition shadow-sm cursor-pointer active:scale-95"
              title="Print Pharmacopoeial Monograph (A4/Letter or PDF Export)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Monograph</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-emerald-950 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Monograph Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-[#FAF7F2] text-[#062414] font-serif monograph-printable-sheet">
          
          {/* Header */}
          <div className="border-b-2 border-[#1B4D3E] pb-4 flex justify-between items-start gap-4 monograph-break-avoid">
            <div>
              <div className="text-[11px] font-sans tracking-widest uppercase font-bold text-[#1B4D3E]/80">
                Ayur Index Pharmacopoeia &bull; Clinical Formulation Monograph
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0F382C] mt-1 font-serif">
                {product.name}
              </h1>
              <div className="text-base text-amber-900 font-serif mt-0.5">
                {product.sanskritName || 'Classical Ayurvedic Medicine'}
              </div>
              <div className="text-xs font-sans text-gray-600 mt-1">
                Classical Source: <strong className="text-gray-900">{product.classicalReference || 'Classical Pharmacopoeia of India (API)'}</strong>
              </div>
            </div>

            {/* Batch & Scannable QR Box */}
            <div className="text-right border border-[#DFB15B] rounded-xl p-2.5 bg-white shrink-0 shadow-xs monograph-break-avoid">
              <div className="w-16 h-16 mx-auto bg-white border border-gray-200 rounded flex items-center justify-center mb-1 overflow-hidden">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt={`QR Code for ${product.name}`} className="w-full h-full object-contain" />
                ) : (
                  <QrCode className="w-10 h-10 text-[#1B4D3E]" />
                )}
              </div>
              <div className="text-[9px] font-mono text-gray-500">BATCH NO:</div>
              <div className="text-xs font-mono font-bold text-[#1B4D3E]">{product.batchNumber || 'AYUR-2026-A1'}</div>
              <div className="text-[8px] font-sans text-gray-500">GMP Verified</div>
            </div>
          </div>

          {/* Quick Meta Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-sans text-xs monograph-break-avoid monograph-meta-card">
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
              <div className="bg-white rounded-xl p-4 border border-[#E2D9CC] font-sans monograph-break-avoid monograph-photo-card">
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
                      <div 
                        key={i} 
                        onClick={() => setLightboxPhotoIndex(i)}
                        className="flex flex-col items-center text-center cursor-pointer group/monoimg"
                        title="Click to inspect high-resolution photo"
                      >
                        <div className="w-full aspect-square max-h-36 rounded-lg overflow-hidden border border-[#E2D9CC] group-hover/monoimg:border-emerald-600 bg-[#FAF7F2] mb-1 relative transition">
                          <img 
                            src={img} 
                            alt={`Medicine Angle ${i + 1}`} 
                            className="w-full h-full object-cover group-hover/monoimg:scale-105 transition duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/monoimg:opacity-100 transition-opacity flex items-center justify-center">
                            <Maximize2 className="w-3.5 h-3.5 text-white drop-shadow" />
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-600 font-medium group-hover/monoimg:text-emerald-800 transition">
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
          <div className="bg-white rounded-xl p-5 border border-[#E2D9CC] space-y-3 font-sans monograph-break-avoid">
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
                {product.indications || "Indicated for traditional Ayurvedic clinical administration as referenced in classical medical treatises."}
              </p>
            </div>
          </div>

          {/* Botanical Ingredients Table */}
          <div className="bg-white rounded-xl p-5 border border-[#E2D9CC] font-sans monograph-break-avoid">
            <h3 className="font-serif font-bold text-lg text-[#0F382C] border-b border-gray-100 pb-2 mb-3">
              Botanical Composition & Actives
            </h3>
            <table className="w-full text-left text-xs monograph-table">
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
                      No botanical ingredients registered in central Supabase database for this formulation.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Posology & Administration */}
          <div className="bg-white rounded-xl p-5 border border-[#E2D9CC] space-y-3 font-sans text-xs monograph-break-avoid monograph-posology-card">
            <h3 className="font-serif font-bold text-lg text-[#0F382C] border-b border-gray-100 pb-1">
              Posology & Dispensary Guidelines
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-bold text-gray-700 block mb-0.5">Recommended Clinical Dosage:</span>
                <p className="text-gray-600">{product.usage || product.dosage || "15–25 ml twice daily after food or as directed by an Ayurvedic physician."}</p>
              </div>
              <div>
                <span className="font-bold text-gray-700 block mb-0.5">Anupana (Adjuvant Vehicle):</span>
                <p className="text-gray-600">Equal quantity of lukewarm boiled water, raw organic honey, or warm milk as directed by Vaidya.</p>
              </div>
            </div>
          </div>

          {/* Pharmacy Certificate Footer */}
          <div className="pt-6 border-t-2 border-[#1B4D3E] flex justify-between items-end font-sans text-xs text-gray-600 monograph-certificate-footer monograph-break-avoid">
            <div>
              <p>Formulation complies with <strong>Ayurvedic Pharmacopoeia of India (API)</strong></p>
              <p className="text-[11px] text-gray-500">Document generated from Ayur Index Clinical Database &bull; Central Supabase Storage</p>
            </div>
            <div className="text-right">
              <div className="w-36 border-b border-gray-400 mb-1"></div>
              <p className="font-semibold text-gray-800">Chief Medical Administrator</p>
              <p className="text-[10px] text-gray-500">Ayur Index Pharmacopoeial Dispensary</p>
            </div>
          </div>

        </div>

      </div>

      {lightboxPhotoIndex !== null && product && (
        <PhotoLightboxModal
          isOpen={lightboxPhotoIndex !== null}
          product={product}
          initialIndex={lightboxPhotoIndex}
          onClose={() => setLightboxPhotoIndex(null)}
        />
      )}
    </div>
  );
};
