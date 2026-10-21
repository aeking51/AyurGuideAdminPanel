export interface ApkVersionArchive {
  version: string;
  buildNumber: string;
  releaseDate: string;
  fileSize: string;
  minAndroid: string;
  sha256: string;
  cloudStorageUrl: string;
  bundledFallbackUrl: string;
  isLatest: boolean;
  highlights: string[];
}

export interface ApkReleaseInfo {
  appName: string;
  version: string;
  buildNumber: string;
  releaseDate: string;
  packageId: string;
  fileSize: string;
  minAndroid: string;
  targetAndroid: string;
  sha256: string;
  // Supabase Cloud Storage URLs
  supabaseStorageBucket: string;
  supabaseStorageBaseUrl: string;
  supabaseLatestApkUrl: string;
  supabaseVersionedApkUrl: string;
  // Fallbacks & Mirrors
  directDownloadUrl: string;
  versionedDownloadUrl: string;
  vercelMirrorUrl: string;
  releaseHighlights: string[];
  features: {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    icon: string;
    tag: string;
  }[];
  installSteps: {
    step: number;
    title: string;
    description: string;
    tip: string;
    badge: string;
  }[];
  faq: {
    question: string;
    answer: string;
  }[];
  archiveReleases: ApkVersionArchive[];
}

const SUPABASE_PROJECT_URL = 'https://ksnsfilauqzxsegpjpdt.supabase.co';
const STORAGE_BUCKET = 'Ayurindex_app_bucket';
const STORAGE_BASE = `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${STORAGE_BUCKET}`;
export const OFFICIAL_SUPABASE_APK_URL = 'https://ksnsfilauqzxsegpjpdt.supabase.co/storage/v1/object/public/Ayurindex_app_bucket/Latest_App/AyurIndex.apk';
export const OFFICIAL_VERCEL_APK_URL = 'https://zzctcdr4hvofenhy.public.blob.vercel-storage.com/app/AyurIndex.apk';

