import { OFFICIAL_SUPABASE_APK_URL, OFFICIAL_VERCEL_APK_URL, APK_CONFIG } from '../config/apkConfig';

export interface ManagedApkLink {
  id: 'supabase' | 'vercel' | string;
  name: string;
  badge: string;
  url: string;
  defaultUrl: string;
  isActive: boolean;
  isPrimary: boolean;
  latencyMs?: number;
  lastChecked?: string;
  isReachable?: boolean;
  isCustom?: boolean;
  description: string;
}

export interface ApkLinkConfigState {
  links: ManagedApkLink[];
  updatedAt: string;
}

const STORAGE_KEY = 'ayurindex_managed_apk_links_v1';
const EVENT_NAME = 'ayurindex-apk-links-updated';

const DEFAULT_LINKS: ManagedApkLink[] = [
  {
    id: 'supabase',
    name: 'Supabase Cloud Storage',
    badge: 'Supabase CDN',
    url: OFFICIAL_SUPABASE_APK_URL,
    defaultUrl: OFFICIAL_SUPABASE_APK_URL,
    isActive: true,
    isPrimary: true,
    description: 'Permanent latest pointer hosted on Supabase Storage bucket (Ayurindex_app_bucket).'
  },
  {
    id: 'vercel',
    name: 'Vercel Blob Mirror',
    badge: 'Vercel Edge',
    url: OFFICIAL_VERCEL_APK_URL,
    defaultUrl: OFFICIAL_VERCEL_APK_URL,
    isActive: true,
    isPrimary: false,
    description: 'High-speed redundant blob mirror hosted on Vercel Storage edge infrastructure.'
  }
];

