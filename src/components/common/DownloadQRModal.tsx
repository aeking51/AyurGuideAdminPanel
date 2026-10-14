import React, { useState, useEffect } from 'react';
import { 
  X, 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  Smartphone, 
  ExternalLink,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { APK_CONFIG } from '../../config/apkConfig';
import { generateQrDataUrl } from '../../utils/shareUtils';

interface DownloadQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToFullPage?: () => void;
}

export const DownloadQRModal: React.FC<DownloadQRModalProps> = ({
  isOpen,
  onClose,
  onNavigateToFullPage,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadTarget, setDownloadTarget] = useState<'apk' | 'page'>('page');

  useEffect(() => {
    if (!isOpen) return;

    // Determine target URL for the QR code
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ayurindex.app';
    const targetUrl = downloadTarget === 'apk' 
      ? (APK_CONFIG.supabaseLatestApkUrl || `${origin}${APK_CONFIG.directDownloadUrl}`)
      : `${origin}/download`;

    generateQrDataUrl(targetUrl, 320)
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Failed to generate APK QR:', err));
  }, [isOpen, downloadTarget]);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ayurindex.app';
  const currentUrl = downloadTarget === 'apk' 
    ? (APK_CONFIG.supabaseLatestApkUrl || `${origin}${APK_CONFIG.directDownloadUrl}`)
    : `${origin}/download`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadQrImage = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `ayurguide-download-qr-${downloadTarget}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0D281C] border border-[#23493C] rounded-2xl shadow-2xl overflow-hidden text-gray-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#23493C]/80 bg-[#081C13]/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Get Ayur Index for Android</h3>
              <p className="text-xs text-emerald-400/80">Scan with your smartphone camera</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col items-center text-center">
          
          {/* Target Toggle */}
          <div className="w-full flex rounded-lg bg-[#081C13] p-1 border border-[#23493C]/60 mb-5">
            <button
              onClick={() => setDownloadTarget('page')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                downloadTarget === 'page'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Open Download Page
            </button>
            <button
              onClick={() => setDownloadTarget('apk')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                downloadTarget === 'apk'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Direct APK Download
            </button>
          </div>

          {/* QR Code Container */}
          <div className="relative p-3 bg-white rounded-2xl shadow-xl border-4 border-emerald-500/40 mb-4">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Ayur Index Android Download QR Code"
                className="w-56 h-56 rounded-lg object-contain"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="w-8 h-8 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
              </div>
            )}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#081C13] border border-emerald-400/50 text-emerald-300 px-3 py-0.5 rounded-full text-[10px] font-mono tracking-wider shadow uppercase">
              {APK_CONFIG.version} &bull; {APK_CONFIG.fileSize}
            </div>
          </div>

          <p className="text-xs text-gray-300 mt-2 max-w-xs leading-relaxed">
            Point your Android phone's camera at this QR code to {downloadTarget === 'apk' ? 'instantly download the APK file' : 'open the official installation hub'}.
          </p>

          {/* Link display & copy */}
          <div className="w-full mt-4 flex items-center gap-2 bg-[#081C13] border border-[#23493C] rounded-lg p-2 text-left">
            <span className="text-xs font-mono text-emerald-300/80 truncate flex-1 pl-1">
              {currentUrl}
            </span>
            <button
              onClick={handleCopyLink}
              className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 rounded-md transition-colors text-xs flex items-center gap-1 shrink-0"
              title="Copy Link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="w-full grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={handleDownloadQrImage}
              className="py-2.5 px-3 bg-[#1A3D2E] hover:bg-[#23493C] text-emerald-200 border border-[#23493C] rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save QR Image</span>
            </button>

            <a
              href={APK_CONFIG.directDownloadUrl}
              download={`ayurguide-${APK_CONFIG.version}.apk`}
              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-950/50"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Download APK</span>
            </a>
          </div>

          {onNavigateToFullPage && (
            <button
              onClick={() => {
                onClose();
                onNavigateToFullPage();
              }}
              className="mt-4 text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors underline underline-offset-4"
            >
              <span>View full installation instructions & features</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}

          {/* Security badge */}
          <div className="mt-4 pt-3 border-t border-[#23493C]/50 w-full flex items-center justify-center gap-1.5 text-[11px] text-emerald-400/70">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified Official Build &bull; Virus & Ad Free</span>
          </div>

        </div>
      </div>
    </div>
  );
};
