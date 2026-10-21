import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Lock, 
  Trash2, 
  Database, 
  Info, 
  CheckCircle2, 
  XCircle,
  FileText,
  UserCheck,
  Search,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { AppDevice, DeviceStats, User } from '../../types';
import { DeviceService } from '../../services/deviceService';

interface PrivacyConsentTabProps {
  stats: DeviceStats;
  devices: AppDevice[];
  activeUser: User | null;
  onRefresh: () => void;
  onOpenMigrationModal: () => void;
  onSelectDevice: (installationId: string) => void;
  onDeviceDeleted: () => void;
}

export const PrivacyConsentTab: React.FC<PrivacyConsentTabProps> = ({
  stats,
  devices,
  activeUser,
  onRefresh,
  onOpenMigrationModal,
  onSelectDevice,
  onDeviceDeleted,
}) => {
  const [deleteTargetId, setDeleteTargetId] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteMessage, setDeleteMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const handleDeleteRequest = async () => {
    if (!deleteTargetId.trim()) return;
    setIsDeleting(true);
    setDeleteMessage(null);
    try {
      const res = await DeviceService.deleteDevice(
        deleteTargetId.trim(),
        activeUser?.email || 'admin@sitaramayurveda.com'
      );
      if (res.success) {
        setDeleteMessage({ type: 'success', text: res.message });
        setDeleteTargetId('');
        setShowConfirmModal(false);
        onDeviceDeleted();
      } else {
        setDeleteMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setDeleteMessage({ type: 'error', text: err.message || 'Deletion failed.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Privacy Governance Banner */}
      <div className="bg-[#0A1F17] border border-[#23493C] rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-600/80 flex items-center justify-center text-emerald-400 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-100 font-serif">
                Privacy, Consent & Data Governance
              </h3>
              <p className="text-xs text-emerald-400/80 mt-1 max-w-2xl leading-relaxed">
                Ayur Index strictly implements zero-trust consent separation. Device hardware reporting and GPS location collection are managed independently under explicit, client-side Android operating system permissions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0D281C] hover:bg-[#133829] border border-[#23493C] text-emerald-300 hover:text-white text-xs font-semibold transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Core Architecture Breakdown: Device Reporting vs Location Reporting */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Device Reporting Consent Card */}
        <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-bold text-gray-100">1. Device Telemetry Reporting</h4>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800">
              Diagnostic Scope
            </span>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed">
            Covers non-sensitive hardware attributes: manufacturer, model, Android OS version, app version code, language, time zone, and network type for diagnostic compatibility.
          </p>

          <div className="p-3.5 rounded-xl bg-[#081C13] border border-[#23493C] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total Registered Devices:</span>
              <span className="font-mono font-bold text-white">{stats.totalDevices}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Active Reporting Consents:</span>
              <span className="font-mono font-bold text-emerald-300">{stats.totalDevices}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Underlying Field:</span>
              <code className="text-emerald-400 font-mono text-[11px]">app_devices.device_reporting_consent</code>
            </div>
          </div>

          <div className="text-[11px] text-gray-400 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Device reporting consent alone permits telemetry diagnostics but does <strong>NOT</strong> grant access to GPS coordinates.
            </span>
          </div>
        </div>

        {/* Location Reporting Consent Card */}
        <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm font-bold text-gray-100">2. Location Reporting Consent</h4>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider bg-amber-950 text-amber-300 border border-amber-800">
              High-Privacy Scope
            </span>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed">
            Covers precise or approximate GPS coordinates strictly for authorized clinical dispensary routing. Only collected when the Android user explicitly consents in-app and grants OS runtime permissions.
          </p>

          <div className="p-3.5 rounded-xl bg-[#081C13] border border-[#23493C] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Location Consent Granted:</span>
              <span className="font-mono font-bold text-emerald-300">{stats.locationConsentCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Location Consent Denied/None:</span>
              <span className="font-mono font-bold text-amber-300">{stats.noLocationConsentCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Devices with Actual Fixes:</span>
              <span className="font-mono font-bold text-white">{stats.devicesWithLocationData}</span>
            </div>
          </div>

          <div className="text-[11px] text-amber-300/90 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Crucial Policy:</strong> Administrators cannot silently enable location reporting. The Android user retains sole authority over OS runtime permissions.
            </span>
          </div>
        </div>

      </div>

      {/* Strict Architectural & Ethical Guarantees */}
      <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-5 space-y-3">
        <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Core Privacy & Security Guarantees</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-300 pt-1">
          <div className="p-3.5 rounded-xl bg-[#081C13] border border-[#23493C]/80 space-y-1.5">
            <strong className="text-gray-100 block">No IP Geolocation Inference</strong>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              IP addresses are never used to synthesize fake GPS fixes or fabricate coordinates. Records originate only from authenticated device hardware.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#081C13] border border-[#23493C]/80 space-y-1.5">
            <strong className="text-gray-100 block">Row-Level Security (RLS)</strong>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Coordinates and device lists are strictly gated behind administrator authentication. Anonymous visitors cannot read telemetry tables.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#081C13] border border-[#23493C]/80 space-y-1.5">
            <strong className="text-gray-100 block">Cascading Deletion</strong>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Foreign key constraints guarantee that deleting a device record instantaneously and permanently purges all historical coordinate trails.
            </p>
          </div>
        </div>
      </div>

      {/* Administrator GDPR / Privacy Deletion Section */}
      <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Trash2 className="w-5 h-5 text-rose-400" />
            <div>
              <h4 className="text-sm font-bold text-gray-100">
                Right to Erasure: Request Device & Telemetry Deletion
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Permanently delete a device installation record and all associated location history.
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
            Admin Only
          </span>
        </div>

        {deleteMessage && (
          <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            deleteMessage.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/60 border-rose-800 text-rose-300'
          }`}>
            {deleteMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{deleteMessage.text}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={deleteTargetId}
            onChange={(e) => setDeleteTargetId(e.target.value)}
            placeholder="Enter exact Installation ID to purge (e.g. inst_9f82...)"
            className="flex-1 w-full bg-[#081C13] border border-[#23493C] text-xs text-gray-200 placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500 font-mono"
          />
          <button
            disabled={!deleteTargetId.trim()}
            onClick={() => setShowConfirmModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition disabled:opacity-40 cursor-pointer shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Purge Device Data</span>
          </button>
        </div>

        <p className="text-[11px] text-gray-400">
          This operation triggers an audit trail entry in <code className="text-emerald-400 font-mono">public.audit_logs</code> recording your administrator identity (<code className="text-emerald-300">{activeUser?.email || 'admin'}</code>) for clinical compliance.
        </p>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#081C13] border border-[#23493C] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-700 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h4 className="text-base font-bold text-gray-100 font-serif">Confirm Permanent Erasure</h4>
              <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                Are you sure you want to delete all stored records for installation ID:
              </p>
              <p className="font-mono text-rose-300 text-xs bg-rose-950/40 border border-rose-800/60 p-2 rounded-lg mt-2 break-all">
                {deleteTargetId}
              </p>
              <p className="text-[11px] text-rose-400 mt-2">
                This will cascade-delete all associated GPS locations and device hardware records. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-[#0D281C] hover:bg-[#133829] border border-[#23493C] text-gray-300 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDeleteRequest}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Purging...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schema Verification & Migration Reference */}
      <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <h5 className="text-xs font-bold text-gray-200">Supabase Schema & Migration Reference</h5>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Review idempotent SQL scripts, column types, and Row Level Security definitions.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenMigrationModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#081C13] hover:bg-[#133829] border border-[#23493C] text-emerald-300 hover:text-white text-xs font-medium transition cursor-pointer"
        >
          <span>View SQL Script</span>
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
        </button>
      </div>

    </div>
  );
};
