import { APK_CONFIG, ApkVersionArchive } from '../config/apkConfig';

export interface ManagedApkVersion extends ApkVersionArchive {
  isActive: boolean;
  defaultCloudStorageUrl: string;
  lastTested?: string;
  latencyMs?: number;
  isReachable?: boolean;
}

const STORAGE_KEY = 'ayurindex_managed_apk_versions_v1';
const EVENT_NAME = 'ayurindex-apk-versions-updated';

function getInitialDefaultVersions(): ManagedApkVersion[] {
  return APK_CONFIG.archiveReleases.map(rel => ({
    ...rel,
    isActive: true,
    defaultCloudStorageUrl: rel.cloudStorageUrl
  }));
}

export class ApkVersionManagerService {
  /**
   * Retrieves all managed APK versions from localStorage or default archive.
   */
  static getVersions(): ManagedApkVersion[] {
    if (typeof window === 'undefined') return getInitialDefaultVersions();

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return getInitialDefaultVersions();
      }
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with defaults to ensure all fields are present
        const defaultVersions = getInitialDefaultVersions();
        return defaultVersions.map(def => {
          const found = parsed.find((p: any) => p.version === def.version);
          if (found) {
            return {
              ...def,
              ...found,
              cloudStorageUrl: found.cloudStorageUrl || def.cloudStorageUrl,
              defaultCloudStorageUrl: def.defaultCloudStorageUrl,
              isActive: typeof found.isActive === 'boolean' ? found.isActive : true
            };
          }
          return def;
        });
      }
    } catch (e) {
      console.warn('Failed to parse managed APK versions from localStorage, using defaults', e);
    }

    return getInitialDefaultVersions();
  }

  /**
   * Returns only active APK versions for public rendering.
   */
  static getActiveVersions(): ManagedApkVersion[] {
    return this.getVersions().filter(v => v.isActive);
  }

  /**
   * Saves version configuration and broadcasts update event.
   */
  static saveVersions(versions: ManagedApkVersion[]): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(versions));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: versions }));
    } catch (e) {
      console.error('Error saving APK versions to localStorage:', e);
    }
  }

  /**
   * Toggles active/inactive state of a specific version.
   */
  static toggleVersionActive(version: string): ManagedApkVersion[] {
    const current = this.getVersions();
    const updated = current.map(v => {
      if (v.version === version) {
        return {
          ...v,
          isActive: !v.isActive
        };
      }
      return v;
    });

    this.saveVersions(updated);
    return updated;
  }

  /**
   * Sets the active state directly for a version.
   */
  static setVersionActive(version: string, isActive: boolean): ManagedApkVersion[] {
    const current = this.getVersions();
    const updated = current.map(v => {
      if (v.version === version) {
        return {
          ...v,
          isActive
        };
      }
      return v;
    });

    this.saveVersions(updated);
    return updated;
  }

  /**
   * Updates download URL for a specific version.
   */
  static updateVersionUrl(version: string, newUrl: string): ManagedApkVersion[] {
    const trimmed = newUrl.trim();
    if (!trimmed) return this.getVersions();

    const current = this.getVersions();
    const updated = current.map(v => {
      if (v.version === version) {
        return {
          ...v,
          cloudStorageUrl: trimmed,
          lastTested: undefined,
          isReachable: undefined,
          latencyMs: undefined
        };
      }
      return v;
    });

    this.saveVersions(updated);
    return updated;
  }

  /**
   * Resets download URL for a specific version back to default.
   */
  static resetVersionUrl(version: string): ManagedApkVersion[] {
    const current = this.getVersions();
    const updated = current.map(v => {
      if (v.version === version) {
        return {
          ...v,
          cloudStorageUrl: v.defaultCloudStorageUrl,
          lastTested: undefined,
          isReachable: undefined,
          latencyMs: undefined
        };
      }
      return v;
    });

    this.saveVersions(updated);
    return updated;
  }

  /**
   * Resets all versions to active status and default URLs.
   */
  static resetAllToDefaults(): ManagedApkVersion[] {
    const defaults = getInitialDefaultVersions();
    this.saveVersions(defaults);
    return defaults;
  }

  /**
   * Enables all versions.
   */
  static enableAllVersions(): ManagedApkVersion[] {
    const current = this.getVersions();
    const updated = current.map(v => ({ ...v, isActive: true }));
    this.saveVersions(updated);
    return updated;
  }

  /**
   * Tests reachability of an APK version download link.
   */
  static async testVersionReachability(version: string): Promise<{ isReachable: boolean; latencyMs: number; statusText: string }> {
    const versions = this.getVersions();
    const target = versions.find(v => v.version === version);
    if (!target) {
      return { isReachable: false, latencyMs: 0, statusText: 'Version not found' };
    }

    const startTime = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const resp = await fetch(target.cloudStorageUrl, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache'
      });
      clearTimeout(timeoutId);

      const latencyMs = Math.round(performance.now() - startTime);
      const isReachable = resp.ok || resp.status === 200 || resp.status === 206 || resp.status === 302;
      const statusText = isReachable ? `HTTP ${resp.status} OK` : `HTTP ${resp.status}`;

      const updated = versions.map(v => v.version === version ? {
        ...v,
        isReachable,
        latencyMs,
        lastTested: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      } : v);
      this.saveVersions(updated);

      return { isReachable, latencyMs, statusText };
    } catch (e: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      const updated = versions.map(v => v.version === version ? {
        ...v,
        isReachable: false,
        latencyMs,
        lastTested: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      } : v);
      this.saveVersions(updated);

      return {
        isReachable: false,
        latencyMs,
        statusText: e.name === 'AbortError' ? 'Connection Timeout (5s)' : 'Network Error / Blocked'
      };
    }
  }

  /**
   * Subscribes a listener to version changes across components.
   */
  static subscribe(callback: (versions: ManagedApkVersion[]) => void): () => void {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<ManagedApkVersion[]>;
      callback(customEvent.detail || this.getVersions());
    };

    const storageHandler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        callback(this.getVersions());
      }
    };

    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener('storage', storageHandler);

    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener('storage', storageHandler);
    };
  }
}
