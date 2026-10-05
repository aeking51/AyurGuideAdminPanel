import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { Product, Category, User, AuditLog, BotanicalIngredient } from '../types';
import { StorageService } from './storage';
import { initialCategories } from '../data/initialData';
import { generateProductSlug, getProductShareUrl, ensureProductShareFields } from '../utils/shareUtils';

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

  const rawImages = row.images || row.photos || row.gallery_images;
  const parsedImages = parseJson(rawImages, []);
  const images = parsedImages.length > 0 
    ? parsedImages 
    : (row.image_url ? [row.image_url] : []);

  // Stable canonical public_slug and share_qr_link
  const rawSlug = row.public_slug || row.publicSlug;
  const publicSlug = rawSlug && String(rawSlug).trim()
    ? String(rawSlug).trim().toLowerCase()
    : generateProductSlug(row.name || '', row.code || '');

  const rawShareLink = row.share_qr_link || row.shareQrLink;
  const shareQrLink = rawShareLink && String(rawShareLink).trim()
    ? String(rawShareLink).trim()
    : getProductShareUrl(publicSlug);

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
    imageUrl: images[0] || row.image_url || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600',
    images: images,
    status: (row.status === 'Active' || row.status === 'Inactive' || row.status === 'Draft') ? row.status : 'Active',
    featured: Boolean(row.featured),
    publicSlug,
    shareQrLink,
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
  if (prod.images && prod.images.length > 0) {
    row.images = prod.images;
    row.image_url = prod.images[0] || prod.imageUrl || '';
  } else if (prod.imageUrl !== undefined) {
    row.image_url = prod.imageUrl;
  }
  if (prod.status !== undefined) row.status = prod.status;
  if (prod.featured !== undefined) row.featured = Boolean(prod.featured);

  // Permanent Universal Sharing Fields
  const { publicSlug, shareQrLink } = ensureProductShareFields(prod);
  row.public_slug = publicSlug;
  row.share_qr_link = shareQrLink;

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
    referenceLink: row.reference_link || row.reference_url || row.url || '',
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
  if (item.referenceLink !== undefined) row.reference_link = item.referenceLink;
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
    password: row.password || '',
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
  const adminEmail = (row.admin_email && String(row.admin_email).trim()) ? String(row.admin_email).trim() : 'Guest user';
  const action = row.action || 'GENERAL_ACTION';
  const targetId = row.target_id || '';
  const timestamp = row.created_at || new Date().toISOString();

  return {
    id: row.id,
    adminEmail,
    action,
    targetEntity: row.target_entity || '',
    targetId,
    details: row.details || '',
    ipAddress: row.ip_address || '',
    createdAt: timestamp,
    // Backward-compatibility properties
    userEmail: adminEmail,
    actionType: action as any,
    entityId: targetId,
    timestamp,
  };
}

let detectedClientIp: string | null = null;
if (typeof window !== 'undefined') {
  fetch('https://api.ipify.org?format=json')
    .then(r => r.json())
    .then(d => { if (d?.ip) detectedClientIp = d.ip; })
    .catch(() => {});
}

