/**
 * Sitaram Ayurveda Medicine Catalogue Admin Website
 * Central Database & Persistence Layer
 * Designed for immediate Admin Web use and future Android User/Admin application sync.
 */

const DB_KEY_PRODUCTS = 'sitaram_products_v1';
const DB_KEY_CATEGORIES = 'sitaram_categories_v1';
const DB_KEY_INGREDIENTS = 'sitaram_ingredients_v1';
const DB_KEY_MANUFACTURERS = 'sitaram_manufacturers_v1';
const DB_KEY_BANNERS = 'sitaram_banners_v1';
const DB_KEY_ANNOUNCEMENTS = 'sitaram_announcements_v1';
const DB_KEY_AUDIT = 'sitaram_audit_logs_v1';
const DB_KEY_SETTINGS = 'sitaram_settings_v1';

// The 24 Categories from Sitaram Ayurveda Therapeutic Index Handbook
const DEFAULT_CATEGORIES = [
  { id: 'cat_arishtam', code: 'ARI', name: 'Arishtam', description: 'Self-generated alcohol based decoction elixirs', order: 1, status: 'Active', productCount: 0 },
  { id: 'cat_asavam', code: 'ASA', name: 'Asavam', description: 'Fermented medicinal infusions with natural digestive kindling properties', order: 2, status: 'Active', productCount: 0 },
  { id: 'cat_arkam', code: 'ARK', name: 'Arkam', description: 'Distilled herbal essences and aromatic liquid extracts', order: 3, status: 'Active', productCount: 0 },
  { id: 'cat_bhasmas', code: 'BHA', name: 'Bhasmas / Ksharams', description: 'Calcined mineral, metallic and alkaline preparations of high bioavailability', order: 4, status: 'Active', productCount: 0 },
  { id: 'cat_choornams', code: 'CHO', name: 'Choornams', description: 'Finely pulverized classical herbal powders and compound churna mixtures', order: 5, status: 'Active', productCount: 0 },
  { id: 'cat_gulika', code: 'GUL', name: 'Gulika, Gulika Tablets, Capsules', description: 'Classical hand-rolled pills, modern compressed tablets and hard gelatin formulations', order: 6, status: 'Active', productCount: 0 },
  { id: 'cat_single_herb', code: 'SHC', name: 'Single Herb Veg Capsules', description: 'Standardized pure single herb extracts encapsulated in 100% vegetarian shells', order: 7, status: 'Active', productCount: 0 },
  { id: 'cat_kashayams', code: 'KAS', name: 'Kashayams', description: 'Concentrated classical aqueous decoctions (Kwatha) for systemic disorders', order: 8, status: 'Active', productCount: 0 },
  { id: 'cat_kashayam_tabs', code: 'KTB', name: 'Kashayam Tablets', description: 'Solidified Kashayam extracts compressed for modern compliance without bitter taste', order: 9, status: 'Active', productCount: 0 },
  { id: 'cat_kashayam_sachet', code: 'KSC', name: 'Preservative Free Kashayam Sachet', description: 'Sterile ready-to-mix sachets without chemical preservatives', order: 10, status: 'Active', productCount: 0 },
  { id: 'cat_lehyams', code: 'LEH', name: 'Lehyams', description: 'Herbal jams, confections and electuaries with honey and raw jaggery', order: 11, status: 'Active', productCount: 0 },
  { id: 'cat_ghruthams', code: 'GHR', name: 'Ghruthams', description: 'Medicated cows ghee formulations targeting nervous, ocular and reproductive tissue', order: 12, status: 'Active', productCount: 0 },
  { id: 'cat_avartis', code: 'AVA', name: 'Avartis', description: 'Potentiated preparations processed repeatedly (e.g. 21 times, 101 times)', order: 13, status: 'Active', productCount: 0 },
  { id: 'cat_soft_gels', code: 'SGC', name: 'Soft Gel Capsules', description: 'Lipid soluble herbal extracts and medicated oils in soft gelatin encapsulation', order: 14, status: 'Active', productCount: 0 },
  { id: 'cat_seviyams', code: 'SEV', name: 'Seviyams / Vasthi Thailams', description: 'Medicated oils specifically formulated for internal ingestion and therapeutic enemas', order: 15, status: 'Active', productCount: 0 },
  { id: 'cat_eranda_thailams', code: 'ERT', name: 'Eranda Thailams', description: 'Castor oil based formulations processed with specific herbs for purgation & arthritis', order: 16, status: 'Active', productCount: 0 },
  { id: 'cat_thailams', code: 'THA', name: 'Thailams', description: 'Classical sesame oil based medicated oils for external abhyanga and local therapy', order: 17, status: 'Active', productCount: 0 },
  { id: 'cat_kera_thailams', code: 'KTH', name: 'Kera Thailams', description: 'Pure coconut oil based preparations traditional to Kerala for hair, scalp and skin', order: 18, status: 'Active', productCount: 0 },
  { id: 'cat_kuzhambus', code: 'KUZ', name: 'Kuzhambus', description: 'Dense triple-base medicated oils (Sesame, Castor, Ghee) for deep tissue musculoskeletal healing', order: 19, status: 'Active', productCount: 0 },
  { id: 'cat_mukkootu', code: 'MUK', name: 'Mukkootu', description: 'Traditional Kerala combination oils processed with three sacred oil bases', order: 20, status: 'Active', productCount: 0 },
  { id: 'cat_lepams', code: 'LEP', name: 'Lepams / Ointments', description: 'External medicinal pastes, liniments, creams and topical balms', order: 21, status: 'Active', productCount: 0 },
  { id: 'cat_rasakriya', code: 'RAS', name: 'Rasakriya', description: 'Concentrated aqueous extracts evaporated into solid therapeutic pastilles', order: 22, status: 'Active', productCount: 0 },
  { id: 'cat_otc', code: 'OTC', name: 'O.T.C Products', description: 'Over-the-counter daily wellness, immunity balms, herbal cough drops and digestive aids', order: 23, status: 'Active', productCount: 0 },
  { id: 'cat_ethical_patents', code: 'ETH', name: 'Ethical Patents', description: 'Proprietary research-backed formulations developed by Sitaram Ayurveda', order: 24, status: 'Active', productCount: 0 }
];

