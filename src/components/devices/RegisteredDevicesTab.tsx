import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Smartphone, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  MapPin, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert, 
  Check, 
  X,
  AlertTriangle,
  Download,
  Database
} from 'lucide-react';
import { AppDevice } from '../../types';
import { DeviceService, DeviceQueryParams } from '../../services/deviceService';

interface RegisteredDevicesTabProps {
  onSelectDevice: (installationId: string) => void;
  onNavigateToLocation: (installationId: string) => void;
  onOpenMigrationModal: () => void;
}

export const RegisteredDevicesTab: React.FC<RegisteredDevicesTabProps> = ({
  onSelectDevice,
  onNavigateToLocation,
  onOpenMigrationModal,
}) => {
  const [devices, setDevices] = useState<AppDevice[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tableMissing, setTableMissing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search, Filters & Sorting state
  const [search, setSearch] = useState<string>('');
  const [androidFilter, setAndroidFilter] = useState<string>('all');
  const [appVersionFilter, setAppVersionFilter] = useState<string>('all');
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<string>('all');
  const [consentFilter, setConsentFilter] = useState<'all' | 'both' | 'location_only' | 'device_only' | 'none'>('all');
  const [lastSeenFilter, setLastSeenFilter] = useState<'all' | '24h' | '7d' | '30d' | 'inactive'>('all');

  const [sortField, setSortField] = useState<'last_seen_at' | 'first_seen_at' | 'device_model' | 'manufacturer' | 'app_version'>('last_seen_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [page, setPage] = useState<number>(1);
  const pageSize = 12;

  // Filter options loaded from database
  const [distinctOptions, setDistinctOptions] = useState<{ androidVersions: string[]; appVersions: string[]; deviceTypes: string[] }>({
    androidVersions: [],
    appVersions: [],
    deviceTypes: [],
  });

  const loadFilterOptions = async () => {
    const opts = await DeviceService.fetchDistinctFilterOptions();
    setDistinctOptions(opts);
  };

  const loadDevices = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const params: DeviceQueryParams = {
        search,
        androidVersion: androidFilter,
        appVersion: appVersionFilter,
        deviceType: deviceTypeFilter,
        consentStatus: consentFilter,
        lastSeenFilter: lastSeenFilter,
        sortField,
        sortDirection,
        page,
        pageSize,
      };

      const result = await DeviceService.fetchDevices(params);
      if (result.tableMissing) {
        setTableMissing(true);
        setDevices([]);
        setTotalCount(0);
      } else {
        setTableMissing(false);
        setDevices(result.devices);
        setTotalCount(result.total);
      }

      if (result.errorMessage && !result.tableMissing) {
        setErrorMessage(result.errorMessage);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load devices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadDevices();
  }, [search, androidFilter, appVersionFilter, deviceTypeFilter, consentFilter, lastSeenFilter, sortField, sortDirection, page]);

  const handleSort = (field: 'last_seen_at' | 'first_seen_at' | 'device_model' | 'manufacturer' | 'app_version') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setPage(1);
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const formatDate = (ts?: string) => {
    if (!ts) return 'Not available';
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return 'Not available';
      return d.toLocaleString(undefined, {
        dateStyle: 'short',
        timeStyle: 'short',
      });
    } catch {
      return 'Not available';
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Table Missing Banner */}
      {tableMissing && (
        <div className="bg-amber-950/40 border border-amber-700/60 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-200">
              Table <code className="font-mono bg-amber-900/60 px-1 py-0.5 rounded">public.app_devices</code> does not exist yet in Supabase. Apply the migration to enable device registration and telemetry tracking.
            </p>
          </div>
          <button
            onClick={onOpenMigrationModal}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shrink-0 cursor-pointer"
          >
            Copy SQL Migration
          </button>
        </div>
      )}

      {/* Control Toolbar: Search & Action Controls */}
      <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-4 space-y-3">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-emerald-400/60 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by ID, manufacturer, model, app version..."
              className="w-full bg-[#081C13] border border-[#23493C] text-xs text-gray-200 placeholder-emerald-600/60 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-3 top-2 text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                loadDevices();
                loadFilterOptions();
              }}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#081C13] hover:bg-[#133829] border border-[#23493C] text-emerald-300 hover:text-white text-xs font-medium transition cursor-pointer disabled:opacity-50"
              title="Refresh device records from Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

        </div>

        {/* Multi-Filter Dropdowns Bar */}
        <div className="pt-2 border-t border-[#23493C]/60 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3 text-emerald-400" />
            <span>Filters:</span>
          </span>

          {/* Android Version */}
          <select
            value={androidFilter}
            onChange={(e) => { setAndroidFilter(e.target.value); setPage(1); }}
            className="bg-[#081C13] border border-[#23493C] rounded-lg px-2.5 py-1 text-gray-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Android OS</option>
            {distinctOptions.androidVersions.map(v => (
              <option key={v} value={v}>Android {v}</option>
            ))}
          </select>

          {/* App Version */}
          <select
            value={appVersionFilter}
            onChange={(e) => { setAppVersionFilter(e.target.value); setPage(1); }}
            className="bg-[#081C13] border border-[#23493C] rounded-lg px-2.5 py-1 text-gray-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All App Versions</option>
            {distinctOptions.appVersions.map(v => (
              <option key={v} value={v}>v{v}</option>
            ))}
          </select>

          {/* Device Type */}
          <select
            value={deviceTypeFilter}
            onChange={(e) => { setDeviceTypeFilter(e.target.value); setPage(1); }}
            className="bg-[#081C13] border border-[#23493C] rounded-lg px-2.5 py-1 text-gray-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Device Types</option>
            <option value="Phone">Phone</option>
            <option value="Tablet">Tablet</option>
            <option value="Foldable">Foldable</option>
            <option value="Other">Other</option>
          </select>

          {/* Consent Status */}
          <select
            value={consentFilter}
            onChange={(e) => { setConsentFilter(e.target.value as any); setPage(1); }}
            className="bg-[#081C13] border border-[#23493C] rounded-lg px-2.5 py-1 text-gray-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Consent States</option>
            <option value="both">Both Consented (Device + Location)</option>
            <option value="location_only">Location Consented</option>
            <option value="device_only">Device Only (No Location)</option>
            <option value="none">No Consents</option>
          </select>

          {/* Last Seen Date */}
          <select
            value={lastSeenFilter}
            onChange={(e) => { setLastSeenFilter(e.target.value as any); setPage(1); }}
            className="bg-[#081C13] border border-[#23493C] rounded-lg px-2.5 py-1 text-gray-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Activity Times</option>
            <option value="24h">Active in Last 24 Hours</option>
            <option value="7d">Active in Last 7 Days</option>
            <option value="30d">Active in Last 30 Days</option>
            <option value="inactive">Inactive &gt; 30 Days</option>
          </select>

          {/* Reset Filters button if any active */}
          {(androidFilter !== 'all' || appVersionFilter !== 'all' || deviceTypeFilter !== 'all' || consentFilter !== 'all' || lastSeenFilter !== 'all' || search) && (
            <button
              onClick={() => {
                setSearch('');
                setAndroidFilter('all');
                setAppVersionFilter('all');
                setDeviceTypeFilter('all');
                setConsentFilter('all');
                setLastSeenFilter('all');
                setPage(1);
              }}
              className="text-xs text-rose-400 hover:text-rose-300 ml-auto underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}

        </div>

      </div>

      {/* Error Message Banner */}
      {errorMessage && (
        <div className="bg-rose-950/50 border border-rose-800 p-3 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Devices Table */}
      <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#081C13] text-gray-300 border-b border-[#23493C]">
              <tr>
                <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Installation ID</th>
                <th 
                  onClick={() => handleSort('manufacturer')}
                  className="py-3 px-3.5 font-semibold whitespace-nowrap cursor-pointer hover:text-emerald-400"
                >
                  <div className="flex items-center gap-1">
                    <span>Manufacturer</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('device_model')}
                  className="py-3 px-3.5 font-semibold whitespace-nowrap cursor-pointer hover:text-emerald-400"
                >
                  <div className="flex items-center gap-1">
                    <span>Device Model</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Android OS</th>
                <th 
                  onClick={() => handleSort('app_version')}
                  className="py-3 px-3.5 font-semibold whitespace-nowrap cursor-pointer hover:text-emerald-400"
                >
                  <div className="flex items-center gap-1">
                    <span>App Version</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Device Type</th>
                <th 
                  onClick={() => handleSort('first_seen_at')}
                  className="py-3 px-3.5 font-semibold whitespace-nowrap cursor-pointer hover:text-emerald-400"
                >
                  <div className="flex items-center gap-1">
                    <span>First Seen</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('last_seen_at')}
                  className="py-3 px-3.5 font-semibold whitespace-nowrap cursor-pointer hover:text-emerald-400"
                >
                  <div className="flex items-center gap-1">
                    <span>Last Seen</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Last Synchronization</th>
                <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Device Consent</th>
                <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Location Consent</th>
                <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Location Records</th>
                <th className="py-3 px-3.5 font-semibold whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#23493C]/40">
              {isLoading ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-7 h-7 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mb-2" />
                      <span className="text-xs font-mono text-emerald-300">Retrieving device records from Supabase...</span>
                    </div>
                  </td>
                </tr>
              ) : devices.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center">
                    <div className="max-w-md mx-auto">
                      <Smartphone className="w-10 h-10 text-emerald-500/40 mx-auto mb-2" />
                      <h4 className="text-sm font-semibold text-gray-200">No Device Records Match Query</h4>
                      <p className="text-xs text-emerald-400/70 mt-1">
                        {tableMissing
                          ? 'The app_devices table needs to be created in your Supabase project.'
                          : 'Try adjusting your search keywords or resetting your active filter criteria.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                devices.map((dev) => (
                  <tr key={dev.installationId} className="hover:bg-[#133829]/40 transition group">
                    {/* Installation ID */}
                    <td className="py-3 px-3.5 font-mono text-emerald-300">
                      <span className="select-all" title={dev.installationId}>
                        {dev.installationId.length > 14 ? `${dev.installationId.slice(0, 14)}...` : dev.installationId}
                      </span>
                    </td>

                    {/* Manufacturer */}
                    <td className="py-3 px-3.5 text-gray-200">
                      {dev.manufacturer || 'Not available'}
                    </td>

                    {/* Device Model */}
                    <td className="py-3 px-3.5 font-medium text-gray-100">
                      {dev.deviceModel || 'Not available'}
                    </td>

                    {/* Android Version */}
                    <td className="py-3 px-3.5 text-gray-300">
                      {dev.androidVersion ? `Android ${dev.androidVersion}` : 'Not available'}
                    </td>

                    {/* App Version */}
                    <td className="py-3 px-3.5 font-mono text-emerald-300">
                      {dev.appVersionName || dev.appVersion || 'Not available'}
                    </td>

                    {/* Device Type */}
                    <td className="py-3 px-3.5 text-gray-300">
                      <span className="px-1.5 py-0.5 rounded bg-[#081C13] border border-[#23493C] text-[10px] uppercase font-bold text-gray-300">
                        {dev.deviceType || 'Phone'}
                      </span>
                    </td>

                    {/* First Seen */}
                    <td className="py-3 px-3.5 text-gray-400 whitespace-nowrap">
                      {formatDate(dev.firstSeenAt)}
                    </td>

                    {/* Last Seen */}
                    <td className="py-3 px-3.5 text-emerald-300 whitespace-nowrap font-medium">
                      {formatDate(dev.lastSeenAt)}
                    </td>

                    {/* Last Synchronization */}
                    <td className="py-3 px-3.5 text-gray-400 whitespace-nowrap">
                      {formatDate(dev.lastSyncAt)}
                    </td>

                    {/* Device Reporting Consent */}
                    <td className="py-3 px-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        dev.deviceReportingConsent
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-amber-950 text-amber-300 border border-amber-700'
                      }`}>
                        {dev.deviceReportingConsent ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-amber-400" />}
                        <span>{dev.deviceReportingConsent ? 'Granted' : 'Revoked'}</span>
                      </span>
                    </td>

                    {/* Location Consent */}
                    <td className="py-3 px-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        dev.locationConsent
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}>
                        {dev.locationConsent ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-gray-400" />}
                        <span>{dev.locationConsent ? 'Granted' : 'None'}</span>
                      </span>
                    </td>

                    {/* Location Availability */}
                    <td className="py-3 px-3.5">
                      {dev.locationsCount && dev.locationsCount > 0 ? (
                        <button
                          onClick={() => onNavigateToLocation(dev.installationId)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>{dev.locationsCount} Available</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-500">None</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectDevice(dev.installationId)}
                          className="p-1.5 rounded-lg bg-[#081C13] hover:bg-[#133829] border border-[#23493C] text-emerald-300 hover:text-white transition cursor-pointer"
                          title="View Complete Hardware & Telemetry Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalCount > 0 && (
          <div className="p-4 bg-[#081C13] border-t border-[#23493C] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
            <div>
              Showing <span className="font-bold text-gray-200">{(page - 1) * pageSize + 1}</span> to{' '}
              <span className="font-bold text-gray-200">{Math.min(page * pageSize, totalCount)}</span> of{' '}
              <span className="font-bold text-gray-200">{totalCount}</span> registered devices
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-lg bg-[#0D281C] hover:bg-[#133829] border border-[#23493C] text-gray-300 hover:text-white disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2 font-mono text-emerald-300">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                className="p-1.5 rounded-lg bg-[#0D281C] hover:bg-[#133829] border border-[#23493C] text-gray-300 hover:text-white disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
