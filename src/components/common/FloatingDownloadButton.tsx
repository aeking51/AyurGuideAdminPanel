import React, { useState } from 'react';
import { Smartphone, Download, QrCode, X, Sparkles, ChevronRight, Check } from 'lucide-react';
import { APK_CONFIG } from '../../config/apkConfig';

interface FloatingDownloadButtonProps {
  onNavigateToDownload: () => void;
  onOpenQrModal?: () => void;
}

export const FloatingDownloadButton: React.FC<FloatingDownloadButtonProps> = ({
  onNavigateToDownload,
  onOpenQrModal,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);

  if (isDismissed) return null;

  const handleQuickDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadStarted(true);
    const link = document.createElement('a');
    link.href = APK_CONFIG.supabaseLatestApkUrl || APK_CONFIG.directDownloadUrl;
    link.download = `AyurIndex.apk`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadStarted(false), 3000);
  };

  return (
    <aside 
      aria-label="Ayur Index Android App Download"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 group print:hidden select-none"
    >
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex items-center bg-gradient-to-r from-[#0C3022] via-[#0E3D2B] to-[#0A261A] text-white p-1.5 pl-3 pr-2 rounded-full border border-emerald-500/40 shadow-2xl shadow-emerald-950/80 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-emerald-400"
      >
        {/* Pulsing notification dot */}
        <span className="relative flex h-3 w-3 mr-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>

        {/* Main Click Area to navigate to full download page */}
        <button
          onClick={onNavigateToDownload}
          className="flex items-center gap-2 text-left focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-[#081C13] rounded-full py-1 px-1"
          title="Open Ayur Index Android APK Download Hub"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0 shadow-inner">
            <Smartphone className="w-4 h-4 text-emerald-300" />
          </div>

          <div className="flex flex-col pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold tracking-wide text-emerald-100 font-sans">
                Get Ayur Index APK
              </span>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.2 rounded-full font-mono font-medium">
                {APK_CONFIG.version}
              </span>
            </div>
            <span className="text-[10px] text-emerald-300/80 hidden sm:inline">
              Free Classical Formulary for Android
            </span>
          </div>

          <ChevronRight className="w-4 h-4 text-emerald-400/70 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Direct Download Action Button */}
        <button
          onClick={handleQuickDownload}
          title={`Direct Download APK (${APK_CONFIG.fileSize})`}
          className="ml-1 p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition-colors flex items-center justify-center shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-300"
        >
          {downloadStarted ? (
            <Check className="w-3.5 h-3.5 text-white animate-bounce" />
          ) : (
            <Download className="w-3.5 h-3.5 text-white" />
          )}
        </button>

        {/* QR Code Action Button */}
        {onOpenQrModal && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenQrModal();
            }}
            title="Scan QR Code to download on mobile"
            className="p-2 hover:bg-emerald-500/20 text-emerald-300 rounded-full transition-colors flex items-center justify-center ml-0.5"
          >
            <QrCode className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Dismiss Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsDismissed(true);
          }}
          title="Dismiss for this session"
          className="p-1 text-emerald-400/50 hover:text-emerald-200 hover:bg-emerald-500/10 rounded-full transition-colors ml-0.5"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
};