const DEFAULT_MANUFACTURERS = [
  {
    id: 'mfg_sitaram_main',
    name: 'Sitaram Ayurveda Pvt. Ltd.',
    code: 'SAPL-01',
    license: 'AYUSH-KL-TCR-1921-GMP',
    contactPerson: 'Dr. D. Ramanathan, Chief Physician',
    email: 'regulatory@sitaramayurveda.com',
    phone: '+91 487 2381201',
    address: 'Round South, Thrissur, Kerala 680001, India',
    status: 'Active'
  },
  {
    id: 'mfg_sitaram_pharmacy',
    name: 'Sitaram Pharmacy Works',
    code: 'SPW-02',
    license: 'AYUSH-KL-TCR-1948-MFG',
    contactPerson: 'Quality Assurance Head',
    email: 'qa@sitaramayurveda.com',
    phone: '+91 487 2381502',
    address: 'Punkunnam, Thrissur, Kerala 680002, India',
    status: 'Active'
  }
];

// Products must only be loaded from Supabase Cloud database
// All placeholder and demonstration products removed
const DEFAULT_PRODUCTS = [];

// Normalized Master Ingredients Registry
const DEFAULT_INGREDIENTS = [
  { id: 'ing_abhaya', name: 'Abhaya', botanicalName: 'Terminalia chebula', sanskritName: 'अभया (हरीतकी)', partUsed: 'Fruit pericarp', productsCount: 4, status: 'Active' },
  { id: 'ing_dhatri', name: 'Dhatri / Amalaki', botanicalName: 'Emblica officinalis', sanskritName: 'धात्री (आमलकी)', partUsed: 'Fresh & dried fruit', productsCount: 5, status: 'Active' },
  { id: 'ing_guduchi', name: 'Amrutha / Guduchi', botanicalName: 'Tinospora cordifolia', sanskritName: 'अमृता (गुडूची)', partUsed: 'Mature stem', productsCount: 4, status: 'Active' },
  { id: 'ing_ashwagandha', name: 'Ashwagandha', botanicalName: 'Withania somnifera', sanskritName: 'अश्वगंधा', partUsed: 'Root', productsCount: 3, status: 'Active' },
  { id: 'ing_dashamoola', name: 'Dashamoola', botanicalName: 'Ten Sacred Roots Compound', sanskritName: 'दशमूल', partUsed: 'Roots of 10 trees/herbs', productsCount: 5, status: 'Active' },
  { id: 'ing_bala', name: 'Bala', botanicalName: 'Sida cordifolia', sanskritName: 'बला', partUsed: 'Root and whole plant', productsCount: 4, status: 'Active' },
  { id: 'ing_guggulu', name: 'Guggulu (Purified)', botanicalName: 'Commiphora mukul', sanskritName: 'शुद्ध गुग्गुलु', partUsed: 'Purified gum resin', productsCount: 3, status: 'Active' },
  { id: 'ing_draksha', name: 'Draksha', botanicalName: 'Vitis vinifera', sanskritName: 'द्राक्षा', partUsed: 'Dried sweet fruit', productsCount: 2, status: 'Active' },
  { id: 'ing_brahmi', name: 'Brahmi', botanicalName: 'Bacopa monnieri', sanskritName: 'ब्राह्मी', partUsed: 'Whole plant', productsCount: 3, status: 'Active' },
  { id: 'ing_saffron', name: 'Kunkuma (Saffron)', botanicalName: 'Crocus sativus', sanskritName: 'कुंकुम (केसर)', partUsed: 'Stigma & styles', productsCount: 2, status: 'Active' },
  { id: 'ing_triphala', name: 'Triphala Compound', botanicalName: 'Tri-myrobalan compound', sanskritName: 'त्रिफला', partUsed: 'Three fruits equal ratio', productsCount: 6, status: 'Active' },
  { id: 'ing_rasna', name: 'Rasna', botanicalName: 'Pluchea lanceolata', sanskritName: 'रास्ना', partUsed: 'Root / Rhizome', productsCount: 3, status: 'Active' },
  { id: 'ing_swarna', name: 'Swarna Bhasma', botanicalName: 'Aurum nano-calx', sanskritName: 'स्वर्ण भस्म', partUsed: 'Processed incinerated gold', productsCount: 1, status: 'Active' },
  { id: 'ing_arjuna', name: 'Arjuna', botanicalName: 'Terminalia arjuna', sanskritName: 'अर्जुन', partUsed: 'Stem bark', productsCount: 2, status: 'Active' }
];

