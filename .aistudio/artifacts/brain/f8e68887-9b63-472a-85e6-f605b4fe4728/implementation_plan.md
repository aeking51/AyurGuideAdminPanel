# AyurGuide Android APK Public Download Portal

A dedicated, friction-free public distribution page and global navigation touchpoints for patients, clinical practitioners, and the public to discover, scan, and download the official AyurGuide Android application (APK), complete with step-by-step sideloading guidance and interactive feature previews powered by live Supabase medicine records.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and user experience decisions have been established based on your responses and system requirements:

- **Download Architecture**: Hybrid download mechanism providing instant direct download of the bundled AyurGuide APK release (`/downloads/ayurguide-latest.apk`) alongside a configurable fallback or custom mirror URL input (e.g., GitHub Releases, cloud bucket, or internal server), with file size, SHA-256 verification checksum, and version badge (v1.2.0).
- **Public Navigation & Accessibility**: High-visibility dual access — a dedicated navbar link with QR preview modal in the main header, plus a responsive floating "Get Android App" pill widget present across all public views (including individual `/product/:slug` monograph pages) and the main portal.
- **Onboarding & Trust Content**: Mobile scan-to-download QR code generator, interactive step-by-step Android sideloading & security permission guide ("Allow Unknown Sources / Install Unknown Apps"), and an interactive 4-stage AyurGuide mobile feature preview (Fast Offline Lookup, Botanical Monograph Cards, Formulation Scanner, Dosage Calculators).
- **Zero Mock / Supabase Live Integration**: All preview metrics and showcase items dynamically draw from live `public.products` and `public.ingredients` in Supabase without placeholder mock data.

---

## 1. Overview & Core Concept

### What It Does
The **AyurGuide APK Public Download Portal** provides an accessible, unauthenticated gateway (`/download` and `#/download`) enabling anyone — whether clinical practitioners on rounds or patients researching classical remedies — to download and install the native AyurGuide Android APK directly to their mobile devices.

### Target Audience & Persona
- **Ayurvedic Practitioners & Vaidyas**: Seeking a rapid, pocket-friendly offline reference for classical formulations and Sanskrit botanicals during clinical consultations.
- **Ayurveda Pharmacy Operators & Students**: Looking for barcode scanning, dosage guidance, and verified herb constituents on their personal Android phones.
- **Public Patients & Health Seekers**: Accessing shared medicine monographs who want the full companion app installed without Google Play account restrictions.

### Key Value Delivered
- **Immediate APK Delivery**: Direct browser download starts with a single tap, with automatic download link generation and direct file streaming.
- **Frictionless Mobile Handoff**: Desktop visitors can scan the prominent QR code with their phone camera to instantly start downloading the APK directly on their device.
- **Trust & Security Assurance**: Clear explanation of Android security dialogs, Play Protect verification steps, and cryptographic checksums to reassure users during sideloading.
- **Universal Visibility**: The floating action pill ensures visitors arriving from shared medicine links never miss the mobile app availability.

---

## 2. User Experience & Visual Design

### Key User Flows

```
  ┌───────────────────────────────────────────────────────────────┐
  │ 1. Public Visitor Arrives (Home, /product/:slug, or /download)│
  └───────────────────────────────┬───────────────────────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         │                                                 │
         ▼                                                 ▼
┌──────────────────┐                              ┌──────────────────┐
│ Navbar Link /    │                              │ Floating "Get    │
│ Direct /download │                              │ Android App" FAB │
└────────┬─────────┘                              └────────┬─────────┘
         │                                                 │
         └────────────────────────┬────────────────────────┘
                                  │
                                  ▼
 ┌─────────────────────────────────────────────────────────────────┐
 │                   Public APK Download Hub                       │
 │  • Hero: App Icon, Live Version Pill, One-Click Download Button │
 │  • Dynamic QR Code with "Scan with Phone Camera" guide          │
 │  • Direct File Download + Mirror/Custom URL Fallback            │
 └────────────────────────────────┬────────────────────────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         │                                                 │
         ▼                                                 ▼
┌─────────────────────────────────┐      ┌─────────────────────────────────┐
│ Installation Guide (4 Steps)    │      │ Interactive Mobile App Preview  │
│ 1. Download .apk file           │      │ • Live classical medicine stats │
│ 2. Tap open in notification bar │      │ • Botanical ingredient search   │
│ 3. Allow install unknown apps   │      │ • Digital monograph inspector   │
│ 4. Launch AyurGuide & search    │      │ (Driven by real Supabase data)  │
└─────────────────────────────────┘      └─────────────────────────────────┘
```