export class ApkLinkManagerService {
  /**
   * Retrieves all managed APK links from localStorage or returns defaults.
   */
  static getLinks(): ManagedApkLink[] {
    if (typeof window === 'undefined') return DEFAULT_LINKS;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return DEFAULT_LINKS;
      }
      const parsed: ApkLinkConfigState = JSON.parse(stored);
      if (Array.isArray(parsed.links) && parsed.links.length > 0) {
        // Ensure default properties exist in case of version upgrades
        return parsed.links.map(link => ({
          ...link,
          defaultUrl: link.id === 'supabase' ? OFFICIAL_SUPABASE_APK_URL : (link.id === 'vercel' ? OFFICIAL_VERCEL_APK_URL : link.defaultUrl || link.url)
        }));
      }
    } catch (e) {
      console.warn('Failed to parse managed APK links from storage, falling back to defaults', e);
    }

    return DEFAULT_LINKS;
  }

  /**
   * Saves link configuration and broadcasts the update event.
   */
  static saveLinks(links: ManagedApkLink[]): void {
    if (typeof window === 'undefined') return;

    // Safety: ensure at least one link is primary if there are active links
    const activeLinks = links.filter(l => l.isActive);
    let finalLinks = [...links];

    if (activeLinks.length > 0 && !activeLinks.some(l => l.isPrimary)) {
      finalLinks = finalLinks.map(l => l.id === activeLinks[0].id ? { ...l, isPrimary: true } : l);
    }

    const state: ApkLinkConfigState = {
      links: finalLinks,
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: finalLinks }));
    } catch (e) {
      console.error('Error saving APK links:', e);
    }
  }

  /**
   * Updates a specific link's URL.
   */
  static updateLinkUrl(id: string, newUrl: string): ManagedApkLink[] {
    const trimmed = newUrl.trim();
    if (!trimmed) return this.getLinks();

    const links = this.getLinks().map(link => {
      if (link.id === id) {
        return {
          ...link,
          url: trimmed,
          lastChecked: undefined,
          isReachable: undefined,
          latencyMs: undefined
        };
      }
      return link;
    });

    this.saveLinks(links);
    return links;
  }

  /**
   * Toggles the active/inactive state of a link.
   */
  static toggleLinkActive(id: string): ManagedApkLink[] {
    const current = this.getLinks();
    const target = current.find(l => l.id === id);
    if (!target) return current;

    const nextActive = !target.isActive;
    
    let updated = current.map(link => {
      if (link.id === id) {
        return {
          ...link,
          isActive: nextActive,
          // If deactivated and was primary, drop primary flag
          isPrimary: nextActive ? link.isPrimary : false
        };
      }
      return link;
    });

    // If target was primary and is now inactive, transfer primary to first other active link
    if (!nextActive && target.isPrimary) {
      const nextActiveLink = updated.find(l => l.isActive);
      if (nextActiveLink) {
        updated = updated.map(l => l.id === nextActiveLink.id ? { ...l, isPrimary: true } : l);
      }
    }

    this.saveLinks(updated);
    return updated;
  }

  /**
   * Designates a link as the primary download source.
   */
  static setPrimaryLink(id: string): ManagedApkLink[] {
    const current = this.getLinks();
    const updated = current.map(link => ({
      ...link,
      isPrimary: link.id === id,
      // Automatically activate if chosen as primary
      isActive: link.id === id ? true : link.isActive
    }));

    this.saveLinks(updated);
    return updated;
  }

  /**
   * Resets a link URL back to official default.
   */
  static resetLinkUrl(id: string): ManagedApkLink[] {
    const links = this.getLinks().map(link => {
      if (link.id === id) {
        return {
          ...link,
          url: link.defaultUrl,
          lastChecked: undefined,
          isReachable: undefined,
          latencyMs: undefined
        };
      }
      return link;
    });

    this.saveLinks(links);
    return links;
  }

  /**
   * Resets all links to factory defaults.
   */
  static resetAllToDefaults(): ManagedApkLink[] {
    this.saveLinks(DEFAULT_LINKS);
    return DEFAULT_LINKS;
  }

  /**
   * Adds a new custom APK download mirror link.
   */
  static addCustomLink(name: string, url: string, description = 'Custom APK distribution mirror'): ManagedApkLink[] {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return this.getLinks();

    const id = `custom_${Date.now()}`;
    const newLink: ManagedApkLink = {
      id,
      name: name.trim() || 'Custom Mirror',
      badge: 'Custom Mirror',
      url: trimmedUrl,
      defaultUrl: trimmedUrl,
      isActive: true,
      isPrimary: false,
      isCustom: true,
      description
    };

    const links = [...this.getLinks(), newLink];
    this.saveLinks(links);
    return links;
  }

  /**
   * Removes a custom link.
   */
  static removeCustomLink(id: string): ManagedApkLink[] {
    const links = this.getLinks().filter(l => l.id !== id || !l.isCustom);
    this.saveLinks(links);
    return links;
  }

  /**
   * Tests reachability and latency of an APK link via HEAD request.
   */
  static async testLinkReachability(id: string): Promise<{ isReachable: boolean; latencyMs: number; statusText: string }> {
    const links = this.getLinks();
    const link = links.find(l => l.id === id);
    if (!link) {
      return { isReachable: false, latencyMs: 0, statusText: 'Link not found' };
    }

    const startTime = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const resp = await fetch(link.url, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache'
      });
      clearTimeout(timeoutId);

      const latencyMs = Math.round(performance.now() - startTime);
      const isReachable = resp.ok || resp.status === 200 || resp.status === 206 || resp.status === 302;
      const statusText = isReachable ? `HTTP ${resp.status} OK` : `HTTP ${resp.status}`;

      // Update link in storage with latest check
      const updated = links.map(l => l.id === id ? {
        ...l,
        isReachable,
        latencyMs,
        lastChecked: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      } : l);
      this.saveLinks(updated);

      return { isReachable, latencyMs, statusText };
    } catch (e: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      const updated = links.map(l => l.id === id ? {
        ...l,
        isReachable: false,
        latencyMs,
        lastChecked: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      } : l);
      this.saveLinks(updated);

      return { 
        isReachable: false, 
        latencyMs, 
        statusText: e.name === 'AbortError' ? 'Connection Timeout (5s)' : 'Network Error / Blocked' 
      };
    }
  }

  /**
   * Subscribes a listener to link changes across tabs and components.
   */
  static subscribe(callback: (links: ManagedApkLink[]) => void): () => void {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<ManagedApkLink[]>;
      callback(customEvent.detail || this.getLinks());
    };

    const storageHandler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        callback(this.getLinks());
      }
    };

    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener('storage', storageHandler);

    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener('storage', storageHandler);
    };
  }

  /**
   * Returns the primary active download link, or falls back to first active, or direct fallback.
   */
  static getPrimaryActiveLink(): ManagedApkLink {
    const links = this.getLinks();
    const primary = links.find(l => l.isActive && l.isPrimary);
    if (primary) return primary;

    const anyActive = links.find(l => l.isActive);
    if (anyActive) return anyActive;

    // Fallback to default Supabase entry even if marked inactive
    return links[0] || DEFAULT_LINKS[0];
  }

  /**
   * Returns all currently active links.
   */
  static getActiveLinks(): ManagedApkLink[] {
    const links = this.getLinks().filter(l => l.isActive);
    return links.length > 0 ? links : [DEFAULT_LINKS[0]];
  }
}
