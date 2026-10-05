import React, { useState, useEffect } from 'react';
import { 
  X, 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  Share2, 
  ExternalLink,
  Sparkles,
  Smartphone,
  Printer,
  ShieldCheck
} from 'lucide-react';
import { Product } from '../../types';
import { 
  generateQrDataUrl, 
  generatePrintableQrCard, 
  ensureProductShareFields 
} from '../../utils/shareUtils';

interface ProductQRModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductQRModal: React.FC<ProductQRModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isGeneratingDownload, setIsGeneratingDownload] = useState<boolean>(false);
  const [downloadMode, setDownloadMode] = useState<'card' | 'qr-only'>('card');
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (!product || !isOpen) {
      setQrDataUrl('');
      setCopied(false);
      setShareSuccess(false);
      return;
    }

    const { shareQrLink } = ensureProductShareFields(product);

    // Dynamically generate QR code encoding ONLY the canonical share_qr_link
    generateQrDataUrl(shareQrLink, 360)
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Failed to generate QR:', err));
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const { shareQrLink, publicSlug } = ensureProductShareFields(product);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareQrLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = shareQrLink;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} | AyurGuide`,
          text: `${product.name} (${product.code})\nView authentic Ayurvedic medicine details in AyurGuide:`,
          url: shareQrLink,
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownload = async () => {
    setIsGeneratingDownload(true);
    try {
      let downloadUrl = qrDataUrl;
      let filename = `AyurGuide-QR-${publicSlug}.png`;

      if (downloadMode === 'card') {
        downloadUrl = await generatePrintableQrCard(shareQrLink, product.name, product.code);
        filename = `AyurGuide-Printable-Card-${publicSlug}.png`;
      } else {
        // Pure high-res QR (800x800)
        downloadUrl = await generateQrDataUrl(shareQrLink, 800);
      }

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsGeneratingDownload(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 qr-modal-overlay">
      
      {/* ======================================================== */}
      {/* 1. ON-SCREEN INTERACTIVE MODAL DIALOG (HIDDEN ON PRINT)  */}
      {/* ======================================================== */}
      <div 
        className="no-print bg-[#081C13] border border-[#23493C] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 qr-modal-dialog"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0D281C] to-[#0A2217] px-6 py-4 border-b border-[#23493C] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-gray-100 tracking-wide">
                SHARE PRODUCT
              </h3>
              <p className="text-[11px] text-emerald-400/90 font-mono">
                Universal Canonical QR & App Link
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-emerald-950 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Medicine Identity Card */}
          <div className="bg-[#0D281C] border border-[#23493C] rounded-xl p-4 flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold mb-0.5">
                Medicine Details
              </div>
              <h4 className="font-serif font-bold text-lg text-gray-100">
                {product.name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-amber-300 border border-emerald-800/80">
                  Code: {product.code}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                  {product.categoryName || 'Ayurvedic Medicine'}
                </span>
              </div>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
              product.status === 'Active'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
            }`}>
              {product.status}
            </span>
          </div>

          {/* QR Code Display Canvas */}
          <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#0D281C]/90 to-[#071710] rounded-2xl border border-emerald-800/40 relative group">
            {qrDataUrl ? (
              <div className="relative p-3.5 bg-white rounded-2xl shadow-xl border-4 border-emerald-900/30">
                <img 
                  src={qrDataUrl} 
                  alt={`QR Code for ${product.name}`}
                  className="w-56 h-56 sm:w-60 sm:h-60 object-contain"
                />
                <div className="text-center mt-1 text-[10px] text-gray-700 font-semibold uppercase tracking-wider">
                  AYURGUIDE CANONICAL QR
                </div>
              </div>
            ) : (
              <div className="w-56 h-56 flex flex-col items-center justify-center text-gray-400">
                <div className="w-8 h-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mb-2" />
                <span className="text-xs font-mono">Generating universal QR...</span>
              </div>
            )}

            <div className="flex items-center gap-2 mt-3 text-xs text-gray-300">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Scan to view in AyurGuide</span>
            </div>
          </div>

          {/* Canonical Share Link Display */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-300">
              <span>Canonical Share Link:</span>
              <a 
                href={shareQrLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[11px] text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 hover:underline"
              >
                <span>Preview Page</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                readOnly 
                value={shareQrLink} 
                className="flex-1 bg-[#05140D] border border-[#23493C] rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none selection:bg-emerald-600 selection:text-white select-all"
              />
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0"
                title="Copy share link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Download Format Selector */}
          <div className="bg-[#05140D] border border-[#23493C]/70 rounded-xl p-3 flex items-center justify-between text-xs">
            <span className="text-gray-300 font-medium">Download Format:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDownloadMode('card')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  downloadMode === 'card'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-[#0D281C] text-gray-400 hover:text-white border border-[#23493C]'
                }`}
              >
                Printable Brand Card
              </button>
              <button
                type="button"
                onClick={() => setDownloadMode('qr-only')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  downloadMode === 'qr-only'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-[#0D281C] text-gray-400 hover:text-white border border-[#23493C]'
                }`}
              >
                QR Code Only
              </button>
            </div>
          </div>

          {/* Primary Action Buttons: Print Card, Download QR, Copy Link, Share */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            
            {/* CSS Print Action Button */}
            <button
              onClick={handlePrint}
              disabled={!qrDataUrl}
              className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition disabled:opacity-50 cursor-pointer"
              title="Print QR Flyer with AyurGuide Branding"
            >
              <Printer className="w-4 h-4" />
              <span>Print Card</span>
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={!qrDataUrl || isGeneratingDownload}
              className="px-3 py-2.5 rounded-xl bg-[#0D281C] hover:bg-[#123626] text-emerald-200 border border-emerald-700/60 text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
              title="Download PNG image"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingDownload ? 'Saving...' : 'Download'}</span>
            </button>

            {/* Copy Link Button */}
            <button
              onClick={handleCopyLink}
              className="px-3 py-2.5 rounded-xl bg-[#0D281C] hover:bg-[#123626] text-emerald-200 border border-emerald-700/60 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>

            {/* Native Share Button */}
            <button
              onClick={handleNativeShare}
              className="px-3 py-2.5 rounded-xl bg-[#0D281C] hover:bg-[#123626] text-emerald-200 border border-emerald-700/60 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              {shareSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{shareSuccess ? 'Shared!' : 'Share'}</span>
            </button>

          </div>

          {/* Canonical Sharing Notice */}
          <div className="bg-[#05140D]/70 border border-emerald-900/50 rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-gray-400">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              Use <strong>Print Card</strong> to generate crisp product shelf tags or consultation handouts with official AyurGuide branding.
            </p>
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* 2. DEDICATED CSS-BASED PRINT-FRIENDLY LAYOUT             */}
      {/* (ONLY RENDERS DURING BROWSER/PDF PRINTING VIA CSS)       */}
      {/* ======================================================== */}
      <div className="print-only hidden qr-print-card bg-white text-[#061810] p-6 max-w-md mx-auto border-4 border-[#065F46] rounded-2xl text-center shadow-none">
        
        {/* Top Decorative Border Accents */}
        <div className="w-full flex items-center justify-between border-b-2 border-[#065F46] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#065F46] flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="font-serif font-bold text-xl tracking-wider text-[#065F46] leading-none">
                AYURGUIDE
              </div>
              <div className="text-[9px] uppercase tracking-widest text-[#047857] font-semibold font-sans mt-0.5">
                Ayurvedic Clinical Pharmacopoeia
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block text-[11px] font-mono font-bold px-2 py-0.5 rounded border border-[#065F46] text-[#065F46] bg-emerald-50">
              {product.code}
            </span>
          </div>
        </div>

        {/* Medicine Name & Category */}
        <div className="my-2">
          <h2 className="font-serif font-bold text-2xl text-[#062414] tracking-tight">
            {product.name}
          </h2>
          {product.sanskritName && (
            <p className="font-serif italic text-sm text-[#92400E] mt-0.5">
              {product.sanskritName}
            </p>
          )}
          <div className="inline-flex items-center gap-2 mt-1.5 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-[#065F46]">
            <span>{product.categoryName || 'Classical Medicine'}</span>
            {product.classicalReference && (
              <>
                <span>•</span>
                <span className="font-serif italic text-[11px]">{product.classicalReference}</span>
              </>
            )}
          </div>
        </div>

        {/* High-Resolution Centered QR Frame */}
        <div className="my-4 p-3.5 bg-white border-2 border-[#065F46] rounded-xl shadow-xs inline-block">
          {qrDataUrl && (
            <img 
              src={qrDataUrl} 
              alt={`QR Code for ${product.name}`}
              className="w-52 h-52 object-contain mx-auto"
            />
          )}
        </div>

        {/* Clear Call-To-Action (User Requirement: 'Scan to view in AyurGuide') */}
        <div className="space-y-1.5 my-1">
          <div className="text-lg font-serif font-bold text-[#065F46] tracking-wide uppercase">
            Scan to view in AyurGuide
          </div>
          <p className="text-xs text-gray-700 max-w-xs mx-auto leading-relaxed font-sans">
            Scan this QR code with your smartphone camera or the AyurGuide app to access complete clinical formulation monographs, botanical ingredients, dosage, and classical references.
          </p>
        </div>

        {/* Canonical Permanent Link in Monospace */}
        <div className="mt-4 pt-3 border-t border-gray-200 text-center">
          <div className="text-[10px] font-mono text-gray-600 bg-gray-50 py-1 px-2 rounded border border-gray-200 inline-block break-all max-w-full">
            {shareQrLink}
          </div>
        </div>

        {/* Bottom Verification Seal */}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[9px] uppercase tracking-wider text-[#065F46] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Official AyurGuide Standardized Formulary Record</span>
        </div>

      </div>

    </div>
  );
};
