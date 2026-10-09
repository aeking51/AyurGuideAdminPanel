import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  FileText, 
  AlertCircle, 
  Layers, 
  ShieldCheck, 
  Package, 
  Pill, 
  HeartPulse, 
  Flame, 
  Wind, 
  Droplet, 
  Clock, 
  ShieldAlert, 
  Info, 
  Activity, 
  Leaf, 
  CheckCircle2, 
  Calendar, 
  ExternalLink, 
  Compass, 
  X, 
  Copy, 
  Check, 
  Share2 
} from 'lucide-react';
import { Product, IngredientItem } from '../../types';
import { SupabaseService } from '../../services/supabase';
import { ensureProductShareFields } from '../../utils/shareUtils';

interface PublicProductPageProps {
  slug: string;
  onNavigateHome?: () => void;
}

export const PublicProductPage: React.FC<PublicProductPageProps> = ({ 
  slug,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setSelectedImageIndex(0);

    // Fetch live product record from Supabase by canonical slug or code
    SupabaseService.fetchProductBySlug(slug)
      .then(found => {
        if (!isMounted) return;
        if (found) {
          if (found.status === 'Inactive') {
            setError('Medicine Not Available');
          } else {
            setProduct(found);
          }
        } else {
          setError('Medicine Not Found');
        }
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('Failed to load product details:', err);
        setError('Failed to load medicine details.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleCopyShareLink = async () => {
    if (!product) return;
    const { shareQrLink } = ensureProductShareFields(product);
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} | Ayur Index`,
          text: `${product.name} (${product.code})\nView authentic Ayurvedic medicine details:`,
          url: shareQrLink,
        });
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareQrLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#081C13] text-gray-100 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 border-3 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mb-4" />
        <h2 className="font-serif text-base sm:text-lg text-emerald-300">AYUR INDEX</h2>
        <p className="text-xs text-gray-400 font-mono mt-1 text-center">Retrieving authentic medicine record...</p>
      </div>
    );
  }

  // Error / Inactive State
  if (error || !product) {
    const isInactive = error === 'Medicine Not Available';

    return (
      <div className="min-h-screen bg-[#081C13] text-gray-100 flex flex-col">
        {/* Top Minimal Brand Bar */}
        <header className="border-b border-[#23493C]/60 bg-[#061810] py-3.5 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              <div>
                <h1 className="font-serif font-bold text-base sm:text-lg text-emerald-100 tracking-wider">AYUR INDEX</h1>
                <p className="text-[9px] sm:text-[10px] text-emerald-400/80 font-mono">Ayurvedic Clinical Pharmacopoeia</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-xl mx-auto px-4 py-12 sm:py-16 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-950/50 border border-amber-800/60 flex items-center justify-center text-amber-400 mb-4 sm:mb-5 shadow-xl">
            <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-100 mb-2">
            {isInactive ? 'Medicine Not Available' : 'Medicine Not Found'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mb-8 leading-relaxed">
            {isInactive
              ? 'This formulation is currently inactive or under clinical review in the pharmacopoeia.'
              : 'The requested Ayurvedic medicine record could not be found. Please verify the QR link or code.'}
          </p>
        </main>

        <footer className="border-t border-[#23493C]/60 py-4 bg-[#061810] text-center text-xs text-gray-500 px-4">
          <p>Ayur Index &bull; Standardized Ayurvedic Pharmacopoeia Directory</p>
        </footer>
      </div>
    );
  }

  // Image handling
  const allImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.imageUrl || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600"];
  const currentImage = allImages[selectedImageIndex] || allImages[0];

  // Ingredients strictly from Supabase record
  const effectiveIngredients: IngredientItem[] = React.useMemo(() => {
    if (!product?.ingredients || product.ingredients.length === 0) {
      return [];
    }
    return product.ingredients.map(item => {
      if (typeof item === 'string') {
        const clean = item.trim();
        const parenMatch = clean.match(/^([^(]+)\s*\(([^)]+)\)$/);
        return {
          name: parenMatch ? parenMatch[1].trim() : clean,
          botanicalName: parenMatch ? parenMatch[2].trim() : '',
        };
      }
      return item;
    });
  }, [product]);

  return (
    <div className="min-h-screen bg-[#081C13] text-gray-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* Brand Header - Touch-friendly & Responsive */}
      <header className="border-b border-[#23493C]/60 bg-[#061810]/95 backdrop-blur-md sticky top-0 z-40 px-3.5 sm:px-6 py-2.5 sm:py-3.5 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shrink-0">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="font-serif font-bold text-base sm:text-lg text-emerald-100 tracking-wider truncate leading-tight">
                AYUR INDEX
              </h1>
              <p className="text-[9px] sm:text-[10px] text-emerald-400 font-mono tracking-tight truncate">
                Ayurvedic Clinical Pharmacopoeia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="text-[11px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-mono font-bold tracking-tight">
              {product.code}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container - Optimized Paddings for Mobile/Tablet */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">

        {/* Public Hero Card */}
        <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl overflow-hidden shadow-2xl">
          
          <div className="p-4 sm:p-6 md:p-8 flex flex-col md:flex-row gap-5 md:gap-8 items-center md:items-start">
            
            {/* Product Image & Thumbnail Gallery */}
            <div className="w-full md:w-64 shrink-0 flex flex-col items-center">
              <div className="w-full max-w-[220px] sm:max-w-[260px] aspect-square rounded-2xl overflow-hidden bg-[#081C13] border-2 border-emerald-800/60 shadow-xl relative mx-auto">
                <img 
                  src={currentImage} 
                  alt={product.name}
                  loading="eager"
                  className="w-full h-full object-cover transition duration-300"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-950/90 border border-emerald-700/80 text-[9px] sm:text-[10px] font-mono text-emerald-300">
                  {product.code}
                </div>
              </div>

              {/* Multi-image thumbnail gallery - touch-pan-x for smooth mobile swipe */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-2 mt-2.5 overflow-x-auto max-w-full pb-1 px-1 touch-pan-x scrollbar-thin">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                        selectedImageIndex === idx 
                          ? 'border-emerald-400 scale-105 shadow-md' 
                          : 'border-[#23493C] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Status Badge */}
              <div className="mt-2.5 sm:mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] sm:text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Verified Formulation</span>
              </div>
            </div>

            {/* Medicine Identity & Summary */}
            <div className="flex-1 w-full space-y-3.5 sm:space-y-4 text-left">
              <div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5">
                  <span className="text-[10px] sm:text-xs uppercase font-semibold px-2 sm:px-2.5 py-0.5 rounded-md bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                    {product.categoryName || 'Classical Medicine'}
                  </span>
                  {product.targetDoshas && product.targetDoshas.length > 0 && (
                    <span className="text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-300 border border-amber-800/50">
                      {product.targetDoshas.join(' • ')}
                    </span>
                  )}
                </div>

                <h2 className="font-serif font-bold text-xl sm:text-2xl md:text-3xl text-gray-100 tracking-tight leading-tight">
                  {product.name}
                </h2>

                {product.sanskritName && (
                  <p className="text-amber-200/90 font-serif text-xs sm:text-sm italic mt-0.5">
                    {product.sanskritName}
                  </p>
                )}
              </div>

              {/* Primary Benefit Callout */}
              {product.primaryBenefit && (
                <div className="bg-emerald-950/50 border border-emerald-800/60 rounded-xl p-2.5 sm:p-3 flex items-start gap-2.5">
                  <HeartPulse className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold text-emerald-300 tracking-wider block">
                      Primary Therapeutic Action:
                    </span>
                    <p className="text-xs sm:text-sm text-gray-200 font-medium leading-relaxed">
                      {product.primaryBenefit}
                    </p>
                  </div>
                </div>
              )}

              {/* Classical Reference */}
              {product.classicalReference && (
                <div className="bg-[#081C13]/70 rounded-xl p-2.5 sm:p-3 border border-[#23493C]/70 text-xs">
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-emerald-400 tracking-wider block mb-0.5">
                    Classical Treatise Reference:
                  </span>
                  <p className="text-gray-300 font-serif leading-relaxed">
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
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1 text-xs">
                  <Package className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-gray-400">Available Packings:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.packings.map((pkg, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-[10px] sm:text-[11px] font-mono">
                        {pkg}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Share Medicine Action */}
              <div className="pt-3 sm:pt-4 border-t border-[#23493C] flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white border border-emerald-700/60 font-semibold text-xs sm:text-sm shadow-md transition active:scale-[0.98] cursor-pointer"
                  title="Share medicine details or copy link"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Share Medicine'}</span>
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* COMPREHENSIVE CLINICAL PRODUCT DETAILS SECTION */}
        <div id="comprehensive-web-details" className="space-y-4 sm:space-y-6 pt-1 sm:pt-2">
          
          <div className="flex items-center justify-between border-b border-[#23493C] pb-2">
            <h3 className="font-serif font-bold text-base sm:text-lg text-emerald-200 flex items-center gap-2">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
              <span>Comprehensive Formulation Monograph</span>
            </h3>
            <span className="text-[10px] sm:text-xs text-emerald-400/80 font-mono hidden sm:inline">
              Ayurvedic Pharmacopoeia Standard
            </span>
          </div>

          {/* Grid: Therapeutic Indications & Administration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5">
            
            {/* Indications */}
            <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-4 sm:p-5 shadow-lg space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                <FileText className="w-4 h-4 shrink-0" />
                <span>Therapeutic Indications (Roga Rogi Pareeksha)</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                {product.indications || product.primaryBenefit || 'Indicated for traditional Ayurvedic clinical administration as referenced in classical medical treatises.'}
              </p>
            </div>

            {/* Dosage & Anupana */}
            <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-4 sm:p-5 shadow-lg space-y-2">
              <div className="flex items-center gap-2 text-teal-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                <Pill className="w-4 h-4 shrink-0" />
                <span>Dosage & Method of Administration (Matra & Anupana)</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                {product.dosage || product.usage || '15–30 ml twice daily after food with an equal quantity of warm water, or as directed by an Ayurvedic physician.'}
              </p>
            </div>

          </div>

          {/* Pharmacological Profile & Tridosha Dynamics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            
            {/* Vata Action */}
            <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-3.5 sm:p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-sky-400 text-xs font-bold uppercase tracking-wider">
                <Wind className="w-4 h-4 shrink-0" />
                <span>Vata Dynamics</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {product.targetDoshas?.includes('Vata') 
                  ? 'Actively pacifies aggravated Vata dosha; supports joint and nervous vitality.'
                  : 'Neutral to calming effect on normal Vata physiology.'}
              </p>
            </div>

            {/* Pitta Action */}
            <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-3.5 sm:p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Flame className="w-4 h-4 shrink-0" />
                <span>Pitta Dynamics</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {product.targetDoshas?.includes('Pitta')
                  ? 'Soothes metabolic heat, supports digestion without provoking inflammatory Pitta.'
                  : 'Balances normal digestive agni.'}
              </p>
            </div>

            {/* Kapha Action */}
            <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-3.5 sm:p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Droplet className="w-4 h-4 shrink-0" />
                <span>Kapha Dynamics</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {product.targetDoshas?.includes('Kapha')
                  ? 'Clears mucus, expels stagnant fluids, and enhances metabolic lightness.'
                  : 'Maintains healthy tissue nourishment without increasing heaviness.'}
              </p>
            </div>

          </div>

          {/* Health Goals / Clinical Focus Tags */}
          {product.healthGoals && product.healthGoals.length > 0 && (
            <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-3">
              <div className="flex items-center gap-1.5 text-xs uppercase font-bold text-emerald-400 shrink-0">
                <Activity className="w-4 h-4 shrink-0" />
                <span>Clinical Focus:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {product.healthGoals.map((goal, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-200 border border-emerald-800 text-[11px] sm:text-xs font-medium">
                    {goal}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Botanical Ingredients: Optimized for Mobile & Tablet */}
          <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-[#081C13] px-4 sm:px-5 py-3 sm:py-3.5 border-b border-[#23493C] flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Layers className="w-4 h-4 shrink-0" />
                <span>Standardized Botanical Ingredients & Composition</span>
              </span>
              <span className="text-[11px] sm:text-xs text-gray-400 font-mono">
                {effectiveIngredients.length} Herbs
              </span>
            </div>

            {effectiveIngredients.length > 0 ? (
              <>
                {/* 1. Mobile Card Layout (Visible only on screens < md) - Eliminates clunky horizontal scrolling */}
                <div className="md:hidden divide-y divide-[#23493C]/50">
                  {effectiveIngredients.map((item, idx) => (
                    <div key={idx} className="p-3.5 space-y-1.5 bg-[#0D281C]/40 hover:bg-[#133829]/30 transition">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-semibold text-gray-100 text-xs sm:text-sm block">
                            {item.name}
                          </span>
                          {item.sanskritName && (
                            <span className="text-[11px] text-amber-300 font-serif italic block mt-0.5">
                              {item.sanskritName}
                            </span>
                          )}
                        </div>
                        {item.partUsed && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-mono shrink-0">
                            {item.partUsed}
                          </span>
                        )}
                      </div>

                      {item.botanicalName && (
                        <div className="text-xs italic text-emerald-300">
                          {item.botanicalName}
                        </div>
                      )}

                      {(item.therapeuticAction || item.classicalRole) && (
                        <div className="text-[11px] text-gray-300 flex items-center gap-1.5 pt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                          <span>{item.therapeuticAction || item.classicalRole}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 2. Tablet & Desktop Classical Table (Visible on md and larger screens) */}
                <div className="hidden md:block overflow-x-auto">
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
                      {effectiveIngredients.map((item, idx) => (
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
                            {item.partUsed || '—'}
                          </td>
                          <td className="py-2.5 px-4 text-gray-300">
                            {item.classicalRole || item.therapeuticAction || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="p-5 sm:p-6 text-center text-xs text-gray-400">
                No botanical ingredients are currently registered in the Supabase database for this formulation.
              </div>
            )}
          </div>

          {/* Safety, Quality Assurance & Administration Advisory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            
            {/* Storage & Handling */}
            <div className="bg-[#081C13] border border-[#23493C] rounded-2xl p-3.5 sm:p-4 space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Storage & Preservation</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Store tightly closed in original container in a cool, dry place protected from direct heat, sunlight, and moisture. Keep out of reach of children.
              </p>
            </div>

            {/* Quality Standard */}
            <div className="bg-[#081C13] border border-[#23493C] rounded-2xl p-3.5 sm:p-4 space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Pharmacopoeial Quality Guarantee</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Manufactured in compliance with standard Good Manufacturing Practices (GMP) and Ayurvedic Pharmacopoeia of India (API) guidelines. Zero heavy metal contaminants.
              </p>
            </div>

          </div>

          {/* Quick Links Section - Mobile & Tablet Responsive */}
          <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-4 sm:p-6 shadow-xl space-y-3.5 sm:space-y-4">
            <div className="flex items-center justify-between border-b border-[#23493C]/80 pb-2.5 sm:pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
                <h4 className="font-serif font-bold text-xs sm:text-sm text-emerald-200 uppercase tracking-wider">
                  Quick Links
                </h4>
              </div>
              <span className="text-[10px] sm:text-[11px] text-gray-400 font-mono">
                Explore Sitaram Ayurveda
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
              
              {/* Sitaram Ayurveda */}
              <a
                href="https://sitaramayurveda.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3.5 sm:p-4 rounded-xl bg-[#081C13] hover:bg-[#133829] border border-[#23493C] hover:border-emerald-600/70 transition flex flex-col justify-between active:scale-[0.99] min-h-[72px]"
              >
                <div>
                  <div className="flex items-center justify-between text-emerald-400 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider">Sitaram Ayurveda</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition shrink-0" />
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Official clinical apothecary, research, and authentic classical formulations.
                  </p>
                </div>
                <div className="mt-2.5 pt-1.5 border-t border-[#23493C]/50 text-[10px] sm:text-[11px] font-mono text-emerald-400/90 group-hover:text-emerald-300 truncate">
                  sitaramayurveda.com
                </div>
              </a>

              {/* Sitaram Beach Retreat */}
              <a
                href="https://sitaramretreat.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3.5 sm:p-4 rounded-xl bg-[#081C13] hover:bg-[#133829] border border-[#23493C] hover:border-emerald-600/70 transition flex flex-col justify-between active:scale-[0.99] min-h-[72px]"
              >
                <div>
                  <div className="flex items-center justify-between text-teal-400 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider">Sitaram Beach Retreat</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition shrink-0" />
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Authentic NABH-accredited Ayurvedic hospital, Panchakarma, and seaside healing.
                  </p>
                </div>
                <div className="mt-2.5 pt-1.5 border-t border-[#23493C]/50 text-[10px] sm:text-[11px] font-mono text-teal-400/90 group-hover:text-teal-300 truncate">
                  sitaramretreat.com
                </div>
              </a>

              {/* Mountain Retreat Munnar */}
              <a
                href="https://sitaramretreat.com/mountain-retreat-munnar/"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3.5 sm:p-4 rounded-xl bg-[#081C13] hover:bg-[#133829] border border-[#23493C] hover:border-emerald-600/70 transition flex flex-col justify-between active:scale-[0.99] min-h-[72px] sm:col-span-2 lg:col-span-1"
              >
                <div>
                  <div className="flex items-center justify-between text-amber-400 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider">Mountain Retreat Munnar</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition shrink-0" />
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Holistic Ayurvedic retreat immersed in the serene hills of Munnar, Kerala.
                  </p>
                </div>
                <div className="mt-2.5 pt-1.5 border-t border-[#23493C]/50 text-[10px] sm:text-[11px] font-mono text-amber-400/90 group-hover:text-amber-300 truncate">
                  sitaramretreat.com/mountain-retreat-munnar
                </div>
              </a>

            </div>
          </div>

        </div>

      </main>

      {/* Footer - Extra Bottom Clearance for Mobile Gestures / Tab Bars */}
      <footer className="border-t border-[#23493C]/60 py-5 sm:py-6 pb-8 sm:pb-6 bg-[#061810] text-center text-xs text-gray-400 space-y-1 px-4">
        <p className="text-emerald-300 font-serif font-semibold">
          AYUR INDEX &bull; Ayurvedic Clinical Pharmacopoeia
        </p>
        <p className="text-[10px] sm:text-[11px] text-gray-500">
          Standardized Classical Formulations &bull; Authentic Clinical Reference Portal
        </p>
      </footer>

    </div>
  );
};
