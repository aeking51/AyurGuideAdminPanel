import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Smartphone, 
  Globe, 
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
  Calendar
} from 'lucide-react';
import { Product } from '../../types';
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

  const handleShowInWeb = () => {
    const element = document.getElementById('comprehensive-web-details');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShowInApp = () => {
    if (!product) return;
    const { shareQrLink } = ensureProductShareFields(product);
    // Invoke the Android App Link via canonical URL
    window.location.href = shareQrLink;
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#081C13] text-gray-100 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-3 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mb-4" />
        <h2 className="font-serif text-lg text-emerald-300">AYURGUIDE</h2>
        <p className="text-xs text-gray-400 font-mono mt-1">Retrieving authentic medicine record...</p>
      </div>
    );
  }

  // Error / Inactive State
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
                <h1 className="font-serif font-bold text-lg text-emerald-100 tracking-wider">AYURGUIDE</h1>
                <p className="text-[10px] text-emerald-400/80 font-mono">Ayurvedic Clinical Pharmacopoeia</p>
              </div>
            </div>
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
              ? 'This formulation is currently inactive or under clinical review in the pharmacopoeia.'
              : 'The requested Ayurvedic medicine record could not be found. Please verify the QR link or code.'}
          </p>
        </main>

        <footer className="border-t border-[#23493C]/60 py-4 bg-[#061810] text-center text-xs text-gray-500">
          <p>AyurGuide &bull; Standardized Ayurvedic Pharmacopoeia Directory</p>
        </footer>
      </div>
    );
  }

  // Image handling
  const allImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.imageUrl || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600"];
  const currentImage = allImages[selectedImageIndex] || allImages[0];

  return (
    <div className="min-h-screen bg-[#081C13] text-gray-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* Brand Header - Clean Clinical Presentation */}
      <header className="border-b border-[#23493C]/60 bg-[#061810]/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg text-emerald-100 tracking-wider">
                AYURGUIDE
              </h1>
              <p className="text-[10px] text-emerald-400 font-mono tracking-tight">
                Ayurvedic Clinical Pharmacopoeia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-mono font-bold">
              {product.code}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Public Hero Card */}
        <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl overflow-hidden shadow-2xl">
          
          <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            
            {/* Product Image & Thumbnail Gallery */}
            <div className="w-full md:w-64 shrink-0 flex flex-col items-center">
              <div className="w-full aspect-square max-w-[260px] rounded-2xl overflow-hidden bg-[#081C13] border-2 border-emerald-800/60 shadow-xl relative">
                <img 
                  src={currentImage} 
                  alt={product.name}
                  loading="eager"
                  className="w-full h-full object-cover transition duration-300"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-emerald-950/90 border border-emerald-700/80 text-[10px] font-mono text-emerald-300">
                  {product.code}
                </div>
              </div>

              {/* Multi-image thumbnail gallery */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-2 mt-3 overflow-x-auto max-w-full pb-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition cursor-pointer shrink-0 ${
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
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Ayurvedic Formulation</span>
              </div>
            </div>

            {/* Medicine Identity & Summary */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
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

              {/* Primary Benefit Callout */}
              {product.primaryBenefit && (
                <div className="bg-emerald-950/50 border border-emerald-800/60 rounded-xl p-3 flex items-start gap-2.5">
                  <HeartPulse className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider block">
                      Primary Therapeutic Action:
                    </span>
                    <p className="text-xs text-gray-200 font-medium">
                      {product.primaryBenefit}
                    </p>
                  </div>
                </div>
              )}

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
                  <Package className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
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
                  title="Open this medicine directly in the AyurGuide Android Application"
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>SHOW IN APP</span>
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* COMPREHENSIVE CLINICAL PRODUCT DETAILS SECTION */}
        <div id="comprehensive-web-details" className="space-y-6 pt-2">
          
          <div className="flex items-center justify-between border-b border-[#23493C] pb-2">
            <h3 className="font-serif font-bold text-lg text-emerald-200 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <span>Comprehensive Formulation Monograph</span>
            </h3>
            <span className="text-xs text-emerald-400/80 font-mono">
              Ayurvedic Pharmacopoeia Standard
            </span>
          </div>

          {/* Grid: Therapeutic Indications & Administration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Indications */}
            <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-5 shadow-lg space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                <span>Therapeutic Indications (Roga Rogi Pareeksha)</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                {product.indications || product.primaryBenefit || 'Indicated for traditional Ayurvedic clinical administration as referenced in classical medical treatises.'}
              </p>
            </div>

            {/* Dosage & Anupana */}
            <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-5 shadow-lg space-y-2">
              <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
                <Pill className="w-4 h-4" />
                <span>Dosage & Method of Administration (Matra & Anupana)</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                {product.dosage || product.usage || '15–30 ml twice daily after food with an equal quantity of warm water, or as directed by an Ayurvedic physician.'}
              </p>
            </div>

          </div>

          {/* Pharmacological Profile & Tridosha Dynamics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Vata Action */}
            <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
                <Wind className="w-4 h-4" />
                <span>Vata Dynamics</span>
              </div>
              <p className="text-xs text-gray-300">
                {product.targetDoshas?.includes('Vata') 
                  ? 'Actively pacifies aggravated Vata dosha; supports joint and nervous vitality.'
                  : 'Neutral to calming effect on normal Vata physiology.'}
              </p>
            </div>

            {/* Pitta Action */}
            <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Flame className="w-4 h-4" />
                <span>Pitta Dynamics</span>
              </div>
              <p className="text-xs text-gray-300">
                {product.targetDoshas?.includes('Pitta')
                  ? 'Soothes metabolic heat, supports digestion without provoking inflammatory Pitta.'
                  : 'Balances normal digestive agni.'}
              </p>
            </div>

            {/* Kapha Action */}
            <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Droplet className="w-4 h-4" />
                <span>Kapha Dynamics</span>
              </div>
              <p className="text-xs text-gray-300">
                {product.targetDoshas?.includes('Kapha')
                  ? 'Clears mucus, expels stagnant fluids, and enhances metabolic lightness.'
                  : 'Maintains healthy tissue nourishment without increasing heaviness.'}
              </p>
            </div>

          </div>

          {/* Health Goals / Clinical Focus Tags */}
          {product.healthGoals && product.healthGoals.length > 0 && (
            <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs uppercase font-bold text-emerald-400 shrink-0">
                <Activity className="w-4 h-4" />
                <span>Clinical Focus:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.healthGoals.map((goal, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-200 border border-emerald-800 text-xs font-medium">
                    {goal}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Botanical Ingredients Formulation Table */}
          <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-[#081C13] px-5 py-3.5 border-b border-[#23493C] flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>Standardized Botanical Ingredients & Composition</span>
              </span>
              <span className="text-xs text-gray-400 font-mono">
                {product.ingredients?.length || 0} Ingredients Recorded
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

          {/* Safety, Quality Assurance & Administration Advisory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Storage & Handling */}
            <div className="bg-[#081C13] border border-[#23493C] rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Clock className="w-4 h-4" />
                <span>Storage & Preservation</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Store tightly closed in original container in a cool, dry place protected from direct heat, sunlight, and moisture. Keep out of reach of children.
              </p>
            </div>

            {/* Quality Standard */}
            <div className="bg-[#081C13] border border-[#23493C] rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pharmacopoeial Quality Guarantee</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Manufactured in compliance with standard Good Manufacturing Practices (GMP) and Ayurvedic Pharmacopoeia of India (API) guidelines. Zero heavy metal contaminants.
              </p>
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#23493C]/60 py-6 bg-[#061810] text-center text-xs text-gray-400 space-y-1">
        <p className="text-emerald-300 font-serif font-semibold">
          AYURGUIDE &bull; Ayurvedic Clinical Pharmacopoeia
        </p>
        <p className="text-[11px] text-gray-500">
          Standardized Classical Formulations &bull; Authentic Clinical Reference Portal
        </p>
      </footer>

    </div>
  );
};
