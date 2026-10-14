import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Download, 
  QrCode, 
  ShieldCheck, 
  Sparkles, 
  BookOpen, 
  Database, 
  Layers, 
  Copy, 
  Check, 
  ArrowLeft, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ChevronRight, 
  HelpCircle, 
  FileCode, 
  Share2, 
  RefreshCw, 
  Search, 
  Pill, 
  Terminal, 
  Server, 
  Clock, 
  Radio,
  Sliders,
  Star,
  Settings,
  Power
} from 'lucide-react';
import { APK_CONFIG, ApkReleaseInfo, ApkVersionArchive } from '../../config/apkConfig';
import { generateQrDataUrl } from '../../utils/shareUtils';
import { SupabaseService } from '../../services/supabase';
import { ApkStorageService, StorageStatusResult } from '../../services/apkStorageService';
import { ApkLinkManagerService, ManagedApkLink } from '../../services/apkLinkManagerService';
import { ReleaseManagerModal } from '../admin/ReleaseManagerModal';
import { Product, BotanicalIngredient } from '../../types';

interface ApkDownloadPageProps {
  onNavigateHome: () => void;
  onNavigateToProduct?: (slug: string) => void;
}

export const ApkDownloadPage: React.FC<ApkDownloadPageProps> = ({ 
  onNavigateHome,
  onNavigateToProduct
}) => {
  // Managed Distribution Links (Supabase, Vercel & Custom mirrors)
  const [managedLinks, setManagedLinks] = useState<ManagedApkLink[]>(() => ApkLinkManagerService.getLinks());
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState<boolean>(false);

  // Download configuration & mirrors (Default to Supabase Storage CDN)
  const [downloadSource, setDownloadSource] = useState<'supabase_cdn' | 'vercel'>('supabase_cdn');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Supabase Storage CDN Health Status
  const [storageStatus, setStorageStatus] = useState<StorageStatusResult | null>(null);
  const [isCheckingCdn, setIsCheckingCdn] = useState<boolean>(false);

  // QR Code State
  const [qrTarget, setQrTarget] = useState<'apk' | 'page'>('apk');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Stepper State
  const [activeStep, setActiveStep] = useState<number>(1);

  // Live Supabase feature preview data (NO placeholder data - strictly from Supabase)
  const [sampleProducts, setSampleProducts] = useState<Product[]>([]);
  const [totalProductsCount, setTotalProductsCount] = useState<number>(0);
  const [totalHerbsCount, setTotalHerbsCount] = useState<number>(0);
  const [totalCategoriesCount, setTotalCategoriesCount] = useState<number>(0);
  const [isLoadingLiveStats, setIsLoadingLiveStats] = useState<boolean>(true);

  // Active feature tab preview
  const [activeFeatureIndex, setActiveFeatureIndex] = useState<number>(0);

  // Subscribe to live link updates across components
  useEffect(() => {
    const unsubscribe = ApkLinkManagerService.subscribe((links) => {
      setManagedLinks(links);
    });
    return unsubscribe;
  }, []);

  // Check Supabase Storage CDN status on load
  const refreshStorageStatus = () => {
    setIsCheckingCdn(true);
    ApkStorageService.checkCloudReleaseStatus()
      .then(res => setStorageStatus(res))
      .finally(() => setIsCheckingCdn(false));
  };

  useEffect(() => {
    refreshStorageStatus();
  }, []);

  // Fetch real Supabase records for feature preview (strict rule: no placeholders)
  useEffect(() => {
    let isMounted = true;
    setIsLoadingLiveStats(true);

    Promise.all([
      SupabaseService.fetchProducts().catch(() => []),
      SupabaseService.fetchBotanicalIngredients().catch(() => []),
      SupabaseService.fetchCategories().catch(() => [])
    ]).then(([prods, herbs, cats]) => {
      if (!isMounted) return;
      setTotalProductsCount(prods.length);
      setTotalHerbsCount(herbs.length);
      setTotalCategoriesCount(cats.length);
      // Pick top 4 active products for live preview showcase
      const featured = prods.filter(p => p.status === 'Active' && p.imageUrl).slice(0, 4);
      setSampleProducts(featured.length > 0 ? featured : prods.slice(0, 4));
      setIsLoadingLiveStats(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Resolve managed links for Supabase & Vercel
  const supabaseLink = managedLinks.find(l => l.id === 'supabase') || {
    id: 'supabase',
    name: 'Supabase Cloud Storage',
    badge: 'Supabase CDN',
    url: APK_CONFIG.supabaseLatestApkUrl,
    defaultUrl: APK_CONFIG.supabaseLatestApkUrl,
    isActive: true,
    isPrimary: true,
    description: 'Permanent latest pointer hosted on Supabase Storage bucket.'
  };

  const vercelLink = managedLinks.find(l => l.id === 'vercel') || {
    id: 'vercel',
    name: 'Vercel Blob Mirror',
    badge: 'Vercel Edge',
    url: APK_CONFIG.vercelMirrorUrl,
    defaultUrl: APK_CONFIG.vercelMirrorUrl,
    isActive: true,
    isPrimary: false,
    description: 'High-speed redundant blob mirror hosted on Vercel Storage edge infrastructure.'
  };

  // Compute active download URL based on selected mirror, active states, and primary configuration
  const activeDownloadUrl = React.useMemo(() => {
    if (downloadSource === 'vercel') {
      if (vercelLink.isActive) return vercelLink.url;
      if (supabaseLink.isActive) return supabaseLink.url;
    }
    // Default or 'supabase_cdn'
    if (supabaseLink.isActive) return supabaseLink.url;
    if (vercelLink.isActive) return vercelLink.url;

    // Fallback to primary active link or default
    const primary = ApkLinkManagerService.getPrimaryActiveLink();
    return primary ? primary.url : APK_CONFIG.supabaseLatestApkUrl;
  }, [downloadSource, supabaseLink, vercelLink]);

  // Generate QR code whenever target or download URL changes
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ayurindex.app';
    const targetUrl = qrTarget === 'apk' 
      ? (activeDownloadUrl.startsWith('http') ? activeDownloadUrl : `${origin}${activeDownloadUrl}`)
      : `${origin}/download`;

    generateQrDataUrl(targetUrl, 380)
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Error generating APK QR:', err));
  }, [qrTarget, activeDownloadUrl]);

  const handleDownloadClick = () => {
    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      const link = document.createElement('a');
      link.href = activeDownloadUrl;
      link.download = `AyurIndex.apk`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadSuccess(true);
      }, 1200);

      setTimeout(() => {
        setDownloadSuccess(false);
      }, 6000);
    } catch (e) {
      console.error('Download error:', e);
      setIsDownloading(false);
    }
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(APK_CONFIG.sha256).then(() => {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2500);
    });
  };

  const handleCopyPageLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ayurindex.app';
    navigator.clipboard.writeText(`${origin}/download`).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  return (
    <div className="min-h-screen bg-[#081C13] text-gray-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* Top Navigation Header */}
      <header className="border-b border-[#23493C]/80 bg-[#061810]/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="p-2 rounded-xl bg-[#0D281C] hover:bg-[#1A3D2E] text-emerald-300 border border-[#23493C] transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Return to Clinical Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Index</span>
            </button>

            <div className="h-6 w-px bg-[#23493C]/80" />

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-emerald-500/40 shadow-md shadow-emerald-950 flex items-center justify-center bg-[#061810] flex-shrink-0">
                <img 
                  src="/img/sitaram_ayuveda_luxury_logo.jpg" 
                  alt="Ayur Index Official Luxury Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-base tracking-tight font-serif">
                    Ayur Index
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
                    Android APK {APK_CONFIG.version}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400/80 hidden sm:block">
                  Companion mobile formulary for clinical Ayurveda
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopyPageLink}
              className="py-1.5 px-3 bg-[#0D281C] hover:bg-[#1A3D2E] text-emerald-300 border border-[#23493C] rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Link Copied' : 'Share Page'}</span>
            </button>

            <button
              onClick={handleDownloadClick}
              className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950/80 transition-all hover:shadow-emerald-600/30"
            >
              <Download className="w-4 h-4" />
              <span>Download APK</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* HERO SECTION */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0D281C] via-[#0B2318] to-[#081C13] border border-[#23493C] p-6 sm:p-10 shadow-2xl">
          
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left 7 Columns: Product Intro & Download Actions */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-emerald-400/60 shadow-2xl shadow-emerald-950/80 bg-[#061810] p-1 flex-shrink-0 group hover:border-emerald-300 transition-all duration-300">
                  <img 
                    src="/img/sitaram_ayuveda_luxury_logo.jpg" 
                    alt="Ayur Index Official Luxury App Logo" 
                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>OFFICIAL STANDALONE ANDROID RELEASE &bull; BUILD {APK_CONFIG.buildNumber}</span>
                    </div>

                    {/* Supabase Storage Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#081C13] border border-[#23493C] text-[11px] font-mono text-gray-300">
                      <Database className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Supabase Cloud Storage CDN</span>
                    </div>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-serif leading-tight">
                    Ayur Index for Android
                  </h1>
                </div>
              </div>

              <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-2xl">
                Carry the complete Ayurvedic medicine catalogue, formulation monographs, Dravyaguna botanical herbs database, and camera barcode monograph scanner in your pocket. Built for offline clinical consultations and daily practitioner use.
              </p>

              {/* Version & System Spec Badges */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-[#081C13] border border-[#23493C] flex items-center gap-2">
                  <span className="text-gray-400">Version:</span>
                  <span className="font-mono text-emerald-300 font-semibold">{APK_CONFIG.version}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-[#081C13] border border-[#23493C] flex items-center gap-2">
                  <span className="text-gray-400">File Size:</span>
                  <span className="font-mono text-emerald-300 font-semibold">{APK_CONFIG.fileSize}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-[#081C13] border border-[#23493C] flex items-center gap-2">
                  <span className="text-gray-400">Requires:</span>
                  <span className="text-gray-200">{APK_CONFIG.minAndroid}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-[#081C13] border border-[#23493C] flex items-center gap-2">
                  <span className="text-gray-400">Distribution:</span>
                  <span className="text-emerald-400 font-mono">Supabase Object CDN</span>
                </div>
              </div>

              {/* Primary Call to Action Download Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#081C13]/90 border border-emerald-500/40 shadow-xl space-y-4">
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={handleDownloadClick}
                    disabled={isDownloading}
                    className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-950 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {isDownloading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Connecting to Cloud CDN...</span>
                      </>
                    ) : downloadSuccess ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-white" />
                        <span>Download Commenced!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span>Download Ayur Index APK ({APK_CONFIG.fileSize})</span>
                      </>
                    )}
                  </button>

                  {vercelLink.isActive ? (
                    <a
                      href={vercelLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3.5 px-4 rounded-xl bg-[#0D281C] hover:bg-[#1A3D2E] text-emerald-300 border border-[#23493C] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
                      title="Download from high-speed secondary Vercel storage mirror"
                    >
                      <ExternalLink className="w-4 h-4 text-emerald-400" />
                      <span>Vercel Mirror</span>
                    </a>
                  ) : (
                    <button
                      onClick={() => setIsReleaseModalOpen(true)}
                      className="py-3.5 px-4 rounded-xl bg-[#0D281C]/60 hover:bg-[#1A3D2E] text-gray-400 hover:text-emerald-300 border border-[#23493C] font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
                      title="Manage and configure APK distribution endpoints"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Manage Mirrors</span>
                    </button>
                  )}
                </div>

                {/* SHA256 Verification String */}
                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-[#23493C]/60 flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-gray-400 uppercase font-bold text-[10px]">SHA-256:</span>
                    <span className="text-emerald-300 select-all truncate max-w-[200px] sm:max-w-xs">
                      {APK_CONFIG.sha256}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyHash}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono text-[10px]"
                  >
                    {copiedHash ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHash ? 'Checksum Copied' : 'Copy Checksum'}</span>
                  </button>
                </div>

              </div>

              {/* CDN Edge Source & Download Routing */}
              <div className="p-4 rounded-2xl bg-[#0D281C]/60 border border-[#23493C] space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-semibold text-emerald-200 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-emerald-400" />
                    CDN Edge Source &amp; Download Routing
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 hidden sm:inline">
                      Auto-selected: {downloadSource === 'vercel' ? (vercelLink.isActive ? 'Vercel Mirror' : 'Supabase CDN') : (supabaseLink.isActive ? 'Supabase CDN' : 'Vercel Mirror')}
                    </span>
                    <button
                      onClick={() => setIsReleaseModalOpen(true)}
                      className="py-1 px-2.5 rounded-lg bg-[#081C13] hover:bg-[#153426] text-emerald-300 border border-[#23493C] text-[11px] font-semibold flex items-center gap-1.5 transition shadow-sm"
                      title="Edit links, toggle active/inactive status, test reachability, or add mirrors"
                    >
                      <Sliders className="w-3 h-3 text-emerald-400" />
                      <span>Manage Cloud Links</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {/* Supabase CDN Option */}
                  <button
                    onClick={() => {
                      if (!supabaseLink.isActive) {
                        setIsReleaseModalOpen(true);
                      } else {
                        setDownloadSource('supabase_cdn');
                      }
                    }}
                    className={`py-2.5 px-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      !supabaseLink.isActive
                        ? 'bg-[#06140E]/60 border-red-950/40 text-gray-500 opacity-60 hover:opacity-100'
                        : downloadSource === 'supabase_cdn' 
                          ? 'bg-emerald-600/30 border-emerald-400 text-white shadow' 
                          : 'bg-[#081C13] border-[#23493C] text-gray-300 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>Supabase CDN</span>
                        {supabaseLink.isPrimary && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Primary
                          </span>
                        )}
                        {!supabaseLink.isActive && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-emerald-400/80">
                        {supabaseLink.isActive ? 'Official Storage Bucket • High Speed' : 'Disabled in link manager (Click to enable)'}
                      </div>
                    </div>
                    {supabaseLink.isActive && downloadSource === 'supabase_cdn' && (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                  </button>

                  {/* Vercel Mirror Option */}
                  <button
                    onClick={() => {
                      if (!vercelLink.isActive) {
                        setIsReleaseModalOpen(true);
                      } else {
                        setDownloadSource('vercel');
                      }
                    }}
                    className={`py-2.5 px-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      !vercelLink.isActive
                        ? 'bg-[#06140E]/60 border-red-950/40 text-gray-500 opacity-60 hover:opacity-100'
                        : downloadSource === 'vercel' 
                          ? 'bg-emerald-600/30 border-emerald-400 text-white shadow' 
                          : 'bg-[#081C13] border-[#23493C] text-gray-300 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>Vercel Mirror</span>
                        {vercelLink.isPrimary && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Primary
                          </span>
                        )}
                        {!vercelLink.isActive && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-emerald-400/80">
                        {vercelLink.isActive ? 'Secondary Edge • Vercel Blob Storage' : 'Disabled in link manager (Click to enable)'}
                      </div>
                    </div>
                    {vercelLink.isActive && downloadSource === 'vercel' && (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                  </button>
                </div>
              </div>

            </div>

            {/* Right 5 Columns: QR Code Scanner for Mobile Visitors */}
            <div className="lg:col-span-5 flex flex-col items-center">
              
              <div className="w-full max-w-sm rounded-3xl bg-[#0D281C] border border-emerald-500/40 p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
                
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />
                
                <div className="w-full flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <img 
                      src="/img/sitaram_ayuveda_luxury_logo.jpg" 
                      alt="Logo" 
                      className="w-5 h-5 rounded-md object-cover border border-emerald-400/50" 
                    />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Scan to Mobile
                    </span>
                  </div>
                  
                  {/* QR Target Switch */}
                  <div className="flex bg-[#081C13] rounded-lg p-0.5 border border-[#23493C] text-[10px]">
                    <button
                      onClick={() => setQrTarget('apk')}
                      className={`px-2 py-0.5 rounded-md font-mono transition-colors ${
                        qrTarget === 'apk' ? 'bg-emerald-600 text-white font-bold' : 'text-gray-400'
                      }`}
                    >
                      Cloud APK
                    </button>
                    <button
                      onClick={() => setQrTarget('page')}
                      className={`px-2 py-0.5 rounded-md font-mono transition-colors ${
                        qrTarget === 'page' ? 'bg-emerald-600 text-white font-bold' : 'text-gray-400'
                      }`}
                    >
                      Web Portal
                    </button>
                  </div>
                </div>

                {/* QR Code Canvas Frame */}
                <div className="relative p-3 bg-white rounded-2xl shadow-xl border-4 border-emerald-500/30 mb-4 group cursor-pointer">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Ayur Index Android Download QR Code"
                      className="w-52 h-52 sm:w-60 sm:h-60 rounded-lg object-contain"
                    />
                  ) : (
                    <div className="w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center bg-gray-100 rounded-lg">
                      <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                    </div>
                  )}

                  {/* Corner Target Accents */}
                  <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-600" />
                  <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-600" />
                  <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-600" />
                  <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-600" />
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-white">
                    Point Phone Camera to Scan
                  </p>
                  <p className="text-[11px] text-gray-400 max-w-[240px]">
                    {qrTarget === 'apk' 
                      ? 'Triggers instant direct download of ayurindex-latest.apk from Supabase Storage' 
                      : 'Opens this interactive installation portal directly on mobile'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#23493C]/60 w-full flex items-center justify-center gap-2 text-[11px] text-emerald-300 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Hosted in Supabase Storage &bull; Verified Safe</span>
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* STEP-BY-STEP SIDELOADING / INSTALLATION GUIDE */}
        <section className="space-y-6">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Zero Friction Setup
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif">
              How to Install Ayur Index on Android
            </h2>
            <p className="text-sm text-gray-400">
              Follow these 4 simple steps to install the APK directly without requiring a Google Play account.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {APK_CONFIG.installSteps.map((step) => {
              const isSelected = activeStep === step.step;
              return (
                <div
                  key={step.step}
                  onClick={() => setActiveStep(step.step)}
                  className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#0E3524] border-emerald-400 shadow-xl shadow-emerald-950/60 scale-[1.02]'
                      : 'bg-[#0D281C]/70 hover:bg-[#0D281C] border-[#23493C]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono font-bold text-sm flex items-center justify-center">
                        {step.step}
                      </span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        isSelected ? 'bg-emerald-500 text-white' : 'bg-[#081C13] text-gray-400 border border-[#23493C]'
                      }`}>
                        {step.badge}
                      </span>
                    </div>

                    <h3 className="font-semibold text-white text-base">
                      {step.title}
                    </h3>

                    <p className="text-xs text-gray-300 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#23493C]/60 flex items-start gap-1.5 text-[11px] text-emerald-300/90 bg-[#081C13]/60 p-2 rounded-lg">
                    <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{step.tip}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Android Security Clarification Callout */}
          <div className="rounded-2xl bg-[#092217] border border-emerald-500/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-white">
                  Why does Android show "File might be harmful"?
                </h4>
                <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
                  This standard security notification appears for all APKs downloaded directly from websites. Ayur Index is clean, verified, and distributed directly from our authenticated Supabase Storage bucket. Tap <strong className="text-emerald-300">Download anyway</strong> with complete confidence.
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadClick}
              className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shrink-0 transition-colors shadow-md"
            >
              Start APK Download
            </button>
          </div>

        </section>

        {/* VERSION ARCHIVE & RELEASE HISTORY (SUPABASE STORAGE) */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-medium">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Permanent Release Archive
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif mt-2">
                Version History &amp; Changelogs
              </h2>
              <p className="text-sm text-gray-400">
                Download historical verified releases or audit cryptographic SHA-256 signatures stored in Supabase.
              </p>
            </div>

            <div className="text-xs text-gray-400">
              Total archived builds: <span className="font-mono text-emerald-300 font-semibold">{APK_CONFIG.archiveReleases.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {APK_CONFIG.archiveReleases.map(rel => (
              <div
                key={rel.version}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  rel.isLatest
                    ? 'bg-[#0E3524] border-emerald-400 shadow-xl shadow-emerald-950/60'
                    : 'bg-[#0D281C]/70 hover:bg-[#0D281C] border-[#23493C]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold font-mono text-white">{rel.version}</span>
                      {rel.isLatest && (
                        <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-mono font-semibold">
                          Latest
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 font-mono">{rel.fileSize}</span>
                  </div>

                  <div className="text-xs text-gray-400 flex items-center gap-2">
                    <span>{rel.releaseDate}</span>
                    <span>&bull;</span>
                    <span>{rel.minAndroid}</span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-mono text-gray-400 tracking-wider block">
                      Release Highlights:
                    </span>
                    {rel.highlights.map((h, i) => (
                      <div key={i} className="text-xs text-gray-300 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#23493C]/60 flex items-center justify-between">
                  <div className="text-[10px] font-mono text-gray-400 truncate max-w-[140px]" title={rel.sha256}>
                    SHA: {rel.sha256.substring(0, 10)}...
                  </div>

                  <a
                    href={rel.cloudStorageUrl}
                    download
                    className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LIVE FEATURE PREVIEW & SUPABASE SHOWCASE */}
        <section className="space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-medium">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                Connected to Supabase
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif mt-2">
                Interactive App Feature Preview
              </h2>
              <p className="text-sm text-gray-400">
                Explore key features packed inside the Ayur Index Android app, synchronized directly with live cloud records.
              </p>
            </div>

            {/* Live Database Metrics Counter */}
            <div className="flex items-center gap-3 bg-[#0D281C] border border-[#23493C] p-2.5 rounded-2xl text-xs">
              <div className="px-3 py-1 bg-[#081C13] rounded-xl border border-[#23493C] text-center">
                <span className="block text-gray-400 text-[10px] uppercase">Medicines</span>
                <span className="font-mono text-emerald-300 font-bold text-sm">
                  {isLoadingLiveStats ? '...' : totalProductsCount}
                </span>
              </div>
              <div className="px-3 py-1 bg-[#081C13] rounded-xl border border-[#23493C] text-center">
                <span className="block text-gray-400 text-[10px] uppercase">Botanicals</span>
                <span className="font-mono text-emerald-300 font-bold text-sm">
                  {isLoadingLiveStats ? '...' : totalHerbsCount}
                </span>
              </div>
              <div className="px-3 py-1 bg-[#081C13] rounded-xl border border-[#23493C] text-center">
                <span className="block text-gray-400 text-[10px] uppercase">Categories</span>
                <span className="font-mono text-emerald-300 font-bold text-sm">
                  {isLoadingLiveStats ? '...' : totalCategoriesCount}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Feature Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {APK_CONFIG.features.map((feat, idx) => {
              const isTabActive = activeFeatureIndex === idx;
              return (
                <button
                  key={feat.id}
                  onClick={() => setActiveFeatureIndex(idx)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isTabActive
                      ? 'bg-[#103E2B] border-emerald-400 text-white shadow-lg'
                      : 'bg-[#0D281C]/70 hover:bg-[#0D281C] border-[#23493C] text-gray-300'
                  }`}
                >
                  <span className="text-[10px] font-mono text-emerald-400 block mb-1">
                    {feat.tag}
                  </span>
                  <span className="text-xs font-semibold line-clamp-1">
                    {feat.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Feature Showcase Body */}
          <div className="rounded-3xl bg-[#0D281C] border border-[#23493C] p-6 sm:p-8 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Feature Details */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-medium">
                  {APK_CONFIG.features[activeFeatureIndex].tag}
                </div>
                <h3 className="text-2xl font-bold text-white font-serif">
                  {APK_CONFIG.features[activeFeatureIndex].title}
                </h3>
                <p className="text-sm font-medium text-emerald-400">
                  {APK_CONFIG.features[activeFeatureIndex].subtitle}
                </p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {APK_CONFIG.features[activeFeatureIndex].description}
                </p>

                {/* Key Benefits Checklist */}
                <div className="space-y-2 pt-2">
                  {APK_CONFIG.releaseHighlights.slice(0, 3).map((hl, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <button
                    onClick={handleDownloadClick}
                    className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download App for Android</span>
                  </button>
                </div>
              </div>

              {/* Mock Mobile Viewport with Real Data & Photos */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-xs bg-[#081C13] border-4 border-[#23493C] rounded-[2.5rem] p-3 shadow-2xl relative overflow-hidden">
                  
                  {/* Phone Speaker Notch */}
                  <div className="w-24 h-4 bg-[#23493C] rounded-full mx-auto mb-3" />

                  {/* Mobile Screen Content */}
                  <div className="bg-[#0A261A] rounded-2xl p-3 border border-[#23493C]/60 space-y-3 min-h-[380px] flex flex-col justify-between">
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] pb-2 border-b border-[#23493C]/60">
                        <span className="font-serif font-bold text-white flex items-center gap-1.5">
                          <img 
                            src="/img/sitaram_ayuveda_luxury_logo.jpg" 
                            alt="Logo" 
                            className="w-4 h-4 rounded-full object-cover border border-emerald-400/50" 
                          />
                          <span>Ayur Index Mobile</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">Offline Ready</span>
                      </div>

                      {/* Search Bar Preview */}
                      <div className="bg-[#061810] border border-[#23493C] rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-xs text-gray-400">
                        <Search className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[11px] text-gray-400">Search 300+ formulations...</span>
                      </div>

                      {/* Live medicine cards from Supabase with Authentic Photos */}
                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">
                          Formulary Index:
                        </span>
                        {sampleProducts.slice(0, 3).map((prod) => (
                          <div 
                            key={prod.id}
                            className="bg-[#081C13] border border-[#23493C]/80 rounded-lg p-2 text-left flex items-center gap-2.5 hover:border-emerald-500/50 transition-colors"
                          >
                            <div className="w-10 h-10 rounded-lg bg-[#061810] border border-emerald-800/60 overflow-hidden shrink-0">
                              <img 
                                src={prod.imageUrl || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600'} 
                                alt={prod.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600';
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-white truncate max-w-[130px]">
                                  {prod.name}
                                </span>
                                <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 px-1 rounded">
                                  {prod.code}
                                </span>
                              </div>
                              <p className="text-[10px] text-emerald-400/80 truncate">
                                {prod.categoryName || 'Classical Medicine'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center text-[10px] text-emerald-300">
                      Tap QR scanner to verify clinic medicine bottle
                    </div>

                  </div>

                  {/* Phone Bottom Home Bar */}
                  <div className="w-28 h-1 bg-gray-500 rounded-full mx-auto mt-3" />

                </div>
              </div>

            </div>
          </div>

        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section className="space-y-6 pt-4">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-white font-serif">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              Everything you need to know about downloading and sideloading the Ayur Index Android APK.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {APK_CONFIG.faq.map((item, idx) => (
              <div 
                key={idx}
                className="rounded-2xl bg-[#0D281C]/70 border border-[#23493C] p-5 space-y-2 text-left"
              >
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{item.question}</span>
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed pl-6">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Public Footer */}
      <footer className="border-t border-[#23493C]/80 py-8 bg-[#061810] text-center text-xs text-emerald-400/70 mt-12 space-y-2">
        <div className="flex items-center justify-center gap-3">
          <button onClick={onNavigateHome} className="hover:text-emerald-300 underline underline-offset-4">
            Ayur Index Home
          </button>
          <span>&bull;</span>
          <a href={activeDownloadUrl} download className="hover:text-emerald-300 underline underline-offset-4">
            Direct Cloud APK
          </a>
          <span>&bull;</span>
          <a href={vercelLink.url} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300 underline underline-offset-4">
            Vercel Mirror
          </a>
          <span>&bull;</span>
          <button 
            onClick={() => setIsReleaseModalOpen(true)}
            className="hover:text-emerald-300 underline underline-offset-4 flex items-center gap-1 inline-flex"
          >
            <Sliders className="w-3 h-3" />
            <span>Manage Cloud Links</span>
          </button>
        </div>
        <div className="flex items-center justify-center gap-2">
          <img 
            src="/img/sitaram_ayuveda_luxury_logo.jpg" 
            alt="Ayur Index Logo" 
            className="w-4 h-4 rounded-full object-cover border border-emerald-400/40 inline-block" 
          />
          <p>
            Ayur Index Android Companion &bull; Powered by Live Supabase Storage CDN
          </p>
        </div>
      </footer>

      {/* Cloud Hosting & Link Manager Modal */}
      {isReleaseModalOpen && (
        <ReleaseManagerModal
          isOpen={isReleaseModalOpen}
          onClose={() => setIsReleaseModalOpen(false)}
        />
      )}

    </div>
  );
};