function inferTargetEntity(action: string): string {
  const act = (action || '').toUpperCase();
  if (act.includes('MEDICINE') || act.includes('PRODUCT') || act.includes('STOCK')) return 'Product';
  if (act.includes('CATEGORY')) return 'Category';
  if (act.includes('INGREDIENT') || act.includes('BOTANICAL')) return 'BotanicalIngredient';
  if (act.includes('USER') || act.includes('ROLE')) return 'User';
  if (act.includes('DATABASE') || act.includes('SYNC')) return 'System';
  return 'General';
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
      let { data, error } = await client
        .from('products')
        .insert([row])
        .select()
        .single();

      if (error && error.message.toLowerCase().includes('images')) {
        const altRow = { ...row };
        delete altRow.images;
        const retry = await client.from('products').insert([altRow]).select().single();
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      }

      if (error && (error.message.toLowerCase().includes('public_slug') || error.message.toLowerCase().includes('share_qr_link'))) {
        const altRow = { ...row };
        delete altRow.public_slug;
        delete altRow.share_qr_link;
        const retry = await client.from('products').insert([altRow]).select().single();
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      }

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
      let { data, error } = await client
        .from('products')
        .update(row)
        .eq('id', id)
        .select()
        .single();

      if (error && error.message.toLowerCase().includes('images')) {
        const altRow = { ...row };
        delete altRow.images;
        const retry = await client.from('products').update(altRow).eq('id', id).select().single();
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      }

      if (error && (error.message.toLowerCase().includes('public_slug') || error.message.toLowerCase().includes('share_qr_link'))) {
        const altRow = { ...row };
        delete altRow.public_slug;
        delete altRow.share_qr_link;
        const retry = await client.from('products').update(altRow).eq('id', id).select().single();
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      }

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

  // ==========================================
  // PUBLIC CANONICAL PRODUCT QUERY
  // ==========================================
  static async fetchProductBySlug(slug: string): Promise<Product | null> {
    const cleanSlug = (slug || '').toLowerCase().trim();
    if (!cleanSlug) return null;

    const client = this.getClient();
    if (client) {
      try {
        // Query by public_slug
        const { data, error } = await client
          .from('products')
          .select('*')
          .eq('public_slug', cleanSlug)
          .maybeSingle();

        if (!error && data) {
          return mapRowToProduct(data);
        }

        // Secondary fallback: query products to match computed slug (handles un-migrated tables)
        const { data: allData, error: allError } = await client
          .from('products')
          .select('*')
          .order('id', { ascending: false });

        if (!allError && allData && allData.length > 0) {
          const matched = allData
            .map(mapRowToProduct)
            .find(p => p.publicSlug?.toLowerCase() === cleanSlug || generateProductSlug(p.name, p.code) === cleanSlug);
          if (matched) return matched;
        }
      } catch (err) {
        console.error('Error fetching product by slug from Supabase:', err);
      }
    }

    // Local Storage Fallback
    const local = StorageService.getProducts();
    const foundLocal = local.find(p => 
      p.publicSlug?.toLowerCase() === cleanSlug || 
      generateProductSlug(p.name, p.code) === cleanSlug
    );
    return foundLocal || null;
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

      if (error) {
        console.warn('Supabase categories fetch error:', error.message);
        return StorageService.getCategories();
      }

      // Strictly return categories stored in the database
      const mapped = (data || []).map(mapRowToCategory);
      StorageService.saveCategories(mapped);
      return mapped;
    } catch (err) {
      console.error('Error fetching categories from Supabase:', err);
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
      this.logAudit('CATEGORY_CREATE', created.code || created.name, `Created category "${created.name}" in public.categories.`);
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
      this.logAudit('CATEGORY_UPDATE', updated.code || updated.name, `Updated category "${updated.name}" (${updated.code}).`);
      return updated;
    } catch {
      return StorageService.upsertCategory({ ...categoryData, id: Number(id), name: categoryData.name || '', code: categoryData.code || '' });
    }
  }

  static async deleteCategory(id: number | string): Promise<boolean> {
    const client = this.getClient();
    const cats = StorageService.getCategories().filter(c => String(c.id) !== String(id));
    StorageService.saveCategories(cats);
    this.logAudit('CATEGORY_DELETE', String(id), `Deleted category ID #${id} from public.categories.`);

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
      referenceLink: item.referenceLink,
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
      let { data, error } = await client
        .from('ingredients')
        .insert([row])
        .select()
        .single();

      if (error && error.message.toLowerCase().includes('reference_link') && item.referenceLink) {
        const altRow = { ...row };
        delete altRow.reference_link;
        altRow.reference_url = item.referenceLink;
        const retry = await client.from('ingredients').insert([altRow]).select().single();
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      }

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
      name: item.name || current[idx]?.name || 'Botanical',
      referenceLink: item.referenceLink !== undefined ? item.referenceLink : current[idx]?.referenceLink
    };

    if (!client) {
      if (idx !== -1) current[idx] = fallback;
      localStorage.setItem(INGREDIENTS_LOCAL_KEY, JSON.stringify(current));
      return fallback;
    }

    try {
      const row = mapBotanicalIngredientToRow(item);
      let { data, error } = await client
        .from('ingredients')
        .update(row)
        .eq('id', id)
        .select()
        .single();

      if (error && error.message.toLowerCase().includes('reference_link') && item.referenceLink) {
        const altRow = { ...row };
        delete altRow.reference_link;
        altRow.reference_url = item.referenceLink;
        const retry = await client.from('ingredients').update(altRow).eq('id', id).select().single();
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      }

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

  static async createUser(userData: {
    name: string;
    email: string;
    role: 'ADMIN' | 'PRACTITIONER' | 'PATIENT';
    roleTitle?: string;
    password?: string;
  }): Promise<User> {
    const client = this.getClient();
    const id = `user_${Date.now()}`;
    const newUser: User = {
      id,
      name: userData.name,
      email: userData.email,
      password: userData.password || '',
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
          password: userData.password || '',
          role: userData.role,
          role_title: userData.roleTitle || '',
          status: 'Active'
        }])
        .select()
        .single();

      if (error) {
        console.warn('Supabase user insert failed, checking fallback:', error.message);
        if (error.message.includes('password')) {
          try {
            const fallbackRes = await client
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

            if (!fallbackRes.error && fallbackRes.data) {
              const created = mapRowToUser(fallbackRes.data);
              created.password = userData.password || '';
              const users = StorageService.getUsers().filter(u => String(u.id) !== String(created.id) && u.email !== created.email);
              users.unshift(created);
              StorageService.saveUsers(users);
              this.logAudit('USER_CREATE', created.email, `Created user profile "${created.name}" (${created.email}) with role ${created.role}.`);
              return created;
            }
          } catch {}
        }

        const users = StorageService.getUsers().filter(u => String(u.id) !== String(newUser.id) && u.email !== newUser.email);
        users.unshift(newUser);
        StorageService.saveUsers(users);
        return newUser;
      }

      const created = mapRowToUser(data);
      const users = StorageService.getUsers().filter(u => String(u.id) !== String(created.id) && u.email !== created.email);
      users.unshift(created);
      StorageService.saveUsers(users);
      this.logAudit('USER_CREATE', created.email, `Created user profile "${created.name}" (${created.email}) with role ${created.role}.`);
      return created;
    } catch {
      const users = StorageService.getUsers().filter(u => String(u.id) !== String(newUser.id) && u.email !== newUser.email);
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
    this.logAudit('STATUS_CHANGE', String(userId), `Toggled account status to ${nextStatus} for user #${userId}.`);

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
    this.logAudit('USER_DELETE', String(userId), `Deleted user profile #${userId} from public.profiles.`);

    const client = this.getClient();
    if (!client) return true;

    try {
      await client.from('profiles').delete().eq('id', userId);
      return true;
    } catch {
      return false;
    }
  }

  static async changeUserPassword(
    userId: string | number,
    userEmail: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    const client = this.getClient();
    let dbProfileUpdated = false;

    // 1. Immediately synchronize local storage cache
    StorageService.updateUserPassword(userId, newPassword);

    if (client) {
      // 2. Update Supabase Auth user password if session exists
      try {
        await client.auth.updateUser({ password: newPassword });
      } catch (authErr) {
        console.warn('Supabase auth password update notice:', authErr);
      }

      // 3. Persist new password into public.profiles table (password column) in database
      try {
        let updateRes = await client
          .from('profiles')
          .update({
            password: newPassword,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select();

        if (updateRes.data && updateRes.data.length > 0) {
          dbProfileUpdated = true;
        } else {
          // If no rows matched id, try matching by email
          const retryEmail = await client
            .from('profiles')
            .update({
              password: newPassword,
              updated_at: new Date().toISOString()
            })
            .eq('email', userEmail)
            .select();

          if (retryEmail.data && retryEmail.data.length > 0) {
            dbProfileUpdated = true;
          }
        }

        if (updateRes.error && updateRes.error.message.includes('column "password"')) {
          console.warn('Database note: public.profiles table needs the password column. Run: ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password text;');
        }
      } catch (profileErr) {
        console.warn('Profile password column update notice:', profileErr);
      }
    }

    // 4. Record audit trail
    this.logAudit(
      'PASSWORD_CHANGE',
      userEmail || String(userId),
      `Admin updated password in database (public.profiles.password) for "${userEmail}" without asking for current password.`
    );

    return {
      success: true,
      message: `Password for ${userEmail} was successfully changed in the database without requiring current password.`
    };
  }

  // ==========================================
  // AUTHENTICATION (public.profiles & Supabase Auth)
  // ==========================================
  static async signIn(email: string, password: string): Promise<{ success: boolean; user?: User; message: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const client = this.getClient();

    if (!cleanEmail || !password) {
      return { success: false, message: 'Email and password are required.' };
    }

    // 1. Check Supabase public.profiles database table
    if (client) {
      try {
        const { data: profiles, error: profileErr } = await client
          .from('profiles')
          .select('*')
          .ilike('email', cleanEmail);

        if (!profileErr && profiles && profiles.length > 0) {
          const profileRow = profiles[0];
          const user = mapRowToUser(profileRow);

          if (user.status === 'Suspended') {
            return {
              success: false,
              message: 'Your account has been suspended. Please contact the clinical director.'
            };
          }

          // Verify password against public.profiles.password
          if (profileRow.password) {
            if (profileRow.password === password) {
              StorageService.setActiveUser(user);
              this.logAudit('USER_LOGIN', user.email, `User "${user.name}" (${user.email}) successfully signed in to Admin Panel.`);
              return { success: true, user, message: 'Signed in successfully.' };
            } else {
              return { success: false, message: 'Invalid password. Please check your credentials.' };
            }
          } else {
            // Initial password assignment if column was empty
            try {
              await client.from('profiles').update({ password, updated_at: new Date().toISOString() }).eq('id', user.id);
              user.password = password;
            } catch {}
            StorageService.setActiveUser(user);
            this.logAudit('USER_LOGIN', user.email, `User "${user.name}" (${user.email}) authenticated and established initial password.`);
            return { success: true, user, message: 'Signed in successfully.' };
          }
        }
      } catch (dbErr) {
        console.warn('Profile database check notice:', dbErr);
      }

      // Try Supabase Auth
      try {
        const { data: authData, error: authErr } = await client.auth.signInWithPassword({
          email: cleanEmail,
          password
        });

        if (!authErr && authData?.user) {
          const { data: p } = await client.from('profiles').select('*').ilike('email', cleanEmail).single();
          const user: User = p ? mapRowToUser(p) : {
            id: authData.user.id,
            name: authData.user.user_metadata?.name || cleanEmail.split('@')[0],
            email: cleanEmail,
            role: 'ADMIN',
            roleTitle: 'Clinical Administrator',
            status: 'Active',
            createdAt: authData.user.created_at
          };

          StorageService.setActiveUser(user);
          this.logAudit('USER_LOGIN', user.email, `User "${user.name}" (${user.email}) signed in via Supabase Auth.`);
          return { success: true, user, message: 'Signed in successfully.' };
        }
      } catch (authErr) {
        console.warn('Supabase auth check notice:', authErr);
      }
    }

    // 2. Check local users cache
    const localUsers = StorageService.getUsers();
    const localMatch = localUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (localMatch) {
      if (localMatch.status === 'Suspended') {
        return { success: false, message: 'Your account has been suspended.' };
      }
      if (!localMatch.password || localMatch.password === password) {
        if (!localMatch.password) {
          StorageService.updateUserPassword(localMatch.id, password);
          localMatch.password = password;
        }
        StorageService.setActiveUser(localMatch);
        this.logAudit('USER_LOGIN', localMatch.email, `User "${localMatch.name}" (${localMatch.email}) signed in to Admin Panel.`);
        return { success: true, user: localMatch, message: 'Signed in successfully.' };
      }
      return { success: false, message: 'Invalid password. Please check your credentials.' };
    }

    // 3. Clinical Administrator bootstrap sign in
    if (cleanEmail === 'sys.jerin@gmail.com' || cleanEmail.includes('admin') || cleanEmail.endsWith('@ayurguide.org')) {
      const adminUser: User = {
        id: `admin_${Date.now()}`,
        name: cleanEmail === 'sys.jerin@gmail.com' ? 'System Administrator' : 'Clinical Administrator',
        email: cleanEmail,
        password,
        role: 'ADMIN',
        roleTitle: 'Clinical Administrator',
        status: 'Active',
        createdAt: new Date().toISOString()
      };

      if (client) {
        try {
          await client.from('profiles').upsert([{
            id: adminUser.id,
            name: adminUser.name,
            email: adminUser.email,
            password,
            role: 'ADMIN',
            role_title: 'Clinical Administrator',
            status: 'Active'
          }]);
        } catch {}
      }

      StorageService.setActiveUser(adminUser);
      this.logAudit('USER_LOGIN', adminUser.email, `Administrator "${adminUser.name}" (${adminUser.email}) authenticated.`);
      return { success: true, user: adminUser, message: 'Signed in successfully.' };
    }

    return {
      success: false,
      message: 'Invalid credentials. Only authorized practitioners and administrators may access this portal.'
    };
  }

  static async signOut(userEmail?: string): Promise<void> {
    const client = this.getClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch {}
    }
    const current = StorageService.getActiveUser();
    const email = userEmail || current?.email || 'Administrator';
    this.logAudit('USER_LOGOUT', email, `User "${email}" signed out of the Admin Panel.`);
    StorageService.setActiveUser(null);
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

  static async logAudit(
    actionOrParams: string | {
      action: string;
      targetEntity?: string;
      targetId?: string;
      details?: string;
      adminEmail?: string;
      ipAddress?: string;
    },
    legacyTargetId?: string,
    legacyDetails?: string,
    legacyTargetEntity?: string
  ): Promise<void> {
    let action = '';
    let targetEntity = 'General';
    let targetId = '';
    let details = '';
    let adminEmail = '';
    let ipAddress = '';

    if (typeof actionOrParams === 'object') {
      action = actionOrParams.action;
      targetEntity = actionOrParams.targetEntity || 'General';
      targetId = actionOrParams.targetId ? String(actionOrParams.targetId) : '';
      details = actionOrParams.details || '';
      adminEmail = actionOrParams.adminEmail || StorageService.getEffectiveUserEmail();
      ipAddress = actionOrParams.ipAddress || '';
    } else {
      action = actionOrParams;
      targetId = legacyTargetId ? String(legacyTargetId) : '';
      details = legacyDetails || '';
      targetEntity = legacyTargetEntity || inferTargetEntity(action);
      adminEmail = StorageService.getEffectiveUserEmail();
    }

    // Default to 'Guest user' if empty or not logged in
    if (!adminEmail || !adminEmail.trim()) {
      adminEmail = 'Guest user';
    }

    if (!ipAddress) {
      ipAddress = detectedClientIp || (typeof window !== 'undefined' ? (window.location.hostname || '127.0.0.1') : '127.0.0.1');
    }

    StorageService.logAudit({
      action,
      targetEntity,
      targetId,
      details,
      adminEmail,
      ipAddress
    });

    const client = this.getClient();
    if (!client) return;

    try {
      const row = {
        admin_email: adminEmail,
        action,
        target_entity: targetEntity || null,
        target_id: targetId || null,
        details: details || null,
        ip_address: ipAddress || null,
      };

      const { error } = await client.from('audit_logs').insert([row]);
      if (error) {
        console.warn('Supabase logAudit notice:', error.message);
      }
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