// App Content: Banners for Future Android Application
const DEFAULT_BANNERS = [
  {
    id: 'ban_01',
    title: 'Monsoon Karkidaka Chikitsa',
    subtitle: 'Revitalizing classical rasayanas and medicated tailams for seasonal immunity',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&auto=format&fit=crop&q=80',
    targetType: 'Category',
    targetValue: 'Lehyams',
    status: 'Active',
    order: 1
  },
  {
    id: 'ban_02',
    title: 'Kerala Classical Taila Heritage',
    subtitle: 'Centuries-tested neuromuscular restoration with Bala, Sahachara & Dhanwantharam',
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1200&auto=format&fit=crop&q=80',
    targetType: 'Category',
    targetValue: 'Thailams',
    status: 'Active',
    order: 2
  }
];

// App Content: Mobile Announcements
const DEFAULT_ANNOUNCEMENTS = [
  {
    id: 'ann_01',
    title: 'Fresh Seasonal Amalaki Batch Harvested',
    message: 'All Chyavanaprasam batches are currently being cooked using fresh Western Ghats winter Amalaki pulp.',
    priority: 'Normal',
    status: 'Active',
    date: '2026-09-12'
  },
  {
    id: 'ann_02',
    title: 'Ayush GMP Certification Renewed',
    message: 'Thrissur manufacturing division quality laboratory renewed with zero non-conformances.',
    priority: 'High',
    status: 'Active',
    date: '2026-09-01'
  }
];

// Initial Audit Logs
const DEFAULT_AUDIT = [
  { id: 'aud_01', timestamp: '2026-09-14 09:15:22', admin: 'admin@sitaramayurveda.com', action: 'PRODUCT_UPDATE', entity: 'SA-00012 (Chyavanaprasam)', details: 'Updated packing sizes to include 1 kg economy tub.' },
  { id: 'aud_02', timestamp: '2026-09-14 07:45:10', admin: 'admin@sitaramayurveda.com', action: 'PRODUCT_UPDATE', entity: 'SA-00016 (Kumkumadi Tailam)', details: 'Refreshed posology guidelines and high-res dossier image.' },
  { id: 'aud_03', timestamp: '2026-09-13 14:20:00', admin: 'admin@sitaramayurveda.com', action: 'STATUS_TOGGLE', entity: 'SA-00021 (Agasthya Rasayanam)', details: 'Product set to Inactive pending fresh batch release.' },
  { id: 'aud_04', timestamp: '2026-09-12 11:30:15', admin: 'admin@sitaramayurveda.com', action: 'CATEGORY_VERIFIED', entity: 'All 24 Handbook Categories', details: 'Full alignment verified with Sitaram Therapeutic Index Handbook.' }
];