### Visual Identity & Theme
- **Design Language**: Deep forest sanctuary aesthetics (`#081C13` background, `#0D281C` container cards, `#23493C` emerald borders) matching the Ayur Index design system.
- **Accent Elements**: Vibrant clinical emerald (`#10B981`), Ayurvedic gold (`#F59E0B`), and jade glow highlights with smooth micro-interactions.
- **Typography**: Clean, highly readable system typography hierarchy with tabular figures for version numbers, SHA-256 hashes, and file sizes.
- **Hero Presentation**: Sleek mobile device mockup showcasing the AyurGuide app interface, paired with an illuminated QR code card and quick download actions.

### Component Layout & Responsive Hierarchy
1. **Public Top Navigation Bar**:
   - Ayur Index branding with active mobile badge.
   - Distinct "Android App" navigation tab with an Android robot/smartphone icon and "Free APK" badge.
   - Quick QR modal trigger in the header for desktop users.
2. **Download Hub Hero Section**:
   - Primary `Download AyurGuide APK` button (initiates instant `.apk` download with file size indicator, e.g., `~18.4 MB`).
   - Mirror / Custom URL selector dropdown (allows using alternative hosting endpoints or CDN URLs).
   - "Scan to Install on Mobile" high-contrast QR code with direct phone-camera target URL.
   - Security verification panel displaying release tag, build date, minimum Android version (`Android 8.0+`), and SHA-256 checksum with one-click copy.
3. **Interactive Step-by-Step Installation Walkthrough**:
   - Visual cards explaining:
     - **Step 1**: Tap *Download Anyway* if Chrome displays the standard unknown file notice.
     - **Step 2**: Open the downloaded `ayurguide-v1.2.0.apk` from the notification shade or Files app.
     - **Step 3**: Toggle *Allow from this source* in Android Settings when prompted.
     - **Step 4**: Tap *Install* and launch AyurGuide with instant offline Ayurvedic lookup.
4. **Interactive Feature Showcase**:
   - 4 tabbed or carousel highlights showing the app's real capabilities:
     - Classical Formulation Explorer
     - Botanical Herb Directory with Dravyaguna properties
     - Formulation Barcode & QR Scanner
     - Patient Monograph Sharing & Offline Vault
5. **Universal Floating Download Button**:
   - Subtle, non-intrusive floating pill in the bottom-right corner of all public pages (`/product/:slug`) and catalogue views with an icon, "Get AyurGuide APK" label, and dismissible badge.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Hybrid APK Hosting (Bundled Static File + Custom Mirror URL)
- **Chosen Approach**: Serve a default bundled APK file endpoint `/downloads/ayurguide-latest.apk` (with standard static file routing) while including an intuitive setting/switch for administrators or users to point to custom release URLs (e.g., GitHub Releases asset URL or Supabase storage bucket).
- **Why**: Ensures the download works immediately out of the box without external setup, while accommodating production deployments where APKs are hosted on cloud storage buckets or GitHub release pipelines.
- **Alternative Considered**: Requiring external cloud bucket URLs upfront was rejected because it causes broken links if no external bucket is provisioned.

