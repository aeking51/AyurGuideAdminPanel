# Ayur Index Android APK Cloud Hosting & Release Architecture

An enterprise-grade, high-availability distribution strategy to host, version, and distribute the official Ayur Index Android APK using your existing Supabase Central Backend Storage infrastructure, paired with automatic latest-link redirection, versioned historical archives, and admin release tooling.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were selected based on your preferences:
> - **Primary Hosting Provider**: Dedicated **Supabase Storage Bucket** (`apks`) linked to your active central project (`ksnsfilauqzxsegpjpdt.supabase.co`).
> - **Version Distribution Strategy**: **Automatic Latest Pointer** (`ayurindex-latest.apk`) for instant seamless updates on all printed clinical QR codes, paired with **Versioned Archive Links** (`ayurindex-v1.2.0.apk`) for reproducible builds and rollback safety.
> - **Zero-Disruption Fallback**: The app maintains high-speed local bundled fallback (`/downloads/ayurindex-latest.apk`) ensuring download access remains 100% operational even during maintenance windows or offline clinic setups.

- **Confirmed Decision 1**: Store binary release packages in public Supabase Storage bucket `apks`.
- **Confirmed Decision 2**: Provide single permanent `/downloads/latest` or bucket link for QR codes with automated pointer updates.
- **Confirmed Decision 3**: Add release management interface in the clinical administration panel for publishing newer versions.

---

## 1. Overview & Core Concept

### What It Does
This architecture transitions the Ayur Index APK from a purely static local web file to a globally distributed, cloud-backed delivery system hosted on **Supabase Storage**. Visitors, patients, and clinical practitioners scanning packaging QR codes or visiting `/download` will pull the verified APK from Supabase's high-speed CDN with automatic checksum verification and version archives.

### Target Audience & Use Cases
1. **Clinic Patients & Visitors**: Scan QR codes on medicine bottles or prescription monographs to download the latest authenticated Android APK in seconds without Play Store barriers.
2. **Clinical Vaidyas & Field Researchers**: Sideload the APK onto tablets and rugged Android smartphones in remote, low-connectivity clinics.
3. **Medical Administrators**: Manage and publish updated application builds, view SHA-256 signatures, and inspect download telemetry directly from the Ayur Index admin dashboard.

### Key Value Delivered
- **Permanent, Never-Broken QR Codes**: Printed medicine monographs and clinic banners with QR codes point to a stable `latest` URL that always resolves to the most recent APK without reprinting physical materials.
- **CDN Edge Acceleration**: Supabase Storage serves files across worldwide Cloudflare/Fastly edges with resuming capabilities (`Range` requests) and gzip/brotli transport optimization.
- **Complete Clinical Transparency**: Direct SHA-256 checksums and virus-free audit signatures displayed on both the download portal and admin releases panel.

---

## 2. User Experience & Visual Design

### Key User Flows

#### Flow A: Public Visitor / Patient Download Flow
```
┌─────────────────────────────────┐     ┌──────────────────────────────────┐     ┌────────────────────────────────┐
│   Medicine Bottle QR or Link    │ ──> │   Ayur Index /download Portal    │ ──> │   Supabase CDN Direct Stream   │
│   (Printed Monograph / Web CTA) │     │   - Auto Latest Cloud URL        │     │   - Fast chunked download      │
│                                 │     │   - SHA-256 Checksum & Size      │     │   - Background Android install │
└─────────────────────────────────┘     └──────────────────────────────────┘     └────────────────────────────────┘
                                                        │
                                                        ▼
                                        ┌──────────────────────────────────┐
                                        │   Version Archive & Changelog    │
                                        │   - v1.2.0 (Current)             │
                                        │   - v1.1.0 (Archive)             │
                                        │   - Sideloading 4-Step Guide     │
                                        └──────────────────────────────────┘
```

#### Flow B: Admin Release Publishing Flow
```
┌─────────────────────────────────┐     ┌──────────────────────────────────┐     ┌────────────────────────────────┐
│   Admin "Release Manager" Tab   │ ──> │   Upload New APK / Set URL       │ ──> │   Auto-Sync Latest Pointer     │
│   - Version Tag (e.g. v1.3.0)   │     │   - Computes SHA-256 Hash        │     │   - Updates Supabase Storage   │
│   - Release Notes & Highlights  │     │   - Uploads to 'apks' bucket     │     │   - Live updates public page   │
└─────────────────────────────────┘     └──────────────────────────────────┘     └────────────────────────────────┘
```

### Visual Identity & Theme
- **Theme Palette**: Classical Ayurvedic Forest (`#081C13`, `#0D281C`, `#103E2B`) with shimmering emerald accents (`#10B981`, `#34D399`) and parchment highlights.
- **Storage Badging**: Sleek Supabase Cloud Storage badge (`Connected to Supabase CDN`) with live storage latency and uptime indicator.
- **Interactive Archive Drawer**: Expanding release cards with release highlights, bugfix summaries, minimum Android OS requirements, and instant direct download triggers.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Supabase Storage Bucket vs. External Cloud Storage (AWS S3 / GCP Cloud Storage)
- **Chosen Approach**: Use a dedicated public Supabase Storage bucket named `apks` in your existing Supabase project.
- **Why**: You already have an authenticated, active Supabase project (`ksnsfilauqzxsegpjpdt.supabase.co`). Storing releases here keeps database, authentication, and object storage consolidated under a single dashboard with zero extra cloud subscription costs or complex IAM credential pipelines.
- **Trade-off**: Requires bucket public read permissions or signed URLs. We will configure standard public read policy so download links work seamlessly worldwide without requiring user authentication.

