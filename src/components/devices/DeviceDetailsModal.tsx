import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Shield, 
  MapPin, 
  Clock, 
  Globe, 
  Wifi, 
  Copy, 
  Check, 
  ExternalLink, 
  Trash2, 
  AlertTriangle,
  Layers,
  Cpu,
  Calendar,
  Compass
} from 'lucide-react';
import { AppDevice, AppDeviceLocation } from '../../types';
import { DeviceService } from '../../services/deviceService';

interface DeviceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  installationId: string | null;
  onDeleteDevice?: (installationId: string) => void;
  onNavigateToLocation?: (loc: AppDeviceLocation) => void;
}

export const DeviceDetailsModal: React.FC<DeviceDetailsModalProps> = ({
  isOpen,
  onClose,
  installationId,
  onDeleteDevice,
  onNavigateToLocation,
}) => {
  const [device, setDevice] = useState<AppDevice | null>(null);
  const [locations, setLocations] = useState<AppDeviceLocation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !installationId) {
      setDevice(null);
      setLocations([]);
      setConfirmDelete(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    DeviceService.fetchDeviceById(installationId)
      .then(res => {
        if (!isMounted) return;
        setDevice(res.device);
        setLocations(res.locations);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, installationId]);

  if (!isOpen) return null;

  const handleCopyId = () => {
    if (!installationId) return;
    navigator.clipboard.writeText(installationId);
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

  const latestLoc = locations.length > 0 ? locations[0] : (device?.latestLocation || null);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-3xl bg-[#081C13] border border-[#23493C] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#23493C] bg-gradient-to-r from-[#0D281C] to-[#081C13] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-100 font-serif">
                  {device?.deviceModel || 'Registered Mobile Device'}
                </h3>
                {device?.manufacturer && (
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                    {device.manufacturer}
                  </span>
                )}
                <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {device?.deviceType || 'Phone'}
                </span>
              </div>
              <p className="text-xs text-emerald-400/80 font-mono flex items-center gap-1.5 mt-0.5">
                <span>ID: {installationId || 'Unknown'}</span>
                <button
                  onClick={handleCopyId}
                  className="p-0.5 hover:text-white transition"
                  title="Copy Installation ID"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                </button>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#0D281C] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {isLoading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mb-3" />
              <span className="text-xs font-mono text-emerald-300">Retrieving device hardware & telemetry record...</span>
            </div>
          ) : !device ? (
            <div className="p-8 text-center bg-[#0D281C]/40 rounded-xl border border-[#23493C]">
              <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-gray-200">Device Record Not Found</h4>
              <p className="text-xs text-emerald-400/70 mt-1">
                The requested installation ID does not exist in public.app_devices or may have been deleted.
              </p>
            </div>
          ) : (
            <>
              {/* Primary Highlights Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#0D281C] border border-[#23493C]">
                  <span className="text-[11px] font-semibold text-emerald-400/80 block uppercase tracking-wider">Device Reporting</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Shield className={`w-4 h-4 ${device.deviceReportingConsent ? 'text-emerald-400' : 'text-amber-400'}`} />
                    <span className="text-sm font-bold text-gray-100">
                      {device.deviceReportingConsent ? 'Consent Granted' : 'Consent Denied / Revoked'}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block">Hardware telemetry authorized</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0D281C] border border-[#23493C]">
                  <span className="text-[11px] font-semibold text-emerald-400/80 block uppercase tracking-wider">Location Consent</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin className={`w-4 h-4 ${device.locationConsent ? 'text-emerald-400' : 'text-rose-400'}`} />
                    <span className="text-sm font-bold text-gray-100">
                      {device.locationConsent ? 'Consent Granted' : 'No Location Consent'}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    {device.locationConsent ? 'User permitted coordinates' : 'Never collected or inferred'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0D281C] border border-[#23493C]">
                  <span className="text-[11px] font-semibold text-emerald-400/80 block uppercase tracking-wider">Activity Status</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-bold text-gray-100">
                      {getRelativeTime(device.lastSeenAt) || 'Recorded'}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block truncate">
                    Last Seen: {formatTimestamp(device.lastSeenAt)}
                  </span>
                </div>
              </div>

              {/* Hardware & OS Specifications Table */}
              <div className="bg-[#0D281C]/50 border border-[#23493C] rounded-xl p-4">
                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span>Hardware & Software Specifications</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#23493C]/60">
                    <span className="text-gray-400">Installation ID:</span>
                    <span className="font-mono text-emerald-200 select-all truncate max-w-[200px]" title={device.installationId}>
                      {device.installationId}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#23493C]/60">
                    <span className="text-gray-400">Manufacturer & Model:</span>
                    <span className="font-medium text-gray-200">
                      {device.manufacturer || device.deviceModel ? `${device.manufacturer || ''} ${device.deviceModel || ''}`.trim() : 'Not available'}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#23493C]/60">
                    <span className="text-gray-400">Android Version:</span>
                    <span className="font-medium text-gray-200">
                      {device.androidVersion ? `Android ${device.androidVersion}` : 'Not available'}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#23493C]/60">
                    <span className="text-gray-400">Android SDK Version:</span>
                    <span className="font-medium text-gray-200">
                      {device.sdkVersion ? `API Level ${device.sdkVersion}` : 'Not available'}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#23493C]/60">
                    <span className="text-gray-400">Application Version Name:</span>
                    <span className="font-medium text-emerald-300 font-mono">
                      {device.appVersionName || device.appVersion || 'Not available'}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#23493C]/60">
                    <span className="text-gray-400">Application Version Code:</span>
                    <span className="font-medium text-gray-200 font-mono">
                      {device.appVersionCode !== undefined ? device.appVersionCode : 'Not available'}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#23493C]/60">
                    <span className="text-gray-400">Device Form Factor:</span>
                    <span className="font-medium text-gray-200">
                      {device.deviceType || 'Not available'}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#23493C]/60">
                    <span className="text-gray-400">Language & Locale:</span>
                    <span className="font-medium text-gray-200">
                      {device.language || 'Not available'}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#23493C]/60">
                    <span className="text-gray-400">Time Zone:</span>
                    <span className="font-medium text-gray-200">
                      {device.timezone || 'Not available'}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#23493C]/60">
                    <span className="text-gray-400">Network Connection:</span>
                    <span className="font-medium text-gray-200 flex items-center gap-1">
                      <Wifi className="w-3 h-3 text-emerald-400" />
                      <span>{device.networkType || 'Not available'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Temporal Timestamps Table */}
              <div className="bg-[#0D281C]/50 border border-[#23493C] rounded-xl p-4">
                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Telemetry Timestamps (Administrator Local Time)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#081C13] border border-[#23493C]">
                    <span className="text-gray-400 block text-[11px]">First Seen:</span>
                    <span className="font-medium text-gray-200 block mt-0.5">
                      {formatTimestamp(device.firstSeenAt)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#081C13] border border-[#23493C]">
                    <span className="text-gray-400 block text-[11px]">Last Seen:</span>
                    <span className="font-medium text-emerald-300 block mt-0.5 font-bold">
                      {formatTimestamp(device.lastSeenAt)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#081C13] border border-[#23493C]">
                    <span className="text-gray-400 block text-[11px]">Last Synchronization:</span>
                    <span className="font-medium text-gray-200 block mt-0.5">
                      {formatTimestamp(device.lastSyncAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Latest Permitted Location Record */}
              <div className="bg-[#0D281C]/50 border border-[#23493C] rounded-xl p-4">
                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>Latest Permitted Location Record</span>
                </h4>

                {latestLoc ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-2.5 rounded-lg bg-[#081C13] border border-[#23493C]">
                        <span className="text-gray-400 block text-[11px]">Latitude & Longitude:</span>
                        <span className="font-mono font-bold text-emerald-300 block mt-0.5">
                          {latestLoc.latitude.toFixed(6)}, {latestLoc.longitude.toFixed(6)}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#081C13] border border-[#23493C]">
                        <span className="text-gray-400 block text-[11px]">Accuracy & Precision:</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-medium text-gray-200">
                            {latestLoc.accuracy ? `±${Math.round(latestLoc.accuracy)}m` : 'Not available'}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                            latestLoc.locationPrecision === 'precise'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                              : 'bg-amber-950 text-amber-300 border border-amber-700'
                          }`}>
                            {latestLoc.locationPrecision}
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#081C13] border border-[#23493C]">
                        <span className="text-gray-400 block text-[11px]">Recorded vs Uploaded:</span>
                        <span className="text-[11px] text-gray-300 block mt-0.5">
                          Rec: {formatTimestamp(latestLoc.recordedAt)}
                        </span>
                        <span className="text-[10px] text-gray-500 block">
                          Up: {formatTimestamp(latestLoc.uploadedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons for location */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {onNavigateToLocation && (
                        <button
                          onClick={() => {
                            onNavigateToLocation(latestLoc);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>View on Location History Map</span>
                        </button>
                      )}

                      <a
                        href={`https://www.google.com/maps?q=${latestLoc.latitude},${latestLoc.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#081C13] hover:bg-[#133829] border border-[#23493C] text-emerald-300 hover:text-white text-xs font-medium transition cursor-pointer"
                      >
                        <span>Google Maps</span>
                        <ExternalLink className="w-3 h-3 text-emerald-400" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-[#081C13] border border-[#23493C] text-xs text-gray-400 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span>
                      {device.locationConsent
                        ? 'Location consent is active, but no GPS fix or coordinates have been recorded yet.'
                        : 'No location records available. Location reporting was not consented by the device user.'}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

        </div>

        {/* Modal Footer & Admin Deletion Action */}
        <div className="p-4 border-t border-[#23493C] bg-[#061810] flex flex-wrap items-center justify-between gap-3">
          
          {/* Deletion confirmation area */}
          {confirmDelete ? (
            <div className="flex items-center gap-2 bg-rose-950/60 border border-rose-800 p-2 rounded-xl text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="text-rose-200">
                Permanently delete device & cascade-remove all {locations.length} location records?
              </span>
              <button
                disabled={isDeleting}
                onClick={async () => {
                  if (!installationId || !onDeleteDevice) return;
                  setIsDeleting(true);
                  try {
                    await onDeleteDevice(installationId);
                    onClose();
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div>
              {onDeleteDevice && device && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-950/80 border border-rose-800/60 text-rose-300 hover:text-white text-xs font-semibold transition cursor-pointer"
                  title="Delete this device and cascade all location history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Device Record</span>
                </button>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#0D281C] hover:bg-[#133829] border border-[#23493C] text-gray-300 hover:text-white text-xs font-medium transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