### Decision 2: Zero-Auth Public Route (`/download` and `#/download`)
- **Chosen Approach**: Make the APK download page a first-class public route alongside `/product/:slug`, accessible without admin login credentials.
- **Why**: Public users and practitioners scanning QR codes or clicking external links should immediately access the download page without encountering an admin authentication wall.
- **Alternative Considered**: Putting the download option only inside the practitioner admin navbar was rejected as it prevents general public access.

### Decision 3: Global Floating Action Pill on Public Product Monographs
- **Chosen Approach**: Mount a floating "Get Android App" action pill on all public views that seamlessly links to the download page or opens the quick-scan modal.
- **Why**: Patients and practitioners viewing a shared medicine monograph via QR code are in the exact mindset to install the native mobile app for faster daily access.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Ayur Index Client Router                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
       ┌────────────────────────────┼───────────────────────────┐
       ▼                            ▼                           ▼
┌──────────────┐             ┌──────────────┐            ┌──────────────┐
│  /download   │             │/product/:slug│            │ Admin Portal │
│ Public Page  │             │ Public Page  │            │ (Auth Guard) │
└──────┬───────┘             └──────┬───────┘            └──────┬───────┘
       │                            │                           │
       │                            ▼                           │
       │                   ┌──────────────────┐                 │
       │                   │ Floating Action  │                 │
       │                   │ Download Button  │                 │
       │                   └────────┬─────────┘                 │
       │                            │                           │
       └────────────────────────────┼───────────────────────────┘
                                    │
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │               APK Distribution Service                 │
       │  • Direct File Handler (/downloads/ayurguide-v1.2.apk) │
       │  • Dynamic QR Code Generator (SVG / Canvas)            │
       │  • Custom Storage / Mirror URL Resolver                │
       │  • Live Supabase Stats Hydration (Products & Herbs)    │
       └────────────────────────────┬───────────────────────────┘
                                    │
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │                 Supabase PostgreSQL DB                 │
       │        (Live medicine count, botanicals, categories)   │
       └────────────────────────────────────────────────────────┘
```

### Component Structure & State Flow
- **`ApkDownloadPage.tsx`**: Primary public destination page with hero banner, direct download trigger, QR code generator (using standard SVG/Canvas QR rendering), interactive install steps, and live product preview counter.
- **`FloatingDownloadButton.tsx`**: Lightweight sticky component positioned at `bottom-6 right-6` with pulse animation, collapsible on mobile scroll, active across public monograph pages and main catalogue.
- **`DownloadQRModal.tsx`**: Accessible modal allowing desktop users on any page to open a high-res QR code for immediate scanning with their smartphone camera.
- **`apkConfig.ts`**: Centralized configuration specifying the latest version string (`v1.2.0`), build number, release notes, package name (`com.ayurindex.ayurguide`), file size, SHA-256 hash, and download endpoints.
- **Routing Integration in `App.tsx`**: Enhanced URL parsing supporting `/download`, `#/download`, query parameter `?view=download`, and navigation state transitions between catalogue, product monograph, and download hub.

### Interactive Component & State Mapping

| Component | Trigger / Event | State Transition & Action |
| :--- | :--- | :--- |
| **Hero Download Button** | User clicks "Download AyurGuide APK" | Initiates browser direct download of `.apk`, triggers success toast with install reminder, increments local download counter |
| **Mirror URL Selector** | User toggles between "Direct Server" and "Custom URL" | Updates target download link, re-encodes the mobile QR code with the new download destination URL |
| **Mobile QR Generator** | User opens page or changes mirror | Renders clean SVG QR code containing the absolute direct download link for seamless smartphone scanning |
| **Installation Stepper** | User clicks steps 1–4 | Highlights active step, displays helpful screenshot preview of the Android security prompt for clarity |
| **Floating Action FAB** | User clicks floating button on any page | Smoothly navigates to `/download` or triggers quick-download sheet depending on current viewport |
| **Copy Checksum / Link** | User clicks copy button | Copies SHA-256 hash or public download URL to clipboard with instant visual confirmation tick |
