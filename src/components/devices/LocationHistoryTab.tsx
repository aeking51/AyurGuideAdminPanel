import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  MapPin, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  ShieldCheck, 
  Navigation,
  Compass,
  Calendar,
  Layers,
  Database,
  AlertTriangle,
  Info
} from 'lucide-react';
import { AppDeviceLocation } from '../../types';
import { DeviceService, LocationQueryParams } from '../../services/deviceService';
import { InteractiveMapView } from './InteractiveMapView';

interface LocationHistoryTabProps {
  initialInstallationId?: string | null;
  onOpenMigrationModal: () => void;
}

export const LocationHistoryTab: React.FC<LocationHistoryTabProps> = ({
  initialInstallationId,
  onOpenMigrationModal,
}) => {
  const [locations, setLocations] = useState<AppDeviceLocation[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tableMissing, setTableMissing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters & State
  const [searchId, setSearchId] = useState<string>(initialInstallationId || '');
  const [precisionFilter, setPrecisionFilter] = useState<'all' | 'precise' | 'approximate'>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'today' | '7d' | '30d'>('all');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);
  const pageSize = 15;

  // Selected Location for Map and Details view
  const [selectedLocation, setSelectedLocation] = useState<AppDeviceLocation | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'table'>('split');

  const loadLocations = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const params: LocationQueryParams = {
        installationId: searchId,
        precision: precisionFilter,
        dateRange: dateRangeFilter,
        sortDirection,
        page,
        pageSize,
      };

      const result = await DeviceService.fetchLocationHistory(params);
      if (result.tableMissing) {
        setTableMissing(true);
        setLocations([]);
        setTotalCount(0);
        setSelectedLocation(null);
      } else {
        setTableMissing(false);
        setLocations(result.locations);
        setTotalCount(result.total);
        if (result.locations.length > 0 && !selectedLocation) {
          setSelectedLocation(result.locations[0]);
        }
      }

      if (result.errorMessage && !result.tableMissing) {
        setErrorMessage(result.errorMessage);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load location history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, [searchId, precisionFilter, dateRangeFilter, sortDirection, page]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const formatDate = (ts?: string) => {
    if (!ts) return 'Not available';
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return 'Not available';
      return d.toLocaleString(undefined, {
        dateStyle: 'short',
        timeStyle: 'medium',
      });
    } catch {
      return 'Not available';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Table Missing Alert */}
      {tableMissing && (
        <div className="bg-amber-950/40 border border-amber-700/60 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-200">
              Table <code className="font-mono bg-amber-900/60 px-1 py-0.5 rounded">public.app_devices</code> does not exist yet. Run the SQL migration to enable device and location capture.
            </p>
          </div>
          <button
            onClick={onOpenMigrationModal}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shrink-0 cursor-pointer"
          >
            Copy SQL Script
          </button>
        </div>
      )}

      {/* Filter & Toolbar */}
      <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search by Installation ID */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-emerald-400/60 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => { setSearchId(e.target.value); setPage(1); }}
              placeholder="Search coordinates by Installation ID..."
              className="w-full bg-[#081C13] border border-[#23493C] text-xs text-gray-200 placeholder-emerald-600/60 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
            />
          </div>

          {/* View Mode Toggle & Refresh */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#081C13] border border-[#23493C] rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  viewMode === 'split' ? 'bg-emerald-700 text-white shadow-xs' : 'text-gray-400 hover:text-white'
                }`}
              >
                Split View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  viewMode === 'map' ? 'bg-emerald-700 text-white shadow-xs' : 'text-gray-400 hover:text-white'
                }`}
              >
                Map Only
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  viewMode === 'table' ? 'bg-emerald-700 text-white shadow-xs' : 'text-gray-400 hover:text-white'
                }`}
              >
                Table Only
              </button>
            </div>

            <button
              onClick={loadLocations}
              disabled={isLoading}
              className="p-2 rounded-xl bg-[#081C13] hover:bg-[#133829] border border-[#23493C] text-emerald-300 hover:text-white transition cursor-pointer disabled:opacity-50"
              title="Refresh location records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

        </div>

        {/* Precision & Date Range Filters */}
        <div className="pt-2 border-t border-[#23493C]/60 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3 text-emerald-400" />
            <span>Filters:</span>
          </span>

          {/* Precision Filter */}
          <select
            value={precisionFilter}
            onChange={(e) => { setPrecisionFilter(e.target.value as any); setPage(1); }}
            className="bg-[#081C13] border border-[#23493C] rounded-lg px-2.5 py-1 text-gray-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Precision Levels</option>
            <option value="precise">Precise Coordinates Only</option>
            <option value="approximate">Approximate Only</option>
          </select>

          {/* Date Range Filter */}
          <select
            value={dateRangeFilter}
            onChange={(e) => { setDateRangeFilter(e.target.value as any); setPage(1); }}
            className="bg-[#081C13] border border-[#23493C] rounded-lg px-2.5 py-1 text-gray-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Time Records</option>
            <option value="today">Recorded Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          {/* Sort Direction Toggle */}
          <button
            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#081C13] border border-[#23493C] text-emerald-300 hover:text-white transition cursor-pointer"
          >
            <ArrowUpDown className="w-3 h-3" />
            <span>{sortDirection === 'desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>

          {(searchId || precisionFilter !== 'all' || dateRangeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchId('');
                setPrecisionFilter('all');
                setDateRangeFilter('all');
                setPage(1);
              }}
              className="text-xs text-rose-400 hover:text-rose-300 ml-auto underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Map View Section (Visible in Split or Map mode) */}
      {(viewMode === 'split' || viewMode === 'map') && (
        <InteractiveMapView
          locations={locations}
          selectedLocation={selectedLocation}
          onSelectLocation={(loc) => setSelectedLocation(loc)}
          isLoading={isLoading}
        />
      )}

      {/* Location Records Table (Visible in Split or Table mode) */}
      {(viewMode === 'split' || viewMode === 'table') && (
        <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-[#081C13] border-b border-[#23493C] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200">
                Consented Telemetry Log ({totalCount} {totalCount === 1 ? 'Record' : 'Records'})
              </h4>
            </div>
            <span className="text-[11px] text-gray-400">
              Times displayed in Administrator Local Time
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#081C13]/80 text-gray-300 border-b border-[#23493C]">
                <tr>
                  <th className="py-2.5 px-3.5 font-semibold">Installation ID</th>
                  <th className="py-2.5 px-3.5 font-semibold">Latitude</th>
                  <th className="py-2.5 px-3.5 font-semibold">Longitude</th>
                  <th className="py-2.5 px-3.5 font-semibold">Accuracy</th>
                  <th className="py-2.5 px-3.5 font-semibold">Precision</th>
                  <th className="py-2.5 px-3.5 font-semibold">Source</th>
                  <th className="py-2.5 px-3.5 font-semibold">Recorded Time</th>
                  <th className="py-2.5 px-3.5 font-semibold">Uploaded Time</th>
                  <th className="py-2.5 px-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#23493C]/40">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-7 h-7 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mb-2" />
                        <span className="text-xs font-mono text-emerald-300">Retrieving coordinates from Supabase...</span>
                      </div>
                    </td>
                  </tr>
                ) : locations.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center">
                      <div className="max-w-md mx-auto">
                        <MapPin className="w-10 h-10 text-emerald-500/40 mx-auto mb-2" />
                        <h4 className="text-sm font-semibold text-gray-200">No Location Records Available</h4>
                        <p className="text-xs text-emerald-400/70 mt-1">
                          No GPS coordinate records exist for the selected device or date range. Only legitimately consented coordinates are stored.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  locations.map((loc) => {
                    const isSelected = selectedLocation?.id ? selectedLocation.id === loc.id : false;
                    return (
                      <tr 
                        key={loc.id || `${loc.installationId}-${loc.recordedAt}`}
                        onClick={() => setSelectedLocation(loc)}
                        className={`transition cursor-pointer ${
                          isSelected ? 'bg-emerald-950/80 border-l-4 border-emerald-400' : 'hover:bg-[#133829]/40'
                        }`}
                      >
                        <td className="py-3 px-3.5 font-mono text-emerald-300">
                          <span title={loc.installationId}>
                            {loc.installationId.length > 14 ? `${loc.installationId.slice(0, 14)}...` : loc.installationId}
                          </span>
                        </td>

                        <td className="py-3 px-3.5 font-mono text-gray-200">
                          {loc.latitude.toFixed(6)}
                        </td>

                        <td className="py-3 px-3.5 font-mono text-gray-200">
                          {loc.longitude.toFixed(6)}
                        </td>

                        <td className="py-3 px-3.5 text-gray-300">
                          {loc.accuracy ? `±${Math.round(loc.accuracy)}m` : '—'}
                        </td>

                        <td className="py-3 px-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            loc.locationPrecision === 'precise'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                              : 'bg-amber-950 text-amber-300 border border-amber-700'
                          }`}>
                            {loc.locationPrecision}
                          </span>
                        </td>

                        <td className="py-3 px-3.5 text-gray-400 font-mono text-[11px]">
                          {loc.locationSource || 'gps'}
                        </td>

                        <td className="py-3 px-3.5 text-gray-300 whitespace-nowrap">
                          {formatDate(loc.recordedAt)}
                        </td>

                        <td className="py-3 px-3.5 text-gray-500 whitespace-nowrap text-[11px]">
                          {formatDate(loc.uploadedAt)}
                        </td>

                        <td className="py-3 px-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                            <a
                              href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-[#081C13] hover:bg-[#133829] border border-[#23493C] text-emerald-400 hover:text-white transition"
                              title="Open coordinates in Google Maps"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
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
                <span className="font-bold text-gray-200">{totalCount}</span> location fixes
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
      )}

    </div>
  );
};
