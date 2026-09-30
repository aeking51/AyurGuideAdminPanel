import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { Product, Category, User, AuditLog, BotanicalIngredient } from '../types';
import { StorageService } from './storage';
import { initialCategories } from '../data/initialData';

let supabaseInstance: SupabaseClient | null = null;
let realtimeChannel: RealtimeChannel | null = null;

// ====================================================================
// 1. PRODUCTS MAPPERS (Matches public.products)
// ====================================================================
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
    categoryName: row.category_name || '',
    classicalReference: row.classical_reference || '',
    packings: parseJson(row.packings, ['450 ml']),
    ingredients: parseJson(row.ingredients, []),
    usage: row.dosage || row.usage || '',
    dosage: row.dosage || row.usage || '',
    indications: row.indications || '',
    description: row.description || '',
    imageUrl: row.image_url || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600',
    status: (row.status === 'Active' || row.status === 'Inactive' || row.status === 'Draft') ? row.status : 'Active',
    featured: Boolean(row.featured),
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export function mapProductToRow(prod: Partial<Product>): Record<string, any> {
  const row: Record<string, any> = {};

  if (prod.code) row.code = prod.code;
  if (prod.name) row.name = prod.name;
  if (prod.categoryName !== undefined) row.category_name = prod.categoryName || null;
  if (prod.classicalReference !== undefined) row.classical_reference = prod.classicalReference;
  if (prod.packings !== undefined) row.packings = prod.packings;
  if (prod.ingredients !== undefined) row.ingredients = prod.ingredients;
  if (prod.usage !== undefined || prod.dosage !== undefined) {
    row.dosage = prod.dosage || prod.usage || '';
  }
  if (prod.indications !== undefined) row.indications = prod.indications;
  if (prod.description !== undefined) row.description = prod.description;
  if (prod.imageUrl !== undefined) row.image_url = prod.imageUrl;
  if (prod.status !== undefined) row.status = prod.status;
  if (prod.featured !== undefined) row.featured = Boolean(prod.featured);
  row.updated_at = new Date().toISOString();

  return row;
}

// ====================================================================
// 2. CATEGORIES MAPPERS (Matches public.categories)
// ====================================================================
export function mapRowToCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    code: row.code || '',
    title: row.title || '',
    description: row.description || '',
    icon: row.icon || 'leaf',
    status: 'Active',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export function mapCategoryToRow(cat: Partial<Category>): Record<string, any> {
  const row: Record<string, any> = {};
  if (cat.name) row.name = cat.name;
  if (cat.code !== undefined) row.code = cat.code;
  if (cat.title !== undefined) row.title = cat.title;
  if (cat.description !== undefined) row.description = cat.description;
  if (cat.icon !== undefined) row.icon = cat.icon;
  row.updated_at = new Date().toISOString();
  return row;
}

