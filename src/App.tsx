import React, { useState, useEffect, useCallback } from 'react';
import { StorageService } from './services/storage';
import { SupabaseService } from './services/supabase';
import { Product, Category, User, AuditLog, SupabaseConfig } from './types';
import { Navbar } from './components/layout/Navbar';
import { StatsBar } from './components/layout/StatsBar';
import { CatalogueView } from './components/catalogue/CatalogueView';
import { CategoriesView } from './components/categories/CategoriesView';
import { UsersView } from './components/users/UsersView';
import { AuditView } from './components/audit/AuditView';
import { DatabaseView } from './components/database/DatabaseView';
import { ProductModal } from './components/catalogue/ProductModal';
import { MonographModal } from './components/catalogue/MonographModal';

export const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(StorageService.getSupabaseConfig());
  const [isRealtimeActive, setIsRealtimeActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const [currentTab, setCurrentTab] = useState<string>('catalogue');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [monographProduct, setMonographProduct] = useState<Product | null>(null);

  // Fetch all central data from Supabase
  const loadCentralData = useCallback(async () => {
    try {
      const [fetchedProducts, fetchedCategories, fetchedUsers, fetchedLogs] = await Promise.all([
        SupabaseService.fetchProducts(),
        SupabaseService.fetchCategories(),
        SupabaseService.fetchUsers(),
        SupabaseService.fetchAuditLogs()
      ]);

      setProducts(fetchedProducts);
      setCategories(fetchedCategories);
      setUsers(fetchedUsers);
      setAuditLogs(fetchedLogs);
      setSupabaseConfig(StorageService.getSupabaseConfig());
    } catch (err) {
      console.error('Failed to load central data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load and Realtime Postgres Changes Subscription
  useEffect(() => {
    loadCentralData();

    // Subscribe to live PostgreSQL changes
    const unsubscribe = SupabaseService.subscribeRealtime({
      onProductChange: () => {
        SupabaseService.fetchProducts().then(setProducts);
        SupabaseService.fetchAuditLogs().then(setAuditLogs);
      },
      onCategoryChange: () => {
        SupabaseService.fetchCategories().then(setCategories);
        SupabaseService.fetchAuditLogs().then(setAuditLogs);
      },
      onUserChange: () => {
        SupabaseService.fetchUsers().then(setUsers);
        SupabaseService.fetchAuditLogs().then(setAuditLogs);
      },
      onAuditChange: () => {
        SupabaseService.fetchAuditLogs().then(setAuditLogs);
      },
      onStatusChange: (status) => {
        setIsRealtimeActive(status === 'SUBSCRIBED');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [loadCentralData]);

  // ==========================================
  // PRODUCT CRUD HANDLERS
  // ==========================================
  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (prodData: Partial<Product> & { name: string }) => {
    try {
      if (prodData.id) {
        const updated = await SupabaseService.updateProduct(prodData.id, prodData);
        if (updated) {
          setProducts(prev => prev.map(p => String(p.id) === String(updated.id) ? updated : p));
        }
      } else {
        const created = await SupabaseService.createProduct(prodData);
        setProducts(prev => [created, ...prev.filter(p => p.id !== created.id)]);
      }
      SupabaseService.fetchAuditLogs().then(setAuditLogs);
    } catch (err) {
      console.error('Failed to save product:', err);
    }
  };

  const handleDeleteProduct = async (prod: Product) => {
    if (window.confirm(`Are you sure you want to delete formulation "${prod.name}" (${prod.code})?`)) {
      setProducts(prev => prev.filter(p => String(p.id) !== String(prod.id)));
      await SupabaseService.deleteProduct(prod.id);
      SupabaseService.fetchAuditLogs().then(setAuditLogs);
    }
  };

  // ==========================================
  // CATEGORY CRUD HANDLERS
  // ==========================================
  const handleSaveCategory = async (catData: Partial<Category> & { name: string; code: string }) => {
    try {
      if (catData.id) {
        const updated = await SupabaseService.updateCategory(catData.id, catData);
        setCategories(prev => prev.map(c => String(c.id) === String(updated.id) ? updated : c));
      } else {
        const created = await SupabaseService.createCategory(catData);
        setCategories(prev => [...prev, created]);
      }
      SupabaseService.fetchAuditLogs().then(setAuditLogs);
    } catch (err) {
      console.error('Failed to save category:', err);
    }
  };

  const handleDeleteCategory = async (id: number | string) => {
    setCategories(prev => prev.filter(c => String(c.id) !== String(id)));
    await SupabaseService.deleteCategory(id);
    SupabaseService.fetchAuditLogs().then(setAuditLogs);
  };

  // ==========================================
  // USER / PRACTITIONER CRUD HANDLERS
  // ==========================================
  const handleAddUser = async (userData: { name: string; email: string; role: 'ADMIN' | 'PRACTITIONER' | 'PATIENT'; roleTitle?: string }) => {
    try {
      const created = await SupabaseService.createUser(userData);
      setUsers(prev => [created, ...prev]);
      SupabaseService.fetchAuditLogs().then(setAuditLogs);
    } catch (err) {
      console.error('Failed to add user:', err);
    }
  };

  const handleUpdateUserRole = async (userId: string | number, newRole: 'ADMIN' | 'PRACTITIONER' | 'PATIENT') => {
    setUsers(prev => prev.map(u => String(u.id) === String(userId) ? { ...u, role: newRole } : u));
    await SupabaseService.updateUserRole(userId, newRole);
    SupabaseService.fetchAuditLogs().then(setAuditLogs);
  };

  const handleToggleUserStatus = async (userId: string | number) => {
    setUsers(prev => prev.map(u => {
      if (String(u.id) === String(userId)) {
        return { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' };
      }
      return u;
    }));
    await SupabaseService.toggleUserStatus(userId);
    SupabaseService.fetchAuditLogs().then(setAuditLogs);
  };

  const handleDeleteUser = async (userId: string | number) => {
    setUsers(prev => prev.filter(u => String(u.id) !== String(userId)));
    await SupabaseService.deleteUser(userId);
    SupabaseService.fetchAuditLogs().then(setAuditLogs);
  };

  // Config Handler
  const handleSaveSupabaseConfig = (cfg: SupabaseConfig) => {
    StorageService.saveSupabaseConfig(cfg);
    setSupabaseConfig(cfg);
    SupabaseService.resetClient();
    loadCentralData();
  };

  return (
    <div className="min-h-screen bg-[#081C13] text-gray-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Header & Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenNewProduct={handleOpenNewProduct}
        syncStatus={{ 
          connected: supabaseConfig.connected || isRealtimeActive, 
          lastSync: supabaseConfig.lastSyncTime 
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* KPI Stats Bar */}
        <StatsBar
          products={products}
          categories={categories}
          users={users}
        />

        {/* Tab Views */}
        {currentTab === 'catalogue' && (
          <CatalogueView
            products={products}
            categories={categories}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenNewProduct={handleOpenNewProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onViewMonograph={(p) => setMonographProduct(p)}
          />
        )}

        {currentTab === 'categories' && (
          <CategoriesView
            categories={categories}
            products={products}
            onSaveCategory={handleSaveCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {currentTab === 'users' && (
          <UsersView
            users={users}
            onUpdateRole={handleUpdateUserRole}
            onToggleStatus={handleToggleUserStatus}
            onAddUser={handleAddUser}
            onDeleteUser={handleDeleteUser}
          />
        )}

        {currentTab === 'audit' && (
          <AuditView logs={auditLogs} />
        )}

        {currentTab === 'database' && (
          <DatabaseView
            config={supabaseConfig}
            onSaveConfig={handleSaveSupabaseConfig}
            onReloadAllData={loadCentralData}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="no-print border-t border-[#23493C]/60 py-4 bg-[#061810] text-center text-xs text-emerald-400/60">
        <p>AyurGuide Clinical Administration Portal &bull; Central Supabase Database &bull; Realtime CRUD Engine</p>
      </footer>

      {/* Product Add/Edit Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
        categories={categories}
      />

      {/* Monograph Printable Modal */}
      <MonographModal
        product={monographProduct}
        onClose={() => setMonographProduct(null)}
      />

    </div>
  );
};

export default App;
