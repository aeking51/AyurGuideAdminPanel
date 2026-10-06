import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { StorageService } from './services/storage';
import { SupabaseService } from './services/supabase';
import { Product, Category, User, AuditLog, SupabaseConfig, BotanicalIngredient } from './types';
import { Navbar } from './components/layout/Navbar';
import { StatsBar } from './components/layout/StatsBar';
import { CatalogueView } from './components/catalogue/CatalogueView';
import { DeleteConfirmModal } from './components/common/DeleteConfirmModal';
import { LoginView } from './components/auth/LoginView';
import { PublicProductPage } from './components/public/PublicProductPage';
import { ProductQRModal } from './components/common/ProductQRModal';

// Code-split secondary views & modals for faster initial load
const IngredientsView = lazy(() => import('./components/ingredients/IngredientsView').then(m => ({ default: m.IngredientsView })));
const CategoriesView = lazy(() => import('./components/categories/CategoriesView').then(m => ({ default: m.CategoriesView })));
const UsersView = lazy(() => import('./components/users/UsersView').then(m => ({ default: m.UsersView })));
const AuditView = lazy(() => import('./components/audit/AuditView').then(m => ({ default: m.AuditView })));
const DatabaseView = lazy(() => import('./components/database/DatabaseView').then(m => ({ default: m.DatabaseView })));
const ProductModal = lazy(() => import('./components/catalogue/ProductModal').then(m => ({ default: m.ProductModal })));
const MonographModal = lazy(() => import('./components/catalogue/MonographModal').then(m => ({ default: m.MonographModal })));
const ChangePasswordModal = lazy(() => import('./components/common/ChangePasswordModal').then(m => ({ default: m.ChangePasswordModal })));

const TabSuspenseFallback: React.FC = () => (
  <div className="bg-[#0D281C]/60 rounded-2xl border border-[#23493C] p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
    <div className="w-7 h-7 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mb-3" />
    <span className="text-xs font-mono text-emerald-300">Loading module...</span>
  </div>
);

/**
 * Extracts the product public_slug from the current browser URL.
 * Supports /product/:slug and hash fallback #/product/:slug.
 */
function getPublicProductSlugFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Direct path /product/{slug}
  const pathname = window.location.pathname;
  const matchPath = pathname.match(/^\/product\/([^/?#]+)/i);
  if (matchPath && matchPath[1]) {
    return decodeURIComponent(matchPath[1]);
  }

  // 2. Hash fallback #/product/{slug}
  const hash = window.location.hash;
  const matchHash = hash.match(/^#\/?product\/([^/?#]+)/i);
  if (matchHash && matchHash[1]) {
    return decodeURIComponent(matchHash[1]);
  }

  return null;
}

export const App: React.FC = () => {
  // Public Route State: Accessible without login
  const [publicProductSlug, setPublicProductSlug] = useState<string | null>(() => getPublicProductSlugFromUrl());

  // Cache-first instant hydration (zero initial delay)
  const [products, setProducts] = useState<Product[]>(() => StorageService.getProducts());
  const [categories, setCategories] = useState<Category[]>(() => StorageService.getCategories());
  const [botanicalIngredients, setBotanicalIngredients] = useState<BotanicalIngredient[]>(() => StorageService.getBotanicalIngredients());
  const [users, setUsers] = useState<User[]>(() => StorageService.getUsers());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => StorageService.getAuditLogs());
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => StorageService.getSupabaseConfig());
  const [activeUser, setActiveUser] = useState<User | null>(() => StorageService.getActiveUser());
  const [isRealtimeActive, setIsRealtimeActive] = useState<boolean>(false);
  const [, setLoading] = useState<boolean>(false);

  const [currentTab, setCurrentTab] = useState<string>('catalogue');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [monographProduct, setMonographProduct] = useState<Product | null>(null);
  const [sharingProduct, setSharingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState<User | null>(null);

  // Listen to popstate and hashchange to support browser back/forward and link navigation
  useEffect(() => {
    const handleLocationChange = () => {
      setPublicProductSlug(getPublicProductSlugFromUrl());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const handleOpenChangePassword = (user?: User | null) => {
    setPasswordTargetUser(user || activeUser);
    setIsPasswordModalOpen(true);
  };

  // Fetch all central data from Supabase progressively without blocking
  const loadCentralData = useCallback(async () => {
    try {
      // Fire requests in parallel; update each state immediately as soon as each returns
      SupabaseService.fetchProducts().then(setProducts).catch(() => {});
      SupabaseService.fetchCategories().then(setCategories).catch(() => {});
      SupabaseService.fetchBotanicalIngredients().then(setBotanicalIngredients).catch(() => {});
      SupabaseService.fetchUsers().then(setUsers).catch(() => {});
      SupabaseService.fetchAuditLogs().then(setAuditLogs).catch(() => {});
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
      onIngredientChange: () => {
        SupabaseService.fetchBotanicalIngredients().then(setBotanicalIngredients);
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

  const handleDeleteProduct = (prod: Product) => {
    setDeletingProduct(prod);
  };

  const confirmDeleteProduct = async () => {
    if (!deletingProduct) return;
    const target = deletingProduct;
    setDeletingProduct(null);
    setProducts(prev => prev.filter(p => String(p.id) !== String(target.id)));
    await SupabaseService.deleteProduct(target.id);
    SupabaseService.fetchAuditLogs().then(setAuditLogs);
  };

  // ==========================================
  // BOTANICAL INGREDIENTS CRUD HANDLERS
  // ==========================================
  const handleSaveIngredient = async (item: Partial<BotanicalIngredient> & { name: string }) => {
    try {
      const isExistingDbId = item.id && !String(item.id).startsWith('derived-');
      if (isExistingDbId) {
        const updated = await SupabaseService.updateBotanicalIngredient(item.id!, item);
        setBotanicalIngredients(prev => prev.map(x => String(x.id) === String(updated.id) ? updated : x));
      } else {
        const cleanPayload = { ...item };
        delete cleanPayload.id;
        const created = await SupabaseService.createBotanicalIngredient(cleanPayload);
        setBotanicalIngredients(prev => [created, ...prev]);
      }
      SupabaseService.fetchAuditLogs().then(setAuditLogs);
    } catch (err) {
      console.error('Failed to save botanical ingredient:', err);
    }
  };

  const handleDeleteIngredient = async (id: number | string) => {
    setBotanicalIngredients(prev => prev.filter(x => String(x.id) !== String(id)));
    await SupabaseService.deleteBotanicalIngredient(id);
    SupabaseService.fetchAuditLogs().then(setAuditLogs);
  };

  // ==========================================
  // CATEGORY CRUD HANDLERS
  // ==========================================
  const handleSaveCategory = async (catData: Partial<Category> & { name: string; code?: string; title?: string; description?: string; icon?: string }) => {
    try {
      if (catData.id) {
        const oldCat = categories.find(c => String(c.id) === String(catData.id));
        const updated = await SupabaseService.updateCategory(catData.id, catData);
        setCategories(prev => prev.map(c => String(c.id) === String(updated.id) ? updated : c));
        if (oldCat && oldCat.name !== updated.name) {
          setProducts(prev => prev.map(p => 
            p.categoryName === oldCat.name ? { ...p, categoryName: updated.name } : p
          ));
        }
      } else {
        const created = await SupabaseService.createCategory({ ...catData, name: catData.name });
        setCategories(prev => [...prev, created]);
      }
      SupabaseService.fetchAuditLogs().then(setAuditLogs);
    } catch (err) {
      console.error('Failed to save category:', err);
    }
  };

  const handleDeleteCategory = async (id: number | string) => {
    const target = categories.find(c => String(c.id) === String(id));
    setCategories(prev => prev.filter(c => String(c.id) !== String(id)));
    if (target) {
      setProducts(prev => prev.map(p => 
        p.categoryName === target.name ? { ...p, categoryName: undefined } : p
      ));
    }
    await SupabaseService.deleteCategory(id);
    SupabaseService.fetchAuditLogs().then(setAuditLogs);
  };

  // ==========================================
  // USER / PRACTITIONER CRUD HANDLERS
  // ==========================================
  const handleAddUser = async (userData: { name: string; email: string; role: 'ADMIN' | 'PRACTITIONER' | 'PATIENT'; roleTitle?: string; password?: string }) => {
    try {
      const created = await SupabaseService.createUser(userData);
      setUsers(prev => {
        const filtered = prev.filter(u => String(u.id) !== String(created.id) && u.email.toLowerCase() !== created.email.toLowerCase());
        return [created, ...filtered];
      });
      SupabaseService.fetchAuditLogs().then(setAuditLogs);
    } catch (err) {
      console.error('Failed to add user:', err);
      throw err;
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

  // User session login/logout handler
  const handleSelectUser = async (user: User | null) => {
    const prevUser = activeUser;
    setActiveUser(user);
    StorageService.setActiveUser(user);

    if (user) {
      await SupabaseService.logAudit({
        action: 'USER_LOGIN',
        targetEntity: 'User',
        targetId: user.email,
        adminEmail: user.email,
        details: `User "${user.name}" (${user.email}) logged in to clinical session.`
      });
    } else if (prevUser) {
      await SupabaseService.logAudit({
        action: 'USER_LOGOUT',
        targetEntity: 'User',
        targetId: prevUser.email,
        adminEmail: prevUser.email,
        details: `User "${prevUser.name}" logged out. Switched to Guest user.`
      });
    }
    SupabaseService.fetchAuditLogs().then(setAuditLogs);
  };

  const handleSignOut = async () => {
    if (activeUser) {
      await SupabaseService.signOut(activeUser.email);
    } else {
      StorageService.setActiveUser(null);
    }
    setActiveUser(null);
  };

  const handleLoginSuccess = (user: User) => {
    setActiveUser(user);
    loadCentralData();
  };

  // Config Handler
  const handleSaveSupabaseConfig = (cfg: SupabaseConfig) => {
    StorageService.saveSupabaseConfig(cfg);
    setSupabaseConfig(cfg);
    SupabaseService.resetClient();
    loadCentralData();
  };

  // Section-specific Reload Handlers
  const [reloadingSection, setReloadingSection] = useState<string | null>(null);

  const handleReloadProducts = async () => {
    setReloadingSection('catalogue');
    try {
      const prods = await SupabaseService.fetchProducts();
      setProducts(prods);
    } finally {
      setReloadingSection(null);
    }
  };

  const handleReloadBotanicals = async () => {
    setReloadingSection('ingredients');
    try {
      const bots = await SupabaseService.fetchBotanicalIngredients();
      setBotanicalIngredients(bots);
    } finally {
      setReloadingSection(null);
    }
  };

  const handleReloadCategories = async () => {
    setReloadingSection('categories');
    try {
      const cats = await SupabaseService.fetchCategories();
      setCategories(cats);
    } finally {
      setReloadingSection(null);
    }
  };

  const handleReloadUsers = async () => {
    setReloadingSection('users');
    try {
      const u = await SupabaseService.fetchUsers();
      setUsers(u);
    } finally {
      setReloadingSection(null);
    }
  };

  const handleReloadAuditLogs = async () => {
    setReloadingSection('audit');
    try {
      const logs = await SupabaseService.fetchAuditLogs();
      setAuditLogs(logs);
    } finally {
      setReloadingSection(null);
    }
  };

  const handleReloadCurrentTab = async () => {
    if (currentTab === 'catalogue') await handleReloadProducts();
    else if (currentTab === 'ingredients') await handleReloadBotanicals();
    else if (currentTab === 'categories') await handleReloadCategories();
    else if (currentTab === 'users') await handleReloadUsers();
    else if (currentTab === 'audit') await handleReloadAuditLogs();
    else await loadCentralData();
  };

  // Public Canonical Route: /product/:slug (Permits public user access without admin login)
  if (publicProductSlug) {
    return (
      <PublicProductPage
        slug={publicProductSlug}
        onNavigateHome={() => {
          if (typeof window !== 'undefined') {
            window.history.pushState({}, '', '/');
          }
          setPublicProductSlug(null);
        }}
      />
    );
  }

  // Authentication Guard: Require authentication to access the admin panel
  if (!activeUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const isModalActive = Boolean(sharingProduct || monographProduct);

  return (
    <div className="min-h-screen bg-[#081C13] text-gray-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Header & Navigation */}
      <div className={isModalActive ? "no-print" : ""}>
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
          activeUser={activeUser}
          users={users}
          onSelectUser={handleSelectUser}
          onReloadCurrentTab={handleReloadCurrentTab}
          isReloading={reloadingSection !== null}
          onChangePassword={handleOpenChangePassword}
          onSignOut={handleSignOut}
        />
      </div>

      {/* Main Container */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 ${isModalActive ? "no-print" : ""}`}>
        
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
            onShareProduct={(p) => setSharingProduct(p)}
            onReload={handleReloadProducts}
            isReloading={reloadingSection === 'catalogue'}
          />
        )}

        <Suspense fallback={<TabSuspenseFallback />}>
          {currentTab === 'ingredients' && (
            <IngredientsView
              ingredients={botanicalIngredients}
              onSaveIngredient={handleSaveIngredient}
              onDeleteIngredient={handleDeleteIngredient}
              onReload={handleReloadBotanicals}
              isReloading={reloadingSection === 'ingredients'}
            />
          )}

          {currentTab === 'categories' && (
            <CategoriesView
              categories={categories}
              products={products}
              onSaveCategory={handleSaveCategory}
              onDeleteCategory={handleDeleteCategory}
              onReload={handleReloadCategories}
              isReloading={reloadingSection === 'categories'}
            />
          )}

          {currentTab === 'users' && (
            <UsersView
              users={users}
              onUpdateRole={handleUpdateUserRole}
              onToggleStatus={handleToggleUserStatus}
              onAddUser={handleAddUser}
              onDeleteUser={handleDeleteUser}
              onReload={handleReloadUsers}
              isReloading={reloadingSection === 'users'}
              onChangePassword={handleOpenChangePassword}
            />
          )}

          {currentTab === 'audit' && (
            <AuditView 
              logs={auditLogs} 
              onReload={handleReloadAuditLogs}
              isReloading={reloadingSection === 'audit'}
            />
          )}

          {currentTab === 'database' && (
            <DatabaseView
              config={supabaseConfig}
              onSaveConfig={handleSaveSupabaseConfig}
              onReloadAllData={loadCentralData}
            />
          )}
        </Suspense>

      </main>

      {/* Footer */}
      <footer className="no-print border-t border-[#23493C]/60 py-4 bg-[#061810] text-center text-xs text-emerald-400/60">
        <p>AyurGuide Clinical Administration Portal &bull; Central Supabase Database &bull; Realtime CRUD Engine</p>
      </footer>

      {/* Modals with Lazy Loading */}
      <Suspense fallback={null}>
        {isProductModalOpen && (
          <ProductModal
            isOpen={isProductModalOpen}
            onClose={() => setIsProductModalOpen(false)}
            onSave={handleSaveProduct}
            product={editingProduct}
            categories={categories}
            availableIngredients={botanicalIngredients}
          />
        )}

        {monographProduct && (
          <MonographModal
            product={monographProduct}
            onClose={() => setMonographProduct(null)}
          />
        )}

        {isPasswordModalOpen && (
          <ChangePasswordModal
            isOpen={isPasswordModalOpen}
            onClose={() => {
              setIsPasswordModalOpen(false);
              setPasswordTargetUser(null);
            }}
            targetUser={passwordTargetUser || activeUser}
            onPasswordChanged={loadCentralData}
          />
        )}
      </Suspense>

      {/* Product Deletion Confirmation Modal */}
      {deletingProduct && (
        <DeleteConfirmModal
          isOpen={!!deletingProduct}
          onClose={() => setDeletingProduct(null)}
          onConfirm={confirmDeleteProduct}
          title="Delete Formulation"
          itemType="Medicine"
          itemName={deletingProduct.name}
          itemSubtitle={`Code: ${deletingProduct.code} • Category: ${deletingProduct.categoryName || 'General'}`}
          warningMessage="This medicine and its clinical formulation details will be permanently removed from public.products in Supabase."
        />
      )}

      {/* Universal Product QR & Sharing Modal */}
      {sharingProduct && (
        <ProductQRModal
          isOpen={!!sharingProduct}
          product={sharingProduct}
          onClose={() => setSharingProduct(null)}
        />
      )}

    </div>
  );
};

export default App;
