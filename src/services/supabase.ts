import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { Product, Category, User, AuditLog, SupabaseConfig } from '../types';
import { StorageService } from './storage';
import { initialCategories } from '../data/initialData';

let supabaseInstance: SupabaseClient | null = null;
let realtimeChannel: RealtimeChannel | null = null;

// Helper: map Supabase row to Product
export function mapRowToProduct(row: any): Product {
  const parseJson = (val: any, fallback: any[] = []) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try {
        const p = JSON.parse(val);
        return Array.isArray(p) ? p : fallback;
      } catch {
        return fallback;
      }
    }
    return fallback;
  };

  return {
    id: row.id,
    code: row.code || `SA-${row.id}`,
    name: row.name || 'Classical Medicine',
    sanskritName: row.sanskrit_name || row.sanskritName || '',
    categoryId: Number(row.category_id || row.categoryId || 1),
    categoryName: row.category_name || row.categoryName || '',
    classicalReference: row.classical_reference || row.classicalReference || '',
    packings: parseJson(row.packings || row.packings_json, ['450 ml']),
    ingredients: parseJson(row.ingredients || row.ingredients_json, []),
    usage: row.usage || row.dosage || '',
    indications: row.indications || '',
    description: row.description || '',
    primaryBenefit: row.primary_benefit || row.primaryBenefit || '',
    doshaImpact: row.dosha_impact || row.doshaImpact || '',
    targetDoshas: parseJson(row.target_doshas || row.targetDoshas, []),
    healthGoals: parseJson(row.health_goals || row.healthGoals, []),
    imageUrl: row.image_url || row.imageUrl || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600',
    status: (row.status === 'Active' || row.status === 'Inactive' || row.status === 'Draft') ? row.status : 'Active',
    featured: Boolean(row.featured),
    batchNumber: row.batch_number || row.batchNumber || '',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
  };
}

// Helper: map Product to Supabase row
export function mapProductToRow(prod: Partial<Product>): Record<string, any> {
  const row: Record<string, any> = {};

  if (prod.code) row.code = prod.code;
  if (prod.name) row.name = prod.name;
  if (prod.sanskritName !== undefined) row.sanskrit_name = prod.sanskritName;
  if (prod.categoryId !== undefined) row.category_id = prod.categoryId;
  if (prod.categoryName !== undefined) row.category_name = prod.categoryName;
  if (prod.classicalReference !== undefined) row.classical_reference = prod.classicalReference;
  if (prod.packings !== undefined) row.packings = prod.packings;
  if (prod.ingredients !== undefined) row.ingredients = prod.ingredients;
  if (prod.usage !== undefined) {
    row.usage = prod.usage;
    row.dosage = prod.usage;
  }
  if (prod.indications !== undefined) row.indications = prod.indications;
  if (prod.description !== undefined) row.description = prod.description;
  if (prod.primaryBenefit !== undefined) row.primary_benefit = prod.primaryBenefit;
  if (prod.doshaImpact !== undefined) row.dosha_impact = prod.doshaImpact;
  if (prod.targetDoshas !== undefined) row.target_doshas = prod.targetDoshas;
  if (prod.healthGoals !== undefined) row.health_goals = prod.healthGoals;
  if (prod.imageUrl !== undefined) row.image_url = prod.imageUrl;
  if (prod.status !== undefined) row.status = prod.status;
  if (prod.featured !== undefined) row.featured = Boolean(prod.featured);
  if (prod.batchNumber !== undefined) row.batch_number = prod.batchNumber;
  row.updated_at = new Date().toISOString();

  return row;
}

// Helper: map Supabase row to Category
export function mapRowToCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name || 'General Category',
    code: row.code || `CAT-${row.id}`,
    description: row.description || '',
    sortOrder: row.sort_order || row.id || 1,
    status: row.status === 'Inactive' ? 'Inactive' : 'Active',
  };
}

