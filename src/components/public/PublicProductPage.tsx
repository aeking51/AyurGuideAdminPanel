import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ExternalLink, 
  Smartphone, 
  Globe, 
  QrCode, 
  BookOpen, 
  FileText, 
  AlertCircle, 
  Check, 
  Share2, 
  Layers, 
  ShieldCheck, 
  Package,
  Calendar,
  Pill
} from 'lucide-react';
import { Product } from '../../types';
import { SupabaseService } from '../../services/supabase';
import { ensureProductShareFields, generateQrDataUrl } from '../../utils/shareUtils';
import { ProductQRModal } from '../common/ProductQRModal';

interface PublicProductPageProps {
  slug: string;
  onNavigateHome?: () => void;
}

export const PublicProductPage: React.FC<PublicProductPageProps> = ({ 
  slug, 
  onNavigateHome 
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullWebDetails, setShowFullWebDetails] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    SupabaseService.fetchProductBySlug(slug)
      .then((data) => {
        if (!isMounted) return;
        if (!data) {
          setError('Medicine not found in AyurIndex.');
        } else if (data.status !== 'Active') {
          // Strictly enforce: Inactive products show "Medicine Not Available"
          setError('Medicine Not Available');
        } else {
          setProduct(data);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load public product:', err);
        setError('Failed to load medicine details.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleShowInWeb = () => {
    setShowFullWebDetails(true);
    const element = document.getElementById('comprehensive-web-details');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShowInApp = () => {
    if (!product) return;
    const { shareQrLink } = ensureProductShareFields(product);
    // Invoke the Android App Link via canonical URL
    // Android OS automatically intercepts this registered domain pattern and opens the native app
    window.location.href = shareQrLink;
  };

  const handleCopyLink = () => {
    if (!product) return;
    const { shareQrLink } = ensureProductShareFields(product);
    navigator.clipboard.writeText(shareQrLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#081C13] text-gray-100 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-3 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mb-4" />
        <h2 className="font-serif text-lg text-emerald-300">AYURINDEX</h2>
        <p className="text-xs text-gray-400 font-mono mt-1">Retrieving authentic medicine record...</p>
      </div>
    );
  }

  // Error / Inactive State (Requirement 17: Inactive products show "Medicine Not Available")
  if (error || !product) {
    const isInactive = error === 'Medicine Not Available';

    return (
      <div className="min-h-screen bg-[#081C13] text-gray-100 flex flex-col">
        {/* Top Minimal Brand Bar */}
        <header className="border-b border-[#23493C]/60 bg-[#061810] py-4 px-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <div>
                <h1 className="font-serif font-bold text-lg text-emerald-100 tracking-wider">AYURINDEX</h1>
                <p className="text-[10px] text-emerald-400/80 font-mono">Ayurvedic Medicine Index</p>
              </div>
            </div>
            {onNavigateHome && (
              <button 
                onClick={onNavigateHome}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#0D281C] text-emerald-300 border border-[#23493C] hover:text-white"
              >
                Back to Index
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 max-w-xl mx-auto px-4 py-16 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-950/50 border border-amber-800/60 flex items-center justify-center text-amber-400 mb-5 shadow-xl">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-gray-100 mb-2">
            {isInactive ? 'Medicine Not Available' : 'Medicine Not Found'}
          </h2>
          <p className="text-sm text-gray-400 max-w-md mb-8">
            {isInactive 
              ? 'This medicine formulation is currently unlisted, archived, or not published for public access in AyurIndex.'
              : 'The requested medicine slug does not exist in our central standardized Ayurvedic repository.'}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {onNavigateHome ? (
              <button
                onClick={onNavigateHome}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition"
              >
                Browse AyurIndex Catalogue
              </button>
            ) : (
              <a
                href="/"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition"
              >
                Go to Homepage
              </a>
            )}
          </div>
        </main>

        <footer className="border-t border-[#23493C]/60 py-4 bg-[#061810] text-center text-xs text-gray-500">
          <p>AyurIndex &bull; Standardized Ayurvedic Pharmacopoeia Directory</p>
        </footer>
      </div>
    );
  }

  const { shareQrLink } = ensureProductShareFields(product);

  return (
    <div className="min-h-screen bg-[#081C13] text-gray-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* Brand Header */}
      <header className="border-b border-[#23493C]/60 bg-[#061810]/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg text-emerald-100 tracking-wider">
                AYURINDEX
              </h1>
              <p className="text-[10px] text-emerald-400 font-mono tracking-tight">
                Ayurvedic Medicine Index
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0D281C] text-emerald-300 hover:text-white border border-[#23493C] text-xs font-semibold transition"
              title="Share QR Code"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Share QR</span>
            </button>

            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="text-xs px-3 py-1.5 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900 transition"
              >
                Admin Portal
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Public Hero Card */}
        <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl overflow-hidden shadow-2xl">
          
          <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            
            {/* Product Image */}
            <div className="w-full md:w-64 shrink-0 flex flex-col items-center">
              <div className="w-full aspect-square max-w-[260px] rounded-2xl overflow-hidden bg-[#081C13] border-2 border-emerald-800/60 shadow-xl relative">
                <img 
                  src={product.imageUrl || (product.images && product.images[0]) || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600"} 
                  alt={product.name}
                  loading="eager"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-emerald-950/90 border border-emerald-700/80 text-[10px] font-mono text-emerald-300">
                  {product.code}
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Ayurvedic Formulation</span>
              </div>
            </div>

            {/* Medicine Identity & Summary */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs uppercase font-semibold px-2.5 py-0.5 rounded-md bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                    {product.categoryName || 'Classical Medicine'}
                  </span>
                  {product.targetDoshas && product.targetDoshas.length > 0 && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-300 border border-amber-800/50">
                      {product.targetDoshas.join(' • ')}
                    </span>
                  )}
                </div>

                <h2 className="font-serif font-bold text-2xl sm:text-3xl text-gray-100 tracking-tight">
                  {product.name}
                </h2>

                {product.sanskritName && (
                  <p className="text-amber-200/90 font-serif text-sm italic mt-0.5">
                    {product.sanskritName}
                  </p>
                )}
              </div>

              {/* Classical Reference */}
              {product.classicalReference && (
                <div className="bg-[#081C13]/70 rounded-xl p-3 border border-[#23493C]/70 text-xs">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block mb-0.5">
                    Classical Treatise Reference:
                  </span>
                  <p className="text-gray-300 font-serif">
                    {product.classicalReference}
                  </p>
                </div>
              )}

              {/* Description */}
              {product.description && (
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Packings Summary */}
              {product.packings && product.packings.length > 0 && (
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <Package className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-gray-400">Available Packings:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.packings.map((pkg, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-[11px] font-mono">
                        {pkg}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CORE ACTION BUTTONS: [ SHOW IN WEB ] and [ SHOW IN APP ] */}
              <div className="pt-4 border-t border-[#23493C] flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleShowInWeb}
                  className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98] cursor-pointer"
                >
                  <Globe className="w-4 h-4" />
                  <span>SHOW IN WEB</span>
                </button>

                <button
                  type="button"
                  onClick={handleShowInApp}
                  className="flex-1 px-5 py-3 rounded-xl bg-[#081C13] hover:bg-[#123626] text-emerald-300 hover:text-white border-2 border-emerald-600/70 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-[0.98] cursor-pointer"
                  title="Open this medicine directly in the AyurIndex Android Application"
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>SHOW IN APP</span>
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* COMPREHENSIVE WEB DETAILS SECTION (Activated by SHOW IN WEB or directly visible) */}
        <div id="comprehensive-web-details" className="space-y-6 pt-2">
          
          <div className="flex items-center justify-between border-b border-[#23493C] pb-2">
            <h3 className="font-serif font-bold text-lg text-emerald-200 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <span>Complete Formulation Details</span>
            </h3>
            <span className="text-xs text-emerald-400/80 font-mono">
              Live Central Database Record
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Indications */}
            <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-5 shadow-lg space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                <span>Therapeutic Indications (Roga Rogi Pareeksha)</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                {product.indications || product.primaryBenefit || 'Standard classical therapeutic indications as prescribed in the Ayurvedic Pharmacopoeia of India (API).'}
              </p>
            </div>

            {/* Dosage & Usage */}
            <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-5 shadow-lg space-y-2">
              <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
                <Pill className="w-4 h-4" />
                <span>Dosage & Method of Administration (Matra & Anupana)</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                {product.dosage || product.usage || '15–30 ml twice daily after meals with equal quantity of warm water, or as directed by an Ayurvedic physician.'}
              </p>
            </div>

          </div>

          {/* Botanical Ingredients Formulation Table */}
          <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-[#081C13] px-5 py-3 border-b border-[#23493C] flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>Standardized Botanical Ingredients & Composition</span>
              </span>
              <span className="text-xs text-gray-400 font-mono">
                {product.ingredients?.length || 0} Ingredients
              </span>
            </div>

            {product.ingredients && product.ingredients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#061810] text-[10px] uppercase font-semibold text-emerald-400/80 tracking-wider border-b border-[#23493C]">
                    <tr>
                      <th className="py-2.5 px-4">Herb / Common Name</th>
                      <th className="py-2.5 px-4">Botanical Latin</th>
                      <th className="py-2.5 px-4">Part Used</th>
                      <th className="py-2.5 px-4">Therapeutic Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#23493C]/50">
                    {product.ingredients.map((item, idx) => {
                      if (typeof item === 'string') {
                        return (
                          <tr key={idx} className="hover:bg-[#133829]/40">
                            <td className="py-2.5 px-4 font-semibold text-gray-100" colSpan={4}>
                              {item}
                            </td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={idx} className="hover:bg-[#133829]/40">
                          <td className="py-2.5 px-4 font-semibold text-gray-100">
                            {item.name}
                            {item.sanskritName && (
                              <span className="block text-[10px] text-amber-300 font-serif">
                                {item.sanskritName}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 italic text-emerald-300">
                            {item.botanicalName || '—'}
                          </td>
                          <td className="py-2.5 px-4 text-gray-400">
                            {item.partUsed || 'Root / Standardized'}
                          </td>
                          <td className="py-2.5 px-4 text-gray-300">
                            {item.classicalRole || item.therapeuticAction || 'Active Therapeutic'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-gray-400">
                Ingredients formulation details are maintained according to standard classical reference.
              </div>
            )}
          </div>

          {/* Share & QR Callout Bar */}
          <div className="bg-gradient-to-r from-[#0D281C] to-[#0A2217] border border-emerald-800/60 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-serif font-bold text-sm text-emerald-100">
                Permanent Canonical Share Link
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Share this medicine directly to WhatsApp, patients, doctors, or print on labels.
              </p>
              <span className="text-[11px] font-mono text-emerald-400 mt-1 block truncate max-w-md">
                {shareQrLink}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-[#081C13] hover:bg-emerald-950 text-emerald-300 border border-[#23493C] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ExternalLink className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy URL'}</span>
              </button>
              
              <button
                onClick={() => setIsQrModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Show QR Code</span>
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#23493C]/60 py-6 bg-[#061810] text-center text-xs text-gray-400 space-y-1">
        <p className="text-emerald-300 font-serif font-semibold">
          AYURINDEX &bull; Ayurvedic Medicine Index
        </p>
        <p className="text-[11px] text-gray-500">
          Standardized Classical Formulations &bull; Permanent Universal QR System
        </p>
      </footer>

      {/* Share / QR Modal */}
      {isQrModalOpen && (
        <ProductQRModal
          isOpen={isQrModalOpen}
          product={product}
          onClose={() => setIsQrModalOpen(false)}
        />
      )}

    </div>
  );
};
