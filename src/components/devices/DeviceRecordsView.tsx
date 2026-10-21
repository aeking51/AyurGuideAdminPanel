import React, { useState, useEffect, useCallback } from 'react';
import { 
  Smartphone, 
  MapPin, 
  ShieldCheck, 
  LayoutDashboard, 
  ShieldAlert, 
  RefreshCw, 
  Database,
  Lock,
  AlertCircle
} from 'lucide-react';
import { User, DeviceStats, AppDevice, AppDeviceLocation } from '../../types';
import { DeviceService } from '../../services/deviceService';
import { DeviceOverviewTab } from './DeviceOverviewTab';
import { RegisteredDevicesTab } from './RegisteredDevicesTab';
import { LocationHistoryTab } from './LocationHistoryTab';
import { PrivacyConsentTab } from './PrivacyConsentTab';
import { DeviceDetailsModal } from './DeviceDetailsModal';
import { SqlMigrationModal } from './SqlMigrationModal';

interface DeviceRecordsViewProps {
  activeUser: User | null;
  onNavigateHome?: () => void;
}

export const DeviceRecordsView: React.FC<DeviceRecordsViewProps> = ({
  activeUser,
  onNavigateHome,
}) => {
  // Navigation tabs within this section
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'devices' | 'locations' | 'privacy'>('overview');

  // Stats & Database state
  const [stats, setStats] = useState<DeviceStats>({
    totalDevices: 0,
    active24h: 0,
    active7d: 0,
    locationConsentCount: 0,
    noLocationConsentCount: 0,
    devicesWithLocationData: 0,
  });
  const [tableMissing, setTableMissing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [recentDevices, setRecentDevices] = useState<AppDevice[]>([]);

  // Modals & inspect targets
  const [inspectInstallationId, setInspectInstallationId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState<boolean>(false);
  const [filterLocationInstallationId, setFilterLocationInstallationId] = useState<string | null>(null);

  // Security Clearance Check: Must be authenticated and have role === 'ADMIN'
  const isAuthorizedAdmin = activeUser && (activeUser.role === 'ADMIN' || activeUser.roleTitle?.toLowerCase().includes('admin'));

  const loadDashboardData = useCallback(async () => {
    if (!isAuthorizedAdmin) return;
    setIsLoading(true);
    try {
      const [statsRes, devRes] = await Promise.all([
        DeviceService.fetchDeviceStats(),
        DeviceService.fetchDevices({ pageSize: 5, sortField: 'last_seen_at', sortDirection: 'desc' }),
      ]);

      setTableMissing(statsRes.tableMissing || devRes.tableMissing);
      setStats(statsRes.stats);
      setRecentDevices(devRes.devices);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthorizedAdmin]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle selecting a device to open the details modal
  const handleSelectDevice = (installationId: string) => {
    setInspectInstallationId(installationId);
    setIsDetailsModalOpen(true);
  };

  // Handle navigating directly to location history for a specific device
  const handleNavigateToDeviceLocation = (installationId: string) => {
    setFilterLocationInstallationId(installationId);
    setActiveSubTab('locations');
  };

  // Handle device deletion
  const handleDeviceDeleted = async (installationId?: string) => {
    if (installationId) {
      await DeviceService.deleteDevice(installationId, activeUser?.email || 'admin');
    }
    loadDashboardData();
  };

  // If user is not authorized, render clear security clearance barrier
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
            The <strong>Device & Location Records</strong> module contains sensitive hardware telemetry and consented GPS records. Access is restricted exclusively to authenticated Clinical Administrators.
          </p>
          <div className="p-3 rounded-xl bg-[#081C13] border border-[#23493C] text-xs text-emerald-400 font-mono">
            Active Identity: {activeUser?.email || 'Unauthenticated'} ({activeUser?.role || 'Guest'})
          </div>
          <p className="text-[11px] text-gray-500">
            Please sign in as an Administrator in the top right user menu to access this portal.
          </p>
        </div>
      </div>
    );
  }

  const subTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'devices', label: 'Registered Devices', icon: Smartphone, count: stats.totalDevices },
    { id: 'locations', label: 'Location History', icon: MapPin },
    { id: 'privacy', label: 'Privacy & Consent', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-[#23493C]/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-100 font-serif tracking-wide">
              Device & Location Records
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
              Admin Vault
            </span>
          </div>
          <p className="text-xs text-emerald-400/80 mt-1">
            Realtime device telemetry, operating system diagnostics, and consented GPS records from Ayur Index Android installations.
          </p>
        </div>

        {/* Global Section Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsMigrationModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0D281C] hover:bg-[#133829] border border-[#23493C] text-emerald-300 hover:text-white text-xs font-medium transition cursor-pointer"
            title="Inspect Supabase SQL Migration"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">SQL Migration</span>
          </button>

          <button
            onClick={loadDashboardData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0D281C] hover:bg-[#133829] border border-[#23493C] text-emerald-300 hover:text-white text-xs font-medium transition cursor-pointer disabled:opacity-50"
            title="Reload telemetry records from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Pills */}
      <div className="flex space-x-1 sm:space-x-2 border-b border-[#23493C]/40 pb-2 overflow-x-auto no-scrollbar">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                if (tab.id !== 'locations') {
                  setFilterLocationInstallationId(null);
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-[#0D281C] text-gray-300 hover:text-white hover:bg-[#133829] border border-[#23493C]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Render Active Sub-View */}
      {activeSubTab === 'overview' && (
        <DeviceOverviewTab
          stats={stats}
          tableMissing={tableMissing}
          isLoading={isLoading}
          onReload={loadDashboardData}
          onOpenMigrationModal={() => setIsMigrationModalOpen(true)}
          onNavigateToTab={(tab) => {
            setActiveSubTab(tab);
          }}
          recentDevices={recentDevices}
          onSelectDevice={handleSelectDevice}
        />
      )}

      {activeSubTab === 'devices' && (
        <RegisteredDevicesTab
          onSelectDevice={handleSelectDevice}
          onNavigateToLocation={handleNavigateToDeviceLocation}
          onOpenMigrationModal={() => setIsMigrationModalOpen(true)}
        />
      )}

      {activeSubTab === 'locations' && (
        <LocationHistoryTab
          initialInstallationId={filterLocationInstallationId}
          onOpenMigrationModal={() => setIsMigrationModalOpen(true)}
        />
      )}

      {activeSubTab === 'privacy' && (
        <PrivacyConsentTab
          stats={stats}
          devices={recentDevices}
          activeUser={activeUser}
          onRefresh={loadDashboardData}
          onOpenMigrationModal={() => setIsMigrationModalOpen(true)}
          onSelectDevice={handleSelectDevice}
          onDeviceDeleted={loadDashboardData}
        />
      )}

      {/* Device Details Modal */}
      <DeviceDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setInspectInstallationId(null);
        }}
        installationId={inspectInstallationId}
        onDeleteDevice={handleDeviceDeleted}
        onNavigateToLocation={(loc) => {
          setFilterLocationInstallationId(loc.installationId);
          setActiveSubTab('locations');
        }}
      />

      {/* SQL Migration Modal */}
      <SqlMigrationModal
        isOpen={isMigrationModalOpen}
        onClose={() => setIsMigrationModalOpen(false)}
      />

    </div>
  );
};
