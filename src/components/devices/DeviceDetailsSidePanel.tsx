import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  ShieldCheck, 
  ShieldAlert, 
  MapPin, 
  Clock, 
  Globe, 
  Wifi, 
  Copy, 
  Check, 
  ExternalLink, 
  Trash2, 
  AlertTriangle,
  Cpu,
  Calendar,
  Compass,
  Radio,
  Layers,
  Info
} from 'lucide-react';
import { AppDevice } from '../../types';

interface DeviceDetailsSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  device: AppDevice | null;
  onDeleteDevice?: (installationId: string) => Promise<void> | void;
}

export const DeviceDetailsSidePanel: React.FC<DeviceDetailsSidePanelProps> = ({
  isOpen,
  onClose,
  device,
  onDeleteDevice,
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen || !device) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(device.installationId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const formatTimestamp = (ts?: string) => {
    if (!ts) return 'Not available';
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return 'Not available';
      return d.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'medium',
      });
    } catch {
      return 'Not available';
    }
  };

  const getRelativeTime = (ts?: string) => {
    if (!ts) return '';
    try {
      const d = new Date(ts);
      const diffMs = Date.now() - d.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return '';
    }
  };

  const hasLocation = device.latestLocation !== null && device.latestLocation !== undefined;
  const loc = device.latestLocation;

  return (
    <>
      {/* Semi-transparent Backdrop for mobile/tablet focus */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-over Side Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md sm:max-w-lg md:max-w-xl bg-[#081C13] border-l border-[#23493C] shadow-2xl flex flex-col transform transition-transform ease-out duration-300 animate-in slide-in-from-right">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#23493C] bg-gradient-to-r from-[#0D281C] to-[#081C13] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400 shrink-0 shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-gray-100 font-serif truncate">
                  {device.deviceModel || 'Registered Mobile Device'}
                </h3>
                {device.manufacturer && (
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                    {device.manufacturer}
                  </span>
                )}
                <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {device.deviceType || 'Phone'}
                </span>
              </div>
              <p className="text-xs text-emerald-400/80 font-mono flex items-center gap-1.5 mt-0.5 truncate">
                <span className="truncate">ID: {device.installationId}</span>
                <button
                  onClick={handleCopyId}
                  className="p-1 text-gray-400 hover:text-white transition shrink-0"
                  title="Copy Installation ID"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-[#0D281C] transition cursor-pointer shrink-0"
            title="Close Side Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Status Metric Badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#0D281C] border border-[#23493C]">
              <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider block">
                Telemetry Reporting
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                {device.deviceReportingConsent ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span className="text-xs font-bold text-gray-100">
                  {device.deviceReportingConsent ? 'Consent Granted' : 'Revoked'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0D281C] border border-[#23493C]">
              <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider block">
                Location Consent
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                {device.locationConsent ? (
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-gray-400 shrink-0" />
                )}
                <span className="text-xs font-bold text-gray-100">
                  {device.locationConsent ? 'Granted' : 'Not Granted'}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Window Pill */}
          <div className="p-3.5 rounded-xl bg-[#0D281C]/70 border border-[#23493C] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-xs font-semibold text-gray-200">Last Seen:</span>
                <span className="text-xs text-emerald-300 font-bold ml-1.5 font-mono">
                  {getRelativeTime(device.lastSeenAt)}
                </span>
              </div>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">
              {formatTimestamp(device.lastSeenAt)}
            </span>
          </div>

          {/* Hardware & OS Specifications */}
          <div className="bg-[#0D281C]/50 border border-[#23493C] rounded-xl p-4 space-y-2.5">
            <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2 pb-1 border-b border-[#23493C]/50">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Hardware & System Profile</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#23493C]/40">
                <span className="text-gray-400">Installation ID:</span>
                <span className="font-mono text-emerald-200 select-all truncate max-w-[220px]" title={device.installationId}>
                  {device.installationId}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#23493C]/40">
                <span className="text-gray-400">Manufacturer:</span>
                <span className="font-medium text-gray-200">{device.manufacturer || 'Not available'}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#23493C]/40">
                <span className="text-gray-400">Device Model:</span>
                <span className="font-medium text-gray-200">{device.deviceModel || 'Not available'}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#23493C]/40">
                <span className="text-gray-400">Android Version:</span>
                <span className="font-medium text-gray-200">
                  {device.androidVersion ? `Android ${device.androidVersion}` : 'Not available'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#23493C]/40">
                <span className="text-gray-400">Android SDK Level:</span>
                <span className="font-medium text-gray-200">
                  {device.sdkVersion ? `API Level ${device.sdkVersion}` : 'Not available'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#23493C]/40">
                <span className="text-gray-400">App Version Name:</span>
                <span className="font-mono text-emerald-300 font-medium">
                  {device.appVersionName || device.appVersion || 'Not available'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#23493C]/40">
                <span className="text-gray-400">App Version Code:</span>
                <span className="font-mono text-gray-200">
                  {device.appVersionCode !== undefined ? device.appVersionCode : 'Not available'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#23493C]/40">
                <span className="text-gray-400">Device Form Factor:</span>
                <span className="font-medium text-gray-200">{device.deviceType || 'Phone'}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#23493C]/40">
                <span className="text-gray-400">Language & Locale:</span>
                <span className="font-medium text-gray-200">{device.language || 'Not available'}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#23493C]/40">
                <span className="text-gray-400">Device Time Zone:</span>
                <span className="font-medium text-gray-200">{device.timezone || 'Not available'}</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-gray-400">Network Type:</span>
                <span className="font-medium text-gray-200 flex items-center gap-1">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{device.networkType || 'Not available'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Timestamps Section */}
          <div className="bg-[#0D281C]/50 border border-[#23493C] rounded-xl p-4 space-y-2.5">
            <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2 pb-1 border-b border-[#23493C]/50">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Telemetry Timestamps (Admin Local Time)</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#23493C]/40">
                <span className="text-gray-400">First Registered:</span>
                <span className="font-medium text-gray-300">{formatTimestamp(device.firstSeenAt)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#23493C]/40">
                <span className="text-gray-400">Last Telemetry Ping:</span>
                <span className="font-medium text-emerald-300 font-bold">{formatTimestamp(device.lastSeenAt)}</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-gray-400">Last Sync Time:</span>
                <span className="font-medium text-gray-300">{formatTimestamp(device.lastSyncAt)}</span>
              </div>
            </div>
          </div>

          {/* Location Telemetry Section */}
          <div className="bg-[#0D281C]/50 border border-[#23493C] rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2 pb-1 border-b border-[#23493C]/50">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Consented Location Telemetry</span>
            </h4>

            {hasLocation && loc ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-[#081C13] border border-[#23493C] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Coordinates:</span>
                    <span className="font-mono text-emerald-300 font-bold select-all">
                      {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Accuracy Radius:</span>
                    <span className="font-medium text-gray-200">
                      {loc.accuracy ? `±${Math.round(loc.accuracy)} meters` : 'Not available'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Precision Level:</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                      loc.locationPrecision === 'precise'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-amber-950 text-amber-300 border border-amber-700'
                    }`}>
                      {loc.locationPrecision}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Sensor Source:</span>
                    <span className="font-mono text-gray-300 text-[11px]">{loc.locationSource || 'gps'}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#23493C]/50">
                    <span className="text-gray-400 text-[11px]">Recorded at:</span>
                    <span className="text-gray-300 text-[11px]">{formatTimestamp(loc.recordedAt)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-[10px]">Uploaded at:</span>
                    <span className="text-gray-500 text-[10px]">{formatTimestamp(loc.uploadedAt)}</span>
                  </div>
                </div>

                {/* External Mapping Launchers */}
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#081C13] hover:bg-[#133829] border border-[#23493C] text-emerald-300 hover:text-white transition cursor-pointer font-medium"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3 text-emerald-400" />
                  </a>

                  <a
                    href={`https://www.openstreetmap.org/?mlat=${loc.latitude}&mlon=${loc.longitude}#map=16/${loc.latitude}/${loc.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#081C13] hover:bg-[#133829] border border-[#23493C] text-emerald-300 hover:text-white transition cursor-pointer font-medium"
                  >
                    <span>OpenStreetMap</span>
                    <ExternalLink className="w-3 h-3 text-emerald-400" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-[#081C13] border border-[#23493C] text-xs text-gray-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p>
                  {device.locationConsent
                    ? 'Location consent is active, but no GPS fix has been recorded yet.'
                    : 'Location reporting was not consented by the user. No GPS coordinates collected.'}
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-[#23493C] bg-[#061810] shrink-0">
          {confirmDelete ? (
            <div className="bg-rose-950/60 border border-rose-800 p-3 rounded-xl text-xs space-y-2">
              <div className="flex items-center gap-2 text-rose-300 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Confirm Permanent Device Erasure</span>
              </div>
              <p className="text-[11px] text-rose-200/90 leading-relaxed">
                Permanently purge this device record and all telemetry from <code className="font-mono">app_devices</code>? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={async () => {
                    if (!onDeleteDevice) return;
                    setIsDeleting(true);
                    try {
                      await onDeleteDevice(device.installationId);
                      onClose();
                    } finally {
                      setIsDeleting(false);
                      setConfirmDelete(false);
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? 'Purging...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              {onDeleteDevice && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-950/80 border border-rose-800/60 text-rose-300 hover:text-white text-xs font-semibold transition cursor-pointer"
                  title="Purge this device record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Record</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#0D281C] hover:bg-[#133829] border border-[#23493C] text-gray-300 hover:text-white text-xs font-medium transition cursor-pointer ml-auto"
              >
                Close Panel
              </button>
            </div>
          )}
        </div>

      </div>
    </>
  );
};
