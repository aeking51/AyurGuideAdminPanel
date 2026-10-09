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
          title: `${product.name} | Ayur Index`,
          text: `${product.name} (${product.code})\nView authentic Ayurvedic medicine details in Ayur Index:`,
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
      let filename = `AyurIndex-QR-${publicSlug}.png`;

      if (downloadMode === 'card') {
        downloadUrl = await generatePrintableQrCard(shareQrLink, product.name, product.code);
        filename = `AyurIndex-Printable-Card-${publicSlug}.png`;
      } else {
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 qr-modal-overlay">
      
      {/* ======================================================== */}
      {/* 1. ON-SCREEN INTERACTIVE MODAL DIALOG (OPTIMIZED HEIGHT) */}
      {/* ======================================================== */}
      <div 
        className="no-print bg-[#081C13] border border-[#23493C] rounded-2xl w-full max-w-2xl md:max-w-3xl max-h-[92vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 qr-modal-dialog overflow-hidden my-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Sticky Header - Always Visible */}
        <div className="bg-gradient-to-r from-[#0D281C] to-[#0A2217] px-4 sm:px-6 py-3 border-b border-[#23493C] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <QrCode className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-gray-100 tracking-wide leading-tight">
                SHARE PRODUCT
              </h3>
              <p className="text-[10px] sm:text-[11px] text-emerald-400/90 font-mono">
                Universal Canonical QR & Share Link
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-emerald-950 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body (Dual-Column on Desktop to Prevent Overflow) */}
        <div className="overflow-y-auto p-4 sm:p-5 flex-1 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 items-start">
            
            {/* Left Column: QR Code Display Frame */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#0D281C]/90 to-[#071710] rounded-xl border border-emerald-800/40 text-center">
              {qrDataUrl ? (
                <div className="relative p-2.5 bg-white rounded-xl shadow-lg border-2 border-emerald-900/30">
                  <img 
                    src={qrDataUrl} 
                    alt={`QR Code for ${product.name}`}
                    className="w-40 h-40 sm:w-44 sm:h-44 object-contain"
                  />
                  <div className="text-center mt-1 text-[9px] text-gray-700 font-bold uppercase tracking-wider">
                    AYUR INDEX CANONICAL QR
                  </div>
                </div>
              ) : (
                <div className="w-40 h-40 flex flex-col items-center justify-center text-gray-400">
                  <div className="w-6 h-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mb-2" />
                  <span className="text-[11px] font-mono">Generating QR...</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 mt-2.5 text-xs text-gray-300">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-medium">Scan to view in Ayur Index</span>
              </div>

              <a 
                href={shareQrLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="mt-2 text-[11px] text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 hover:underline"
              >
                <span>Preview Public Page</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Right Column: Medicine Details, URL & Actions */}
            <div className="md:col-span-7 space-y-3.5">
              
              {/* Medicine Identity Card */}
              <div className="bg-[#0D281C] border border-[#23493C] rounded-xl p-3 sm:p-3.5 flex items-start justify-between gap-2.5">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold mb-0.5">
                    Medicine Details
                  </div>
                  <h4 className="font-serif font-bold text-base text-gray-100 leading-tight">
                    {product.name}
                  </h4>
                  {product.sanskritName && (
                    <p className="font-serif italic text-xs text-amber-300/90 mt-0.5">
                      {product.sanskritName}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-amber-300 border border-emerald-800/80">
                      Code: {product.code}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                      {product.categoryName || 'Ayurvedic Medicine'}
                    </span>
                  </div>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase shrink-0 ${
                  product.status === 'Active'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                }`}>
                  {product.status}
                </span>
              </div>

              {/* Canonical Share Link Display */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-emerald-300 block">
                  Canonical Share Link:
                </span>
                <div className="flex items-center gap-1.5">
                  <input 
                    type="text" 
                    readOnly 
                    value={shareQrLink} 
                    className="flex-1 bg-[#05140D] border border-[#23493C] rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-emerald-300 focus:outline-none selection:bg-emerald-600 selection:text-white select-all truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 rounded-lg bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 text-xs font-semibold flex items-center gap-1 transition cursor-pointer shrink-0"
                    title="Copy share link"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Download Format Selector */}
              <div className="bg-[#05140D] border border-[#23493C]/70 rounded-lg px-3 py-2 flex items-center justify-between text-xs">
                <span className="text-gray-300 text-[11px] font-medium">Download Format:</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDownloadMode('card')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                      downloadMode === 'card'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-[#0D281C] text-gray-400 hover:text-white border border-[#23493C]'
                    }`}
                  >
                    Printable Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setDownloadMode('qr-only')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                      downloadMode === 'qr-only'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-[#0D281C] text-gray-400 hover:text-white border border-[#23493C]'
                    }`}
                  >
                    QR Only
                  </button>
                </div>
              </div>

              {/* Action Buttons: Print Card, Download, Copy Link, Share */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
                
                {/* Print Button */}
                <button
                  onClick={handlePrint}
                  disabled={!qrDataUrl}
                  className="px-2.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md transition disabled:opacity-50 cursor-pointer"
                  title="Print QR Flyer with Ayur Index Branding"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Card</span>
                </button>

                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  disabled={!qrDataUrl || isGeneratingDownload}
                  className="px-2.5 py-2 rounded-xl bg-[#0D281C] hover:bg-[#123626] text-emerald-200 border border-emerald-700/60 text-xs font-semibold flex items-center justify-center gap-1 transition disabled:opacity-50 cursor-pointer"
                  title="Download PNG image"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isGeneratingDownload ? 'Saving...' : 'Download'}</span>
                </button>

                {/* Copy Link Button */}
                <button
                  onClick={handleCopyLink}
                  className="px-2.5 py-2 rounded-xl bg-[#0D281C] hover:bg-[#123626] text-emerald-200 border border-emerald-700/60 text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                {/* Share Button */}
                <button
                  onClick={handleNativeShare}
                  className="px-2.5 py-2 rounded-xl bg-[#0D281C] hover:bg-[#123626] text-emerald-200 border border-emerald-700/60 text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  {shareSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{shareSuccess ? 'Shared' : 'Share'}</span>
                </button>

              </div>

              {/* Informational Tip */}
              <div className="bg-[#05140D]/70 border border-emerald-900/40 rounded-lg p-2.5 flex items-start gap-2 text-[10px] text-gray-400 leading-normal">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  Use <strong>Print Card</strong> to generate crisp product shelf tags or consultation handouts with official Ayur Index branding.
                </p>
              </div>

            </div>

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
                AYUR INDEX
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

        {/* Clear Call-To-Action */}
        <div className="space-y-1.5 my-1">
          <div className="text-lg font-serif font-bold text-[#065F46] tracking-wide uppercase">
            Scan to view in Ayur Index
          </div>
          <p className="text-xs text-gray-700 max-w-xs mx-auto leading-relaxed font-sans">
            Scan this QR code with your smartphone camera or the Ayur Index app to access complete clinical formulation monographs, botanical ingredients, dosage, and classical references.
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
          <span>Official Ayur Index Standardized Formulary Record</span>
        </div>

      </div>

    </div>
  );
};
