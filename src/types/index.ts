export interface IngredientItem {
  id?: number | string;
  name: string;
  botanicalName?: string;
  sanskritName?: string;
  partUsed?: string;
  classicalRole?: string;
  therapeuticAction?: string;
}

export interface BotanicalIngredient {
  id: number | string;
  name: string;
  botanicalName?: string;
  sanskritName?: string;
  therapeuticAction?: string;
  partUsed?: string;
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
  actionType: 'STOCK_UPDATE' | 'ROLE_CHANGE' | 'MEDICINE_CREATE' | 'MEDICINE_UPDATE' | 'MEDICINE_DELETE' | 'DATABASE_SYNC' | 'CATEGORY_UPDATE' | 'INGREDIENT_CREATE' | 'INGREDIENT_UPDATE' | 'INGREDIENT_DELETE';
  entityId: string | number;
  details: string;
}

export interface SupabaseConfig {
  url: string;
  key: string;
  connected: boolean;
  lastSyncTime?: string;
}