// ====================================================================
// 3. INGREDIENTS MAPPERS (Matches public.ingredients)
// ====================================================================
export function mapRowToBotanicalIngredient(row: any): BotanicalIngredient {
  return {
    id: row.id,
    name: row.name,
    botanicalName: row.botanical_name || '',
    sanskritName: row.sanskrit_name || '',
    therapeuticAction: row.therapeutic_action || '',
    partUsed: row.part_used || '',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function mapBotanicalIngredientToRow(item: Partial<BotanicalIngredient>): Record<string, any> {
  const row: Record<string, any> = {};
  if (item.name) row.name = item.name;
  if (item.botanicalName !== undefined) row.botanical_name = item.botanicalName;
  if (item.sanskritName !== undefined) row.sanskrit_name = item.sanskritName;
  if (item.therapeuticAction !== undefined) row.therapeutic_action = item.therapeuticAction;
  if (item.partUsed !== undefined) row.part_used = item.partUsed;
  return row;
}

// ====================================================================
// 4. PROFILES MAPPERS (Matches public.profiles)
// ====================================================================
export function mapRowToUser(row: any): User {
  return {
    id: row.id,
    username: row.email?.split('@')[0],
    name: row.name || 'Clinical Practitioner',
    email: row.email || '',
    role: (row.role === 'ADMIN' || row.role === 'PRACTITIONER' || row.role === 'PATIENT') ? row.role : 'PRACTITIONER',
    roleTitle: row.role_title || (row.role === 'ADMIN' ? 'Clinical Director' : 'Consulting Physician'),
    status: (row.status === 'Active' || row.status === 'Pending' || row.status === 'Suspended') ? row.status : 'Active',
    avatar: row.avatar_url || '',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

// ====================================================================
// 5. AUDIT LOGS MAPPERS (Matches public.audit_logs)
// ====================================================================
export function mapRowToAuditLog(row: any): AuditLog {
  return {
    id: String(row.id),
    timestamp: row.created_at || new Date().toISOString(),
    userEmail: row.admin_email || 'sys.jerin@gmail.com',
    actionType: (row.action || 'DATABASE_SYNC') as any,
    entityId: row.target_id || '',
    details: row.details || '',
  };
}

// Local cache key for ingredients
const INGREDIENTS_LOCAL_KEY = 'ayurguide_botanicals_cache';

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
  // PRODUCTS CRUD (public.products)
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
      this.logAudit('MEDICINE_CREATE', created.code, `Created medicine "${created.name}" in public.products.`);
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

      this.logAudit('MEDICINE_DELETE', String(id), `Deleted medicine record ID #${id} from public.products.`);
      return true;
    } catch (err) {
      console.error('Error deleting product in Supabase:', err);
      return false;
    }
  }

  // ==========================================
  // CATEGORIES CRUD (public.categories)
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

  static async createCategory(categoryData: Partial<Category> & { name: string }): Promise<Category> {
    const client = this.getClient();
    if (!client) {
      return StorageService.upsertCategory({ ...categoryData, code: categoryData.code || categoryData.name.slice(0, 3).toUpperCase() });
    }

    try {
      const row = mapCategoryToRow(categoryData);
      const { data, error } = await client
        .from('categories')
        .insert([row])
        .select()
        .single();

      if (error) {
        return StorageService.upsertCategory({ ...categoryData, code: categoryData.code || categoryData.name.slice(0, 3).toUpperCase() });
      }

      const created = mapRowToCategory(data);
      StorageService.upsertCategory(created);
      this.logAudit('CATEGORY_UPDATE', created.name, `Created category "${created.name}" in public.categories.`);
      return created;
    } catch {
      return StorageService.upsertCategory({ ...categoryData, code: categoryData.code || categoryData.name.slice(0, 3).toUpperCase() });
    }
  }

  static async updateCategory(id: number | string, categoryData: Partial<Category>): Promise<Category> {
    const client = this.getClient();
    if (!client) {
      return StorageService.upsertCategory({ ...categoryData, id: Number(id), name: categoryData.name || '', code: categoryData.code || '' });
    }

    try {
      const row = mapCategoryToRow(categoryData);
      const { data, error } = await client
        .from('categories')
        .update(row)
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
  // INGREDIENTS CRUD (public.ingredients)
  // ==========================================
  static async fetchBotanicalIngredients(): Promise<BotanicalIngredient[]> {
    const client = this.getClient();
    if (!client) {
      try {
        const local = localStorage.getItem(INGREDIENTS_LOCAL_KEY);
        return local ? JSON.parse(local) : [];
      } catch {
        return [];
      }
    }

    try {
      const { data, error } = await client
        .from('ingredients')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.warn('Supabase fetch ingredients notice:', error.message);
        const local = localStorage.getItem(INGREDIENTS_LOCAL_KEY);
        return local ? JSON.parse(local) : [];
      }

      const mapped = (data || []).map(mapRowToBotanicalIngredient);
      localStorage.setItem(INGREDIENTS_LOCAL_KEY, JSON.stringify(mapped));
      return mapped;
    } catch {
      const local = localStorage.getItem(INGREDIENTS_LOCAL_KEY);
      return local ? JSON.parse(local) : [];
    }
  }

  static async createBotanicalIngredient(item: Partial<BotanicalIngredient> & { name: string }): Promise<BotanicalIngredient> {
    const client = this.getClient();
    const fallback: BotanicalIngredient = {
      id: Date.now(),
      name: item.name,
      botanicalName: item.botanicalName,
      sanskritName: item.sanskritName,
      therapeuticAction: item.therapeuticAction,
      partUsed: item.partUsed,
      createdAt: new Date().toISOString()
    };

    if (!client) {
      const current = await this.fetchBotanicalIngredients();
      current.unshift(fallback);
      localStorage.setItem(INGREDIENTS_LOCAL_KEY, JSON.stringify(current));
      return fallback;
    }

    try {
      const row = mapBotanicalIngredientToRow(item);
      const { data, error } = await client
        .from('ingredients')
        .insert([row])
        .select()
        .single();

      if (error) {
        const current = await this.fetchBotanicalIngredients();
        current.unshift(fallback);
        localStorage.setItem(INGREDIENTS_LOCAL_KEY, JSON.stringify(current));
        return fallback;
      }

      const created = mapRowToBotanicalIngredient(data);
      const current = await this.fetchBotanicalIngredients();
      current.unshift(created);
      localStorage.setItem(INGREDIENTS_LOCAL_KEY, JSON.stringify(current));
      this.logAudit('INGREDIENT_CREATE', created.name, `Added botanical ingredient "${created.name}" to public.ingredients.`);
      return created;
    } catch {
      return fallback;
    }
  }

  static async updateBotanicalIngredient(id: number | string, item: Partial<BotanicalIngredient>): Promise<BotanicalIngredient> {
    const client = this.getClient();
    const current = await this.fetchBotanicalIngredients();
    const idx = current.findIndex(x => String(x.id) === String(id));
    const fallback: BotanicalIngredient = {
      ...(idx !== -1 ? current[idx] : {}),
      ...item,
      id,
      name: item.name || current[idx]?.name || 'Botanical'
    };

    if (!client) {
      if (idx !== -1) current[idx] = fallback;
      localStorage.setItem(INGREDIENTS_LOCAL_KEY, JSON.stringify(current));
      return fallback;
    }

    try {
      const row = mapBotanicalIngredientToRow(item);
      const { data, error } = await client
        .from('ingredients')
        .update(row)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (idx !== -1) current[idx] = fallback;
        localStorage.setItem(INGREDIENTS_LOCAL_KEY, JSON.stringify(current));
        return fallback;
      }

      const updated = mapRowToBotanicalIngredient(data);
      if (idx !== -1) current[idx] = updated;
      localStorage.setItem(INGREDIENTS_LOCAL_KEY, JSON.stringify(current));
      this.logAudit('INGREDIENT_UPDATE', updated.name, `Updated botanical ingredient "${updated.name}".`);
      return updated;
    } catch {
      return fallback;
    }
  }

  static async deleteBotanicalIngredient(id: number | string): Promise<boolean> {
    const current = (await this.fetchBotanicalIngredients()).filter(x => String(x.id) !== String(id));
    localStorage.setItem(INGREDIENTS_LOCAL_KEY, JSON.stringify(current));

    const client = this.getClient();
    if (!client) return true;

    try {
      await client.from('ingredients').delete().eq('id', id);
      this.logAudit('INGREDIENT_DELETE', String(id), `Deleted botanical ingredient ID #${id} from public.ingredients.`);
      return true;
    } catch {
      return false;
    }
  }

  // ==========================================
  // USERS / PRACTITIONERS CRUD (public.profiles)
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
      roleTitle: userData.roleTitle || (userData.role === 'ADMIN' ? 'Clinical Director' : 'Ayurvedic Practitioner'),
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
          role_title: userData.roleTitle || '',
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
      this.logAudit('ROLE_CHANGE', created.email, `Created user profile "${created.name}" in public.profiles.`);
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
  // AUDIT LOGS (public.audit_logs)
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
    onIngredientChange?: () => void;
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
          { event: '*', schema: 'public', table: 'ingredients' },
          (payload) => {
            console.log('Realtime ingredient change:', payload);
            callbacks.onIngredientChange?.();
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

      this.logAudit('DATABASE_SYNC', 'Supabase Cloud', `Synchronized ${products.length} formulations to public.products.`);
      return { success: true, message: `Successfully synchronized ${products.length} medicines to Supabase!`, count: products.length };
    } catch (e: any) {
      return { success: false, message: e.message || 'Sync failed' };
    }
  }
}