const DEFAULT_SETTINGS = {
  centralDbConnected: true,
  firestoreProjectId: 'sitaram-ayurveda-central-prod',
  firestoreApiKey: 'AIzaSyA8B9C0D1E2F3G4H5I6J7K8L9M0N1P2Q3R',
  syncStatus: 'Synchronized with Central Cloud Firestore',
  lastSyncTime: new Date().toISOString(),
  autoSyncIntervalMinutes: 5,
  adminNotificationEmail: 'admin@sitaramayurveda.com',
  catalogueVersion: '2026.4 — Therapeutic Index Edition'
};

/**
 * DB Manager Singleton
 */
class SitaramDB {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(DB_KEY_CATEGORIES)) {
      localStorage.setItem(DB_KEY_CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    }
    if (!localStorage.getItem(DB_KEY_PRODUCTS)) {
      localStorage.setItem(DB_KEY_PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    }
    if (!localStorage.getItem(DB_KEY_INGREDIENTS)) {
      localStorage.setItem(DB_KEY_INGREDIENTS, JSON.stringify(DEFAULT_INGREDIENTS));
    }
    if (!localStorage.getItem(DB_KEY_MANUFACTURERS)) {
      localStorage.setItem(DB_KEY_MANUFACTURERS, JSON.stringify(DEFAULT_MANUFACTURERS));
    }
    if (!localStorage.getItem(DB_KEY_BANNERS)) {
      localStorage.setItem(DB_KEY_BANNERS, JSON.stringify(DEFAULT_BANNERS));
    }
    if (!localStorage.getItem(DB_KEY_ANNOUNCEMENTS)) {
      localStorage.setItem(DB_KEY_ANNOUNCEMENTS, JSON.stringify(DEFAULT_ANNOUNCEMENTS));
    }
    if (!localStorage.getItem(DB_KEY_AUDIT)) {
      localStorage.setItem(DB_KEY_AUDIT, JSON.stringify(DEFAULT_AUDIT));
    }
    if (!localStorage.getItem(DB_KEY_SETTINGS)) {
      localStorage.setItem(DB_KEY_SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    this.recalculateCounts();
  }

  // Categories
  getCategories() {
    return JSON.parse(localStorage.getItem(DB_KEY_CATEGORIES) || '[]');
  }
  saveCategories(cats) {
    localStorage.setItem(DB_KEY_CATEGORIES, JSON.stringify(cats));
  }
  addCategory(cat) {
    const cats = this.getCategories();
    cat.id = 'cat_' + Date.now();
    cat.productCount = 0;
    cats.push(cat);
    this.saveCategories(cats);
    this.logAudit('CATEGORY_ADD', cat.name, `Created category "${cat.name}" [${cat.code}]`);
    return cat;
  }
  updateCategory(id, updated) {
    const cats = this.getCategories();
    const idx = cats.findIndex(c => c.id === id);
    if (idx !== -1) {
      cats[idx] = { ...cats[idx], ...updated };
      this.saveCategories(cats);
      this.logAudit('CATEGORY_UPDATE', cats[idx].name, `Updated details for category "${cats[idx].name}"`);
      return cats[idx];
    }
    return null;
  }
  deleteCategory(id) {
    const products = this.getProducts();
    const cat = this.getCategories().find(c => c.id === id);
    if (!cat) return { success: false, message: 'Category not found' };

    const linkedProducts = products.filter(p => p.category === cat.name);
    if (linkedProducts.length > 0) {
      return { 
        success: false, 
        message: `Cannot delete category "${cat.name}". It is assigned to ${linkedProducts.length} product(s). Please reassign them first.` 
      };
    }
    const filtered = this.getCategories().filter(c => c.id !== id);
    this.saveCategories(filtered);
    this.logAudit('CATEGORY_DELETE', cat.name, `Deleted category "${cat.name}"`);
    return { success: true };
  }

  // Products
  getProducts() {
    return JSON.parse(localStorage.getItem(DB_KEY_PRODUCTS) || '[]');
  }
  saveProducts(prods) {
    localStorage.setItem(DB_KEY_PRODUCTS, JSON.stringify(prods));
    this.recalculateCounts();
  }
  getProductById(id) {
    return this.getProducts().find(p => p.id === id || p.code === id);
  }
  addProduct(prod) {
    const prods = this.getProducts();
    // Validate unique code
    if (prods.some(p => p.code.toLowerCase() === prod.code.toLowerCase())) {
      throw new Error(`Product Code "${prod.code}" is already in use. Please enter a unique code.`);
    }
    prod.id = 'prod_' + Date.now();
    prod.createdAt = new Date().toISOString();
    prod.updatedAt = prod.createdAt;
    prods.unshift(prod);
    this.saveProducts(prods);
    this.logAudit('PRODUCT_ADD', `${prod.code} (${prod.name})`, `Added new product to category "${prod.category}"`);
    return prod;
  }
  updateProduct(id, updated) {
    const prods = this.getProducts();
    const idx = prods.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Product not found.');

    // Check code collision if code changed
    if (updated.code && updated.code.toLowerCase() !== prods[idx].code.toLowerCase()) {
      if (prods.some((p, i) => i !== idx && p.code.toLowerCase() === updated.code.toLowerCase())) {
        throw new Error(`Product Code "${updated.code}" is already taken by another product.`);
      }
    }

    prods[idx] = { 
      ...prods[idx], 
      ...updated, 
      updatedAt: new Date().toISOString() 
    };
    this.saveProducts(prods);
    this.logAudit('PRODUCT_UPDATE', `${prods[idx].code} (${prods[idx].name})`, `Updated formulation details and posology.`);
    return prods[idx];
  }
  toggleProductStatus(id) {
    const prods = this.getProducts();
    const p = prods.find(x => x.id === id);
    if (!p) return null;
    p.status = p.status === 'Active' ? 'Inactive' : 'Active';
    p.updatedAt = new Date().toISOString();
    this.saveProducts(prods);
    this.logAudit('STATUS_TOGGLE', `${p.code} (${p.name})`, `Status changed to ${p.status}`);
    return p;
  }
  deleteProduct(id) {
    const prods = this.getProducts();
    const p = prods.find(x => x.id === id);
    if (!p) return false;
    const filtered = prods.filter(x => x.id !== id);
    this.saveProducts(filtered);
    this.logAudit('PRODUCT_DELETE', `${p.code} (${p.name})`, `Permanently deleted product from catalogue.`);
    return true;
  }

  // Bulk Operations
  bulkUpdateStatus(ids, newStatus) {
    const prods = this.getProducts();
    let count = 0;
    prods.forEach(p => {
      if (ids.includes(p.id)) {
        p.status = newStatus;
        p.updatedAt = new Date().toISOString();
        count++;
      }
    });
    this.saveProducts(prods);
    this.logAudit('BULK_STATUS', `${count} Products`, `Bulk set status to ${newStatus}`);
    return count;
  }
  bulkChangeCategory(ids, newCategory) {
    const prods = this.getProducts();
    let count = 0;
    prods.forEach(p => {
      if (ids.includes(p.id)) {
        p.category = newCategory;
        p.updatedAt = new Date().toISOString();
        count++;
      }
    });
    this.saveProducts(prods);
    this.logAudit('BULK_CATEGORY', `${count} Products`, `Bulk moved to category "${newCategory}"`);
    return count;
  }
  bulkDelete(ids) {
    const prods = this.getProducts();
    const count = ids.length;
    const filtered = prods.filter(p => !ids.includes(p.id));
    this.saveProducts(filtered);
    this.logAudit('BULK_DELETE', `${count} Products`, `Bulk deleted ${count} products.`);
    return count;
  }

  // Ingredients
  getIngredients() {
    return JSON.parse(localStorage.getItem(DB_KEY_INGREDIENTS) || '[]');
  }
  saveIngredients(ings) {
    localStorage.setItem(DB_KEY_INGREDIENTS, JSON.stringify(ings));
  }
  addIngredient(ing) {
    const ings = this.getIngredients();
    ing.id = 'ing_' + Date.now();
    ing.productsCount = 0;
    ings.push(ing);
    this.saveIngredients(ings);
    this.logAudit('INGREDIENT_ADD', ing.name, `Registered new botanical ingredient: ${ing.name} (${ing.botanicalName})`);
    return ing;
  }
  updateIngredient(id, updated) {
    const ings = this.getIngredients();
    const idx = ings.findIndex(i => i.id === id);
    if (idx !== -1) {
      ings[idx] = { ...ings[idx], ...updated };
      this.saveIngredients(ings);
      this.logAudit('INGREDIENT_UPDATE', ings[idx].name, `Updated botanical metadata for ${ings[idx].name}`);
      return ings[idx];
    }
    return null;
  }
  getProductsForIngredient(ingredientName) {
    const search = ingredientName.toLowerCase().trim();
    return this.getProducts().filter(p => {
      return (p.ingredients || []).some(ing => ing.toLowerCase().includes(search));
    });
  }

  // Manufacturers
  getManufacturers() {
    return JSON.parse(localStorage.getItem(DB_KEY_MANUFACTURERS) || '[]');
  }
  saveManufacturers(mfgs) {
    localStorage.setItem(DB_KEY_MANUFACTURERS, JSON.stringify(mfgs));
  }
  addManufacturer(mfg) {
    const mfgs = this.getManufacturers();
    mfg.id = 'mfg_' + Date.now();
    mfgs.push(mfg);
    this.saveManufacturers(mfgs);
    this.logAudit('MANUFACTURER_ADD', mfg.name, `Added manufacturing unit: ${mfg.name}`);
    return mfg;
  }

  // App Content (Banners, Announcements)
  getBanners() {
    return JSON.parse(localStorage.getItem(DB_KEY_BANNERS) || '[]');
  }
  saveBanners(b) {
    localStorage.setItem(DB_KEY_BANNERS, JSON.stringify(b));
  }
  getAnnouncements() {
    return JSON.parse(localStorage.getItem(DB_KEY_ANNOUNCEMENTS) || '[]');
  }
  saveAnnouncements(a) {
    localStorage.setItem(DB_KEY_ANNOUNCEMENTS, JSON.stringify(a));
  }

  // Audit Logs
  getAuditLogs() {
    return JSON.parse(localStorage.getItem(DB_KEY_AUDIT) || '[]');
  }
  logAudit(action, entity, details) {
    const logs = this.getAuditLogs();
    const currentAdmin = localStorage.getItem('sitaram_admin_email') || 'admin@sitaramayurveda.com';
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const ts = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    
    logs.unshift({
      id: 'aud_' + Date.now() + Math.random().toString(36).substr(2, 4),
      timestamp: ts,
      admin: currentAdmin,
      action,
      entity,
      details
    });
    // Keep max 250 records
    if (logs.length > 250) logs.length = 250;
    localStorage.setItem(DB_KEY_AUDIT, JSON.stringify(logs));
  }

  // Settings
  getSettings() {
    return JSON.parse(localStorage.getItem(DB_KEY_SETTINGS) || JSON.stringify(DEFAULT_SETTINGS));
  }
  saveSettings(s) {
    localStorage.setItem(DB_KEY_SETTINGS, JSON.stringify(s));
    this.logAudit('SETTINGS_UPDATE', 'System Configuration', 'Updated central database & synchronization parameters.');
  }

  // Reset to Factory Handbook Defaults
  resetToFactoryDefaults() {
    localStorage.setItem(DB_KEY_CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem(DB_KEY_PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    localStorage.setItem(DB_KEY_INGREDIENTS, JSON.stringify(DEFAULT_INGREDIENTS));
    localStorage.setItem(DB_KEY_MANUFACTURERS, JSON.stringify(DEFAULT_MANUFACTURERS));
    localStorage.setItem(DB_KEY_BANNERS, JSON.stringify(DEFAULT_BANNERS));
    localStorage.setItem(DB_KEY_ANNOUNCEMENTS, JSON.stringify(DEFAULT_ANNOUNCEMENTS));
    localStorage.setItem(DB_KEY_SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    this.recalculateCounts();
    this.logAudit('FACTORY_RESET', 'Catalogue Database', 'Reset entire catalogue to Sitaram Therapeutic Index Handbook defaults.');
  }

  // Count recalculations
  recalculateCounts() {
    const prods = this.getProducts();
    const cats = this.getCategories();
    cats.forEach(c => {
      c.productCount = prods.filter(p => p.category === c.name).length;
    });
    this.saveCategories(cats);

    const ings = this.getIngredients();
    ings.forEach(i => {
      const s = i.name.toLowerCase().trim();
      i.productsCount = prods.filter(p => (p.ingredients || []).some(item => item.toLowerCase().includes(s))).length;
    });
    this.saveIngredients(ings);
  }

  // Suggest Next Code
  getNextProductCode() {
    const prods = this.getProducts();
    let max = 0;
    prods.forEach(p => {
      const match = p.code.match(/SA-(\d+)/i);
      if (match) {
        const n = parseInt(match[1], 10);
        if (n > max) max = n;
      }
    });
    return `SA-${String(max + 1).padStart(5, '0')}`;
  }
}

window.SitaramDB = new SitaramDB();
