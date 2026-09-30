export interface IngredientItem {
  id?: number;
  name: string;
  botanicalName?: string;
  sanskritName?: string;
  partUsed?: string;
  classicalRole?: string;
}

export interface Product {
  id: number | string;
  code: string;
  name: string;
  sanskritName: string;
  categoryId: number;
  categoryName?: string;
  classicalReference: string;
  packings: string[];
  ingredients: (string | IngredientItem)[];
  usage: string;
  indications: string;
  description: string;
  primaryBenefit?: string;
  doshaImpact?: string;
  targetDoshas?: string[];
  healthGoals?: string[];
  imageUrl: string;
  status: 'Active' | 'Inactive' | 'Draft';
  featured: boolean;
  stockUnits?: number;
  batchNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  code: string;
  description: string;
  sortOrder: number;
  status: 'Active' | 'Inactive';
  productCount?: number;
}

export interface User {
  id: number | string;
  username?: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'PRACTITIONER' | 'PATIENT';
  roleTitle?: string;
  status: 'Active' | 'Pending' | 'Suspended';
  avatar?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  actionType: 'STOCK_UPDATE' | 'ROLE_CHANGE' | 'MEDICINE_CREATE' | 'MEDICINE_UPDATE' | 'MEDICINE_DELETE' | 'DATABASE_SYNC' | 'CATEGORY_UPDATE';
  entityId: string | number;
  details: string;
}

export interface SupabaseConfig {
  url: string;
  key: string;
  connected: boolean;
  lastSyncTime?: string;
}
