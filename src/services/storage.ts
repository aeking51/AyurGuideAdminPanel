import { Product, Category, User, AuditLog, SupabaseConfig, BotanicalIngredient } from '../types';
import { initialProducts, initialCategories, initialUsers, initialAuditLogs } from '../data/initialData';
import { ensureProductShareFields } from '../utils/shareUtils';

const PRODUCTS_KEY = 'ayurguide_products';
const CATEGORIES_KEY = 'ayurguide_categories';
const USERS_KEY = 'ayurguide_users';
const AUDIT_KEY = 'ayurguide_audit_logs';
const BOTANICALS_KEY = 'ayurguide_botanicals_cache';
const SUPABASE_KEY = 'ayurguide_supabase_config';
const ACTIVE_USER_KEY = 'ayurguide_active_user';
const CLEANED_FLAG = 'ayurguide_v3_clean_central_db';

// Automatically purge legacy mock placeholders if present
if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem(CLEANED_FLAG) !== 'true') {
      localStorage.removeItem(PRODUCTS_KEY);
      localStorage.removeItem(USERS_KEY);
      localStorage.removeItem(AUDIT_KEY);
      localStorage.setItem(CLEANED_FLAG, 'true');
    }
  } catch {}
}

export class StorageService {
  static getProducts(): Product[] {
    try {
      const data = localStorage.getItem(PRODUCTS_KEY);
      if (!data) {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(initialProducts));
        return initialProducts;
      }
      return JSON.parse(data);
    } catch {
      return initialProducts;
    }
  }

  static saveProducts(products: Product[]): void {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }

  static getProductById(id: number | string): Product | undefined {
    return this.getProducts().find(p => String(p.id) === String(id));
  }

  static upsertProduct(product: Partial<Product> & { name: string }): Product {
    const products = this.getProducts();
    const categories = this.getCategories();
    const category = categories.find(c => c.id === product.categoryId);

    const now = new Date().toISOString();
    let updatedProduct: Product;

    if (product.id) {
      const index = products.findIndex(p => String(p.id) === String(product.id));
      if (index !== -1) {
        const existing = products[index];
        const { publicSlug, shareQrLink } = ensureProductShareFields({
          ...existing,
          ...product,
          publicSlug: product.publicSlug || existing.publicSlug,
          shareQrLink: product.shareQrLink || existing.shareQrLink,
        });

        updatedProduct = {
          ...existing,
          ...product,
          categoryName: category ? category.name : existing.categoryName,
          publicSlug,
          shareQrLink,
          updatedAt: now
        } as Product;
        products[index] = updatedProduct;
        this.logAudit('MEDICINE_UPDATE', updatedProduct.code || String(updatedProduct.id), `Updated medicine "${updatedProduct.name}" (${updatedProduct.code})`);
      } else {
        const { publicSlug, shareQrLink } = ensureProductShareFields(product);
        updatedProduct = {
          ...product,
          id: product.id,
          code: product.code || `SA-${Math.floor(10000 + Math.random() * 90000)}`,
          categoryName: category ? category.name : 'General',
          packings: product.packings || ['450 ml'],
          ingredients: product.ingredients || [],
          status: product.status || 'Active',
          batchNumber: product.batchNumber || `SIT-2026-${Math.floor(100 + Math.random() * 900)}`,
          featured: !!product.featured,
          publicSlug,
          shareQrLink,
          createdAt: now,
          updatedAt: now
        } as Product;
        products.unshift(updatedProduct);
        this.logAudit('MEDICINE_CREATE', updatedProduct.code, `Added new medicine "${updatedProduct.name}"`);
      }
    } else {
      const newId = Date.now();
      const code = product.code || `SA-${Math.floor(10000 + Math.random() * 90000)}`;
      const { publicSlug, shareQrLink } = ensureProductShareFields({ ...product, code });
      updatedProduct = {
        ...product,
        id: newId,
        code,
        categoryName: category ? category.name : 'General',
        packings: product.packings || ['450 ml'],
        ingredients: product.ingredients || [],
        status: product.status || 'Active',
        batchNumber: product.batchNumber || `SIT-2026-${Math.floor(100 + Math.random() * 900)}`,
        featured: !!product.featured,
        publicSlug,
        shareQrLink,
        createdAt: now,
        updatedAt: now
      } as Product;
      products.unshift(updatedProduct);
      this.logAudit('MEDICINE_CREATE', updatedProduct.code, `Created new medicine "${updatedProduct.name}" (${updatedProduct.code})`);
    }

    this.saveProducts(products);
    return updatedProduct;
  }

  static deleteProduct(id: number | string): boolean {
    const products = this.getProducts();
    const target = products.find(p => String(p.id) === String(id));
    if (!target) return false;

    const filtered = products.filter(p => String(p.id) !== String(id));
    this.saveProducts(filtered);
    this.logAudit('MEDICINE_DELETE', target.code || String(target.id), `Deleted medicine "${target.name}"`);
    return true;
  }

  // Categories
  static getCategories(): Category[] {
    try {
      const data = localStorage.getItem(CATEGORIES_KEY);
      if (!data) {
        return [];
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  static saveCategories(categories: Category[]): void {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }

  static upsertCategory(category: Partial<Category> & { name: string; code?: string }): Category {
    const categories = this.getCategories();
    let updated: Category;
    const catCode = (category.code || category.name.slice(0, 3)).toUpperCase();

    if (category.id) {
      const idx = categories.findIndex(c => c.id === category.id);
      if (idx !== -1) {
        updated = { ...categories[idx], ...category, code: catCode } as Category;
        categories[idx] = updated;
      } else {
        updated = { ...category, id: category.id, code: catCode, sortOrder: categories.length + 1, status: 'Active' } as Category;
        categories.push(updated);
      }
    } else {
      updated = {
        id: Date.now(),
        name: category.name,
        code: catCode,
        description: category.description || '',
        sortOrder: categories.length + 1,
        status: category.status || 'Active'
      };
      categories.push(updated);
    }

    this.saveCategories(categories);
    this.logAudit('CATEGORY_UPDATE', updated.code || updated.name, `Saved category "${updated.name}" (${updated.code})`);
    return updated;
  }

  // Botanical Ingredients Cache
  static getBotanicalIngredients(): BotanicalIngredient[] {
    try {
      const data = localStorage.getItem(BOTANICALS_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  static saveBotanicalIngredients(items: BotanicalIngredient[]): void {
    try {
      localStorage.setItem(BOTANICALS_KEY, JSON.stringify(items));
    } catch {}
  }

  // Users
  static getUsers(): User[] {
    try {
      const data = localStorage.getItem(USERS_KEY);
      if (!data) {
        localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
        return initialUsers;
      }
      return JSON.parse(data);
    } catch {
      return initialUsers;
    }
  }

  static saveUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  static updateUserRole(userId: number | string, newRole: 'ADMIN' | 'PRACTITIONER' | 'PATIENT'): User | undefined {
    const users = this.getUsers();
    const idx = users.findIndex(u => String(u.id) === String(userId));
    if (idx === -1) return undefined;

    const oldRole = users[idx].role;
    users[idx].role = newRole;
    users[idx].roleTitle = newRole === 'ADMIN' ? 'Administrator' : newRole === 'PRACTITIONER' ? 'Ayurvedic Clinical Practitioner' : 'Wellness Seeker';
    this.saveUsers(users);

    this.logAudit('ROLE_CHANGE', String(userId), `Changed role of user ${users[idx].name} (${users[idx].email}) from ${oldRole} to ${newRole}`);
    return users[idx];
  }

  static toggleUserStatus(userId: number | string): User | undefined {
    const users = this.getUsers();
    const idx = users.findIndex(u => String(u.id) === String(userId));
    if (idx === -1) return undefined;

    const newStatus = users[idx].status === 'Active' ? 'Suspended' : 'Active';
    users[idx].status = newStatus;
    this.saveUsers(users);

    this.logAudit('ROLE_CHANGE', String(userId), `Toggled status of user ${users[idx].name} to ${newStatus}`);
    return users[idx];
  }

  static updateUserPassword(userId: number | string, newPassword: string): User | undefined {
    const users = this.getUsers();
    const idx = users.findIndex(u => String(u.id) === String(userId) || (u.email && String(u.email).toLowerCase() === String(userId).toLowerCase()));
    if (idx !== -1) {
      users[idx].password = newPassword;
      this.saveUsers(users);
      const active = this.getActiveUser();
      if (active && (String(active.id) === String(users[idx].id) || active.email === users[idx].email)) {
        active.password = newPassword;
        this.setActiveUser(active);
      }
      return users[idx];
    }
    return undefined;
  }

  // Active / Logged in User Management
  static getActiveUser(): User | null {
    try {
      const data = localStorage.getItem(ACTIVE_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static setActiveUser(user: User | null): void {
    try {
      if (user) {
        localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(ACTIVE_USER_KEY);
      }
    } catch {}
  }

  static getEffectiveUserEmail(customEmail?: string): string {
    if (customEmail && customEmail.trim()) {
      return customEmail.trim();
    }
    const active = this.getActiveUser();
    if (active && active.email && active.email.trim()) {
      return active.email.trim();
    }
    return 'Guest user';
  }

  // Audit Logs
  static getAuditLogs(): AuditLog[] {
    try {
      const data = localStorage.getItem(AUDIT_KEY);
      if (!data) {
        localStorage.setItem(AUDIT_KEY, JSON.stringify(initialAuditLogs));
        return initialAuditLogs;
      }
      return JSON.parse(data);
    } catch {
      return initialAuditLogs;
    }
  }

  static logAudit(
    actionOrParams: string | {
      action: string;
      targetEntity?: string;
      targetId?: string;
      details?: string;
      adminEmail?: string;
      ipAddress?: string;
    },
    legacyEntityId?: string | number,
    legacyDetails?: string,
    legacyUserEmail?: string
  ): void {
    const logs = this.getAuditLogs();
    const now = new Date().toISOString();

    let action = '';
    let targetEntity = 'General';
    let targetId = '';
    let details = '';
    let adminEmail = '';
    let ipAddress = '127.0.0.1';

    if (typeof actionOrParams === 'object') {
      action = actionOrParams.action;
      targetEntity = actionOrParams.targetEntity || 'General';
      targetId = actionOrParams.targetId ? String(actionOrParams.targetId) : '';
      details = actionOrParams.details || '';
      adminEmail = actionOrParams.adminEmail || this.getEffectiveUserEmail();
      ipAddress = actionOrParams.ipAddress || (typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1');
    } else {
      action = actionOrParams;
      targetId = legacyEntityId !== undefined ? String(legacyEntityId) : '';
      details = legacyDetails || '';
      adminEmail = legacyUserEmail || this.getEffectiveUserEmail();
      ipAddress = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
      
      const act = action.toUpperCase();
      if (act.includes('MEDICINE') || act.includes('PRODUCT') || act.includes('STOCK')) targetEntity = 'Product';
      else if (act.includes('CATEGORY')) targetEntity = 'Category';
      else if (act.includes('INGREDIENT') || act.includes('BOTANICAL')) targetEntity = 'BotanicalIngredient';
      else if (act.includes('USER') || act.includes('ROLE')) targetEntity = 'User';
      else if (act.includes('DATABASE') || act.includes('SYNC')) targetEntity = 'System';
    }

    if (!adminEmail || !adminEmail.trim()) {
      adminEmail = 'Guest user';
    }

    const newLog: AuditLog = {
      id: `LOG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      adminEmail,
      action,
      targetEntity,
      targetId,
      details,
      ipAddress,
      createdAt: now,
      // Compatibility aliases
      userEmail: adminEmail,
      actionType: action as any,
      entityId: targetId,
      timestamp: now,
    };

    logs.unshift(newLog);
    if (logs.length > 200) logs.pop();
    localStorage.setItem(AUDIT_KEY, JSON.stringify(logs));
  }

  // Supabase Config
  static getSupabaseConfig(): SupabaseConfig {
    const envUrl = (import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || "").trim();
    const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_KEY || import.meta.env.SUPABASE_KEY || "").trim();

    try {
      const data = localStorage.getItem(SUPABASE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          url: envUrl || parsed.url || "https://ksnsfilauqzxsegpjpdt.supabase.co",
          key: envKey || parsed.key || "",
          connected: !!(envKey || (parsed.key && parsed.key.length > 10)),
          lastSyncTime: parsed.lastSyncTime
        };
      }
    } catch {}

    return {
      url: envUrl || "https://ksnsfilauqzxsegpjpdt.supabase.co",
      key: envKey || "",
      connected: !!(envKey && envKey.length > 10)
    };
  }

  static saveSupabaseConfig(config: SupabaseConfig): void {
    localStorage.setItem(SUPABASE_KEY, JSON.stringify(config));
  }

  // Backup / Export
  static exportFullBackup(): string {
    const data = {
      timestamp: new Date().toISOString(),
      products: this.getProducts(),
      categories: this.getCategories(),
      users: this.getUsers(),
      auditLogs: this.getAuditLogs()
    };
    return JSON.stringify(data, null, 2);
  }

  static importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.products)) this.saveProducts(parsed.products);
      if (Array.isArray(parsed.categories)) this.saveCategories(parsed.categories);
      if (Array.isArray(parsed.users)) this.saveUsers(parsed.users);
      this.logAudit('DATABASE_SYNC', 'BACKUP_RESTORE', 'Restored complete database snapshot from JSON backup');
      return true;
    } catch {
      return false;
    }
  }
}