// Helper: map Supabase row to User Profile
export function mapRowToUser(row: any): User {
  return {
    id: row.id,
    username: row.username || row.email?.split('@')[0],
    name: row.name || 'Authorized Practitioner',
    email: row.email || '',
    role: (row.role === 'ADMIN' || row.role === 'PRACTITIONER' || row.role === 'PATIENT') ? row.role : 'PRACTITIONER',
    roleTitle: row.role_title || row.designation || (row.role === 'ADMIN' ? 'Administrator' : 'Consulting Physician'),
    status: (row.status === 'Active' || row.status === 'Pending' || row.status === 'Suspended') ? row.status : 'Active',
    avatar: row.avatar_url || row.avatar || '',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

// Helper: map Supabase row to Audit Log
export function mapRowToAuditLog(row: any): AuditLog {
  return {
    id: String(row.id),
    timestamp: row.created_at || new Date().toISOString(),
    userEmail: row.admin_email || 'admin@ayurguide.org',
    actionType: (row.action || 'DATABASE_SYNC') as any,
    entityId: row.target_id || row.target_entity || '',
    details: row.details || '',
  };
}

export class SupabaseService {
  static getClient(): SupabaseClient | null {
    if (supabaseInstance) return supabaseInstance;

    const config = StorageService.getSupabaseConfig();
    if (config.url && config.key && config.key !== 'test' && config.key.length > 10) {
      try {
        supabaseInstance = createClient(config.url, config.key, {
          auth: { persistSession: false },
          realtime: {
            params: {
              eventsPerSecond: 10,
            },
          },
        });
        return supabaseInstance;
      } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
      }
    }
    return null;
  }

  static isConfigured(): boolean {
    const client = this.getClient();
    return !!client;
  }

  static resetClient(): void {
    if (realtimeChannel) {
      realtimeChannel.unsubscribe();
      realtimeChannel = null;
    }
    supabaseInstance = null;
  }

  static async testConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
    if (!url || !key) {
      return { success: false, message: 'URL and Anon Key are required.' };
    }
    try {
      const tempClient = createClient(url, key, { auth: { persistSession: false } });
      const { error } = await tempClient.from('products').select('id', { count: 'exact', head: true });
      if (error && error.code !== 'PGRST116') {
        return { success: false, message: `Connected with notice: ${error.message}` };
      }
      return { success: true, message: 'Successfully connected to Supabase Central Database!' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Connection failed.' };
    }
  }

  // ==========================================
  // PRODUCTS CRUD
  // ==========================================
  static async fetchProducts(): Promise<Product[]> {
    const client = this.getClient();
    if (!client) {
      return StorageService.getProducts();
    }

    try {
      const { data, error } = await client
        .from('products')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.warn('Supabase fetchProducts warning:', error.message);
        return StorageService.getProducts();
      }

      const mapped = (data || []).map(mapRowToProduct);
      StorageService.saveProducts(mapped);
      return mapped;
    } catch (err) {
      console.error('Error fetching products from Supabase:', err);
      return StorageService.getProducts();
    }
  }

  static async createProduct(productData: Partial<Product> & { name: string }): Promise<Product> {
    const client = this.getClient();
    const code = productData.code || `SA-${Math.floor(10000 + Math.random() * 90000)}`;
    const fullProd = { ...productData, code };

    if (!client) {
      return StorageService.upsertProduct(fullProd);
    }

    try {
      const row = mapProductToRow(fullProd);
      const { data, error } = await client
        .from('products')
        .insert([row])
        .select()
        .single();

      if (error) {
        console.warn('Supabase insert failed, saving locally:', error.message);
        return StorageService.upsertProduct(fullProd);
      }

      const created = mapRowToProduct(data);
      this.logAudit('MEDICINE_CREATE', created.code, `Created medicine "${created.name}" in central database.`);
      StorageService.upsertProduct(created);
      return created;
    } catch (err) {
      console.error('Error creating product in Supabase:', err);
      return StorageService.upsertProduct(fullProd);
    }
  }

  static async updateProduct(id: number | string, productData: Partial<Product>): Promise<Product | null> {
    const client = this.getClient();

    if (!client) {
      return StorageService.upsertProduct({ ...productData, id, name: productData.name || 'Medicine' });
    }

    try {
      const row = mapProductToRow(productData);
      const { data, error } = await client
        .from('products')
        .update(row)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.warn('Supabase update failed, falling back to local:', error.message);
        return StorageService.upsertProduct({ ...productData, id, name: productData.name || 'Medicine' });
      }

      const updated = mapRowToProduct(data);
      this.logAudit('MEDICINE_UPDATE', updated.code, `Updated formulation "${updated.name}" (${updated.code}).`);
      StorageService.upsertProduct(updated);
      return updated;
    } catch (err) {
      console.error('Error updating product in Supabase:', err);
      return StorageService.upsertProduct({ ...productData, id, name: productData.name || 'Medicine' });
    }
  }

  static async deleteProduct(id: number | string): Promise<boolean> {
    const client = this.getClient();
    StorageService.deleteProduct(id);

    if (!client) {
      return true;
    }

    try {
      const { error } = await client
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('Supabase delete failed:', error.message);
        return false;
      }

      this.logAudit('MEDICINE_DELETE', String(id), `Deleted medicine record ID #${id} from central database.`);
      return true;
    } catch (err) {
      console.error('Error deleting product in Supabase:', err);
      return false;
    }
  }

  // ==========================================
  // CATEGORIES CRUD
  // ==========================================
  static async fetchCategories(): Promise<Category[]> {
    const client = this.getClient();
    if (!client) {
      return StorageService.getCategories();
    }

    try {
      const { data, error } = await client
        .from('categories')
        .select('*')
        .order('id', { ascending: true });

      if (error || !data || data.length === 0) {
        return StorageService.getCategories();
      }

      const mapped = data.map(mapRowToCategory);
      StorageService.saveCategories(mapped);
      return mapped;
    } catch {
      return StorageService.getCategories();
    }
  }

  static async createCategory(categoryData: Partial<Category> & { name: string; code: string }): Promise<Category> {
    const client = this.getClient();
    if (!client) {
      return StorageService.upsertCategory(categoryData);
    }

    try {
      const { data, error } = await client
        .from('categories')
        .insert([{
          name: categoryData.name,
          code: categoryData.code,
          description: categoryData.description || '',
          status: categoryData.status || 'Active'
        }])
        .select()
        .single();

      if (error) {
        return StorageService.upsertCategory(categoryData);
      }

      const created = mapRowToCategory(data);
      StorageService.upsertCategory(created);
      this.logAudit('CATEGORY_UPDATE', created.code, `Created category "${created.name}" (${created.code}).`);
      return created;
    } catch {
      return StorageService.upsertCategory(categoryData);
    }
  }

  static async updateCategory(id: number | string, categoryData: Partial<Category>): Promise<Category> {
    const client = this.getClient();
    if (!client) {
      return StorageService.upsertCategory({ ...categoryData, id: Number(id), name: categoryData.name || '', code: categoryData.code || '' });
    }

    try {
      const { data, error } = await client
        .from('categories')
        .update({
          name: categoryData.name,
          code: categoryData.code,
          description: categoryData.description,
          status: categoryData.status
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return StorageService.upsertCategory({ ...categoryData, id: Number(id), name: categoryData.name || '', code: categoryData.code || '' });
      }

      const updated = mapRowToCategory(data);
      StorageService.upsertCategory(updated);
      return updated;
    } catch {
      return StorageService.upsertCategory({ ...categoryData, id: Number(id), name: categoryData.name || '', code: categoryData.code || '' });
    }
  }

  static async deleteCategory(id: number | string): Promise<boolean> {
    const client = this.getClient();
    const cats = StorageService.getCategories().filter(c => String(c.id) !== String(id));
    StorageService.saveCategories(cats);

    if (!client) return true;

    try {
      await client.from('categories').delete().eq('id', id);
      return true;
    } catch {
      return false;
    }
  }

  // ==========================================
  // USERS / PRACTITIONERS CRUD
  // ==========================================
  static async fetchUsers(): Promise<User[]> {
    const client = this.getClient();
    if (!client) {
      return StorageService.getUsers();
    }

    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch profiles warning:', error.message);
        return StorageService.getUsers();
      }

      const mapped = (data || []).map(mapRowToUser);
      StorageService.saveUsers(mapped);
      return mapped;
    } catch {
      return StorageService.getUsers();
    }
  }

  static async createUser(userData: { name: string; email: string; role: 'ADMIN' | 'PRACTITIONER' | 'PATIENT'; roleTitle?: string }): Promise<User> {
    const client = this.getClient();
    const id = `user_${Date.now()}`;
    const newUser: User = {
      id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      roleTitle: userData.roleTitle || (userData.role === 'ADMIN' ? 'System Administrator' : 'Clinical Practitioner'),
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    if (!client) {
      const users = StorageService.getUsers();
      users.unshift(newUser);
      StorageService.saveUsers(users);
      return newUser;
    }

    try {
      const { data, error } = await client
        .from('profiles')
        .insert([{
          id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          designation: userData.roleTitle || '',
          status: 'Active'
        }])
        .select()
        .single();

      if (error) {
        console.warn('Supabase user insert failed, saving locally:', error.message);
        const users = StorageService.getUsers();
        users.unshift(newUser);
        StorageService.saveUsers(users);
        return newUser;
      }

      const created = mapRowToUser(data);
      const users = StorageService.getUsers();
      users.unshift(created);
      StorageService.saveUsers(users);
      this.logAudit('ROLE_CHANGE', created.email, `Created user account "${created.name}" with role ${created.role}.`);
      return created;
    } catch {
      const users = StorageService.getUsers();
      users.unshift(newUser);
      StorageService.saveUsers(users);
      return newUser;
    }
  }

  static async updateUserRole(userId: string | number, role: 'ADMIN' | 'PRACTITIONER' | 'PATIENT'): Promise<void> {
    StorageService.updateUserRole(userId, role);
    const client = this.getClient();
    if (!client) return;

    try {
      await client
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId);

      this.logAudit('ROLE_CHANGE', String(userId), `Updated role to ${role} for user #${userId}.`);
    } catch (e) {
      console.warn('Supabase updateUserRole failed:', e);
    }
  }

  static async toggleUserStatus(userId: string | number): Promise<void> {
    const users = StorageService.getUsers();
    const u = users.find(x => String(x.id) === String(userId));
    const nextStatus = u?.status === 'Active' ? 'Suspended' : 'Active';
    StorageService.toggleUserStatus(userId);

    const client = this.getClient();
    if (!client) return;

    try {
      await client
        .from('profiles')
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', userId);
    } catch (e) {
      console.warn('Supabase toggleUserStatus failed:', e);
    }
  }

  static async deleteUser(userId: string | number): Promise<boolean> {
    const users = StorageService.getUsers().filter(u => String(u.id) !== String(userId));
    StorageService.saveUsers(users);

    const client = this.getClient();
    if (!client) return true;

    try {
      await client.from('profiles').delete().eq('id', userId);
      return true;
    } catch {
      return false;
    }
  }

  // ==========================================
  // AUDIT LOGS
  // ==========================================
  static async fetchAuditLogs(): Promise<AuditLog[]> {
    const client = this.getClient();
    if (!client) {
      return StorageService.getAuditLogs();
    }

    try {
      const { data, error } = await client
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        return StorageService.getAuditLogs();
      }

      const mapped = (data || []).map(mapRowToAuditLog);
      return mapped;
    } catch {
      return StorageService.getAuditLogs();
    }
  }

  static async logAudit(action: string, targetId: string, details: string): Promise<void> {
    StorageService.logAudit(action as any, targetId, details);
    const client = this.getClient();
    if (!client) return;

    try {
      await client.from('audit_logs').insert([{
        admin_email: 'sys.jerin@gmail.com',
        action,
        target_id: targetId,
        details,
      }]);
    } catch (e) {
      console.warn('Supabase logAudit notice:', e);
    }
  }

  // ==========================================
  // REALTIME SUBSCRIPTIONS
  // ==========================================
  static subscribeRealtime(callbacks: {
    onProductChange?: () => void;
    onCategoryChange?: () => void;
    onUserChange?: () => void;
    onAuditChange?: () => void;
    onStatusChange?: (status: 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR') => void;
  }): () => void {
    const client = this.getClient();
    if (!client) {
      callbacks.onStatusChange?.('CLOSED');
      return () => {};
    }

    // Clean up any existing channel
    if (realtimeChannel) {
      realtimeChannel.unsubscribe();
      realtimeChannel = null;
    }

    try {
      const channel = client
        .channel('ayurguide-central-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          (payload) => {
            console.log('Realtime product change:', payload);
            callbacks.onProductChange?.();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'categories' },
          (payload) => {
            console.log('Realtime category change:', payload);
            callbacks.onCategoryChange?.();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          (payload) => {
            console.log('Realtime user profile change:', payload);
            callbacks.onUserChange?.();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'audit_logs' },
          (payload) => {
            console.log('Realtime audit change:', payload);
            callbacks.onAuditChange?.();
          }
        )
        .subscribe((status) => {
          callbacks.onStatusChange?.(status as any);
        });

      realtimeChannel = channel;

      return () => {
        if (realtimeChannel) {
          realtimeChannel.unsubscribe();
          realtimeChannel = null;
        }
      };
    } catch (err) {
      console.error('Error establishing Supabase realtime subscription:', err);
      callbacks.onStatusChange?.('CHANNEL_ERROR');
      return () => {};
    }
  }

  static async syncToCloud(): Promise<{ success: boolean; message: string; count?: number }> {
    const client = this.getClient();
    if (!client) {
      return { success: false, message: 'Supabase is not configured with a valid key. Using offline local storage.' };
    }

    try {
      const products = StorageService.getProducts();
      if (products.length === 0) {
        return { success: true, message: 'Central database is synchronized (0 products).', count: 0 };
      }

      const rows = products.map(mapProductToRow);
      const { error } = await client.from('products').upsert(rows, { onConflict: 'code' });
      if (error) {
        return { success: false, message: `Sync failed: ${error.message}` };
      }

      this.logAudit('DATABASE_SYNC', 'Supabase Cloud', `Synchronized ${products.length} formulations to central cloud database.`);
      return { success: true, message: `Successfully synchronized ${products.length} medicines to Supabase!`, count: products.length };
    } catch (e: any) {
      return { success: false, message: e.message || 'Sync failed' };
    }
  }
}
