import React from 'react';
import { 
  Smartphone, 
  Activity, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  ShieldAlert, 
  Database, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Clock,
  Radio,
  Layers,
  Cpu
} from 'lucide-react';
import { DeviceStats, AppDevice } from '../../types';

interface DeviceOverviewTabProps {
  stats: DeviceStats;
  tableMissing: boolean;
  isLoading: boolean;
  onReload: () => void;
  onOpenMigrationModal: () => void;
  onNavigateToTab: (tab: 'devices' | 'locations' | 'privacy') => void;
  recentDevices: AppDevice[];
  onSelectDevice: (installationId: string) => void;
}

export const DeviceOverviewTab: React.FC<DeviceOverviewTabProps> = ({
  stats,
  tableMissing,
  isLoading,
  onReload,
  onOpenMigrationModal,
  onNavigateToTab,
  recentDevices,
  onSelectDevice,
}) => {
  return (
    <div className="space-y-6">
      
      {/* Table Missing Alert / Migration Prompt Banner */}
      {tableMissing && (
        <div className="bg-amber-950/40 border border-amber-700/60 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-900/60 border border-amber-600 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-200">
                Supabase Table Pending Creation
              </h4>
              <p className="text-xs text-amber-300/80 mt-1 leading-relaxed">
                The table <code className="font-mono bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800">public.app_devices</code> has not been created yet in your Supabase project. Displaying zero counts until the schema migration is applied.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              onClick={onOpenMigrationModal}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <span>View SQL Migration Script</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onReload}
              disabled={isLoading}
              className="p-2 rounded-xl bg-[#0D281C] hover:bg-[#133829] border border-[#23493C] text-emerald-300 hover:text-white transition cursor-pointer"
              title="Re-check database status"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* KPI Dashboard Summary Cards (Exact 6 required metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* 1. Total Registered Devices */}
        <div 
          onClick={() => onNavigateToTab('devices')}
          className="group relative bg-[#0D281C] border border-[#23493C] hover:border-emerald-500/60 rounded-2xl p-5 shadow-lg transition cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400/80">
              Total Registered Devices
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {stats.totalDevices}
            </span>
            <span className="text-xs text-gray-400">installations</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Unique app installations recorded in <code className="text-emerald-400 font-mono">app_devices</code>
          </p>
        </div>

        {/* 2. Devices Active in Last 24 Hours */}
        <div 
          onClick={() => onNavigateToTab('devices')}
          className="group relative bg-[#0D281C] border border-[#23493C] hover:border-emerald-500/60 rounded-2xl p-5 shadow-lg transition cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400/80">
              Active in Last 24 Hours
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-300 font-mono">
              {stats.active24h}
            </span>
            <span className="text-xs text-gray-400">devices</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Recorded telemetry timestamp within the past 24 hours (<code className="text-emerald-400 font-mono">last_seen_at &ge; now - 24h</code>)
          </p>
        </div>

        {/* 3. Devices Active in Last 7 Days */}
        <div 
          onClick={() => onNavigateToTab('devices')}
          className="group relative bg-[#0D281C] border border-[#23493C] hover:border-emerald-500/60 rounded-2xl p-5 shadow-lg transition cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400/80">
              Active in Last 7 Days
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {stats.active7d}
            </span>
            <span className="text-xs text-gray-400">devices</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Recorded activity within the past 7 days (<code className="text-emerald-400 font-mono">last_seen_at &ge; now - 7d</code>)
          </p>
        </div>

        {/* 4. Devices With Location Consent */}
        <div 
          onClick={() => onNavigateToTab('privacy')}
          className="group relative bg-[#0D281C] border border-[#23493C] hover:border-emerald-500/60 rounded-2xl p-5 shadow-lg transition cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400/80">
              With Location Consent
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">
              {stats.locationConsentCount}
            </span>
            <span className="text-xs text-gray-400">
              {stats.totalDevices > 0 ? `(${Math.round((stats.locationConsentCount / stats.totalDevices) * 100)}%)` : 'consented'}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Explicit user permission recorded in <code className="text-emerald-400 font-mono">location_consent = true</code>
          </p>
        </div>

        {/* 5. Devices Without Location Consent */}
        <div 
          onClick={() => onNavigateToTab('privacy')}
          className="group relative bg-[#0D281C] border border-[#23493C] hover:border-amber-500/60 rounded-2xl p-5 shadow-lg transition cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400/90">
              Without Location Consent
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-700/60 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-300 font-mono">
              {stats.noLocationConsentCount}
            </span>
            <span className="text-xs text-gray-400">
              {stats.totalDevices > 0 ? `(${Math.round((stats.noLocationConsentCount / stats.totalDevices) * 100)}%)` : 'restricted'}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Zero coordinates collected or stored; strict user privacy maintained (<code className="text-amber-400 font-mono">location_consent = false</code>)
          </p>
        </div>

        {/* 6. Devices With Available Location Data */}
        <div 
          onClick={() => onNavigateToTab('locations')}
          className="group relative bg-[#0D281C] border border-[#23493C] hover:border-emerald-500/60 rounded-2xl p-5 shadow-lg transition cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400/80">
              With Available Location Data
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {stats.devicesWithLocationData}
            </span>
            <span className="text-xs text-gray-400">verified in database</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Has valid coordinate fields in <code className="text-emerald-400 font-mono">app_devices</code> (distinguished from consent alone)
          </p>
        </div>

      </div>

      {/* Real Data Governance & Time Range Documentation */}
      <div className="bg-[#0A1F17] border border-[#23493C] rounded-2xl p-5 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>Real Database Telemetry Calculation Criteria</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-300 leading-relaxed">
          <div className="space-y-1.5">
            <p>
              <strong className="text-emerald-200">Activity Window Definition:</strong> Device activity is derived from the hardware client's last communication timestamp (<code className="font-mono text-emerald-400">last_seen_at</code>).
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-0.5">
              <li><strong>24 Hours:</strong> Current UTC minus 86,400 seconds.</li>
              <li><strong>7 Days:</strong> Current UTC minus 604,800 seconds.</li>
            </ul>
          </div>
          <div className="space-y-1.5">
            <p>
              <strong className="text-emerald-200">Consent vs Location Availability:</strong> Consent does not equate to coordinates. A device is counted as having available location data <em>only</em> if verified coordinate fields exist in <code className="font-mono text-emerald-400">app_devices</code>.
            </p>
            <p className="text-gray-400">
              All coordinates originate strictly from device GPS/network sensors with user consent. IP addresses are never used to fabricate coordinates.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Devices Quick Feed */}
      <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-gray-100">Recent Registered Devices</h4>
          </div>
          <button
            onClick={() => onNavigateToTab('devices')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition cursor-pointer"
          >
            <span>View All Devices</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentDevices.length === 0 ? (
          <div className="p-8 text-center bg-[#081C13] rounded-xl border border-[#23493C]">
            <Smartphone className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-300">No registered device records found.</p>
            <p className="text-[11px] text-gray-400 mt-1 max-w-md mx-auto">
              When users install Ayur Index on their Android device and consent to reporting, hardware telemetry will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#081C13] text-gray-400 border-b border-[#23493C]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Installation ID</th>
                  <th className="py-2.5 px-3 font-semibold">Device Model</th>
                  <th className="py-2.5 px-3 font-semibold">Android OS</th>
                  <th className="py-2.5 px-3 font-semibold">App Version</th>
                  <th className="py-2.5 px-3 font-semibold">Location Consent</th>
                  <th className="py-2.5 px-3 font-semibold">Last Seen</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#23493C]/50">
                {recentDevices.slice(0, 5).map(dev => (
                  <tr key={dev.installationId} className="hover:bg-[#133829]/50 transition">
                    <td className="py-3 px-3 font-mono text-emerald-300">
                      {dev.installationId.slice(0, 16)}...
                    </td>
                    <td className="py-3 px-3 text-gray-200 font-medium">
                      {dev.manufacturer ? `${dev.manufacturer} ` : ''}{dev.deviceModel || 'Unknown Device'}
                    </td>
                    <td className="py-3 px-3 text-gray-300">
                      {dev.androidVersion ? `Android ${dev.androidVersion}` : '—'}
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-400">
                      {dev.appVersionName || dev.appVersion || '—'}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        dev.locationConsent
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}>
                        {dev.locationConsent ? 'Granted' : 'None'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-400">
                      {new Date(dev.lastSeenAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onSelectDevice(dev.installationId)}
                        className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
