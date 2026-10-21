export interface IngredientItem {
  id?: number | string;
  name: string;
  botanicalName?: string;
  sanskritName?: string;
  partUsed?: string;
  classicalRole?: string;
  therapeuticAction?: string;
  referenceLink?: string;
}

export interface BotanicalIngredient {
  id: number | string;
  name: string;
  botanicalName?: string;
  sanskritName?: string;
  therapeuticAction?: string;
  partUsed?: string;
  referenceLink?: string;
  createdAt?: string;
}

export interface Product {
  id: number | string;
  code: string;
  name: string;
  categoryName?: string;
  categoryId?: number;
  sanskritName?: string;
  classicalReference?: string;
  packings: string[];
  ingredients: (string | IngredientItem)[];
  usage: string;
  dosage?: string;
  indications?: string;
  description?: string;
  primaryBenefit?: string;
  doshaImpact?: string;
  targetDoshas?: string[];
  healthGoals?: string[];
  imageUrl?: string;
  images?: string[];
  status: 'Active' | 'Inactive' | 'Draft';
  featured: boolean;
  publicSlug?: string;
  shareQrLink?: string;
  stockUnits?: number;
  batchNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  code?: string;
  title?: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  status?: 'Active' | 'Inactive';
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: number | string;
  username?: string;
  name: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'PRACTITIONER' | 'PATIENT';
  roleTitle?: string;
  status: 'Active' | 'Pending' | 'Suspended';
  avatar?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string | number;
  adminEmail: string; // Real user email or "Guest user"
  action: string;
  targetEntity?: string;
  targetId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
  // Backward-compatibility properties
  userEmail?: string;
  actionType?: string;
  entityId?: string | number;
  timestamp?: string;
}

export interface SupabaseConfig {
  url: string;
  key: string;
  connected: boolean;
  lastSyncTime?: string;
}

export interface AppDevice {
  id?: number | string;
  installationId: string;
  manufacturer?: string;
  deviceModel?: string;
  androidVersion?: string;
  sdkVersion?: number | string;
  appVersion?: string;
  appVersionName?: string;
  appVersionCode?: number;
  deviceType?: string; // 'Phone' | 'Tablet' | 'Foldable' | 'Other'
  language?: string;
  timezone?: string;
  networkType?: string;
  deviceReportingConsent: boolean;
  locationConsent: boolean;
  firstSeenAt: string;
  lastSeenAt: string;
  lastSyncAt?: string;
  createdAt?: string;
  updatedAt?: string;
  // Computed / joined fields
  locationsCount?: number;
  latestLocation?: AppDeviceLocation | null;
}

export interface AppDeviceLocation {
  id?: number | string;
  installationId: string;
  deviceModel?: string;
  latitude: number;
  longitude: number;
  accuracy?: number; // meters
  locationPrecision: 'approximate' | 'precise';
  locationSource?: string; // 'gps' | 'network' | 'fused' | 'passive'
  recordedAt: string;
  uploadedAt: string;
  createdAt?: string;
}

export interface DeviceStats {
  totalDevices: number;
  active24h: number;
  active7d: number;
  locationConsentCount: number;
  noLocationConsentCount: number;
  devicesWithLocationData: number;
}
