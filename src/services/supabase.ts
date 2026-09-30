import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StorageService } from './storage';

let supabaseInstance: SupabaseClient | null = null;

export class SupabaseService {
  static getClient(): SupabaseClient | null {
    if (supabaseInstance) return supabaseInstance;

    const config = StorageService.getSupabaseConfig();
    if (config.url && config.key && config.key !== 'test' && config.key.length > 10) {
      try {
        supabaseInstance = createClient(config.url, config.key);
        return supabaseInstance;
      } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
      }
    }
    return null;
  }

  static resetClient(): void {
    supabaseInstance = null;
  }

  static async testConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
    if (!url || !key) {
      return { success: false, message: 'URL and Anon / Service Key are required.' };
    }
    try {
      const tempClient = createClient(url, key);
      // Attempt a simple ping to products or health
      const { error } = await tempClient.from('products').select('count', { count: 'exact', head: true });
      if (error && error.code !== 'PGRST116') {
        // Table might not exist or auth failed
        return { success: false, message: `Connected with error: ${error.message}` };
      }
      return { success: true, message: 'Successfully verified connection to Supabase PostgreSQL!' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Connection failed' };
    }
  }

  static async syncToCloud(): Promise<{ success: boolean; message: string; count?: number }> {
    const client = this.getClient();
    if (!client) {
      return { success: false, message: 'Supabase is not configured with a valid key. Using offline local storage.' };
    }

    try {
      const products = StorageService.getProducts();
      // map products to Supabase schema
      const mapped = products.map(p => ({
        code: p.code,
        name: p.name,
        category_id: p.categoryId,
        classical_reference: p.classicalReference,
        packings_json: JSON.stringify(p.packings),
        ingredients_json: JSON.stringify(p.ingredients),
        usage: p.usage,
        indications: p.indications,
        description: p.description,
        image_url: p.imageUrl,
        status: p.status,
        featured: p.featured ? 1 : 0
      }));

      const { error } = await client.from('products').upsert(mapped, { onConflict: 'code' });
      if (error) {
        return { success: false, message: `Sync failed: ${error.message}` };
      }

      StorageService.logAudit('DATABASE_SYNC', 'Supabase Cloud', `Synchronized ${products.length} formulations to cloud database.`);
      return { success: true, message: `Successfully synchronized ${products.length} medicines to Supabase!`, count: products.length };
    } catch (e: any) {
      return { success: false, message: e.message || 'Sync failed' };
    }
  }
}
