import React, { useState, useEffect, useCallback } from 'react';
import { 
  Smartphone, 
  Search, 
  Filter, 
  RefreshCw, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  MapPin, 
  ShieldCheck, 
  ShieldAlert, 
  Check, 
  X, 
  Trash2, 
  Database, 
  AlertTriangle,
  Activity,
  Calendar,
  Lock,
  Layers
} from 'lucide-react';
import { User, AppDevice, DeviceStats } from '../../types';
import { DeviceService, DeviceQueryParams } from '../../services/deviceService';
import { DeviceDetailsSidePanel } from './DeviceDetailsSidePanel';
import { SqlMigrationModal } from './SqlMigrationModal';

interface DeviceRecordsViewProps {
  activeUser: User | null;
  onNavigateHome?: () => void;
}

export const DeviceRecordsView: React.FC<DeviceRecordsViewProps> = ({
  activeUser,
  onNavigateHome,
}) => {
  // Device list and statistics
  const [devices, setDevices] = useState<AppDevice[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [stats, setStats] = useState<DeviceStats>({
    totalDevices: 0,
    active24h: 0,
    active7d: 0,
    locationConsentCount: 0,
    noLocationConsentCount: 0,
    devicesWithLocationData: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tableMissing, setTableMissing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search, Filters & Sorting
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [androidFilter, setAndroidFilter] = useState<string>('all');
  const [appVersionFilter, setAppVersionFilter] = useState<string>('all');
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<string>('all');
  const [consentFilter, setConsentFilter] = useState<'all' | 'both' | 'location_only' | 'device_only' | 'none'>('all');
  const [lastSeenFilter, setLastSeenFilter] = useState<'all' | '24h' | '7d' | '30d' | 'inactive'>('all');

  const [sortField, setSortField] = useState<'last_seen_at' | 'first_seen_at' | 'device_model' | 'manufacturer' | 'app_version'>('last_seen_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Inactivity Sync feedback
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState<number>(1);
  const pageSize = 12;

  // Selected Device for Side Panel Drawer
  const [selectedDevice, setSelectedDevice] = useState<AppDevice | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState<boolean>(false);

  // SQL Migration Modal
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState<boolean>(false);

  // Distinct filter options loaded from database
  const [distinctOptions, setDistinctOptions] = useState<{ androidVersions: string[]; appVersions: string[]; deviceTypes: string[] }>({
    androidVersions: [],
    appVersions: [],
    deviceTypes: [],
  });

  // Security Clearance Check: Must be authenticated and have role === 'ADMIN'
  const isAuthorizedAdmin = activeUser && (activeUser.role === 'ADMIN' || activeUser.roleTitle?.toLowerCase().includes('admin'));

  // Load KPI Stats
  const loadStats = useCallback(async () => {
    try {
      const statsRes = await DeviceService.fetchDeviceStats();
      setStats(statsRes.stats);
      if (statsRes.tableMissing) {
        setTableMissing(true);
      }
    } catch {}
  }, []);

  // Load Filter Options
  const loadFilterOptions = useCallback(async () => {
    try {
      const opts = await DeviceService.fetchDistinctFilterOptions();
      setDistinctOptions(opts);
    } catch {}
  }, []);

  // Load Device Records
  const loadDevices = useCallback(async () => {
    if (!isAuthorizedAdmin) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const params: DeviceQueryParams = {
        search,
        status: statusFilter,
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

        // Update selected device if open
        if (selectedDevice) {
          const fresh = result.devices.find(d => d.installationId === selectedDevice.installationId);
          if (fresh) setSelectedDevice(fresh);
        }
      }

      if (result.errorMessage && !result.tableMissing) {
        setErrorMessage(result.errorMessage);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load devices from Supabase');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthorizedAdmin, search, statusFilter, androidFilter, appVersionFilter, deviceTypeFilter, consentFilter, lastSeenFilter, sortField, sortDirection, page, selectedDevice]);

  // Heartbeat Inactivity Sync across all devices
  const handleSyncInactivity = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await DeviceService.syncHeartbeatInactivityStatuses(activeUser?.email || 'admin@sitaramayurveda.com');
      setSyncFeedback(res.message);
      await loadDevices();
      await loadStats();
    } catch (err: any) {
      setSyncFeedback(`Sync failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 6000);
    }
  };

  useEffect(() => {
    loadStats();
    loadFilterOptions();
  }, [loadStats, loadFilterOptions]);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  // Open Side Panel for a Device
  const handleInspectDevice = (device: AppDevice) => {
    setSelectedDevice(device);
    setIsSidePanelOpen(true);
  };

  // Close Side Panel
  const handleCloseSidePanel = () => {
    setIsSidePanelOpen(false);
    setSelectedDevice(null);
  };

  // Handle Deletion from Side Panel or Table
  const handleDeleteDevice = async (installationId: string) => {
    const res = await DeviceService.deleteDevice(installationId, activeUser?.email || 'admin');
    if (res.success) {
      handleCloseSidePanel();
      loadDevices();
      loadStats();
    }
  };

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

  // Security Clearance Gate
  if (!isAuthorizedAdmin) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-8 shadow-2xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400 mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-gray-100 font-serif">
            Administrator Clearance Required
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            The <strong>Device Records</strong> module contains sensitive hardware telemetry and registered installations. Access is restricted exclusively to authenticated Clinical Administrators.
          </p>
          <div className="p-3 rounded-xl bg-[#081C13] border border-[#23493C] text-xs text-emerald-400 font-mono">
            Active Account: {activeUser?.email || 'Unauthenticated'} ({activeUser?.role || 'Guest'})
          </div>
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
            >
              Return to Catalogue
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-[#23493C]/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-100 font-serif tracking-wide">
              Device Records
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
              public.app_devices
            </span>
          </div>
          <p className="text-xs text-emerald-400/80 mt-1">
            Realtime device telemetry, operating system diagnostics, and consented location records from Ayur Index Android installations.
          </p>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSyncInactivity}
            disabled={isSyncing || isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#081C13] hover:bg-[#133829] border border-[#23493C] text-emerald-300 hover:text-white text-xs font-semibold transition cursor-pointer shadow-sm disabled:opacity-50"
            title="Evaluate Heartbeat Inactivity Rule (>30d uninstalled, 7–30d inactive, <=7d active)"
          >
            <Activity className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-pulse' : ''}`} />
            <span>{isSyncing ? 'Evaluating...' : 'Sync Inactivity Rule'}</span>
          </button>

          <button
            onClick={() => {
              loadDevices();
              loadStats();
              loadFilterOptions();
            }}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer shadow-sm disabled:opacity-50"
            title="Reload records from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Records</span>
          </button>
        </div>
      </div>

      {/* Sync Inactivity Feedback Notification */}
      {syncFeedback && (
        <div className="bg-emerald-950/80 border border-emerald-600/80 rounded-xl p-3 text-xs text-emerald-200 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
          <button
            onClick={() => setSyncFeedback(null)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Table Missing Alert Banner */}
      {tableMissing && (
        <div className="bg-amber-950/40 border border-amber-700/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-200">
              Table <code className="font-mono bg-amber-900/60 px-1 py-0.5 rounded">public.app_devices</code> has not been detected in Supabase. Apply the migration script to enable device telemetry storage.
            </p>
          </div>
          <button
            onClick={() => setIsMigrationModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shrink-0 cursor-pointer"
          >
            Copy SQL Migration
          </button>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-[#0D281C] border border-[#23493C] rounded-xl p-3.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Registered</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-extrabold text-white font-mono">{stats.totalDevices}</span>
            <span className="text-[11px] text-gray-400">devices</span>
          </div>
        </div>

        <div className="bg-[#0D281C] border border-[#23493C] rounded-xl p-3.5">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Active (≤ 7d)</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-extrabold text-emerald-300 font-mono">{stats.active7d}</span>
            <span className="text-[11px] text-emerald-400/80">healthy</span>
          </div>
        </div>

        <div className="bg-[#0D281C] border border-[#23493C] rounded-xl p-3.5">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Inactive (7–30d)</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-extrabold text-amber-300 font-mono">{stats.inactiveCount || 0}</span>
            <span className="text-[11px] text-amber-400/80">dormant</span>
          </div>
        </div>

        <div className="bg-[#0D281C] border border-[#23493C] rounded-xl p-3.5">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Uninstalled (&gt;30d)</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-extrabold text-rose-300 font-mono">{stats.uninstalledCount || 0}</span>
            <span className="text-[11px] text-rose-400/80">inactivity rule</span>
          </div>
        </div>

        <div className="bg-[#0D281C] border border-[#23493C] rounded-xl p-3.5 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Location Consented</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">{stats.locationConsentCount}</span>
            <span className="text-[11px] text-gray-400">approved</span>
          </div>
        </div>
      </div>

      {/* Control Toolbar: Search & Multi-Filters */}
      <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-4 space-y-3 shadow-lg">
        
        {/* Search Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-emerald-400/60 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by installation ID, manufacturer, model, app version..."
              className="w-full bg-[#081C13] border border-[#23493C] text-xs text-gray-200 placeholder-emerald-600/60 rounded-xl pl-9 pr-8 py-2 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs text-gray-400 flex items-center gap-2 self-end sm:self-center">
            <span>Found <strong className="text-emerald-300 font-mono">{totalCount}</strong> device {totalCount === 1 ? 'record' : 'records'}</span>
          </div>
        </div>

        {/* Filter Dropdowns Bar */}
        <div className="pt-2 border-t border-[#23493C]/60 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3 text-emerald-400" />
            <span>Filters:</span>
          </span>

          {/* Heartbeat Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-[#081C13] border border-[#23493C] rounded-lg px-2.5 py-1 text-emerald-300 font-semibold focus:outline-none focus:border-emerald-500 text-xs"
          >
            <option value="all">All Heartbeat Statuses</option>
            <option value="ACTIVE">Active (≤ 7 days)</option>
            <option value="INACTIVE">Inactive (7–30 days)</option>
            <option value="UNINSTALLED">Uninstalled (&gt; 30d Inactivity)</option>
            <option value="SUSPENDED">Suspended (Admin Locked)</option>
          </select>

          {/* Android Version */}
          <select
            value={androidFilter}
            onChange={(e) => { setAndroidFilter(e.target.value); setPage(1); }}
            className="bg-[#081C13] border border-[#23493C] rounded-lg px-2.5 py-1 text-gray-200 focus:outline-none focus:border-emerald-500 text-xs"
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
            className="bg-[#081C13] border border-[#23493C] rounded-lg px-2.5 py-1 text-gray-200 focus:outline-none focus:border-emerald-500 text-xs"
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
            className="bg-[#081C13] border border-[#23493C] rounded-lg px-2.5 py-1 text-gray-200 focus:outline-none focus:border-emerald-500 text-xs"
          >
            <option value="all">All Form Factors</option>
            <option value="Phone">Phone</option>
            <option value="Tablet">Tablet</option>
            <option value="Foldable">Foldable</option>
            <option value="Other">Other</option>
          </select>

          {/* Consent Status */}
          <select
            value={consentFilter}
            onChange={(e) => { setConsentFilter(e.target.value as any); setPage(1); }}
            className="bg-[#081C13] border border-[#23493C] rounded-lg px-2.5 py-1 text-gray-200 focus:outline-none focus:border-emerald-500 text-xs"
          >
            <option value="all">All Consent States</option>
            <option value="both">Both Consented (Device + Location)</option>
            <option value="location_only">Location Consented</option>
            <option value="device_only">Device Only (No Location)</option>
            <option value="none">No Consents</option>
          </select>

          {/* Last Seen Date Filter */}
          <select
            value={lastSeenFilter}
            onChange={(e) => { setLastSeenFilter(e.target.value as any); setPage(1); }}
            className="bg-[#081C13] border border-[#23493C] rounded-lg px-2.5 py-1 text-gray-200 focus:outline-none focus:border-emerald-500 text-xs"
          >
            <option value="all">All Activity Times</option>
            <option value="24h">Active in Last 24 Hours</option>
            <option value="7d">Active in Last 7 Days</option>
            <option value="30d">Active in Last 30 Days</option>
            <option value="inactive">Inactive &gt; 30 Days</option>
          </select>

          {/* Reset Filters button */}
          {(statusFilter !== 'all' || androidFilter !== 'all' || appVersionFilter !== 'all' || deviceTypeFilter !== 'all' || consentFilter !== 'all' || lastSeenFilter !== 'all' || search) && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
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

      {/* Error Message */}
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
                <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Heartbeat Status</th>
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
                  onClick={() => handleSort('last_seen_at')}
                  className="py-3 px-3.5 font-semibold whitespace-nowrap cursor-pointer hover:text-emerald-400"
                >
                  <div className="flex items-center gap-1">
                    <span>Last Seen</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Reporting Consent</th>
                <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Location Consent</th>
                <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Coordinates</th>
                <th className="py-3 px-3.5 font-semibold whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#23493C]/40">
              {isLoading ? (
                <tr>
                  <td colSpan={12} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mb-3" />
                      <span className="text-xs font-mono text-emerald-300">Retrieving device records from app_devices...</span>
                    </div>
                  </td>
                </tr>
              ) : devices.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-14 text-center">
                    <div className="max-w-md mx-auto space-y-2">
                      <Smartphone className="w-10 h-10 text-emerald-500/40 mx-auto" />
                      <h4 className="text-sm font-semibold text-gray-200">No Device Records Found</h4>
                      <p className="text-xs text-emerald-400/70 leading-relaxed">
                        {tableMissing
                          ? 'The app_devices table needs to be created in your Supabase project. Click the SQL Schema button above to copy the script.'
                          : 'No registered Android installations match your current search or filter criteria.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                devices.map((dev) => {
                  const isSelected = selectedDevice?.installationId === dev.installationId;
                  const hasCoordinates = dev.latestLocation !== null && dev.latestLocation !== undefined;

                  return (
                    <tr 
                      key={dev.installationId} 
                      onClick={() => handleInspectDevice(dev)}
                      className={`transition cursor-pointer group ${
                        isSelected 
                          ? 'bg-emerald-950/70 border-l-4 border-emerald-400' 
                          : 'hover:bg-[#133829]/40'
                      }`}
                    >
                      {/* Installation ID */}
                      <td className="py-3 px-3.5 font-mono text-emerald-300">
                        <span title={dev.installationId} className="select-all">
                          {dev.installationId.length > 14 ? `${dev.installationId.slice(0, 14)}...` : dev.installationId}
                        </span>
                      </td>

                      {/* Heartbeat Status */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          dev.status === 'ACTIVE'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/70'
                            : dev.status === 'INACTIVE'
                            ? 'bg-amber-950 text-amber-300 border border-amber-600/70'
                            : dev.status === 'UNINSTALLED'
                            ? 'bg-rose-950 text-rose-300 border border-rose-600/70'
                            : 'bg-gray-800 text-gray-300 border border-gray-600'
                        }`}>
                          {dev.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                          {dev.status === 'INACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                          {dev.status === 'UNINSTALLED' && <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />}
                          {dev.status === 'SUSPENDED' && <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
                          <span>
                            {dev.status === 'ACTIVE' && `Active (${dev.daysSinceLastSeen ?? 0}d)`}
                            {dev.status === 'INACTIVE' && `Inactive (${dev.daysSinceLastSeen ?? 0}d)`}
                            {dev.status === 'UNINSTALLED' && `Uninstalled (${dev.daysSinceLastSeen ?? 0}d)`}
                            {dev.status === 'SUSPENDED' && 'Suspended'}
                          </span>
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

                      {/* Android OS */}
                      <td className="py-3 px-3.5 text-gray-300">
                        {dev.androidVersion ? `Android ${dev.androidVersion}` : '—'}
                      </td>

                      {/* App Version */}
                      <td className="py-3 px-3.5 font-mono text-emerald-300">
                        {dev.appVersionName || dev.appVersion || '—'}
                      </td>

                      {/* Device Type */}
                      <td className="py-3 px-3.5 text-gray-300">
                        <span className="px-1.5 py-0.5 rounded bg-[#081C13] border border-[#23493C] text-[10px] uppercase font-bold text-gray-300">
                          {dev.deviceType || 'Phone'}
                        </span>
                      </td>

                      {/* Last Seen */}
                      <td className="py-3 px-3.5 text-emerald-300 font-mono whitespace-nowrap">
                        {formatDate(dev.lastSeenAt)}
                      </td>

                      {/* Reporting Consent */}
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

                      {/* Coordinates Availability */}
                      <td className="py-3 px-3.5">
                        {hasCoordinates && dev.latestLocation ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-300" title={`${dev.latestLocation.latitude.toFixed(5)}, ${dev.latestLocation.longitude.toFixed(5)}`}>
                            <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>{dev.latestLocation.latitude.toFixed(3)}, {dev.latestLocation.longitude.toFixed(3)}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-500">None</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleInspectDevice(dev)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#081C13] hover:bg-[#133829] border border-[#23493C] text-emerald-300 hover:text-white transition cursor-pointer text-xs font-semibold"
                            title="Inspect complete device specifications & telemetry in side panel"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Inspect</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
                title="Previous Page"
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
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Slide-over Side Panel for Detailed Device Information */}
      <DeviceDetailsSidePanel
        isOpen={isSidePanelOpen}
        onClose={handleCloseSidePanel}
        device={selectedDevice}
        onDeleteDevice={handleDeleteDevice}
        onStatusUpdated={async () => {
          await loadDevices();
          await loadStats();
        }}
        adminEmail={activeUser?.email || 'admin@sitaramayurveda.com'}
      />

      {/* SQL Migration Modal */}
      <SqlMigrationModal
        isOpen={isMigrationModalOpen}
        onClose={() => setIsMigrationModalOpen(false)}
      />

    </div>
  );
};
export default DeviceRecordsView;
