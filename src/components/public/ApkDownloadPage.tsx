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
  Server
} from 'lucide-react';
import { APK_CONFIG, ApkReleaseInfo } from '../../config/apkConfig';
import { generateQrDataUrl } from '../../utils/shareUtils';
import { SupabaseService } from '../../services/supabase';
import { Product, BotanicalIngredient } from '../../types';

interface ApkDownloadPageProps {
  onNavigateHome: () => void;
}

export const ApkDownloadPage: React.FC<ApkDownloadPageProps> = ({ onNavigateHome }) => {
  // Download configuration & mirrors
  const [downloadSource, setDownloadSource] = useState<'bundled' | 'github' | 'custom'>('bundled');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // QR Code State
  const [qrTarget, setQrTarget] = useState<'apk' | 'page'>('apk');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Stepper State
  const [activeStep, setActiveStep] = useState<number>(1);

  // Live Supabase feature preview data (NO placeholder data)
  const [sampleProducts, setSampleProducts] = useState<Product[]>([]);
  const [totalProductsCount, setTotalProductsCount] = useState<number>(0);
  const [totalHerbsCount, setTotalHerbsCount] = useState<number>(0);
  const [totalCategoriesCount, setTotalCategoriesCount] = useState<number>(0);
  const [isLoadingLiveStats, setIsLoadingLiveStats] = useState<boolean>(true);

  // Active feature tab preview
  const [activeFeatureIndex, setActiveFeatureIndex] = useState<number>(0);

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
      const featured = prods.filter(p => p.status === 'Active').slice(0, 4);
      setSampleProducts(featured.length > 0 ? featured : prods.slice(0, 4));
      setIsLoadingLiveStats(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute active download URL based on selected mirror / custom URL
  const activeDownloadUrl = React.useMemo(() => {
    if (downloadSource === 'github') return APK_CONFIG.githubMirrorUrl;
    if (downloadSource === 'custom' && customUrl.trim()) return customUrl.trim();
    return APK_CONFIG.directDownloadUrl;
  }, [downloadSource, customUrl]);

  // Generate QR code whenever target or download URL changes
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ayur-guide-admin-panel.vercel.app';
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
      link.download = `ayurguide-${APK_CONFIG.version}.apk`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 5000);
      }, 1200);
    } catch {
      setIsDownloading(false);
    }
  };

  const handleCopySha256 = async () => {
    try {
      await navigator.clipboard.writeText(APK_CONFIG.sha256);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2500);
    } catch {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2500);
    }
  };

  const handleCopyPageLink = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ayur-guide-admin-panel.vercel.app';
    const url = `${origin}/download`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#081C13] text-gray-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#081C13]/95 backdrop-blur-md border-b border-[#23493C]/80 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="p-2 rounded-xl bg-[#0D281C] hover:bg-[#1A3D2E] text-emerald-400 hover:text-emerald-300 border border-[#23493C] transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Return to Ayur Index Portal"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Catalogue</span>
            </button>

            <div className="h-6 w-px bg-[#23493C]/80" />

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 p-0.5 shadow-md shadow-emerald-950 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-base tracking-tight font-serif">
                    AyurGuide
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
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>OFFICIAL STANDALONE ANDROID RELEASE &bull; BUILD {APK_CONFIG.buildNumber}</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-serif leading-tight">
                  AyurGuide for Android
                </h1>
                <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-2xl">
                  Carry the complete Ayurvedic medicine catalogue, Dravyaguna botanical herbs database, and camera barcode monograph scanner in your pocket. Built for offline clinical consultations and daily practitioner use.
                </p>
              </div>

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
                  <span className="text-gray-400">Release:</span>
                  <span className="text-gray-200">{APK_CONFIG.releaseDate}</span>
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
                        <span>Starting Download...</span>
                      </>
                    ) : downloadSuccess ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-white" />
                        <span>Download Commenced!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span>Download AyurGuide APK ({APK_CONFIG.fileSize})</span>
                      </>
                    )}
                  </button>

                  <a
                    href={APK_CONFIG.githubMirrorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3.5 px-4 rounded-xl bg-[#0D281C] hover:bg-[#1A3D2E] text-emerald-300 hover:text-white border border-[#23493C] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    title="View GitHub Releases Mirror"
                  >
                    <span>GitHub Mirror</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Mirror / Custom URL selector */}
                <div className="pt-3 border-t border-[#23493C]/60 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Download Endpoint:</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDownloadSource('bundled')}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                          downloadSource === 'bundled'
                            ? 'bg-emerald-600 text-white'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        Bundled APK
                      </button>
                      <button
                        onClick={() => setDownloadSource('github')}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                          downloadSource === 'github'
                            ? 'bg-emerald-600 text-white'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        GitHub Releases
                      </button>
                      <button
                        onClick={() => setDownloadSource('custom')}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                          downloadSource === 'custom'
                            ? 'bg-emerald-600 text-white'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        Custom URL
                      </button>
                    </div>
                  </div>

                  {downloadSource === 'custom' && (
                    <div className="flex items-center gap-2 mt-1 animate-in fade-in">
                      <input
                        type="url"
                        placeholder="https://your-cloud-bucket.com/ayurguide.apk"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        className="flex-1 bg-[#061810] border border-[#23493C] rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span className="font-mono truncate max-w-[280px] sm:max-w-md text-emerald-300/70">
                      Target: {activeDownloadUrl}
                    </span>
                    <span className="shrink-0 text-emerald-400/90 font-medium">Free &bull; Open Release</span>
                  </div>
                </div>

              </div>

              {/* SHA-256 Checksum Card */}
              <div className="p-3 bg-[#081C13]/60 rounded-xl border border-[#23493C]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-gray-400 font-mono shrink-0">SHA-256:</span>
                  <code className="text-emerald-300/90 font-mono text-[11px] truncate">
                    {APK_CONFIG.sha256}
                  </code>
                </div>
                <button
                  onClick={handleCopySha256}
                  className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 rounded-md transition-colors text-[11px] flex items-center gap-1 shrink-0"
                >
                  {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHash ? 'Hash Copied' : 'Copy Hash'}</span>
                </button>
              </div>

            </div>

            {/* Right 5 Columns: Mobile QR Code Scanner Card */}
            <div className="lg:col-span-5 flex flex-col items-center">
              
              <div className="w-full max-w-sm bg-[#0D281C] border border-[#23493C] rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center relative">
                
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-white text-base">Mobile Direct QR Scanner</h3>
                </div>

                <p className="text-xs text-gray-300 mb-4">
                  Open your Android camera and point it at this QR code to download directly to your smartphone.
                </p>

                {/* QR Target Mode Selector */}
                <div className="w-full flex rounded-xl bg-[#081C13] p-1 border border-[#23493C] mb-4 text-xs">
                  <button
                    onClick={() => setQrTarget('apk')}
                    className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                      qrTarget === 'apk'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Direct APK Link
                  </button>
                  <button
                    onClick={() => setQrTarget('page')}
                    className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                      qrTarget === 'page'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Open Page on Phone
                  </button>
                </div>

                {/* QR Code Presentation Box */}
                <div className="relative p-3 bg-white rounded-2xl shadow-xl border-4 border-emerald-500/50 mb-3 group">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="AyurGuide Android Download QR Code"
                      className="w-52 h-52 rounded-lg object-contain"
                    />
                  ) : (
                    <div className="w-52 h-52 flex items-center justify-center bg-gray-100 rounded-lg">
                      <div className="w-8 h-8 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
                    </div>
                  )}

                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#081C13] border border-emerald-400/60 text-emerald-300 px-3 py-0.5 rounded-full text-[10px] font-mono tracking-wider shadow">
                    SCAN WITH CAMERA
                  </div>
                </div>

                <div className="w-full mt-3 pt-3 border-t border-[#23493C]/60 flex items-center justify-between text-[11px] text-gray-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Android 8.0 to 14</span>
                  </span>
                  <span className="font-mono text-emerald-300">
                    {APK_CONFIG.fileSize}
                  </span>
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
              How to Install AyurGuide on Android
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
                  This standard security notification appears for all APKs downloaded directly from websites. AyurGuide is clean, verified, and distributed directly from the official Ayur Index platform. Tap <strong className="text-emerald-300">Download anyway</strong> with complete confidence.
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

        {/* LIVE FEATURE PREVIEW & SUPABASE SHOWCASE */}
        <section className="space-y-6 pt-4">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Connected to Supabase
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif mt-2">
                Interactive App Feature Preview
              </h2>
              <p className="text-sm text-gray-400">
                Explore key features packed inside the AyurGuide Android app, synchronized directly with Ayur Index live cloud records.
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

              {/* Mock Mobile Viewport with Real Data */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-xs bg-[#081C13] border-4 border-[#23493C] rounded-[2.5rem] p-3 shadow-2xl relative overflow-hidden">
                  
                  {/* Phone Speaker Notch */}
                  <div className="w-24 h-4 bg-[#23493C] rounded-full mx-auto mb-3" />

                  {/* Mobile Screen Content */}
                  <div className="bg-[#0A261A] rounded-2xl p-3 border border-[#23493C]/60 space-y-3 min-h-[380px] flex flex-col justify-between">
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] pb-2 border-b border-[#23493C]/60">
                        <span className="font-serif font-bold text-white flex items-center gap-1">
                          <Pill className="w-3.5 h-3.5 text-emerald-400" />
                          <span>AyurGuide Mobile</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">Offline Ready</span>
                      </div>

                      {/* Search Bar Preview */}
                      <div className="bg-[#061810] border border-[#23493C] rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-xs text-gray-400">
                        <Search className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[11px] text-gray-400">Search 300+ formulations...</span>
                      </div>

                      {/* Live medicine cards from Supabase */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">
                          Formulary Index:
                        </span>
                        {sampleProducts.slice(0, 3).map((prod) => (
                          <div 
                            key={prod.id}
                            className="bg-[#081C13] border border-[#23493C]/80 rounded-lg p-2 text-left space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-white truncate max-w-[150px]">
                                {prod.name}
                              </span>
                              <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 px-1 rounded">
                                {prod.code}
                              </span>
                            </div>
                            <p className="text-[10px] text-emerald-400/80 truncate">
                              {prod.sanskritName || prod.categoryName || 'Classical Ayurvedic Medicine'}
                            </p>
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
              Everything you need to know about downloading and sideloading the AyurGuide Android APK.
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
            Direct APK File
          </a>
          <span>&bull;</span>
          <a href={APK_CONFIG.githubMirrorUrl} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300 underline underline-offset-4">
            GitHub Releases
          </a>
        </div>
        <p>
          AyurGuide Android Companion &bull; Ayur Index Clinical Formulary System &bull; Powered by Live Supabase
        </p>
      </footer>

    </div>
  );
};
