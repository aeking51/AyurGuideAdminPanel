import { SupabaseService } from './supabase';
import { AppDevice, AppDeviceLocation, DeviceStats } from '../types';

export interface DeviceQueryParams {
  search?: string;
  status?: string; // 'all' | 'ACTIVE' | 'INACTIVE' | 'UNINSTALLED' | 'SUSPENDED'
  androidVersion?: string;
  appVersion?: string;
  deviceType?: string;
  consentStatus?: 'all' | 'both' | 'location_only' | 'device_only' | 'none';
  lastSeenFilter?: 'all' | '24h' | '7d' | '30d' | 'inactive';
  sortField?: 'last_seen_at' | 'first_seen_at' | 'device_model' | 'manufacturer' | 'app_version';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface LocationQueryParams {
  installationId?: string;
  precision?: 'all' | 'precise' | 'approximate';
  dateRange?: 'all' | 'today' | '7d' | '30d';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface DeviceFetchResult {
  devices: AppDevice[];
  total: number;
  tableMissing: boolean;
  errorMessage?: string;
}

export interface LocationFetchResult {
  locations: AppDeviceLocation[];
  total: number;
  tableMissing: boolean;
  errorMessage?: string;
}

export function mapRowToDevice(row: any): AppDevice {
  const hasCoordinates = row.latitude !== null && row.latitude !== undefined &&
                         row.longitude !== null && row.longitude !== undefined;

  let historyCount = 0;
  if (Array.isArray(row.location_history)) {
    historyCount = row.location_history.length;
  }

  const latestLocation: AppDeviceLocation | null = hasCoordinates ? {
    id: row.id,
    installationId: row.installation_id || '',
    deviceModel: row.device_model || row.model || undefined,
    latitude: Number(row.latitude) || 0,
    longitude: Number(row.longitude) || 0,
    accuracy: row.accuracy !== null && row.accuracy !== undefined ? Number(row.accuracy) : undefined,
    locationPrecision: row.location_precision === 'precise' ? 'precise' : 'approximate',
    locationSource: row.location_source || 'gps',
    recordedAt: row.location_recorded_at || row.recorded_at || row.last_seen_at || row.created_at || new Date().toISOString(),
    uploadedAt: row.location_uploaded_at || row.uploaded_at || row.last_seen_at || row.created_at || new Date().toISOString(),
    createdAt: row.created_at || new Date().toISOString(),
  } : null;

  const lastSeenStr = row.last_seen_at || row.updated_at || row.created_at || new Date().toISOString();
  let daysSinceLastSeen = 0;
  try {
    const diffMs = Date.now() - new Date(lastSeenStr).getTime();
    daysSinceLastSeen = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  } catch {}

  // Heartbeat Inactivity Rule:
  // - If explicitly marked UNINSTALLED or uninstall_detected_at is set: 'UNINSTALLED'
  // - If explicitly SUSPENDED: 'SUSPENDED'
  // - If daysSinceLastSeen > 30: 'UNINSTALLED' (Inactivity threshold exceeded; suspected uninstalled)
  // - If daysSinceLastSeen > 7: 'INACTIVE' (Missed recent regular heartbeats)
  // - Otherwise: 'ACTIVE' (Reporting within 7 days)
  let heartbeatStatus: 'ACTIVE' | 'INACTIVE' | 'UNINSTALLED' | 'SUSPENDED' = 'ACTIVE';
  const rawStatus = (row.status || '').toUpperCase();
  if (rawStatus === 'UNINSTALLED' || row.uninstall_detected_at) {
    heartbeatStatus = 'UNINSTALLED';
  } else if (rawStatus === 'SUSPENDED') {
    heartbeatStatus = 'SUSPENDED';
  } else if (daysSinceLastSeen > 30) {
    heartbeatStatus = 'UNINSTALLED';
  } else if (daysSinceLastSeen > 7) {
    heartbeatStatus = 'INACTIVE';
  } else {
    heartbeatStatus = 'ACTIVE';
  }

  const effectiveStatus = (rawStatus === 'ACTIVE' || rawStatus === 'INACTIVE' || rawStatus === 'UNINSTALLED' || rawStatus === 'SUSPENDED')
    ? (rawStatus as any)
    : heartbeatStatus;

  return {
    id: row.id,
    installationId: row.installation_id || '',
    manufacturer: row.manufacturer || undefined,
    deviceModel: row.device_model || row.model || undefined,
    androidVersion: row.android_version || undefined,
    sdkVersion: row.sdk_version || undefined,
    appVersion: row.app_version || undefined,
    appVersionName: row.app_version_name || row.app_version || undefined,
    appVersionCode: row.app_version_code || undefined,
    deviceType: row.device_type || 'Phone',
    language: row.language || undefined,
    timezone: row.timezone || undefined,
    networkType: row.network_type || undefined,
    deviceReportingConsent: Boolean(row.device_reporting_consent),
    locationConsent: Boolean(row.location_consent),
    firstSeenAt: row.first_seen_at || row.created_at || new Date().toISOString(),
    lastSeenAt: lastSeenStr,
    lastSyncAt: row.last_sync_at || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    status: effectiveStatus,
    imei: row.imei || null,
    macAddress: row.mac_address || null,
    uninstallDetectedAt: row.uninstall_detected_at || (effectiveStatus === 'UNINSTALLED' && daysSinceLastSeen > 30 ? lastSeenStr : null),
    daysSinceLastSeen,
    heartbeatStatus,
    locationsCount: hasCoordinates ? (1 + historyCount) : 0,
    latestLocation,
  };
}

export function mapRowToLocation(row: any): AppDeviceLocation {
  return {
    id: row.id,
    installationId: row.installation_id || '',
    deviceModel: row.device_model || undefined,
    latitude: Number(row.latitude) || 0,
    longitude: Number(row.longitude) || 0,
    accuracy: row.accuracy !== null && row.accuracy !== undefined ? Number(row.accuracy) : undefined,
    locationPrecision: row.location_precision === 'precise' ? 'precise' : 'approximate',
    locationSource: row.location_source || 'gps',
    recordedAt: row.location_recorded_at || row.recorded_at || row.created_at || new Date().toISOString(),
    uploadedAt: row.location_uploaded_at || row.uploaded_at || row.created_at || new Date().toISOString(),
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export class DeviceService {
  /**
   * Quick probe to test if public.app_devices single table exists in Supabase
   */
  static async checkTablesExist(): Promise<{ devicesTable: boolean; locationsTable: boolean }> {
    const client = SupabaseService.getClient();
    if (!client) {
      return { devicesTable: false, locationsTable: false };
    }

    let devicesTable = false;
    try {
      const { error: devErr } = await client.from('app_devices').select('id', { count: 'exact', head: true });
      if (!devErr || devErr.code !== 'PGRST205') {
        devicesTable = true;
      }
    } catch {
      devicesTable = false;
    }

    return { devicesTable, locationsTable: devicesTable };
  }

  /**
   * Fetch device records with filters, search, sort, and pagination from single table app_devices.
   */
  static async fetchDevices(params: DeviceQueryParams = {}): Promise<DeviceFetchResult> {
    const client = SupabaseService.getClient();
    if (!client) {
      return { devices: [], total: 0, tableMissing: false, errorMessage: 'Supabase client is not configured.' };
    }

    try {
      const page = params.page || 1;
      const pageSize = params.pageSize || 15;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = client.from('app_devices').select('*', { count: 'exact' });

      // Search filter
      if (params.search && params.search.trim()) {
        const s = params.search.trim();
        query = query.or(
          `installation_id.ilike.%${s}%,device_model.ilike.%${s}%,manufacturer.ilike.%${s}%,app_version.ilike.%${s}%`
        );
      }

      // Android Version filter
      if (params.androidVersion && params.androidVersion !== 'all') {
        query = query.eq('android_version', params.androidVersion);
      }

      // App Version filter
      if (params.appVersion && params.appVersion !== 'all') {
        query = query.eq('app_version', params.appVersion);
      }

      // Device Type filter
      if (params.deviceType && params.deviceType !== 'all') {
        query = query.eq('device_type', params.deviceType);
      }

      // Consent Status filter
      if (params.consentStatus && params.consentStatus !== 'all') {
        if (params.consentStatus === 'both') {
          query = query.eq('device_reporting_consent', true).eq('location_consent', true);
        } else if (params.consentStatus === 'location_only') {
          query = query.eq('location_consent', true);
        } else if (params.consentStatus === 'device_only') {
          query = query.eq('device_reporting_consent', true).eq('location_consent', false);
        } else if (params.consentStatus === 'none') {
          query = query.eq('device_reporting_consent', false).eq('location_consent', false);
        }
      }

      const now = new Date();

      // Status filter with Heartbeat Inactivity logic
      if (params.status && params.status !== 'all') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

        if (params.status === 'UNINSTALLED') {
          query = query.or(`status.eq.UNINSTALLED,uninstall_detected_at.not.is.null,last_seen_at.lt.${thirtyDaysAgo}`);
        } else if (params.status === 'SUSPENDED') {
          query = query.eq('status', 'SUSPENDED');
        } else if (params.status === 'INACTIVE') {
          query = query.or(`status.eq.INACTIVE,and(last_seen_at.lt.${sevenDaysAgo},last_seen_at.gte.${thirtyDaysAgo})`).neq('status', 'SUSPENDED').neq('status', 'UNINSTALLED');
        } else if (params.status === 'ACTIVE') {
          query = query.or(`status.eq.ACTIVE,and(last_seen_at.gte.${sevenDaysAgo},status.is.null)`).neq('status', 'SUSPENDED').neq('status', 'UNINSTALLED');
        }
      }

      // Last Seen temporal filter
      if (params.lastSeenFilter && params.lastSeenFilter !== 'all') {
        if (params.lastSeenFilter === '24h') {
          const since = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
          query = query.gte('last_seen_at', since);
        } else if (params.lastSeenFilter === '7d') {
          const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          query = query.gte('last_seen_at', since);
        } else if (params.lastSeenFilter === '30d') {
          const since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
          query = query.gte('last_seen_at', since);
        } else if (params.lastSeenFilter === 'inactive') {
          const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
          query = query.lt('last_seen_at', cutoff);
        }
      }

      // Sorting
      const sortField = params.sortField || 'last_seen_at';
      const ascending = params.sortDirection === 'asc';
      query = query.order(sortField, { ascending });

      // Pagination
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) {
        if (error.code === 'PGRST205' || error.message.includes('Could not find the table')) {
          return { devices: [], total: 0, tableMissing: true, errorMessage: error.message };
        }
        return { devices: [], total: 0, tableMissing: false, errorMessage: error.message };
      }

      const devices = (data || []).map(mapRowToDevice);
      return { devices, total: count || devices.length, tableMissing: false };
    } catch (err: any) {
      return { devices: [], total: 0, tableMissing: false, errorMessage: err.message || 'Failed to fetch devices' };
    }
  }

  /**
   * Fetch single device complete details including full latest location from single table.
   */
  static async fetchDeviceById(installationId: string): Promise<{ device: AppDevice | null; locations: AppDeviceLocation[]; tableMissing: boolean }> {
    const client = SupabaseService.getClient();
    if (!client || !installationId) {
      return { device: null, locations: [], tableMissing: false };
    }

    try {
      const { data: devData, error: devErr } = await client
        .from('app_devices')
        .select('*')
        .eq('installation_id', installationId)
        .single();

      if (devErr) {
        if (devErr.code === 'PGRST205') {
          return { device: null, locations: [], tableMissing: true };
        }
        return { device: null, locations: [], tableMissing: false };
      }

      const device = mapRowToDevice(devData);
      const locations: AppDeviceLocation[] = [];

      // Add primary latest location if present
      if (device.latestLocation) {
        locations.push(device.latestLocation);
      }

      // If location_history array is present in row, unpack it
      if (Array.isArray(devData.location_history)) {
        for (const item of devData.location_history) {
          if (item && item.latitude !== undefined && item.longitude !== undefined) {
            locations.push({
              id: item.id || `hist_${locations.length}`,
              installationId: devData.installation_id,
              deviceModel: devData.device_model,
              latitude: Number(item.latitude),
              longitude: Number(item.longitude),
              accuracy: item.accuracy != null ? Number(item.accuracy) : undefined,
              locationPrecision: item.location_precision === 'precise' ? 'precise' : 'approximate',
              locationSource: item.location_source || 'gps',
              recordedAt: item.location_recorded_at || item.recorded_at || devData.last_seen_at || new Date().toISOString(),
              uploadedAt: item.location_uploaded_at || item.uploaded_at || devData.last_seen_at || new Date().toISOString(),
              createdAt: item.created_at || devData.created_at || new Date().toISOString(),
            });
          }
        }
      }

      device.locationsCount = locations.length;
      return { device, locations, tableMissing: false };
    } catch {
      return { device: null, locations: [], tableMissing: false };
    }
  }

  /**
   * Fetch paginated and filtered location history from the single table app_devices.
   */
  static async fetchLocationHistory(params: LocationQueryParams = {}): Promise<LocationFetchResult> {
    const client = SupabaseService.getClient();
    if (!client) {
      return { locations: [], total: 0, tableMissing: false, errorMessage: 'Supabase client not configured.' };
    }

    try {
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Query app_devices where coordinates are not null
      let query = client
        .from('app_devices')
        .select('*', { count: 'exact' })
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (params.installationId && params.installationId.trim()) {
        query = query.ilike('installation_id', `%${params.installationId.trim()}%`);
      }

      if (params.precision && params.precision !== 'all') {
        query = query.eq('location_precision', params.precision);
      }

      const now = new Date();
      if (params.dateRange && params.dateRange !== 'all') {
        if (params.dateRange === 'today') {
          const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
          query = query.gte('last_seen_at', startOfDay);
        } else if (params.dateRange === '7d') {
          const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          query = query.gte('last_seen_at', since);
        } else if (params.dateRange === '30d') {
          const since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
          query = query.gte('last_seen_at', since);
        }
      }

      const ascending = params.sortDirection === 'asc';
      query = query.order('last_seen_at', { ascending }).range(from, to);

      const { data, count, error } = await query;

      if (error) {
        if (error.code === 'PGRST205' || error.message.includes('Could not find the table')) {
          return { locations: [], total: 0, tableMissing: true, errorMessage: error.message };
        }
        return { locations: [], total: 0, tableMissing: false, errorMessage: error.message };
      }

      const locations: AppDeviceLocation[] = [];
      for (const row of (data || [])) {
        if (row.latitude != null && row.longitude != null) {
          locations.push(mapRowToLocation(row));
        }
        // Also unpack any nested location_history entries
        if (Array.isArray(row.location_history)) {
          for (const item of row.location_history) {
            if (item && item.latitude != null && item.longitude != null) {
              locations.push({
                id: item.id || `h_${row.id}_${locations.length}`,
                installationId: row.installation_id,
                deviceModel: row.device_model,
                latitude: Number(item.latitude),
                longitude: Number(item.longitude),
                accuracy: item.accuracy != null ? Number(item.accuracy) : undefined,
                locationPrecision: item.location_precision === 'precise' ? 'precise' : 'approximate',
                locationSource: item.location_source || 'gps',
                recordedAt: item.location_recorded_at || item.recorded_at || row.last_seen_at,
                uploadedAt: item.location_uploaded_at || item.uploaded_at || row.last_seen_at,
                createdAt: item.created_at || row.created_at,
              });
            }
          }
        }
      }

      return { locations, total: count || locations.length, tableMissing: false };
    } catch (err: any) {
      return { locations: [], total: 0, tableMissing: false, errorMessage: err.message || 'Failed to fetch location records' };
    }
  }

  /**
   * Fetch overview dashboard metrics calculated from actual single table app_devices.
   */
  static async fetchDeviceStats(): Promise<{ stats: DeviceStats; tableMissing: boolean }> {
    const emptyStats: DeviceStats = {
      totalDevices: 0,
      active24h: 0,
      active7d: 0,
      inactiveCount: 0,
      uninstalledCount: 0,
      locationConsentCount: 0,
      noLocationConsentCount: 0,
      devicesWithLocationData: 0,
    };

    const client = SupabaseService.getClient();
    if (!client) {
      return { stats: emptyStats, tableMissing: false };
    }

    try {
      const now = new Date();
      const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const since7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const since30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

      // 1. Total registered devices
      const { count: totalCount, error: totalErr } = await client
        .from('app_devices')
        .select('id', { count: 'exact', head: true });

      if (totalErr) {
        if (totalErr.code === 'PGRST205' || totalErr.message.includes('Could not find the table')) {
          return { stats: emptyStats, tableMissing: true };
        }
      }

      const totalDevices = totalCount || 0;

      // 2. Active 24 Hours (last_seen_at >= now - 24h)
      const { count: count24h } = await client
        .from('app_devices')
        .select('id', { count: 'exact', head: true })
        .gte('last_seen_at', since24h);

      // 3. Active 7 Days (last_seen_at >= now - 7d)
      const { count: count7d } = await client
        .from('app_devices')
        .select('id', { count: 'exact', head: true })
        .gte('last_seen_at', since7d);

      // 4. Inactive Count (last_seen_at < 7d and >= 30d, not uninstalled/suspended)
      let inactiveCount = 0;
      try {
        const { count: inactC } = await client
          .from('app_devices')
          .select('id', { count: 'exact', head: true })
          .lt('last_seen_at', since7d)
          .gte('last_seen_at', since30d)
          .neq('status', 'SUSPENDED')
          .neq('status', 'UNINSTALLED');
        inactiveCount = inactC || 0;
      } catch {}

      // 5. Uninstalled Count (status = UNINSTALLED or uninstall_detected_at is not null or last_seen_at < 30d)
      let uninstalledCount = 0;
      try {
        const { count: uninstC } = await client
          .from('app_devices')
          .select('id', { count: 'exact', head: true })
          .or(`status.eq.UNINSTALLED,uninstall_detected_at.not.is.null,last_seen_at.lt.${since30d}`);
        uninstalledCount = uninstC || 0;
      } catch {}

      // 6. Devices with Location Consent (location_consent = true)
      const { count: locConsentCount } = await client
        .from('app_devices')
        .select('id', { count: 'exact', head: true })
        .eq('location_consent', true);

      // 7. Devices without Location Consent (location_consent = false)
      const { count: noLocConsentCount } = await client
        .from('app_devices')
        .select('id', { count: 'exact', head: true })
        .eq('location_consent', false);

      // 8. Devices with Available Location Data (latitude IS NOT NULL)
      const { count: locDataCount } = await client
        .from('app_devices')
        .select('id', { count: 'exact', head: true })
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      return {
        stats: {
          totalDevices,
          active24h: count24h || 0,
          active7d: count7d || 0,
          inactiveCount,
          uninstalledCount,
          locationConsentCount: locConsentCount || 0,
          noLocationConsentCount: noLocConsentCount || 0,
          devicesWithLocationData: locDataCount || 0,
        },
        tableMissing: false,
      };
    } catch {
      return { stats: emptyStats, tableMissing: false };
    }
  }

  /**
   * Update status of an individual device (e.g. mark UNINSTALLED, ACTIVE, or SUSPENDED)
   * Records an audit log event.
   */
  static async updateDeviceStatus(
    installationId: string, 
    newStatus: 'ACTIVE' | 'INACTIVE' | 'UNINSTALLED' | 'SUSPENDED', 
    adminEmail: string
  ): Promise<{ success: boolean; message: string }> {
    const client = SupabaseService.getClient();
    if (!client) {
      return { success: false, message: 'Supabase client is not configured.' };
    }

    try {
      const updatePayload: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === 'UNINSTALLED') {
        updatePayload.uninstall_detected_at = new Date().toISOString();
      } else if (newStatus === 'ACTIVE') {
        updatePayload.uninstall_detected_at = null;
      }

      const { error: updErr } = await client
        .from('app_devices')
        .update(updatePayload)
        .eq('installation_id', installationId);

      if (updErr) {
        return { success: false, message: updErr.message };
      }

      // Log audit event
      await SupabaseService.logAudit({
        action: 'DEVICE_STATUS_CHANGED',
        targetEntity: 'AppDevice',
        targetId: installationId,
        adminEmail: adminEmail || 'admin@sitaramayurveda.com',
        details: `Administrator changed status of device "${installationId}" to ${newStatus}.`,
      });

      return { success: true, message: `Status updated to ${newStatus}.` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to update status.' };
    }
  }

  /**
   * Applies the Heartbeat Inactivity Rule across all devices in app_devices:
   * - Inactivity > 30 days: Status = 'UNINSTALLED' (uninstalled detected)
   * - Inactivity 7-30 days: Status = 'INACTIVE' (inactive)
   * - Inactivity <= 7 days: Status = 'ACTIVE' (active)
   * Preserves manual 'SUSPENDED' statuses.
   * Logs an audit record for regulatory traceability.
   */
  static async syncHeartbeatInactivityStatuses(adminEmail: string): Promise<{ success: boolean; updatedCount: number; message: string }> {
    const client = SupabaseService.getClient();
    if (!client) {
      return { success: false, updatedCount: 0, message: 'Supabase client is not configured.' };
    }

    try {
      // 1. Fetch non-suspended devices
      const { data: rows, error: fetchErr } = await client
        .from('app_devices')
        .select('id, installation_id, last_seen_at, status, uninstall_detected_at, created_at')
        .neq('status', 'SUSPENDED');

      if (fetchErr) {
        return { success: false, updatedCount: 0, message: fetchErr.message };
      }

      if (!rows || rows.length === 0) {
        return { success: true, updatedCount: 0, message: 'No devices found to sync.' };
      }

      const nowMs = Date.now();
      let updatedCount = 0;

      for (const row of rows) {
        const lastSeenStr = row.last_seen_at || row.created_at;
        const diffMs = nowMs - (lastSeenStr ? new Date(lastSeenStr).getTime() : 0);
        const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

        let targetStatus: 'ACTIVE' | 'INACTIVE' | 'UNINSTALLED' = 'ACTIVE';
        if (diffDays > 30) {
          targetStatus = 'UNINSTALLED';
        } else if (diffDays > 7) {
          targetStatus = 'INACTIVE';
        } else {
          targetStatus = 'ACTIVE';
        }

        const needsUpdate = row.status !== targetStatus || 
          (targetStatus === 'UNINSTALLED' && !row.uninstall_detected_at);

        if (needsUpdate) {
          const payload: any = {
            status: targetStatus,
            updated_at: new Date().toISOString(),
          };
          if (targetStatus === 'UNINSTALLED' && !row.uninstall_detected_at) {
            payload.uninstall_detected_at = new Date().toISOString();
          } else if (targetStatus === 'ACTIVE' && row.uninstall_detected_at) {
            payload.uninstall_detected_at = null;
          }

          const { error: updErr } = await client
            .from('app_devices')
            .update(payload)
            .eq('id', row.id);

          if (!updErr) {
            updatedCount++;
          }
        }
      }

      // Log audit
      await SupabaseService.logAudit({
        action: 'HEARTBEAT_INACTIVITY_SYNC',
        targetEntity: 'AppDevice',
        adminEmail: adminEmail || 'admin@sitaramayurveda.com',
        details: `Heartbeat Inactivity Rule evaluated on ${rows.length} devices. Updated status for ${updatedCount} devices (Rule: <=7d Active, 7-30d Inactive, >30d Uninstalled).`,
      });

      return {
        success: true,
        updatedCount,
        message: `Successfully synchronized ${updatedCount} device status(es) based on heartbeat inactivity rule.`,
      };
    } catch (err: any) {
      return { success: false, updatedCount: 0, message: err.message || 'Sync failed.' };
    }
  }

  /**
   * Delete device record and its coordinates in a single atomic operation.
   * Logs an audit record for regulatory traceability.
   */
  static async deleteDevice(installationId: string, adminEmail: string): Promise<{ success: boolean; message: string }> {
    const client = SupabaseService.getClient();
    if (!client) {
      return { success: false, message: 'Supabase client is not configured.' };
    }

    try {
      const { error: delErr } = await client
        .from('app_devices')
        .delete()
        .eq('installation_id', installationId);

      if (delErr) {
        return { success: false, message: delErr.message };
      }

      // Log audit event
      await SupabaseService.logAudit({
        action: 'DEVICE_DELETED',
        targetEntity: 'AppDevice',
        targetId: installationId,
        adminEmail: adminEmail || 'admin@sitaramayurveda.com',
        details: `Administrator deleted device installation "${installationId}" and all associated telemetry records.`,
      });

      return { success: true, message: `Device record ${installationId} permanently removed.` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Deletion failed.' };
    }
  }

  /**
   * Helper to fetch distinct Android versions and App versions for filtering dropdowns
   */
  static async fetchDistinctFilterOptions(): Promise<{ androidVersions: string[]; appVersions: string[]; deviceTypes: string[] }> {
    const client = SupabaseService.getClient();
    if (!client) {
      return { androidVersions: [], appVersions: [], deviceTypes: [] };
    }

    try {
      const { data } = await client
        .from('app_devices')
        .select('android_version, app_version, device_type')
        .limit(200);

      if (!data) return { androidVersions: [], appVersions: [], deviceTypes: [] };

      const androidSet = new Set<string>();
      const appSet = new Set<string>();
      const typeSet = new Set<string>();

      for (const row of data) {
        if (row.android_version) androidSet.add(row.android_version);
        if (row.app_version) appSet.add(row.app_version);
        if (row.device_type) typeSet.add(row.device_type);
      }

      return {
        androidVersions: Array.from(androidSet).sort(),
        appVersions: Array.from(appSet).sort(),
        deviceTypes: Array.from(typeSet).sort(),
      };
    } catch {
      return { androidVersions: [], appVersions: [], deviceTypes: [] };
    }
  }
}
