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
  directDownloadUrl: string;
  versionedDownloadUrl: string;
  githubMirrorUrl: string;
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
}

export const APK_CONFIG: ApkReleaseInfo = {
  appName: 'AyurGuide',
  version: 'v1.2.0',
  buildNumber: '120',
  releaseDate: 'October 2026',
  packageId: 'com.ayurindex.ayurguide',
  fileSize: '18.0 MB',
  minAndroid: 'Android 8.0 (Oreo) or later',
  targetAndroid: 'Android 14 (API 34)',
  sha256: 'a8657bb160d6b5371853228f8501f2378f4a20e8f09e32c126564455b9d71d82',
  directDownloadUrl: '/downloads/ayurguide-latest.apk',
  versionedDownloadUrl: '/downloads/ayurguide-v1.2.0.apk',
  githubMirrorUrl: 'https://github.com/ayurindex/ayurguide-android/releases/latest/download/ayurguide-v1.2.0.apk',
  releaseHighlights: [
    'Offline-First Classical Ayurveda Medicines Database with instant search',
    'Integrated Camera Barcode & Clinical QR Monograph Scanner',
    'Comprehensive Dravyaguna Botanical Herbs Dictionary & Sanskrit cross-references',
    'Real-time Supabase cloud sync when connected with practitioner authentication',
    'Dosha impact indicators (Vata, Pitta, Kapha) and classical anupana / dosage guidance'
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
      title: 'Download AyurGuide APK',
      description: 'Tap the "Download APK" button or scan the QR code using your Android smartphone camera.',
      tip: 'Chrome may show "File might be harmful" — tap "Download anyway". This is Android\'s standard notice for all apps installed outside Google Play.',
      badge: 'Step 1'
    },
    {
      step: 2,
      title: 'Open Downloaded File',
      description: 'Once download completes, tap the download notification in your notification tray or open your phone\'s Files/Downloads app.',
      tip: 'Locate `ayurguide-v1.2.0.apk` and tap on it.',
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
      description: 'Tap "Install" on the confirmation screen, then tap "Open" to begin exploring AyurGuide immediately.',
      tip: 'AyurGuide operates fully offline. Connect to Wi-Fi to sync with your Ayur Index database.',
      badge: 'Step 4'
    }
  ],
  faq: [
    {
      question: 'Why does Android show "File might be harmful" when downloading?',
      answer: 'This is Android\'s standard precautionary alert for any APK downloaded via a web browser rather than Google Play. AyurGuide is the verified official build of Ayur Index, free from tracking, telemetry, or ads.'
    },
    {
      question: 'Does AyurGuide work without an internet connection?',
      answer: 'Yes! The entire classical medicine directory and botanical constituents database are packaged locally inside the APK so you can search formulations anywhere without internet.'
    },
    {
      question: 'How do I update AyurGuide in the future?',
      answer: 'Simply download and tap install on any newer APK version from this download page. Your saved favorites, custom notes, and local settings will be preserved automatically.'
    },
    {
      question: 'Is AyurGuide free for public patients and practitioners?',
      answer: 'Yes, AyurGuide is completely free for all Vaidyas, clinical researchers, pharmacy practitioners, and patients seeking authentic classical Ayurvedic information.'
    }
  ]
};