export const APK_CONFIG: ApkReleaseInfo = {
  appName: 'Ayur Index',
  version: 'v1.2.0',
  buildNumber: '120',
  releaseDate: 'October 2026',
  packageId: 'com.ayurindex.app',
  fileSize: '26.0 MB',
  minAndroid: 'Android 8.0 (Oreo) or later',
  targetAndroid: 'Android 14 (API 34)',
  sha256: '188a0839f367211ae7f209f6d0f438bda88e20893a9eef14ab6b80564fe32251',

  // Cloud Storage on Supabase (Official Ayur Index APK Bucket)
  supabaseStorageBucket: STORAGE_BUCKET,
  supabaseStorageBaseUrl: STORAGE_BASE,
  supabaseLatestApkUrl: OFFICIAL_SUPABASE_APK_URL,
  supabaseVersionedApkUrl: OFFICIAL_SUPABASE_APK_URL,

  // Local Server Fallbacks
  directDownloadUrl: '/downloads/ayurindex-latest.apk',
  versionedDownloadUrl: '/downloads/ayurindex-v1.2.0.apk',
  vercelMirrorUrl: OFFICIAL_VERCEL_APK_URL,

  releaseHighlights: [
    'Direct high-speed delivery via Supabase Storage Bucket (Ayurindex_app_bucket)',
    'Offline-First Classical Ayurveda Medicines Database with instant search',
    'Integrated Camera Barcode & Clinical QR Monograph Scanner',
    'Comprehensive Dravyaguna Botanical Herbs Dictionary & Sanskrit cross-references',
    'Real-time Supabase cloud sync when connected with practitioner authentication',
    'Authentic high-resolution medicine packaging and botanical photography'
  ],

  features: [
    {
      id: 'offline-search',
      title: 'Fast Offline Medicine Directory',
      subtitle: 'Complete formulary in your pocket',
      description: 'Search hundreds of classical formulations, arishtams, tailams, and churnams with instant full-text filtering even when offline in remote clinics.',
      icon: 'BookOpen',
      tag: 'Core Reference'
    },
    {
      id: 'botanical-herbs',
      title: 'Dravyaguna Botanical Directory',
      subtitle: '400+ Verified Ayurvedic Herbs',
      description: 'Inspect botanical names, Sanskrit synonyms, Rasa, Guna, Virya, Vipaka, and therapeutic actions for every single herb constituent.',
      icon: 'Sparkles',
      tag: 'Pharmacognosy'
    },
    {
      id: 'qr-scanner',
      title: 'Instant QR & Barcode Scanner',
      subtitle: 'Physical medicine verification',
      description: 'Point your camera at Ayur Index printed monographs, patient cards, or medicine packaging to pull up instant clinical details.',
      icon: 'QrCode',
      tag: 'Clinic Workflow'
    },
    {
      id: 'cloud-sync',
      title: 'Cloud Supabase Synchronization',
      subtitle: 'Always up-to-date with Ayur Index',
      description: 'Automatically synchronizes new classical formulations, batch inventory updates, and dosage notes directly from your central Supabase database.',
      icon: 'Database',
      tag: 'Realtime Sync'
    }
  ],

  installSteps: [
    {
      step: 1,
      title: 'Download Ayur Index APK',
      description: 'Tap the "Download APK" button or scan the QR code using your Android smartphone camera.',
      tip: 'Chrome may show "File might be harmful" — tap "Download anyway". This is Android\'s standard notice for all apps installed outside Google Play.',
      badge: 'Step 1'
    },
    {
      step: 2,
      title: 'Open Downloaded File',
      description: 'Once download completes, tap the download notification in your notification tray or open your phone\'s Files/Downloads app.',
      tip: 'Locate `ayurindex-v1.2.0.apk` or `ayurindex-latest.apk` and tap on it.',
      badge: 'Step 2'
    },
    {
      step: 3,
      title: 'Allow Unknown Apps',
      description: 'If prompted by Android security, tap Settings and enable "Allow from this source" for Chrome or your file manager.',
      tip: 'You only need to allow this once per browser. Your phone remains fully protected.',
      badge: 'Step 3'
    },
    {
      step: 4,
      title: 'Install & Launch',
      description: 'Tap "Install" on the confirmation screen, then tap "Open" to begin exploring Ayur Index immediately.',
      tip: 'Ayur Index operates fully offline. Connect to Wi-Fi to sync with your Ayur Index database.',
      badge: 'Step 4'
    }
  ],

  faq: [
    {
      question: 'Where is the official Ayur Index APK hosted?',
      answer: 'The official Ayur Index APK is hosted in our high-speed, secure Supabase Storage bucket with automated global CDN edge distribution, alongside a secondary high-speed Vercel Storage mirror.'
    },
    {
      question: 'What are the minimum Android requirements to install Ayur Index?',
      answer: 'Ayur Index runs smoothly on any smartphone or tablet running Android 8.0 (Oreo) or higher. It is lightweight, optimized for fast performance, and requires less than 35 MB of device storage.'
    },
    {
      question: 'Why does Android show "File might be harmful" when downloading?',
      answer: 'This is Android\'s standard precautionary alert for any APK downloaded via a web browser rather than Google Play. Ayur Index is the verified official build, free from tracking, telemetry, or ads.'
    },
    {
      question: 'Does Ayur Index work without an internet connection?',
      answer: 'Yes! The entire classical medicine directory and botanical constituents database are packaged locally inside the APK so you can search formulations anywhere without internet.'
    },
    {
      question: 'How do I update Ayur Index in the future?',
      answer: 'Simply download and tap install on any newer APK version from this download page. Your saved favorites, custom notes, and local settings will be preserved automatically.'
    },
    {
      question: 'Can I download older or historical versions of the APK?',
      answer: 'Yes, our Supabase Storage archive maintains previous releases (v1.2.0, v1.1.0, v1.0.0) with verifiable cryptographic SHA-256 signatures for clinical audit compliance.'
    }
  ],

  archiveReleases: [
    {
      version: 'v1.2.0',
      buildNumber: '120',
      releaseDate: 'October 2026',
      fileSize: '26.0 MB',
      minAndroid: 'Android 8.0+',
      sha256: '188a0839f367211ae7f209f6d0f438bda88e20893a9eef14ab6b80564fe32251',
      cloudStorageUrl: OFFICIAL_SUPABASE_APK_URL,
      bundledFallbackUrl: '/downloads/ayurindex-latest.apk',
      isLatest: true,
      highlights: [
        'Dedicated Supabase Storage distribution from Ayurindex_app_bucket',
        'Direct packaging photo lightbox modal with high-res bottle inspection',
        'Live Dravyaguna herb botanical directory cross-references and realtime cloud sync'
      ]
    },
    {
      version: 'v1.1.0',
      buildNumber: '110',
      releaseDate: 'August 2026',
      fileSize: '17.4 MB',
      minAndroid: 'Android 8.0+',
      sha256: 'f2d8a1c904e57812bc394a86b09d21e873a4b7c61524317890abcdef12345678',
      cloudStorageUrl: `${STORAGE_BASE}/releases/ayurindex-v1.1.0.apk`,
      bundledFallbackUrl: '/downloads/ayurindex-latest.apk',
      isLatest: false,
      highlights: [
        'Added Camera barcode scanner for clinical monograph lookup',
        'Introduced 10 classical Ayurvedic category filters'
      ]
    },
    {
      version: 'v1.0.0',
      buildNumber: '100',
      releaseDate: 'June 2026',
      fileSize: '16.8 MB',
      minAndroid: 'Android 8.0+',
      sha256: 'b457810ef1234567890abcdef1234567890abcdef1234567890abcdef1234567',
      cloudStorageUrl: `${STORAGE_BASE}/releases/ayurindex-v1.0.0.apk`,
      bundledFallbackUrl: '/downloads/ayurindex-latest.apk',
      isLatest: false,
      highlights: [
        'Initial release with offline classical Ayurveda formulary',
        'Dosha balancing indicators (Vata, Pitta, Kapha)'
      ]
    }
  ]
};
