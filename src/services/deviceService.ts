import { SupabaseService } from './supabase';
import { AppDevice, AppDeviceLocation, DeviceStats } from '../types';

export interface DeviceQueryParams {
  search?: string;
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
    lastSeenAt: row.last_seen_at || row.updated_at || new Date().toISOString(),
    lastSyncAt: row.last_sync_at || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
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
    recordedAt: row.recorded_at || row.created_at || new Date().toISOString(),
    uploadedAt: row.uploaded_at || row.created_at || new Date().toISOString(),
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export class DeviceService {
  /**
   * Quick probe to test if public.app_devices exists in the Supabase schema
   */
  static async checkTablesExist(): Promise<{ devicesTable: boolean; locationsTable: boolean }> {
    const client = SupabaseService.getClient();
    if (!client) {
      return { devicesTable: false, locationsTable: false };
    }

    let devicesTable = false;
    let locationsTable = false;

    try {
      const { error: devErr } = await client.from('app_devices').select('id', { count: 'exact', head: true });
      if (!devErr || devErr.code !== 'PGRST205') {
        devicesTable = true;
      }
    } catch {
      devicesTable = false;
    }

    try {
      const { error: locErr } = await client.from('app_device_locations').select('id', { count: 'exact', head: true });
      if (!locErr || locErr.code !== 'PGRST205') {
        locationsTable = true;
      }
    } catch {
      locationsTable = false;
    }

    return { devicesTable, locationsTable };
  }

  /**
   * Fetch device records with filters, search, sort, and pagination.
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

      // Last Seen temporal filter
      const now = new Date();
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

      // Fetch location summary for the retrieved devices in this page
      if (devices.length > 0) {
        const ids = devices.map(d => d.installationId);
        try {
          const { data: locs } = await client
            .from('app_device_locations')
            .select('installation_id, latitude, longitude, accuracy, location_precision, location_source, recorded_at, uploaded_at')
            .in('installation_id', ids)
            .order('recorded_at', { ascending: false });

          if (locs && locs.length > 0) {
            const locMap = new Map<string, { count: number; latest: AppDeviceLocation }>();
            for (const row of locs) {
              const current = locMap.get(row.installation_id);
              if (!current) {
                locMap.set(row.installation_id, {
                  count: 1,
                  latest: mapRowToLocation(row),
                });
              } else {
                current.count += 1;
              }
            }

            for (const dev of devices) {
              const info = locMap.get(dev.installationId);
              if (info) {
                dev.locationsCount = info.count;
                dev.latestLocation = info.latest;
              } else {
                dev.locationsCount = 0;
                dev.latestLocation = null;
              }
            }
          } else {
            for (const dev of devices) {
              dev.locationsCount = 0;
              dev.latestLocation = null;
            }
          }
        } catch {
          // If locations table query fails, keep devices intact
        }
      }

      return { devices, total: count || devices.length, tableMissing: false };
    } catch (err: any) {
      return { devices: [], total: 0, tableMissing: false, errorMessage: err.message || 'Failed to fetch devices' };
    }
  }

  /**
   * Fetch single device complete details including full latest location.
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

      // Fetch location history for this device (up to 20 recent records)
      const { data: locData } = await client
        .from('app_device_locations')
        .select('*')
        .eq('installation_id', installationId)
        .order('recorded_at', { ascending: false })
        .limit(20);

      const locations = (locData || []).map(mapRowToLocation);
      device.locationsCount = locations.length;
      device.latestLocation = locations.length > 0 ? locations[0] : null;

      return { device, locations, tableMissing: false };
    } catch {
      return { device: null, locations: [], tableMissing: false };
    }
  }

  /**
   * Fetch paginated and filtered location history.
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

      let query = client.from('app_device_locations').select('*', { count: 'exact' });

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
          query = query.gte('recorded_at', startOfDay);
        } else if (params.dateRange === '7d') {
          const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          query = query.gte('recorded_at', since);
        } else if (params.dateRange === '30d') {
          const since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
          query = query.gte('recorded_at', since);
        }
      }

      const ascending = params.sortDirection === 'asc';
      query = query.order('recorded_at', { ascending }).range(from, to);

      const { data, count, error } = await query;

      if (error) {
        if (error.code === 'PGRST205' || error.message.includes('Could not find the table')) {
          return { locations: [], total: 0, tableMissing: true, errorMessage: error.message };
        }
        return { locations: [], total: 0, tableMissing: false, errorMessage: error.message };
      }

      const locations = (data || []).map(mapRowToLocation);
      return { locations, total: count || locations.length, tableMissing: false };
    } catch (err: any) {
      return { locations: [], total: 0, tableMissing: false, errorMessage: err.message || 'Failed to fetch location records' };
    }
  }

  /**
   * Fetch overview dashboard metrics calculated from actual database records.
   */
  static async fetchDeviceStats(): Promise<{ stats: DeviceStats; tableMissing: boolean }> {
    const emptyStats: DeviceStats = {
      totalDevices: 0,
      active24h: 0,
      active7d: 0,
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

      // 4. Devices with Location Consent (location_consent = true)
      const { count: locConsentCount } = await client
        .from('app_devices')
        .select('id', { count: 'exact', head: true })
        .eq('location_consent', true);

      // 5. Devices without Location Consent (location_consent = false)
      const { count: noLocConsentCount } = await client
        .from('app_devices')
        .select('id', { count: 'exact', head: true })
        .eq('location_consent', false);

      // 6. Devices with Available Location Data
      // Query distinct installation_id from app_device_locations
      let devicesWithLocationData = 0;
      try {
        const { data: locDevices } = await client
          .from('app_device_locations')
          .select('installation_id');

        if (locDevices) {
          const uniqueIds = new Set(locDevices.map(d => d.installation_id));
          devicesWithLocationData = uniqueIds.size;
        }
      } catch {
        devicesWithLocationData = 0;
      }

      return {
        stats: {
          totalDevices,
          active24h: count24h || 0,
          active7d: count7d || 0,
          locationConsentCount: locConsentCount || 0,
          noLocationConsentCount: noLocConsentCount || 0,
          devicesWithLocationData,
        },
        tableMissing: false,
      };
    } catch {
      return { stats: emptyStats, tableMissing: false };
    }
  }

  /**
   * Delete device record and its associated cascaded locations.
   * Logs an audit record for regulatory traceability.
   */
  static async deleteDevice(installationId: string, adminEmail: string): Promise<{ success: boolean; message: string }> {
    const client = SupabaseService.getClient();
    if (!client) {
      return { success: false, message: 'Supabase client is not configured.' };
    }

    try {
      // 1. Delete from app_devices (cascades to app_device_locations via foreign key)
      const { error: delErr } = await client
        .from('app_devices')
        .delete()
        .eq('installation_id', installationId);

      if (delErr) {
        return { success: false, message: delErr.message };
      }

      // 2. Also ensure any orphaned locations are deleted if FK wasn't cascaded
      try {
        await client.from('app_device_locations').delete().eq('installation_id', installationId);
      } catch {}

      // 3. Log audit event
      await SupabaseService.logAudit({
        action: 'DEVICE_DELETED',
        targetEntity: 'AppDevice',
        targetId: installationId,
        adminEmail: adminEmail || 'admin@sitaramayurveda.com',
        details: `Administrator deleted device installation "${installationId}" and cascaded all associated location records.`,
      });

      return { success: true, message: `Device record ${installationId} and associated location history permanently removed.` };
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
