import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import { Product, Category, User, AuditLog, SupabaseConfig } from './types';
import { Navbar } from './components/layout/Navbar';
import { StatsBar } from './components/layout/StatsBar';
import { CatalogueView } from './components/catalogue/CatalogueView';
import { InventoryView } from './components/inventory/InventoryView';
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

  const [currentTab, setCurrentTab] = useState<string>('catalogue');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLowStockOnly, setIsLowStockOnly] = useState<boolean>(false);

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [monographProduct, setMonographProduct] = useState<Product | null>(null);

  // Initial load
  const loadData = () => {
    setProducts(StorageService.getProducts());
    setCategories(StorageService.getCategories());
    setUsers(StorageService.getUsers());
    setAuditLogs(StorageService.getAuditLogs());
    setSupabaseConfig(StorageService.getSupabaseConfig());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (prodData: Partial<Product> & { name: string }) => {
    StorageService.upsertProduct(prodData);
    loadData();
  };

  const handleDeleteProduct = (prod: Product) => {
    if (window.confirm(`Are you sure you want to delete formulation "${prod.name}" (${prod.code})?`)) {
      StorageService.deleteProduct(prod.id);
      loadData();
    }
  };

  const handleUpdateStock = (id: string | number, delta: number) => {
    StorageService.updateStock(id, delta);
    loadData();
  };

  const handleSaveCategory = (catData: Partial<Category> & { name: string; code: string }) => {
    StorageService.upsertCategory(catData);
    loadData();
  };

  const handleUpdateUserRole = (userId: string | number, newRole: 'ADMIN' | 'PRACTITIONER' | 'PATIENT') => {
    StorageService.updateUserRole(userId, newRole);
    loadData();
  };

  const handleToggleUserStatus = (userId: string | number) => {
    StorageService.toggleUserStatus(userId);
    loadData();
  };

  const handleSaveSupabaseConfig = (cfg: SupabaseConfig) => {
    StorageService.saveSupabaseConfig(cfg);
    setSupabaseConfig(cfg);
  };

  const handleToggleLowStockFilter = () => {
    setIsLowStockOnly(prev => !prev);
    if (currentTab !== 'catalogue') {
      setCurrentTab('catalogue');
    }
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
        syncStatus={{ connected: supabaseConfig.connected, lastSync: supabaseConfig.lastSyncTime }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* KPI Stats Bar */}
        <StatsBar
          products={products}
          categories={categories}
          users={users}
          onFilterLowStock={handleToggleLowStockFilter}
          isLowStockFilterActive={isLowStockOnly}
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
            onUpdateStock={handleUpdateStock}
            onFilterLowStock={handleToggleLowStockFilter}
            isLowStockOnly={isLowStockOnly}
          />
        )}

        {currentTab === 'inventory' && (
          <InventoryView
            products={products}
            onUpdateStock={handleUpdateStock}
            onEditProduct={handleEditProduct}
          />
        )}

        {currentTab === 'categories' && (
          <CategoriesView
            categories={categories}
            products={products}
            onSaveCategory={handleSaveCategory}
          />
        )}

        {currentTab === 'users' && (
          <UsersView
            users={users}
            onUpdateRole={handleUpdateUserRole}
            onToggleStatus={handleToggleUserStatus}
          />
        )}

        {currentTab === 'audit' && (
          <AuditView logs={auditLogs} />
        )}

        {currentTab === 'database' && (
          <DatabaseView
            config={supabaseConfig}
            onSaveConfig={handleSaveSupabaseConfig}
            onReloadAllData={loadData}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="no-print border-t border-[#23493C]/60 py-4 bg-[#061810] text-center text-xs text-emerald-400/60">
        <p>AyurGuide Clinical Administration Portal &bull; Sitaram Classical Apothecary &bull; ISO / GMP Standard Dispensary Engine</p>
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
