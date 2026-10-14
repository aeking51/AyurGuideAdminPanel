import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, ShieldCheck, Tag, Sparkles } from 'lucide-react';
import { Product } from '../../types';

interface PhotoLightboxModalProps {
  product: Product;
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  onOpenMonograph?: (product: Product) => void;
}

export const PhotoLightboxModal: React.FC<PhotoLightboxModalProps> = ({
  product,
  initialIndex = 0,
  isOpen,
  onClose,
  onOpenMonograph
}) => {
  const images = (product.images && product.images.length > 0)
    ? product.images
    : [product.imageUrl || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600'];

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex >= 0 && initialIndex < images.length ? initialIndex : 0);
    setIsZoomed(false);
  }, [initialIndex, product, isOpen, images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') {
        setCurrentIndex(prev => (prev + 1) % images.length);
        setIsZoomed(false);
      }
      if (e.key === 'ArrowLeft') {
        setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
        setIsZoomed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, onClose]);

  if (!isOpen) return null;

  const currentImage = images[currentIndex] || images[0];

  const handleNext = () => {
    setCurrentIndex((currentIndex + 1) % images.length);
    setIsZoomed(false);
  };

  const handlePrev = () => {
    setCurrentIndex((currentIndex - 1 + images.length) % images.length);
    setIsZoomed(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-[#081C13] border border-[#23493C] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#23493C]/80 bg-[#061810]/90">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white font-serif truncate">
                {product.name}
              </h3>
              <p className="text-[11px] text-emerald-400/80 font-mono flex items-center gap-2 truncate">
                <span>{product.code}</span>
                {product.categoryName && (
                  <>
                    <span>&bull;</span>
                    <span>{product.categoryName}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-1.5 sm:p-2 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-800/30 transition"
              title={isZoomed ? "Reset Zoom" : "Zoom In"}
            >
              {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Photo Viewport */}
        <div className="relative flex-1 bg-[#05120c] flex items-center justify-center p-4 min-h-[300px] sm:min-h-[440px] overflow-hidden">
          <div 
            className={`transition-transform duration-300 cursor-pointer ${
              isZoomed ? 'scale-150 sm:scale-175' : 'scale-100 hover:scale-[1.02]'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <img 
              src={currentImage} 
              alt={`${product.name} Packaging Photography`}
              className="max-h-[50vh] sm:max-h-[60vh] max-w-full object-contain rounded-xl shadow-2xl border border-emerald-900/40"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600';
              }}
            />
          </div>

          {/* Previous / Next Arrow Controls */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="absolute left-3 sm:left-4 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-[#23493C] transition backdrop-blur-sm"
                title="Previous Image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="absolute right-3 sm:right-4 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-[#23493C] transition backdrop-blur-sm"
                title="Next Image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Photo Counter Pill */}
          <div className="absolute bottom-3 left-4 px-2.5 py-1 rounded-full bg-black/75 border border-emerald-500/30 text-[11px] font-mono text-emerald-300 backdrop-blur-sm">
            Photo {currentIndex + 1} of {images.length}
          </div>

          {/* Classical Reference Badge */}
          {product.classicalReference && (
            <div className="absolute top-3 left-4 hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#081C13]/90 border border-emerald-800/80 text-[11px] text-emerald-300 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span className="truncate max-w-xs">{product.classicalReference}</span>
            </div>
          )}
        </div>

        {/* Bottom Thumbnail Strip & Actions */}
        <div className="p-3 sm:p-4 bg-[#061810] border-t border-[#23493C]/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Thumbnails */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => { setCurrentIndex(idx); setIsZoomed(false); }}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                  currentIndex === idx 
                    ? 'border-emerald-400 scale-105 shadow-md shadow-emerald-950' 
                    : 'border-[#23493C] opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenMonograph && (
              <button
                onClick={() => {
                  onClose();
                  onOpenMonograph(product);
                }}
                className="py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition"
              >
                View Full Monograph
              </button>
            )}
            <button
              onClick={onClose}
              className="py-1.5 px-3 bg-[#0D281C] hover:bg-[#1A3D2E] text-gray-300 border border-[#23493C] rounded-lg text-xs font-medium transition"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
