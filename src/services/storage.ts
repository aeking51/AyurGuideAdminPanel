import { Product, Category, User, AuditLog, SupabaseConfig } from '../types';
import { initialProducts, initialCategories, initialUsers, initialAuditLogs } from '../data/initialData';

const PRODUCTS_KEY = 'ayurguide_products';
const CATEGORIES_KEY = 'ayurguide_categories';
const USERS_KEY = 'ayurguide_users';
const AUDIT_KEY = 'ayurguide_audit_logs';
const SUPABASE_KEY = 'ayurguide_supabase_config';

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
        updatedProduct = {
          ...products[index],
          ...product,
          categoryName: category ? category.name : products[index].categoryName,
          updatedAt: now
        } as Product;
        products[index] = updatedProduct;
        this.logAudit('MEDICINE_UPDATE', updatedProduct.code || updatedProduct.id, `Updated medicine "${updatedProduct.name}" (${updatedProduct.code})`);
      } else {
        updatedProduct = {
          ...product,
          id: product.id,
          code: product.code || `SA-${Math.floor(10000 + Math.random() * 90000)}`,
          categoryName: category ? category.name : 'General',
          packings: product.packings || ['450 ml'],
          ingredients: product.ingredients || [],
          status: product.status || 'Active',
          stockUnits: product.stockUnits || 50,
          batchNumber: product.batchNumber || `SIT-2026-${Math.floor(100 + Math.random() * 900)}`,
          featured: !!product.featured,
          createdAt: now,
          updatedAt: now
        } as Product;
        products.unshift(updatedProduct);
        this.logAudit('MEDICINE_CREATE', updatedProduct.code, `Added new medicine "${updatedProduct.name}"`);
      }
    } else {
      const newId = Date.now();
      updatedProduct = {
        ...product,
        id: newId,
        code: product.code || `SA-${Math.floor(10000 + Math.random() * 90000)}`,
        categoryName: category ? category.name : 'General',
        packings: product.packings || ['450 ml'],
        ingredients: product.ingredients || [],
        status: product.status || 'Active',
        stockUnits: product.stockUnits || 50,
        batchNumber: product.batchNumber || `SIT-2026-${Math.floor(100 + Math.random() * 900)}`,
        featured: !!product.featured,
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
    this.logAudit('MEDICINE_DELETE', target.code || target.id, `Deleted medicine "${target.name}"`);
    return true;
  }

  static updateStock(id: number | string, delta: number): Product | undefined {
    const products = this.getProducts();
    const index = products.findIndex(p => String(p.id) === String(id));
    if (index === -1) return undefined;

    const currentStock = products[index].stockUnits || 0;
    const newStock = Math.max(0, currentStock + delta);
    products[index].stockUnits = newStock;
    products[index].updatedAt = new Date().toISOString();
    this.saveProducts(products);

    this.logAudit('STOCK_UPDATE', products[index].code, `Adjusted stock for ${products[index].name} (${delta > 0 ? '+' : ''}${delta}). New stock: ${newStock} units.`);
    return products[index];
  }

  // Categories
  static getCategories(): Category[] {
    try {
      const data = localStorage.getItem(CATEGORIES_KEY);
      if (!data) {
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(initialCategories));
        return initialCategories;
      }
      return JSON.parse(data);
    } catch {
      return initialCategories;
    }
  }

  static saveCategories(categories: Category[]): void {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }

  static upsertCategory(category: Partial<Category> & { name: string; code: string }): Category {
    const categories = this.getCategories();
    let updated: Category;

    if (category.id) {
      const idx = categories.findIndex(c => c.id === category.id);
      if (idx !== -1) {
        updated = { ...categories[idx], ...category } as Category;
        categories[idx] = updated;
      } else {
        updated = { ...category, id: category.id, sortOrder: categories.length + 1, status: 'Active' } as Category;
        categories.push(updated);
      }
    } else {
      updated = {
        id: Date.now(),
        name: category.name,
        code: category.code.toUpperCase(),
        description: category.description || '',
        sortOrder: categories.length + 1,
        status: category.status || 'Active'
      };
      categories.push(updated);
    }

    this.saveCategories(categories);
    this.logAudit('CATEGORY_UPDATE', updated.code, `Saved category "${updated.name}" (${updated.code})`);
    return updated;
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

    this.logAudit('ROLE_CHANGE', userId, `Changed role of user ${users[idx].name} (${users[idx].email}) from ${oldRole} to ${newRole}`);
    return users[idx];
  }

  static toggleUserStatus(userId: number | string): User | undefined {
    const users = this.getUsers();
    const idx = users.findIndex(u => String(u.id) === String(userId));
    if (idx === -1) return undefined;

    users[idx].status = users[idx].status === 'Active' ? 'Suspended' : 'Active';
    this.saveUsers(users);
    this.logAudit('ROLE_CHANGE', userId, `Set user ${users[idx].name} status to ${users[idx].status}`);
    return users[idx];
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

  static logAudit(actionType: AuditLog['actionType'], entityId: string | number, details: string): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userEmail: 'sys.jerin@gmail.com',
      actionType,
      entityId,
      details
    };
    logs.unshift(newLog);
    // keep max 200 logs
    if (logs.length > 200) logs.pop();
    localStorage.setItem(AUDIT_KEY, JSON.stringify(logs));
  }

  // Supabase Config
  static getSupabaseConfig(): SupabaseConfig {
    try {
      const data = localStorage.getItem(SUPABASE_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    return {
      url: "https://ksnsfilauqzxsegpjpdt.supabase.co",
      key: "",
      connected: false
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
