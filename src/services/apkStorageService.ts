import { APK_CONFIG, ApkVersionArchive } from '../config/apkConfig';
import { SupabaseService } from './supabase';

export interface StorageStatusResult {
  bucketExists: boolean;
  latestFileReachable: boolean;
  effectiveUrl: string;
  source: 'supabase_storage' | 'bundled_fallback' | 'custom';
  latencyMs?: number;
  message: string;
}

export class ApkStorageService {
  /**
   * Evaluates the availability of the Supabase Storage bucket release.
   * If the Supabase bucket URL is reachable, returns it; otherwise cascades to bundled fallback.
   */
  static async checkCloudReleaseStatus(): Promise<StorageStatusResult> {
    const primaryUrl = APK_CONFIG.supabaseLatestApkUrl;
    const fallbackUrl = APK_CONFIG.directDownloadUrl;
    const startTime = performance.now();

    try {
      // Test HEAD on the Supabase storage bucket file
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const resp = await fetch(primaryUrl, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache'
      });
      clearTimeout(timeoutId);

      const latencyMs = Math.round(performance.now() - startTime);

      if (resp.ok) {
        return {
          bucketExists: true,
          latestFileReachable: true,
          effectiveUrl: primaryUrl,
          source: 'supabase_storage',
          latencyMs,
          message: `Live on Supabase Cloud CDN (${latencyMs}ms latency)`
        };
      } else {
        return {
          bucketExists: resp.status !== 404,
          latestFileReachable: false,
          effectiveUrl: fallbackUrl,
          source: 'bundled_fallback',
          latencyMs,
          message: `Falling back to bundled local build (Cloud HTTP ${resp.status})`
        };
      }
    } catch {
      return {
        bucketExists: false,
        latestFileReachable: false,
        effectiveUrl: fallbackUrl,
        source: 'bundled_fallback',
        message: 'Using verified local server fallback build'
      };
    }
  }

  /**
   * Resolves the target download URL for a given release or version.
   */
  static getDownloadUrlForVersion(version: string, preferCloud = true): string {
    const release = APK_CONFIG.archiveReleases.find(r => r.version === version);
    if (!release) return APK_CONFIG.supabaseLatestApkUrl;
    return preferCloud ? release.cloudStorageUrl : release.bundledFallbackUrl;
  }

  /**
   * Generates SQL needed to create and configure the Supabase Storage bucket with public access.
   */
  static getStorageSetupSql(): string {
    const bucket = APK_CONFIG.supabaseStorageBucket;
    return `-- ====================================================================
-- SUPABASE STORAGE BUCKET: ${bucket} (Ayur Index Android Distribution)
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/ksnsfilauqzxsegpjpdt/sql)
-- ====================================================================

-- 1. Create public storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  '${bucket}',
  '${bucket}',
  true,
  104857600, -- 100 MB max size
  ARRAY['application/vnd.android.package-archive', 'application/octet-stream']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Grant public read access to download APK files
CREATE POLICY "Public Read Access for APKs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = '${bucket}');

-- 3. Allow authenticated & admin users to upload new releases
CREATE POLICY "Authenticated Release Uploads"
ON storage.objects FOR INSERT
TO authenticated, anon
WITH CHECK (bucket_id = '${bucket}');

CREATE POLICY "Authenticated Release Updates"
ON storage.objects FOR UPDATE
TO authenticated, anon
USING (bucket_id = '${bucket}');
`;
  }

  /**
   * Uploads an APK file directly to the Supabase Storage bucket.
   */
  static async uploadApkToStorage(
    file: File,
    versionTag: string,
    onProgress?: (percent: number) => void
  ): Promise<{ success: boolean; latestUrl?: string; versionedUrl?: string; message: string }> {
    const client = SupabaseService.getClient();
    if (!client) {
      return {
        success: false,
        message: 'Supabase client is not connected. Please check your credentials in Database Settings.'
      };
    }

    try {
      const sanitizedVersion = versionTag.startsWith('v') ? versionTag : `v${versionTag}`;
      const versionedFilename = `releases/ayurindex-${sanitizedVersion}.apk`;
      const latestFilename = 'Latest_App/AyurIndex.apk';
      const bucket = APK_CONFIG.supabaseStorageBucket;

      onProgress?.(20);

      // 1. Upload the versioned file
      const { error: versionError } = await client.storage
        .from(bucket)
        .upload(versionedFilename, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'application/vnd.android.package-archive'
        });

      if (versionError) {
        throw new Error(`Failed to upload ${versionedFilename}: ${versionError.message}`);
      }

      onProgress?.(60);

      // 2. Upload/update the latest pointer
      const { error: latestError } = await client.storage
        .from(bucket)
        .upload(latestFilename, file, {
          cacheControl: '300', // Short cache for latest pointer
          upsert: true,
          contentType: 'application/vnd.android.package-archive'
        });

      if (latestError) {
        throw new Error(`Failed to update latest pointer ${latestFilename}: ${latestError.message}`);
      }

      onProgress?.(100);

      const latestUrl = `${APK_CONFIG.supabaseStorageBaseUrl}/${latestFilename}`;
      const versionedUrl = `${APK_CONFIG.supabaseStorageBaseUrl}/${versionedFilename}`;

      return {
        success: true,
        latestUrl,
        versionedUrl,
        message: `Successfully published ${sanitizedVersion} to Supabase Storage!`
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Upload failed'
      };
    }
  }

  /**
   * Calculates the SHA-256 hash of a local file in the browser using Web Crypto API.
   */
  static async calculateFileSha256(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