### Decision 2: Dual Storage URL Pattern (Latest Pointer + Immutable Versions)
- **Chosen Approach**:
  1. `https://[supabase-url]/storage/v1/object/public/apks/ayurindex-latest.apk` (Mutable latest pointer for all QR codes).
  2. `https://[supabase-url]/storage/v1/object/public/apks/releases/ayurindex-[version].apk` (Immutable versioned build archive).
- **Why**: Physical QR codes printed on Ayurvedic clinic labels cannot be edited after printing. The `latest` pointer ensures every patient scanning a bottle always gets the newest version, while the immutable versioned files prevent cache poisoning and allow exact rollbacks.

### Decision 3: Client-Side Resilient Fallback Strategy
- **Chosen Approach**: If the Supabase Storage bucket URL returns any error (e.g. 404 before first bucket upload or transient network block), the download handler seamlessly cascades to the local bundled APK (`/downloads/ayurindex-latest.apk`).
- **Why**: Guarantees zero downtime. The download button will never fail with a broken link.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 AYUR INDEX APPLICATION                                 │
│                                                                                        │
│  ┌──────────────────────────────┐              ┌────────────────────────────────────┐  │
│  │   Public /download Portal    │              │  Admin "APK & Releases" Manager    │  │
│  │   - Primary Supabase CTA     │              │  - Version Registry                │  │
│  │   - QR Scanner Target        │              │  - Upload / URL Switcher           │  │
│  │   - Versioned Archive List   │              │  - Checksum Generator              │  │
│  └──────────────┬───────────────┘              └─────────────────┬──────────────────┘  │
│                 │                                                │                     │
│                 ▼                                                ▼                     │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                         Supabase Storage Service Client                          │  │
│  │  - Bucket: public.apks                                                           │  │
│  │  - Base URL: https://ksnsfilauqzxsegpjpdt.supabase.co/storage/v1/object/public/apks │  │
│  │  - Latest URL: .../ayurindex-latest.apk                                          │  │
│  │  - Versioned URLs: .../releases/ayurindex-v1.2.0.apk                             │  │
│  └──────────────────────────────────────┬───────────────────────────────────────────┘  │
└─────────────────────────────────────────┼──────────────────────────────────────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
   ┌──────────────────────────────┐               ┌──────────────────────────────┐
   │    Primary CDN Route         │               │     Local Server Fallback    │
   │  Supabase Edge Global CDN    │ ────────────> │  Bundled Vite Static Asset   │
   │  (High speed, direct APK)    │ (On 404/Fail) │  (/downloads/ayurindex.apk)  │
   └──────────────────────────────┘               └──────────────────────────────┘
```

### Supabase Storage Bucket & Schema Specifications

#### 1. Supabase Storage Bucket Definition
```sql
-- Create public storage bucket for APK distribution
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'apks',
  'apks',
  true,
  104857600, -- 100 MB max APK size limit
  ARRAY['application/vnd.android.package-archive', 'application/octet-stream']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read access policy for anonymous APK downloads
CREATE POLICY "Public Read Access for APKs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'apks');
```

#### 2. Release Configuration Data Structure
```typescript
export interface CloudApkRelease {
  version: string;
  buildNumber: number;
  releaseDate: string;
  fileSize: string;
  sha256: string;
  cloudStorageUrl: string; // Supabase CDN URL
  bundledFallbackUrl: string; // Local server URL
  isLatest: boolean;
  minAndroid: string;
  changelog: string[];
}
```

### Implementation Steps

1. **Supabase Storage Configuration (`src/config/apkConfig.ts`)**:
   - Update `APK_CONFIG` with the primary Supabase Storage public URL:
     `https://ksnsfilauqzxsegpjpdt.supabase.co/storage/v1/object/public/apks/ayurindex-latest.apk`
   - Define versioned archive structure for historical releases.
   - Configure health check and automatic fallback to `/downloads/ayurindex-latest.apk`.

2. **Storage Helper Service (`src/services/apkStorageService.ts`)**:
   - Create helper utility to check Supabase Storage availability, verify live CDN headers, and resolve the optimal download endpoint for any user's region.
   - Add automated bucket creation script/instructions and SQL migration in `supabase_schema.sql`.

3. **Public Download Portal Enhancements (`src/components/public/ApkDownloadPage.tsx`)**:
   - Add "Hosted on Supabase Cloud CDN" trust badge with live connectivity pill.
   - Add "Version History & Archive" table allowing practitioners to download past verified builds.
   - Update QR code generator to encode the live Supabase Storage URL or clean `/download` redirect.

4. **Admin Dashboard Release Management Panel (`src/components/admin/ReleaseManagerModal.tsx`)**:
   - Provide an administration modal in the Database/Settings tab where admins can view storage bucket status, update version metadata, and copy live Supabase Storage URLs.
