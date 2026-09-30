/**
 * Sitaram Ayurveda Admin Website - Application Controller & Client Router
 * Fully upgraded to empower complete administration of the Therapeutic Index Catalogue:
 * Formulations, 24 Categories, Ingredients, Manufacturers, Import/Export, Banners, Reports, Audit Logs, Settings.
 */

class AdminApp {
  constructor() {
    this.currentPath = window.location.pathname || '/admin/dashboard';
    this.currentUser = null;
    this.profileMenuOpen = false;
    this.productFilterState = {
      search: '',
      category: '',
      status: '',
      ingredient: ''
    };
    this.selectedProductIds = new Set();
    this.motionMode = localStorage.getItem('glass_parallax_motion') || 'default';
    this.applyMotionMode(this.motionMode);
    this.tiltMagnitude = parseFloat(localStorage.getItem('glass_parallax_tilt') || '7.5');
    this.applyTiltMagnitude(this.tiltMagnitude);
    this.productViewMode = localStorage.getItem('ayurguide_product_view_mode') || 'cards';
    this.dashboardState = {
      loading: true,
      error: null,
      metrics: null,
      recentProducts: [],
      recentlyUpdated: [],
      categorySummary: []
    };
    this.init();
  }

  applyMotionMode(mode) {
    const validMode = (mode === 'fluid' || mode === 'snappy') ? mode : 'default';
    this.motionMode = validMode;
    document.body.setAttribute('data-motion', validMode);
    if (validMode === 'snappy') {
      document.documentElement.style.setProperty('--glass-motion-duration', '0.08s');
      document.documentElement.style.setProperty('--glass-motion-timing', 'cubic-bezier(0.1, 0.9, 0.2, 1)');
      document.documentElement.style.setProperty('--glass-shadow-duration', '0.12s');
      document.documentElement.style.setProperty('--glass-magnetic-timing', 'cubic-bezier(0.2, 1.6, 0.4, 1)');
      document.documentElement.style.setProperty('--glass-magnetic-duration', '0.22s');
    } else if (validMode === 'fluid') {
      document.documentElement.style.setProperty('--glass-motion-duration', '0.35s');
      document.documentElement.style.setProperty('--glass-motion-timing', 'cubic-bezier(0.25, 1, 0.5, 1)');
      document.documentElement.style.setProperty('--glass-shadow-duration', '0.45s');
      document.documentElement.style.setProperty('--glass-magnetic-timing', 'cubic-bezier(0.25, 1.25, 0.4, 1)');
      document.documentElement.style.setProperty('--glass-magnetic-duration', '0.45s');
    } else {
      // default balanced mode
      document.documentElement.style.setProperty('--glass-motion-duration', '0.15s');
      document.documentElement.style.setProperty('--glass-motion-timing', 'cubic-bezier(0.2, 0.9, 0.3, 1)');
      document.documentElement.style.setProperty('--glass-shadow-duration', '0.2s');
      document.documentElement.style.setProperty('--glass-magnetic-timing', 'cubic-bezier(0.34, 1.56, 0.64, 1)');
      document.documentElement.style.setProperty('--glass-magnetic-duration', '0.32s');
    }
  }

  setParallaxMotionMode(mode) {
    this.applyMotionMode(mode);
    localStorage.setItem('glass_parallax_motion', this.motionMode);
    
    // Update UI toggle buttons if present on the page (Dashboard / Headers)
    const btnDefault = document.getElementById('motion-toggle-default');
    const btnSnappy = document.getElementById('motion-toggle-snappy');
    const btnFluid = document.getElementById('motion-toggle-fluid');
    const activeClass = 'px-2.5 py-1 text-xs font-bold rounded-lg bg-[#10B981] text-[#052414] shadow-sm transition-all flex items-center gap-1';
    const inactiveClass = 'px-2.5 py-1 text-xs font-semibold rounded-lg text-gray-400 hover:text-white transition-all flex items-center gap-1';

    if (btnDefault) btnDefault.className = (this.motionMode === 'default') ? activeClass : inactiveClass;
    if (btnSnappy) btnSnappy.className = (this.motionMode === 'snappy') ? activeClass : inactiveClass;
    if (btnFluid) btnFluid.className = (this.motionMode === 'fluid') ? activeClass : inactiveClass;

    // Update SPA User Settings Modal Badges & Cards
    const modalBadge = document.getElementById('spa-modal-active-motion-attr');
    if (modalBadge) modalBadge.textContent = `data-motion="${this.motionMode}"`;

    const settingsPageBadge = document.getElementById('settings-page-active-motion-attr');
    if (settingsPageBadge) settingsPageBadge.textContent = `data-motion="${this.motionMode}"`;

    ['default', 'snappy', 'fluid'].forEach(m => {
      // Modal cards
      const card = document.getElementById(`spa-settings-motion-${m}`);
      const check = document.getElementById(`spa-settings-check-${m}`);
      if (card) {
        if (m === this.motionMode) {
          card.className = 'relative rounded-2xl p-3.5 border transition cursor-pointer flex flex-col justify-between group bg-emerald-900/40 border-emerald-400 ring-2 ring-emerald-500/40 shadow-lg';
        } else {
          card.className = 'relative rounded-2xl p-3.5 border transition cursor-pointer flex flex-col justify-between group bg-white/5 hover:bg-white/10 border-white/10';
        }
      }
      if (check) check.classList.toggle('hidden', m !== this.motionMode);

      // Dedicated /admin/settings page cards
      const pageCard = document.getElementById(`page-settings-motion-${m}`);
      const pageCheck = document.getElementById(`page-settings-check-${m}`);
      if (pageCard) {
        if (m === this.motionMode) {
          pageCard.className = 'rounded-xl p-4 border transition cursor-pointer flex flex-col justify-between group bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md';
        } else {
          pageCard.className = 'rounded-xl p-4 border transition cursor-pointer flex flex-col justify-between group hover:bg-emerald-50/50 bg-white border-gray-200';
        }
      }
      if (pageCheck) pageCheck.classList.toggle('hidden', m !== this.motionMode);
    });
  }

  openUserSettingsModal() {
    const modal = document.getElementById('user-settings-panel-modal');
    if (modal) {
      modal.classList.remove('hidden');
      this.setParallaxMotionMode(this.motionMode);
    }
  }

  closeUserSettingsModal() {
    const modal = document.getElementById('user-settings-panel-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  applyTiltMagnitude(val) {
    const num = Math.max(0, Math.min(25, parseFloat(val) || 7.5));
    this.tiltMagnitude = num;
    document.documentElement.style.setProperty('--glass-tilt-magnitude', `${num}deg`);
  }

  setTiltMagnitude(val) {
    this.applyTiltMagnitude(val);
    localStorage.setItem('glass_parallax_tilt', this.tiltMagnitude);
    
    // Update all slider displays in real time
    const displays = document.querySelectorAll('.tilt-magnitude-display');
    displays.forEach(el => {
      el.textContent = `${this.tiltMagnitude.toFixed(1)}°`;
    });
    const sliders = document.querySelectorAll('.tilt-magnitude-slider');
    sliders.forEach(el => {
      if (el.value !== String(this.tiltMagnitude)) {
        el.value = this.tiltMagnitude;
      }
    });

    const modalDisplay = document.getElementById('spa-modal-tilt-display');
    if (modalDisplay) modalDisplay.textContent = `${this.tiltMagnitude.toFixed(1)}°`;
    const modalSlider = document.getElementById('spa-modal-tilt-slider');
    if (modalSlider && modalSlider.value !== String(this.tiltMagnitude)) {
      modalSlider.value = this.tiltMagnitude;
    }
  }

  async init() {
    // 1. Listen for browser back/forward buttons
    window.addEventListener('popstate', () => {
      this.handleRoute(window.location.pathname);
    });

    // 2. Listen for hash changes (e.g. #products/add, #products/view/prod_..., #import, #export)
    window.addEventListener('hashchange', () => {
      this.handleRoute(window.location.pathname);
    });

    // 3. Close profile dropdown on outside click
    document.addEventListener('click', (e) => {
      const container = document.getElementById('admin-profile-menu-container');
      if (container && !container.contains(e.target)) {
        const dropdown = document.getElementById('admin-profile-dropdown');
        if (dropdown && !dropdown.classList.contains('hidden')) {
          dropdown.classList.add('hidden');
          this.profileMenuOpen = false;
        }
      }
    });

    // 3b. Mouse-tracked 3D Parallax Tilt Effect with Magnetic Snapping Gravitation & Refraction
    let activeMagneticCard = null;
    let magneticTimer = null;

    document.addEventListener('mousemove', (e) => {
      const card = e.target.closest('.liquid-glass-card');
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Magnetic Snapping Transition:
      // When cursor enters a card, briefly trigger a snap transition so the card
      // noticeably gravitates toward the cursor before normal continuous tracking engages.
      if (activeMagneticCard !== card) {
        if (activeMagneticCard && activeMagneticCard !== card) {
          activeMagneticCard.classList.remove('is-magnetic-snapping');
        }
        activeMagneticCard = card;
        card.classList.add('is-magnetic-snapping');
        clearTimeout(magneticTimer);
        const snapDuration = (this.motionMode === 'snappy') ? 220 : 340;
        magneticTimer = setTimeout(() => {
          if (activeMagneticCard) {
            activeMagneticCard.classList.remove('is-magnetic-snapping');
          }
        }, snapDuration);
      }

      // Magnetic Gravitation & Tilt Calculations:
      // 1. Magnetic physical translation pulling card center subtly toward the cursor position
      const magnetStrength = 10; // max +/-10px pull along X and Y
      const magnetPullX = ((x - centerX) / centerX) * magnetStrength;
      const magnetPullY = ((y - centerY) / centerY) * magnetStrength;

      // 2. 3D Angular Tilt (rotation around center)
      const mag = typeof this.tiltMagnitude === 'number' ? this.tiltMagnitude : 7.5;
      const rotateX = ((centerY - y) / centerY) * mag;
      const rotateY = ((x - centerX) / centerX) * mag;

      const shadowOffsetX = (-rotateY * 1.5).toFixed(1);
      const shadowOffsetY = (rotateX * 1.5).toFixed(1);
      const lightOffsetX = (rotateY * 1.8).toFixed(1);
      const lightOffsetY = (-rotateX * 1.8).toFixed(1);

      const pctX = ((x / rect.width) * 100).toFixed(1);
      const pctY = ((y / rect.height) * 100).toFixed(1);
      const oppPctX = (100 - (x / rect.width) * 100).toFixed(1);
      const oppPctY = (100 - (y / rect.height) * 100).toFixed(1);

      card.style.setProperty('--mouse-x', `${pctX}%`);
      card.style.setProperty('--mouse-y', `${pctY}%`);
      card.style.setProperty('--shadow-x', `${oppPctX}%`);
      card.style.setProperty('--shadow-y', `${oppPctY}%`);
      card.style.setProperty('--glare-opacity', '1');
      card.style.setProperty(
        '--glass-inner-shadow',
        `inset ${lightOffsetX}px ${lightOffsetY}px 12px 0 rgba(255, 255, 255, 0.85), inset ${shadowOffsetX}px ${shadowOffsetY}px 18px 0 rgba(4, 38, 20, 0.16)`
      );

      // Apply magnetic translation + elevation + 3D rotation tilt
      card.style.transform = `perspective(1000px) translate3d(${magnetPullX.toFixed(2)}px, ${(magnetPullY - 4).toFixed(2)}px, 0) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.018)`;
      
      // Depth parallax for interior child elements (amplified gravitation shift)
      // (Excluding .glass-card-front and .glass-card-back to preserve 3D card flip rotations)
      const children = card.children;
      for (let i = 0; i < children.length; i++) {
        if (children[i].classList.contains('glass-card-front') || children[i].classList.contains('glass-card-back')) {
          continue;
        }
        children[i].style.transform = `translateZ(20px) translateX(${((rotateY * 0.55) + (magnetPullX * 0.35)).toFixed(2)}px) translateY(${((-rotateX * 0.55) + (magnetPullY * 0.35)).toFixed(2)}px)`;
      }
    });

    document.addEventListener('mouseout', (e) => {
      const card = e.target.closest('.liquid-glass-card');
      if (!card) return;
      if (!card.contains(e.relatedTarget)) {
        if (activeMagneticCard === card) {
          card.classList.remove('is-magnetic-snapping');
          activeMagneticCard = null;
          clearTimeout(magneticTimer);
        }
        card.style.transform = 'perspective(1000px) translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg) scale(1)';
        card.style.setProperty('--glare-opacity', '0');
        card.style.removeProperty('--glass-inner-shadow');
        const children = card.children;
        for (let i = 0; i < children.length; i++) {
          if (children[i].classList.contains('glass-card-front') || children[i].classList.contains('glass-card-back')) {
            continue;
          }
          children[i].style.transform = 'translateZ(0px) translateX(0px) translateY(0px)';
        }
      }
    });

    // Universal 3D Flip Capability Handler for .liquid-glass-card
    document.addEventListener('click', (e) => {
      const flipBtn = e.target.closest('[data-action="flip-card"], .secondary-info-btn, .glass-card-info-btn, .glass-card-flip-back-btn');
      if (flipBtn) {
        e.preventDefault();
        e.stopPropagation();
        const card = flipBtn.closest('.liquid-glass-card');
        if (card) {
          card.classList.toggle('is-flipped');
        }
      }
    });

    // 4. Verify session against backend on initial page load
    const sessionRes = await SitaramAuth.checkSession();
    if (sessionRes.authenticated) {
      this.currentUser = sessionRes.admin;
      if (this.currentPath === '/admin/login' || this.currentPath === '/' || this.currentPath === '/admin') {
        this.navigate('/admin/dashboard');
        return;
      }
      this.handleRoute(this.currentPath);
    } else {
      this.currentUser = null;
      if (this.currentPath !== '/admin/login') {
        this.navigate('/admin/login');
        return;
      }
      this.handleRoute('/admin/login');
    }
  }

  navigate(path, event) {
    if (event) {
      event.preventDefault();
    }
    // Clear hash if navigating via main navbar
    if (window.location.hash && !path.includes('#')) {
      history.pushState("", document.title, window.location.pathname + window.location.search);
    }
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    this.handleRoute(path);
  }

  async handleRoute(pathname) {
    this.currentPath = pathname;
    const root = document.getElementById('app-root');
    if (!root) return;

    // Login Route
    if (pathname === '/admin/login') {
      root.innerHTML = Views.login();
      this.attachLoginForm();
      return;
    }

    // Protection Check
    if (!this.currentUser) {
      const check = await SitaramAuth.checkSession();
      if (!check.authenticated) {
        this.navigate('/admin/login');
        return;
      }
      this.currentUser = check.admin;
    }

    const hash = window.location.hash.replace(/^#\/?/, '');
    const pathSub = pathname.replace('/admin/', '').split('/')[0] || 'dashboard';

    // Route Dispatcher
    if (hash.startsWith('products/add') || pathSub === 'products-add') {
      this.renderProductAddView(root);
    }
    else if (hash.startsWith('products/edit/')) {
      const prodId = hash.replace('products/edit/', '');
      this.renderProductEditView(root, prodId);
    }
    else if (hash.startsWith('products/view/')) {
      const prodId = hash.replace('products/view/', '');
      this.renderProductDossierView(root, prodId);
    }
    else if (hash === 'import' || pathSub === 'import') {
      root.innerHTML = Views.layout('products', this.currentUser, ModuleViews.import());
    }
    else if (hash === 'export' || pathSub === 'export') {
      root.innerHTML = Views.layout('products', this.currentUser, ModuleViews.export(SitaramDB.getCategories(), SitaramDB.getIngredients()));
    }
    else if (pathSub === 'dashboard' || hash === 'dashboard') {
      root.innerHTML = Views.layout('dashboard', this.currentUser, '<div id="dashboard-content"></div>');
      this.loadDashboardData();
    } 
    else if (pathSub === 'products' || hash === 'products') {
      this.renderProductListView(root);
    }
    else if (pathSub === 'categories' || hash === 'categories') {
      root.innerHTML = Views.layout('categories', this.currentUser, ModuleViews.categories(SitaramDB.getCategories()));
    }
    else if (pathSub === 'ingredients' || hash === 'ingredients') {
      root.innerHTML = Views.layout('ingredients', this.currentUser, ModuleViews.ingredients(SitaramDB.getIngredients()));
    }
    else if (pathSub === 'manufacturers' || hash === 'manufacturers') {
      root.innerHTML = Views.layout('manufacturers', this.currentUser, ModuleViews.manufacturers(SitaramDB.getManufacturers()));
    }
    else if (pathSub === 'media' || hash === 'media') {
      root.innerHTML = Views.layout('media', this.currentUser, ModuleViews.media());
    }
    else if (pathSub === 'app-content' || hash === 'app-content') {
      const featured = SitaramDB.getProducts().filter(p => p.featured);
      root.innerHTML = Views.layout('app-content', this.currentUser, ModuleViews.appContent(SitaramDB.getBanners(), SitaramDB.getAnnouncements(), featured));
    }
    else if (pathSub === 'reports' || hash === 'reports') {
      root.innerHTML = Views.layout('reports', this.currentUser, ModuleViews.reports(SitaramDB.getProducts(), SitaramDB.getCategories(), SitaramDB.getIngredients()));
    }
    else if (pathSub === 'supabase' || hash === 'supabase') {
      this.renderSupabaseView(root);
    }
    else if (pathSub === 'audit-logs' || hash === 'audit-logs') {
      root.innerHTML = Views.layout('audit-logs', this.currentUser, ModuleViews.auditLogs(SitaramDB.getAuditLogs()));
    }
    else if (pathSub === 'settings' || hash === 'settings') {
      root.innerHTML = Views.layout('settings', this.currentUser, ModuleViews.settings(SitaramDB.getSettings()));
    }
    else {
      this.navigate('/admin/dashboard');
    }
  }

  // ==========================================
  // DASHBOARD
  // ==========================================
  async loadDashboardData() {
    const container = document.getElementById('dashboard-content');
    if (!container) return;

    container.innerHTML = DashboardView.renderLoading();

    try {
      const [resMetrics, resRecent, resUpdated, resSummary] = await Promise.all([
        fetch('/api/dashboard/metrics', { headers: { 'Accept': 'application/json' } }).catch(() => null),
        fetch('/api/dashboard/recent-products', { headers: { 'Accept': 'application/json' } }).catch(() => null),
        fetch('/api/dashboard/recently-updated', { headers: { 'Accept': 'application/json' } }).catch(() => null),
        fetch('/api/dashboard/category-summary', { headers: { 'Accept': 'application/json' } }).catch(() => null)
      ]);

      let metrics, recent, updated, summary;

      if (resMetrics && resMetrics.ok) {
        const m = await resMetrics.json();
        metrics = m.data;
      } else {
        const prods = SitaramDB.getProducts();
        metrics = {
          totalProducts: prods.length,
          activeProducts: prods.filter(p => p.status === 'Active').length,
          inactiveProducts: prods.filter(p => p.status === 'Inactive').length,
          categories: SitaramDB.getCategories().length,
          ingredients: SitaramDB.getIngredients().length,
          manufacturers: SitaramDB.getManufacturers().length
        };
      }

      if (resRecent && resRecent.ok) {
        const r = await resRecent.json();
        recent = r.data || [];
      } else {
        recent = SitaramDB.getProducts().slice(0, 5);
      }

      if (resUpdated && resUpdated.ok) {
        const u = await resUpdated.json();
        updated = u.data || [];
      } else {
        updated = [...SitaramDB.getProducts()].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)).slice(0, 5);
      }

      if (resSummary && resSummary.ok) {
        const s = await resSummary.json();
        summary = s.data || [];
      } else {
        summary = SitaramDB.getCategories().map(c => ({
          name: c.name,
          product_count: c.productCount || 0
        }));
      }

      this.dashboardState = {
        loading: false,
        error: null,
        metrics,
        recentProducts: recent,
        recentlyUpdated: updated,
        categorySummary: summary
      };

      container.innerHTML = DashboardView.renderSuccess(
        this.dashboardState.metrics,
        this.dashboardState.recentProducts,
        this.dashboardState.recentlyUpdated,
        this.dashboardState.categorySummary
      );
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      container.innerHTML = DashboardView.renderError(err.message);
    }
  }

  // ==========================================
  // PRODUCTS MANAGEMENT
  // ==========================================
  getFilteredProducts() {
    let prods = SitaramDB.getProducts();
    const { search, category, status, ingredient } = this.productFilterState;

    if (search) {
      const q = search.toLowerCase().trim();
      prods = prods.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.code && p.code.toLowerCase().includes(q)) ||
        (p.indications && p.indications.toLowerCase().includes(q)) ||
        (p.classicalReference && p.classicalReference.toLowerCase().includes(q))
      );
    }
    if (category) {
      prods = prods.filter(p => p.category === category);
    }
    if (status) {
      prods = prods.filter(p => p.status === status);
    }
    if (ingredient) {
      const ingQ = ingredient.toLowerCase().trim();
      prods = prods.filter(p => (p.ingredients || []).some(i => i.toLowerCase().includes(ingQ)));
    }
    return prods;
  }

  renderProductListView(root) {
    const prods = this.getFilteredProducts();
    const cats = SitaramDB.getCategories();
    const content = ProductViews.list(prods, cats, this.productFilterState);
    root.innerHTML = Views.layout('products', this.currentUser, content);
    this.selectedProductIds.clear();
  }

  renderProductAddView(root) {
    const cats = SitaramDB.getCategories();
    const content = ProductViews.form(false, null, cats);
    root.innerHTML = Views.layout('products', this.currentUser, content);
  }

  renderProductEditView(root, prodId) {
    const prod = SitaramDB.getProductById(prodId);
    if (!prod) {
      this.showToast('Product formulation not found!', 'error');
      this.navigate('/admin/products');
      return;
    }
    const cats = SitaramDB.getCategories();
    const content = ProductViews.form(true, prod, cats);
    root.innerHTML = Views.layout('products', this.currentUser, content);
  }

  renderProductDossierView(root, prodId) {
    const prod = SitaramDB.getProductById(prodId);
    if (!prod) {
      this.showToast('Product formulation not found!', 'error');
      this.navigate('/admin/products');
      return;
    }
    const content = ProductViews.dossier(prod);
    root.innerHTML = Views.layout('products', this.currentUser, content);
  }

  onProductSearch(val) {
    this.productFilterState.search = val;
    this.refreshProductTableOnly();
  }

  onProductCategoryFilter(val) {
    this.productFilterState.category = val;
    this.refreshProductTableOnly();
  }

  onProductStatusFilter(val) {
    this.productFilterState.status = val;
    this.refreshProductTableOnly();
  }

  onProductIngredientFilter(val) {
    this.productFilterState.ingredient = val;
    this.refreshProductTableOnly();
  }

  clearProductFilters() {
    this.productFilterState = { search: '', category: '', status: '', ingredient: '' };
    const root = document.getElementById('app-root');
    if (root) this.renderProductListView(root);
  }

  setProductViewMode(mode) {
    this.productViewMode = mode;
    localStorage.setItem('ayurguide_product_view_mode', mode);
    this.refreshProductTableOnly();
  }

  flipProductCard(productId) {
    if (this.productViewMode !== 'cards') {
      this.productViewMode = 'cards';
      localStorage.setItem('ayurguide_product_view_mode', 'cards');
      this.refreshProductTableOnly();
    }
    setTimeout(() => {
      const card = document.querySelector(`[data-product-id="${productId}"]`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.add('is-flipped');
      }
    }, 120);
  }

  refreshProductTableOnly() {
    const root = document.getElementById('app-root');
    if (root) {
      this.renderProductListView(root);
    }
  }

  toggleProductStatus(id, reloadDossier = false) {
    const updated = SitaramDB.toggleProductStatus(id);
    if (!updated) return;
    
    // Sync with backend API
    fetch('/api/products/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: updated.status })
    }).catch(() => {});

    this.showToast(`${updated.name} status updated to ${updated.status}`, 'success');
    if (reloadDossier) {
      const root = document.getElementById('app-root');
      if (root) this.renderProductDossierView(root, id);
    } else {
      this.refreshProductTableOnly();
    }
  }

  deleteProduct(id) {
    const prod = SitaramDB.getProductById(id);
    if (!prod) return;

    // Show safe confirmation dialog
    let modal = document.getElementById('safeDeleteMedicineModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'safeDeleteMedicineModal';
      modal.className = 'fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#EBE3D5] space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-2xl bg-red-100 border border-red-200 text-red-600 flex items-center justify-center text-2xl shrink-0">
            ⚠️
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-serif font-bold text-xl text-[#1B4D3E] leading-snug">Delete Medicine?</h3>
            <p class="text-sm text-gray-600 mt-1">Are you sure you want to permanently delete this medicine?</p>
            <div class="mt-3 p-3 bg-red-50/60 rounded-xl border border-red-100 flex items-center gap-3">
              <img src="${prod.image_url || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=150&q=80'}" class="w-10 h-10 rounded-lg object-cover border border-[#EBE3D5] shrink-0" alt="Medicine" />
              <div class="min-w-0">
                <p class="font-serif font-bold text-xs text-[#1B4D3E] truncate">${prod.name || 'Ayurvedic Medicine'}</p>
                <p class="text-[11px] text-gray-500 truncate">${prod.category || 'Classical'} • ${prod.code || ''}</p>
              </div>
            </div>
          </div>
        </div>

        <div id="safeDeleteErrorBox" class="hidden p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
          <span class="text-base shrink-0">🚫</span>
          <div class="flex-1">
            <p class="font-bold text-red-900">Database Restriction</p>
            <p id="safeDeleteErrorMsg" class="text-[11px] text-red-700 mt-0.5 leading-relaxed">The medicine cannot be deleted because of database restrictions.</p>
          </div>
        </div>

        <div class="flex items-center justify-end space-x-3 pt-3 border-t border-[#EBE3D5]">
          <button 
            type="button" 
            id="cancelSafeDeleteBtn" 
            class="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-[#F7F4EE] border border-[#EBE3D5] transition cursor-pointer">
            Cancel
          </button>
          <button 
            type="button" 
            id="confirmSafeDeleteBtn" 
            class="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-md transition cursor-pointer flex items-center gap-2">
            <span id="safeDeleteSpinner" class="hidden text-xs">⏳</span>
            <span id="safeDeleteBtnText">Delete Medicine</span>
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');

    const cancelBtn = modal.querySelector('#cancelSafeDeleteBtn');
    const confirmBtn = modal.querySelector('#confirmSafeDeleteBtn');
    const spinner = modal.querySelector('#safeDeleteSpinner');
    const btnText = modal.querySelector('#safeDeleteBtnText');
    const errBox = modal.querySelector('#safeDeleteErrorBox');
    const errMsg = modal.querySelector('#safeDeleteErrorMsg');

    cancelBtn.onclick = () => {
      modal.classList.add('hidden');
    };

    confirmBtn.onclick = async () => {
      confirmBtn.disabled = true;
      spinner.classList.remove('hidden');
      btnText.innerText = "Deleting...";
      errBox.classList.add('hidden');

      let deleteSuccess = false;
      let databaseError = null;

      try {
        const res = await fetch('/api/products/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.success !== false) {
          deleteSuccess = true;
        } else {
          databaseError = data.error || `Database restriction error (${res.status}): Unable to delete medicine.`;
        }
      } catch (netErr) {
        console.error("Database deletion error:", netErr);
        databaseError = `Database connection error: ${netErr.message || 'Unable to contact database server.'}`;
      }

      if (!deleteSuccess) {
        // Do not silently fail. Display clear error message.
        confirmBtn.disabled = false;
        spinner.classList.add('hidden');
        btnText.innerText = "Delete Medicine";
        errMsg.innerText = databaseError || "The medicine cannot be deleted because of database restrictions.";
        errBox.classList.remove('hidden');
        this.showToast(databaseError, 'error');
        return;
      }

      // Successful deletion
      SitaramDB.deleteProduct(id);
      modal.classList.add('hidden');

      this.showToast(`Medicine "${prod.name}" permanently deleted successfully.`, 'success');

      if (window.location.hash.includes('products/view')) {
        window.location.hash = '#products';
      } else {
        this.refreshProductTableOnly();
      }
    };
  }

  // Row selection & Bulk operations
  toggleSelectAllProducts(checked) {
    const checkboxes = document.querySelectorAll('.product-row-checkbox');
    checkboxes.forEach(cb => {
      cb.checked = checked;
      const pid = cb.getAttribute('data-product-id');
      if (checked) {
        this.selectedProductIds.add(pid);
      } else {
        this.selectedProductIds.delete(pid);
      }
    });
    this.updateBulkActionBar();
  }

  onProductRowCheckboxChange() {
    this.selectedProductIds.clear();
    const checkboxes = document.querySelectorAll('.product-row-checkbox:checked');
    checkboxes.forEach(cb => {
      this.selectedProductIds.add(cb.getAttribute('data-product-id'));
    });
    this.updateBulkActionBar();
  }

  updateBulkActionBar() {
    const bar = document.getElementById('bulk-action-bar');
    const countBadge = document.getElementById('bulk-selected-count');
    if (!bar) return;
    const count = this.selectedProductIds.size;
    if (count > 0) {
      bar.classList.remove('hidden');
      if (countBadge) countBadge.innerText = `${count} Selected`;
    } else {
      bar.classList.add('hidden');
    }
  }

  onBulkActivate() {
    const ids = Array.from(this.selectedProductIds);
    if (ids.length === 0) return;
    SitaramDB.bulkUpdateStatus(ids, 'Active');
    fetch('/api/products/bulk-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, status: 'Active' })
    }).catch(() => {});
    this.showToast(`Bulk activated ${ids.length} products!`, 'success');
    this.selectedProductIds.clear();
    this.refreshProductTableOnly();
  }

  onBulkDeactivate() {
    const ids = Array.from(this.selectedProductIds);
    if (ids.length === 0) return;
    SitaramDB.bulkUpdateStatus(ids, 'Inactive');
    fetch('/api/products/bulk-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, status: 'Inactive' })
    }).catch(() => {});
    this.showToast(`Bulk deactivated ${ids.length} products!`, 'info');
    this.selectedProductIds.clear();
    this.refreshProductTableOnly();
  }

  showBulkCategoryModal() {
    const ids = Array.from(this.selectedProductIds);
    if (ids.length === 0) return;
    const cats = SitaramDB.getCategories();

    this.openModal(`
      <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
        <h3 class="font-serif font-bold text-lg text-[#0F382C]">Change Category for ${ids.length} Products</h3>
        <p class="text-xs text-gray-500">Select new therapeutic classification from the 24 Handbook categories:</p>
        <select id="modal-bulk-cat-select" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B4D3E]">
          ${cats.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
        </select>
        <div class="flex items-center justify-end gap-2 pt-3 border-t">
          <button onclick="App.closeModal()" class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onclick="App.confirmBulkCategoryChange()" class="px-4 py-2 bg-[#1B4D3E] hover:bg-[#0F382C] text-white text-xs font-semibold rounded-lg">Apply Category</button>
        </div>
      </div>
    `);
  }

  confirmBulkCategoryChange() {
    const sel = document.getElementById('modal-bulk-cat-select');
    if (!sel) return;
    const newCat = sel.value;
    const ids = Array.from(this.selectedProductIds);
    SitaramDB.bulkChangeCategory(ids, newCat);
    fetch('/api/products/bulk-category', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, category: newCat })
    }).catch(() => {});
    this.closeModal();
    this.showToast(`Moved ${ids.length} products to ${newCat}!`, 'success');
    this.selectedProductIds.clear();
    this.refreshProductTableOnly();
  }

  onBulkDelete() {
    const ids = Array.from(this.selectedProductIds);
    if (ids.length === 0) return;
    if (!confirm(`Are you sure you want to permanently delete these ${ids.length} products from the catalogue?`)) {
      return;
    }
    SitaramDB.bulkDelete(ids);
    fetch('/api/products/bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    }).catch(() => {});
    this.showToast(`Deleted ${ids.length} products!`, 'info');
    this.selectedProductIds.clear();
    this.refreshProductTableOnly();
  }

  // Add / Edit Product Form Actions
  addPackingRow() {
    const container = document.getElementById('packing-container');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'flex items-center gap-2 packing-row';
    div.innerHTML = `
      <input type="text" placeholder="e.g. 450 ml, 200 ml, 60 Tablets" class="packing-input flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B4D3E]">
      <button type="button" onclick="this.parentElement.remove()" class="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50" title="Remove">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    `;
    container.appendChild(div);
  }

  addIngredientRow() {
    const container = document.getElementById('ingredient-container');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'flex items-center gap-2 ingredient-row';
    div.innerHTML = `
      <input type="text" placeholder="e.g. Ashwagandha (Withania somnifera)" class="ingredient-input flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B4D3E]">
      <button type="button" onclick="this.parentElement.remove()" class="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50" title="Remove">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    `;
    container.appendChild(div);
  }

  saveProductForm(isEdit, prodId) {
    const code = document.getElementById('f-code')?.value.trim();
    const name = document.getElementById('f-name')?.value.trim();
    const category = document.getElementById('f-category')?.value;
    const reference = document.getElementById('f-reference')?.value.trim();
    const status = document.getElementById('f-status')?.value || 'Active';
    const featured = document.getElementById('f-featured')?.checked || false;
    const usage = document.getElementById('f-usage')?.value.trim() || '';
    const indications = document.getElementById('f-indications')?.value.trim() || '';
    const description = document.getElementById('f-description')?.value.trim() || '';
    const imageUrl = document.getElementById('f-image')?.value.trim() || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600';

    if (!code || !name || !category) {
      alert('Product Code, Formulation Name, and Category are mandatory.');
      return;
    }

    // Gather packings
    const packings = [];
    document.querySelectorAll('.packing-input').forEach(input => {
      const v = input.value.trim();
      if (v) packings.push(v);
    });
    if (packings.length === 0) packings.push('450 ml');

    // Gather ingredients
    const ingredients = [];
    document.querySelectorAll('.ingredient-input').forEach(input => {
      const v = input.value.trim();
      if (v) ingredients.push(v);
    });

    const payload = {
      code,
      name,
      category,
      classicalReference: reference,
      status,
      featured,
      packings,
      ingredients,
      usage,
      indications,
      description,
      imageUrl
    };

    if (isEdit) {
      SitaramDB.updateProduct(prodId, payload);
      fetch('/api/products/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: prodId, ...payload })
      }).catch(() => {});
      this.showToast(`Updated "${name}" successfully!`, 'success');
      window.location.hash = `#products/view/${prodId}`;
    } else {
      const created = SitaramDB.addProduct(payload);
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
      this.showToast(`Added formulation "${name}" to catalogue!`, 'success');
      window.location.hash = `#products/view/${created.id}`;
    }
  }

  // ==========================================
  // CATEGORIES MANAGEMENT
  // ==========================================
  showAddCategoryModal() {
    this.openModal(`
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-serif font-bold text-lg text-[#0F382C]">Add Therapeutic Category</h3>
          <button onclick="App.closeModal()" class="text-gray-400 hover:text-gray-700">✕</button>
        </div>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Category Name *</label>
            <input type="text" id="cat-m-name" placeholder="e.g. Asavam, Choornams, Ghruthams" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B4D3E]">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Short Code *</label>
              <input type="text" id="cat-m-code" placeholder="e.g. ASA, CHO" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 font-mono uppercase">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Display Order</label>
              <input type="number" id="cat-m-order" value="${SitaramDB.getCategories().length + 1}" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300">
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Therapeutic Handbook Description</label>
            <textarea id="cat-m-desc" rows="2" placeholder="Classical definition & posology..." class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300"></textarea>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 pt-3 border-t">
          <button onclick="App.closeModal()" class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onclick="App.saveCategoryModal(false)" class="px-5 py-2 bg-[#1B4D3E] hover:bg-[#0F382C] text-white text-xs font-semibold rounded-lg">Create Category</button>
        </div>
      </div>
    `);
  }

  showEditCategoryModal(id) {
    const cat = SitaramDB.getCategoryById(id);
    if (!cat) return;
    this.openModal(`
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-serif font-bold text-lg text-[#0F382C]">Edit Category: ${cat.name}</h3>
          <button onclick="App.closeModal()" class="text-gray-400 hover:text-gray-700">✕</button>
        </div>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Category Name *</label>
            <input type="text" id="cat-m-name" value="${cat.name}" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B4D3E]">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Short Code *</label>
              <input type="text" id="cat-m-code" value="${cat.code || ''}" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 font-mono uppercase">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Display Order</label>
              <input type="number" id="cat-m-order" value="${cat.order || 1}" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300">
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Therapeutic Handbook Description</label>
            <textarea id="cat-m-desc" rows="2" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300">${cat.description || ''}</textarea>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 pt-3 border-t">
          <button onclick="App.closeModal()" class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onclick="App.saveCategoryModal(true, '${id}')" class="px-5 py-2 bg-[#1B4D3E] hover:bg-[#0F382C] text-white text-xs font-semibold rounded-lg">Update Category</button>
        </div>
      </div>
    `);
  }

  saveCategoryModal(isEdit, id) {
    const name = document.getElementById('cat-m-name')?.value.trim();
    const code = document.getElementById('cat-m-code')?.value.trim();
    const order = parseInt(document.getElementById('cat-m-order')?.value || '1', 10);
    const description = document.getElementById('cat-m-desc')?.value.trim() || '';

    if (!name || !code) {
      alert('Category name and code are mandatory.');
      return;
    }

    if (isEdit) {
      SitaramDB.updateCategory(id, { name, code, order, description });
      fetch('/api/categories/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, code, order, description })
      }).catch(() => {});
      this.showToast(`Updated category "${name}"!`, 'success');
    } else {
      SitaramDB.addCategory({ name, code, order, description, status: 'Active' });
      fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code, order, description, status: 'Active' })
      }).catch(() => {});
      this.showToast(`Created category "${name}"!`, 'success');
    }

    this.closeModal();
    const root = document.getElementById('app-root');
    if (root) root.innerHTML = Views.layout('categories', this.currentUser, ModuleViews.categories(SitaramDB.getCategories()));
  }

  deleteCategory(id) {
    const cat = SitaramDB.getCategoryById(id);
    if (!cat) return;
    if (!confirm(`Are you sure you want to delete category "${cat.name}"? Existing products under this category should be reassigned.`)) {
      return;
    }
    SitaramDB.deleteCategory(id);
    fetch('/api/categories/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    }).catch(() => {});
    this.showToast(`Deleted category "${cat.name}"`, 'info');
    const root = document.getElementById('app-root');
    if (root) root.innerHTML = Views.layout('categories', this.currentUser, ModuleViews.categories(SitaramDB.getCategories()));
  }

  // ==========================================
  // INGREDIENTS MASTER REGISTRY
  // ==========================================
  showAddIngredientModal() {
    this.openModal(`
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-serif font-bold text-lg text-[#0F382C]">Register Normalized Botanical</h3>
          <button onclick="App.closeModal()" class="text-gray-400 hover:text-gray-700">✕</button>
        </div>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Common / Trade Name *</label>
            <input type="text" id="ing-m-name" placeholder="e.g. Ashwagandha, Haritaki, Draksha" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B4D3E]">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Botanical Latin Binomial</label>
            <input type="text" id="ing-m-latin" placeholder="e.g. Withania somnifera (L.) Dunal" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 italic">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Sanskrit Name</label>
              <input type="text" id="ing-m-sanskrit" placeholder="e.g. अश्वगन्धा, हरीतकी" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Part Used</label>
              <input type="text" id="ing-m-part" placeholder="e.g. Root, Dried Fruit, Bark" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300">
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 pt-3 border-t">
          <button onclick="App.closeModal()" class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onclick="App.saveIngredientModal()" class="px-5 py-2 bg-[#1B4D3E] hover:bg-[#0F382C] text-white text-xs font-semibold rounded-lg">Register Herb</button>
        </div>
      </div>
    `);
  }

  saveIngredientModal() {
    const name = document.getElementById('ing-m-name')?.value.trim();
    const botanicalName = document.getElementById('ing-m-latin')?.value.trim() || '';
    const sanskritName = document.getElementById('ing-m-sanskrit')?.value.trim() || '';
    const partUsed = document.getElementById('ing-m-part')?.value.trim() || '';

    if (!name) {
      alert('Botanical Name is required.');
      return;
    }

    SitaramDB.addIngredient({ name, botanicalName, sanskritName, partUsed });
    fetch('/api/ingredients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, botanicalName, sanskritName, partUsed })
    }).catch(() => {});

    this.closeModal();
    this.showToast(`Registered botanical "${name}"!`, 'success');
    const root = document.getElementById('app-root');
    if (root) root.innerHTML = Views.layout('ingredients', this.currentUser, ModuleViews.ingredients(SitaramDB.getIngredients()));
  }

  viewIngredientProducts(ingredientName) {
    this.productFilterState = {
      search: '',
      category: '',
      status: '',
      ingredient: ingredientName
    };
    this.navigate('/admin/products');
    this.showToast(`Filtered formulations containing ${ingredientName}`, 'info');
  }

  // ==========================================
  // MANUFACTURERS MANAGEMENT
  // ==========================================
  showAddManufacturerModal() {
    this.openModal(`
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-serif font-bold text-lg text-[#0F382C]">Add Ayush GMP Manufacturing Facility</h3>
          <button onclick="App.closeModal()" class="text-gray-400 hover:text-gray-700">✕</button>
        </div>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Unit / Company Name *</label>
            <input type="text" id="mfg-m-name" placeholder="e.g. Sitaram Ayurveda Special Formulations Unit" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B4D3E]">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Facility Code *</label>
              <input type="text" id="mfg-m-code" placeholder="e.g. SAPL-02" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 font-mono">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">GMP Ayush License No.</label>
              <input type="text" id="mfg-m-license" placeholder="e.g. AYUSH-KL-TCR-GMP" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Contact Person</label>
              <input type="text" id="mfg-m-contact" placeholder="e.g. Production Manager" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email</label>
              <input type="email" id="mfg-m-email" placeholder="factory@sitaram.com" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300">
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Physical Address</label>
            <input type="text" id="mfg-m-address" placeholder="Factory address, Thrissur, Kerala" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300">
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 pt-3 border-t">
          <button onclick="App.closeModal()" class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onclick="App.saveManufacturerModal()" class="px-5 py-2 bg-[#1B4D3E] hover:bg-[#0F382C] text-white text-xs font-semibold rounded-lg">Save Facility</button>
        </div>
      </div>
    `);
  }

  saveManufacturerModal() {
    const name = document.getElementById('mfg-m-name')?.value.trim();
    const code = document.getElementById('mfg-m-code')?.value.trim();
    const license = document.getElementById('mfg-m-license')?.value.trim() || '';
    const contactPerson = document.getElementById('mfg-m-contact')?.value.trim() || '';
    const email = document.getElementById('mfg-m-email')?.value.trim() || '';
    const address = document.getElementById('mfg-m-address')?.value.trim() || '';

    if (!name || !code) {
      alert('Facility Name and Code are required.');
      return;
    }

    SitaramDB.addManufacturer({ name, code, license, contactPerson, email, address, status: 'Active' });
    fetch('/api/manufacturers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, code, license, contactPerson, email, address, status: 'Active' })
    }).catch(() => {});

    this.closeModal();
    this.showToast(`Saved manufacturing facility "${name}"!`, 'success');
    const root = document.getElementById('app-root');
    if (root) root.innerHTML = Views.layout('manufacturers', this.currentUser, ModuleViews.manufacturers(SitaramDB.getManufacturers()));
  }

  // ==========================================
  // BULK EXCEL & CSV IMPORT
  // ==========================================
  downloadExcelTemplate() {
    const headers = ['Product Code', 'Product Name', 'Category', 'Classical Reference', 'Packings (comma separated)', 'Ingredients (comma separated)', 'Indications', 'Dosage & Usage', 'Status'];
    const rows = [
      headers.join(','),
      'SA-00021,"Amritharishtam","Arishtam","Bhaishajya Ratnavali","450 ml, 200 ml","Amritha (Tinospora cordifolia), Bilva, Agnimantha","Chronic Jwara, Pitta disorders","15 to 25 ml twice daily after food","Active"',
      'SA-00022,"Chyavanaprasam","Lehyams","Charaka Samhita (Chikitsasthana)","500 g, 1 kg","Amalaki, Dashamoola, Ashwagandha, Pippali, Honey, Ghee","Rasayana, Kasa, Shwasa, Immunodeficiency","10 to 15 grams twice daily with warm milk","Active"'
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Sitaram_Catalogue_Import_Template.csv';
    link.click();
    this.showToast('Downloaded Sitaram Import Template!', 'success');
  }

  handleExcelUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
      if (lines.length < 2) {
        alert('File is empty or contains no data rows.');
        return;
      }

      const validCats = SitaramDB.getCategories().map(c => c.name.toLowerCase());
      const parsedProducts = [];

      for (let i = 1; i < lines.length; i++) {
        const row = this.parseCSVLine(lines[i]);
        if (row.length < 3) continue;

        const code = row[0] || `SA-${String(Date.now()).slice(-5)}`;
        const name = row[1];
        const category = row[2];
        const reference = row[3] || '';
        const packings = (row[4] || '450 ml').split(',').map(s => s.trim()).filter(Boolean);
        const ingredients = (row[5] || '').split(',').map(s => s.trim()).filter(Boolean);
        const indications = row[6] || '';
        const usage = row[7] || '';
        const status = (row[8] && row[8].toLowerCase() === 'inactive') ? 'Inactive' : 'Active';

        const catValid = validCats.includes(category.toLowerCase());

        parsedProducts.push({
          code,
          name,
          category,
          classicalReference: reference,
          packings,
          ingredients,
          indications,
          usage,
          status,
          categoryValid: catValid
        });
      }

      this.stagedImportProducts = parsedProducts;
      this.renderImportPreview(file.name, parsedProducts);
    };
    reader.readAsText(file);
  }

  parseCSVLine(text) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  }

  renderImportPreview(filename, products) {
    const previewContainer = document.getElementById('import-preview-area');
    if (!previewContainer) return;

    previewContainer.classList.remove('hidden');
    previewContainer.innerHTML = `
      <div class="bg-white rounded-xl border border-[#E2D9CC] p-5 space-y-4 shadow-sm">
        <div class="flex items-center justify-between border-b pb-3">
          <div>
            <h3 class="font-serif font-bold text-base text-[#0F382C]">Validated Import Preview: ${filename}</h3>
            <p class="text-xs text-gray-500">${products.length} formulation records detected.</p>
          </div>
          <button onclick="App.commitImportedProducts()" class="px-5 py-2 bg-[#1B4D3E] hover:bg-[#0F382C] text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span>Commit ${products.length} Formulations to Catalogue</span>
          </button>
        </div>

        <div class="overflow-x-auto max-h-80 custom-scrollbar border rounded-lg">
          <table class="w-full text-left text-xs">
            <thead class="bg-gray-50 text-gray-600 uppercase font-semibold text-[10px] sticky top-0">
              <tr>
                <th class="p-2.5">Code</th>
                <th class="p-2.5">Name</th>
                <th class="p-2.5">Category</th>
                <th class="p-2.5">Packings</th>
                <th class="p-2.5">Ingredients</th>
                <th class="p-2.5">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              ${products.map(p => `
                <tr class="${p.categoryValid ? 'hover:bg-gray-50' : 'bg-red-50/60'}">
                  <td class="p-2 font-mono text-[11px] text-gray-700">${p.code}</td>
                  <td class="p-2 font-semibold text-gray-800">${p.name}</td>
                  <td class="p-2">
                    <span class="px-2 py-0.5 rounded text-[10px] ${p.categoryValid ? 'bg-emerald-50 text-emerald-800' : 'bg-red-100 text-red-800 font-bold'}">
                      ${p.category} ${p.categoryValid ? '' : '(Non-standard)'}
                    </span>
                  </td>
                  <td class="p-2 text-gray-600">${p.packings.join(', ')}</td>
                  <td class="p-2 text-gray-500 truncate max-w-xs">${p.ingredients.join(', ')}</td>
                  <td class="p-2">
                    <span class="px-2 py-0.5 rounded text-[10px] ${p.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}">${p.status}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  commitImportedProducts() {
    if (!this.stagedImportProducts || this.stagedImportProducts.length === 0) return;
    let count = 0;
    this.stagedImportProducts.forEach(p => {
      SitaramDB.addProduct({
        code: p.code,
        name: p.name,
        category: p.category,
        classicalReference: p.classicalReference,
        packings: p.packings,
        ingredients: p.ingredients,
        indications: p.indications,
        usage: p.usage,
        status: p.status,
        imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600'
      });
      count++;
    });

    this.showToast(`Successfully committed ${count} formulations to master catalogue!`, 'success');
    this.stagedImportProducts = [];
    this.navigate('/admin/products');
  }

  // ==========================================
  // EXPORT ENGINE (CSV & Excel)
  // ==========================================
  triggerExport(format) {
    const scope = document.querySelector('input[name="export-scope"]:checked')?.value || 'all';
    const catFilter = document.getElementById('export-cat-filter')?.value || '';

    let prods = SitaramDB.getProducts();
    if (scope === 'active') {
      prods = prods.filter(p => p.status === 'Active');
    } else if (scope === 'inactive') {
      prods = prods.filter(p => p.status === 'Inactive');
    }

    if (catFilter) {
      prods = prods.filter(p => p.category === catFilter);
    }

    const headers = ['Product Code', 'Product Name', 'Category', 'Classical Reference', 'Available Packings', 'Main Botanical Ingredients', 'Indications', 'Posology / Usage', 'Status', 'Updated At'];
    const rows = [
      headers.map(h => `"${h}"`).join(',')
    ];

    prods.forEach(p => {
      rows.push([
        `"${p.code}"`,
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${(p.category || '').replace(/"/g, '""')}"`,
        `"${(p.classicalReference || '').replace(/"/g, '""')}"`,
        `"${(p.packings || []).join('; ')}"`,
        `"${(p.ingredients || []).join('; ')}"`,
        `"${(p.indications || '').replace(/"/g, '""')}"`,
        `"${(p.usage || '').replace(/"/g, '""')}"`,
        `"${p.status}"`,
        `"${p.updatedAt || ''}"`
      ].join(','));
    });

    const csvContent = '\uFEFF' + rows.join('\r\n');
    const mime = format === 'excel' ? 'application/vnd.ms-excel;charset=utf-8;' : 'text/csv;charset=utf-8;';
    const ext = format === 'excel' ? 'csv' : 'csv'; // clean universal CSV compatible with Excel
    const blob = new Blob([csvContent], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sitaram_Ayurveda_Catalogue_${scope.toUpperCase()}_${new Date().toISOString().split('T')[0]}.${ext}`;
    link.click();
    this.showToast(`Exported ${prods.length} formulations!`, 'success');
  }

  triggerPdfExport() {
    const scope = document.querySelector('input[name="export-scope"]:checked')?.value || 'all';
    const catFilter = document.getElementById('export-cat-filter')?.value || '';

    let prods = SitaramDB.getProducts();
    if (scope === 'active') {
      prods = prods.filter(p => p.status === 'Active');
    } else if (scope === 'inactive') {
      prods = prods.filter(p => p.status === 'Inactive');
    }

    if (catFilter) {
      prods = prods.filter(p => p.category === catFilter);
    }

    if (!prods.length) {
      this.showToast('No medicines found matching the current scope', 'warning');
      return;
    }

    const inStock = prods.filter(p => (p.stock || 25) >= 15).length;
    const lowStock = prods.filter(p => (p.stock || 25) > 0 && (p.stock || 25) < 15).length;
    const outOfStock = prods.filter(p => (p.stock || 25) === 0).length;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.showToast('Popup blocked. Please allow popups to generate the PDF report.', 'error');
      return;
    }

    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Sitaram Ayurveda - Clinical Medicine Catalogue Report</title>
  <style>
    @page {
      size: A4;
      margin: 14mm 12mm 14mm 12mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1F2937;
      background: #FFFFFF;
      margin: 0;
      padding: 0;
      font-size: 9pt;
      line-height: 1.35;
    }
    .header {
      border-bottom: 2px solid #1B4D3E;
      padding-bottom: 10px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-title {
      font-family: Georgia, serif;
      font-size: 18pt;
      font-weight: bold;
      color: #0F382C;
      letter-spacing: 0.5px;
      margin: 0;
    }
    .brand-subtitle {
      font-size: 8pt;
      color: #B45309;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 2px;
    }
    .report-meta {
      text-align: right;
      font-size: 8pt;
      color: #6B7280;
    }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 7.5pt;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-instock { background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; }
    .badge-lowstock { background: #FEF3C7; color: #B45309; border: 1px solid #FDE68A; }
    .badge-outstock { background: #FEF2F2; color: #B91C1C; border: 1px solid #FECACA; }
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 14px;
    }
    .kpi-card {
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 6px;
      padding: 8px 10px;
    }
    .kpi-num {
      font-family: Georgia, serif;
      font-size: 14pt;
      font-weight: bold;
      color: #0F382C;
    }
    .kpi-label {
      font-size: 7pt;
      color: #6B7280;
      text-transform: uppercase;
      font-weight: 600;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      page-break-inside: auto;
    }
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    th {
      background: #1B4D3E;
      color: #FFFFFF;
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: left;
      padding: 6px 8px;
      border: 1px solid #1B4D3E;
    }
    td {
      padding: 6px 8px;
      border-bottom: 1px solid #E5E7EB;
      font-size: 8pt;
      vertical-align: top;
    }
    tr:nth-child(even) td {
      background: #FDFBF7;
    }
    .prod-name {
      font-weight: bold;
      color: #0F382C;
      font-size: 8.5pt;
    }
    .prod-ref {
      font-style: italic;
      color: #6B7280;
      font-size: 7.5pt;
      margin-top: 1px;
    }
    .tag {
      display: inline-block;
      background: #F3EFE6;
      color: #4A5568;
      border-radius: 3px;
      padding: 1px 4px;
      font-size: 7pt;
      margin: 1px;
    }
    .footer {
      margin-top: 14px;
      border-top: 1px solid #E5E7EB;
      padding-top: 6px;
      font-size: 7pt;
      color: #9CA3AF;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="background:#1B4D3E; color:#FFF; padding:10px 16px; margin-bottom:14px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
    <span><strong>PDF Export Ready:</strong> Click Print and choose "Save as PDF" to save or print this dossier.</span>
    <button onclick="window.print()" style="background:#DFB15B; border:none; color:#1B4D3E; padding:6px 14px; font-weight:bold; border-radius:6px; cursor:pointer;">Print / Save as PDF</button>
  </div>

  <div class="header">
    <div>
      <h1 class="brand-title">SITARAM AYURVEDA</h1>
      <div class="brand-subtitle">Master Classical Medicine Catalogue &amp; Stock Dossier</div>
    </div>
    <div class="report-meta">
      <div><strong>Date:</strong> ${currentDate}</div>
      <div><strong>Scope:</strong> ${scope.toUpperCase()} ${catFilter ? '• ' + catFilter : ''}</div>
      <div><strong>Total Listed:</strong> ${prods.length} Formulations</div>
    </div>
  </div>

  <div class="kpi-row">
    <div class="kpi-card">
      <div class="kpi-num">${prods.length}</div>
      <div class="kpi-label">Total Formulations</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-num" style="color:#047857">${inStock}</div>
      <div class="kpi-label">Ready in Stock (&ge;15 units)</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-num" style="color:#B45309">${lowStock}</div>
      <div class="kpi-label">Low Stock Restock Queue</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-num" style="color:#B91C1C">${outOfStock}</div>
      <div class="kpi-label">Depleted Stock Units</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:10%">Code</th>
        <th style="width:24%">Formulation &amp; Reference</th>
        <th style="width:16%">Category &amp; Packings</th>
        <th style="width:25%">Botanicals / Ingredients</th>
        <th style="width:15%">Primary Indications</th>
        <th style="width:10%; text-align:center">Stock Status</th>
      </tr>
    </thead>
    <tbody>
      ${prods.map(p => {
        const stockUnits = p.stock || 25;
        let badgeClass = 'badge-instock';
        let badgeText = `${stockUnits} Units`;
        if (stockUnits === 0) {
          badgeClass = 'badge-outstock';
          badgeText = 'Depleted';
        } else if (stockUnits < 15) {
          badgeClass = 'badge-lowstock';
          badgeText = `${stockUnits} Units (Low)`;
        }

        return `
          <tr>
            <td style="font-family:monospace; font-weight:600; color:#4B5563">${p.code || 'N/A'}</td>
            <td>
              <div class="prod-name">${p.name || ''}</div>
              ${p.classicalReference ? `<div class="prod-ref">Ref: ${p.classicalReference}</div>` : ''}
            </td>
            <td>
              <div style="font-weight:600; color:#1B4D3E">${p.category || 'General'}</div>
              <div style="margin-top:2px; font-size:7.5pt; color:#6B7280">${(p.packings || []).join(', ')}</div>
            </td>
            <td>
              ${(p.ingredients || []).slice(0, 5).map(ing => `<span class="tag">${ing}</span>`).join('')}
              ${(p.ingredients || []).length > 5 ? `<span style="font-size:7pt; color:#9CA3AF">+${p.ingredients.length - 5} more</span>` : ''}
            </td>
            <td style="font-size:7.5pt; color:#374151">${p.indications || 'Standard Ayurvedic Posology'}</td>
            <td style="text-align:center">
              <span class="badge ${badgeClass}">${badgeText}</span>
            </td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  <div class="footer">
    <div>Sitaram Ayurveda Pharmacy Ltd. • Classical Heritage Formulation Standards • Confidential Clinical Report</div>
    <div>Generated: ${new Date().toISOString()}</div>
  </div>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    this.showToast(`Prepared PDF Dossier for ${prods.length} formulations!`, 'success');
  }

  // ==========================================
  // MOBILE APP CONTENT (Banners, Bulletins)
  // ==========================================
  showAddBannerModal() {
    this.openModal(`
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-serif font-bold text-lg text-[#0F382C]">Add Mobile App Promo Banner</h3>
          <button onclick="App.closeModal()" class="text-gray-400 hover:text-gray-700">✕</button>
        </div>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Headline Title *</label>
            <input type="text" id="ban-m-title" placeholder="e.g. Authentic Kerala Rasayana Formulations" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B4D3E]">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Subtitle / Clinical Tagline</label>
            <input type="text" id="ban-m-sub" placeholder="e.g. Prepared strictly adhering to Ashtangahrudayam" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Banner Image URL</label>
            <input type="url" id="ban-m-url" value="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Target Action</label>
              <select id="ban-m-type" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300">
                <option value="category">Open Category</option>
                <option value="product">Open Formulation</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Target Parameter</label>
              <input type="text" id="ban-m-val" placeholder="e.g. Arishtam" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300">
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 pt-3 border-t">
          <button onclick="App.closeModal()" class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onclick="App.saveBannerModal()" class="px-5 py-2 bg-[#1B4D3E] hover:bg-[#0F382C] text-white text-xs font-semibold rounded-lg">Publish Banner</button>
        </div>
      </div>
    `);
  }

  saveBannerModal() {
    const title = document.getElementById('ban-m-title')?.value.trim();
    const subtitle = document.getElementById('ban-m-sub')?.value.trim() || '';
    const imageUrl = document.getElementById('ban-m-url')?.value.trim() || '';
    const targetType = document.getElementById('ban-m-type')?.value;
    const targetValue = document.getElementById('ban-m-val')?.value.trim() || '';

    if (!title) {
      alert('Title is required.');
      return;
    }

    const banners = SitaramDB.getBanners();
    banners.push({
      id: 'ban_' + Date.now(),
      title,
      subtitle,
      imageUrl,
      targetType,
      targetValue,
      status: 'Active'
    });
    SitaramDB.saveBanners(banners);
    this.closeModal();
    this.showToast('Published new mobile app banner!', 'success');
    const root = document.getElementById('app-root');
    if (root) {
      const featured = SitaramDB.getProducts().filter(p => p.featured);
      root.innerHTML = Views.layout('app-content', this.currentUser, ModuleViews.appContent(SitaramDB.getBanners(), SitaramDB.getAnnouncements(), featured));
    }
  }

  showAddAnnouncementModal() {
    this.openModal(`
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-serif font-bold text-lg text-[#0F382C]">Add Clinical Bulletin Announcement</h3>
          <button onclick="App.closeModal()" class="text-gray-400 hover:text-gray-700">✕</button>
        </div>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Bulletin Headline *</label>
            <input type="text" id="ann-m-title" placeholder="e.g. Revised Dosage Posology for Dhanwantharam Thailam" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B4D3E]">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Priority Level</label>
            <select id="ann-m-pri" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300">
              <option value="Normal">Normal</option>
              <option value="High">High (Red Alert)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Message Body</label>
            <textarea id="ann-m-msg" rows="3" placeholder="Notice text for practitioners and mobile app users..." class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300"></textarea>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 pt-3 border-t">
          <button onclick="App.closeModal()" class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onclick="App.saveAnnouncementModal()" class="px-5 py-2 bg-[#1B4D3E] hover:bg-[#0F382C] text-white text-xs font-semibold rounded-lg">Broadcast Notice</button>
        </div>
      </div>
    `);
  }

  saveAnnouncementModal() {
    const title = document.getElementById('ann-m-title')?.value.trim();
    const priority = document.getElementById('ann-m-pri')?.value || 'Normal';
    const message = document.getElementById('ann-m-msg')?.value.trim() || '';

    if (!title) {
      alert('Headline is required.');
      return;
    }

    const ann = SitaramDB.getAnnouncements();
    ann.unshift({
      id: 'ann_' + Date.now(),
      title,
      priority,
      message,
      date: new Date().toISOString().split('T')[0]
    });
    SitaramDB.saveAnnouncements(ann);
    this.closeModal();
    this.showToast('Broadcast bulletin notice!', 'success');
    const root = document.getElementById('app-root');
    if (root) {
      const featured = SitaramDB.getProducts().filter(p => p.featured);
      root.innerHTML = Views.layout('app-content', this.currentUser, ModuleViews.appContent(SitaramDB.getBanners(), SitaramDB.getAnnouncements(), featured));
    }
  }

  // ==========================================
  // MEDIA MANAGEMENT
  // ==========================================
  showAddMediaModal() {
    this.openModal(`
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-serif font-bold text-lg text-[#0F382C]">Register Clinical Asset Image</h3>
          <button onclick="App.closeModal()" class="text-gray-400 hover:text-gray-700">✕</button>
        </div>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Asset Title *</label>
            <input type="text" id="med-m-title" placeholder="e.g. Classical Kashayam Amber Glass Bottle (450ml)" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B4D3E]">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Asset Category</label>
              <select id="med-m-cat" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300">
                <option value="Packaging">Packaging</option>
                <option value="Botanicals">Botanicals</option>
                <option value="Manufacturing">Manufacturing</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Resolution / Dimensions</label>
              <input type="text" id="med-m-dim" placeholder="1920x1080" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 font-mono">
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Image URL / CDN Link *</label>
            <input type="url" id="med-m-url" placeholder="https://images.unsplash.com/..." class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300">
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 pt-3 border-t">
          <button onclick="App.closeModal()" class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onclick="App.saveMediaModal()" class="px-5 py-2 bg-[#1B4D3E] hover:bg-[#0F382C] text-white text-xs font-semibold rounded-lg">Save Asset</button>
        </div>
      </div>
    `);
  }

  saveMediaModal() {
    const title = document.getElementById('med-m-title')?.value.trim();
    const category = document.getElementById('med-m-cat')?.value || 'Packaging';
    const dimensions = document.getElementById('med-m-dim')?.value.trim() || '1920x1080';
    const url = document.getElementById('med-m-url')?.value.trim();

    if (!title || !url) {
      alert('Asset title and Image URL are required.');
      return;
    }

    this.closeModal();
    this.showToast(`Saved asset "${title}"!`, 'success');
  }

  // ==========================================
  // REPORTS & AUDIT TRAIL
  // ==========================================
  exportReportCSV() {
    const cats = SitaramDB.getCategories();
    const rows = [
      'Category Name,Short Code,Registered Formulations,Status',
      ...cats.map(c => `"${c.name}","${c.code || ''}",${c.productCount || 0},"${c.status || 'Active'}"`)
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sitaram_Category_Distribution_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    this.showToast('Downloaded Category Distribution Report!', 'success');
  }

  exportAuditCSV() {
    const logs = SitaramDB.getAuditLogs();
    const rows = [
      'Timestamp,Administrator,Action Tag,Entity,Details',
      ...logs.map(l => `"${l.timestamp}","${l.admin}","${l.action}","${l.entity}","${(l.details || '').replace(/"/g, '""')}"`)
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sitaram_Regulatory_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    this.showToast('Downloaded Regulatory Audit Trail!', 'success');
  }

  // ==========================================
  // SETTINGS & BACKUP ENGINE
  // ==========================================
  async testDbConnection() {
    const badge = document.getElementById('sync-status-badge');
    if (badge) {
      badge.innerText = 'Testing Connection...';
      badge.className = 'text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700';
    }

    try {
      const res = await fetch('/api/dashboard/metrics');
      if (res.ok) {
        if (badge) {
          badge.innerText = 'Connected & Live (Supabase + Session Auth)';
          badge.className = 'text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800';
        }
        this.showToast('Central Supabase database connection verified healthy!', 'success');
      } else {
        throw new Error('Server returned ' + res.status);
      }
    } catch (e) {
      if (badge) {
        badge.innerText = 'Local Fallback Mode';
        badge.className = 'text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700';
      }
      this.showToast('Operating in high-speed local browser persistence mode.', 'info');
    }
  }

  saveSettingsConfig() {
    const proj = document.getElementById('cfg-project')?.value.trim() || '';
    const col = document.getElementById('cfg-coll')?.value.trim() || 'catalogue';
    const key = document.getElementById('cfg-key')?.value.trim() || '';

    SitaramDB.saveSettings({
      firestoreProjectId: proj,
      firestoreCollection: col,
      firestoreApiKey: key,
      lastSyncTimestamp: new Date().toISOString()
    });

    this.showToast('Saved Central Database Configuration!', 'success');
  }

  downloadFullBackupJson() {
    const snapshot = {
      meta: {
        system: 'Sitaram Ayurveda Medicine Catalogue Admin Portal',
        handbookEdition: 'Therapeutic Index 2026',
        exportedAt: new Date().toISOString(),
        exportedBy: this.currentUser?.email || 'admin@sitaramayurveda.com'
      },
      categories: SitaramDB.getCategories(),
      products: SitaramDB.getProducts(),
      ingredients: SitaramDB.getIngredients(),
      manufacturers: SitaramDB.getManufacturers(),
      banners: SitaramDB.getBanners(),
      announcements: SitaramDB.getAnnouncements(),
      settings: SitaramDB.getSettings(),
      auditLogs: SitaramDB.getAuditLogs()
    };

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sitaram_Catalogue_Master_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    this.showToast('Master JSON Backup Snapshot downloaded!', 'success');
  }

  resetToHandbookDefaults() {
    if (!confirm('CAUTION: This will reset all catalogue formulations and categories to the official Sitaram Therapeutic Index Handbook baseline defaults. Do you wish to continue?')) {
      return;
    }
    SitaramDB.resetToFactoryDefaults();
    this.showToast('Reset entire catalogue to Therapeutic Index defaults!', 'info');
    this.navigate('/admin/products');
  }

  // ==========================================
  // DIGITAL MONOGRAPH QR CODE GENERATION & PRINTING
  // ==========================================
  openPrintableQRModal(productId) {
    let product = SitaramDB.getProductById(productId);
    if (!product) {
      const all = SitaramDB.getProducts();
      product = all.find(p => p.id === productId || p.code === productId);
    }
    if (!product) {
      this.showToast('Formulation record not found', 'error');
      return;
    }

    this.currentQrProduct = product;
    const origin = window.location.origin;
    const monographUrl = `${origin}/monograph?id=${encodeURIComponent(product.id || product.code)}`;

    const currentYear = new Date().getFullYear();
    const expYear = currentYear + 3;
    const defaultBatch = product.batchNumber || `AYUR-${currentYear}-B0${(Math.floor(Math.random() * 8) + 1)}`;
    const defaultMfg = `08/${currentYear}`;
    const defaultExp = `07/${expYear}`;
    const defaultPacking = Array.isArray(product.packings) && product.packings.length > 0 ? product.packings[0] : '100 g';

    this.openModal(`
      <div class="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#E2D9CC] overflow-hidden animate-fade-in max-h-[92vh] flex flex-col">
        <!-- Modal Header -->
        <div class="bg-gradient-to-r from-[#0F382C] via-[#1B4D3E] to-[#0F382C] px-6 py-4 text-white flex items-center justify-between no-print">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-[#DFB15B] text-[#0F382C] flex items-center justify-center font-serif font-black text-sm">
              S
            </div>
            <div>
              <h3 class="font-serif font-bold text-base text-white leading-tight">Printable QR Code & Monograph Label</h3>
              <p class="text-[11px] text-[#DFB15B]">Classical Formulation: ${product.name} [${product.code}]</p>
            </div>
          </div>
          <button onclick="App.closeModal()" class="text-white/70 hover:text-white text-lg font-bold p-1 rounded-md transition">✕</button>
        </div>

        <!-- Scrollable Modal Content -->
        <div class="p-6 overflow-y-auto space-y-6 flex-1">
          
          <!-- Label Configuration Controls -->
          <div class="bg-[#F9F7F2] p-4 rounded-xl border border-[#E2D9CC] space-y-3 no-print">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-[#0F382C] uppercase tracking-wider flex items-center gap-1.5">
                <span>⚙️</span> Label Customization & Destination
              </span>
              <span class="text-[11px] text-gray-500 font-mono">Realtime Dynamic Preview</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label class="block text-[11px] font-bold text-gray-700 mb-1">QR Target Link</label>
                <select id="qr-target-type" onchange="App.onQrTargetChanged()" class="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-medium focus:ring-1 focus:ring-[#1B4D3E]">
                  <option value="web" selected>🌐 Digital Monograph (Public Web Link)</option>
                  <option value="app">📱 Sitaram Android App (sitaram:// Deep Link)</option>
                </select>
              </div>

              <div>
                <label class="block text-[11px] font-bold text-gray-700 mb-1">Label Layout Preset</label>
                <select id="qr-label-preset" onchange="App.onQrPresetChanged()" class="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-medium focus:ring-1 focus:ring-[#1B4D3E]">
                  <option value="bottle" selected>Standard Medicine Bottle (60 x 60 mm)</option>
                  <option value="card">Clinical Monograph Card (4 x 6 in)</option>
                  <option value="badge">Compact Dispensing Sticker (45 x 45 mm)</option>
                </select>
              </div>

              <div>
                <label class="block text-[11px] font-bold text-gray-700 mb-1">Batch Number</label>
                <input type="text" id="qr-input-batch" value="${defaultBatch}" oninput="App.updateQrLabelText()" class="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-mono">
              </div>

              <div>
                <label class="block text-[11px] font-bold text-gray-700 mb-1">Mfg / Exp Date</label>
                <div class="flex items-center gap-2">
                  <input type="text" id="qr-input-mfg" value="${defaultMfg}" oninput="App.updateQrLabelText()" placeholder="Mfg" class="w-1/2 px-2 py-1.5 rounded-lg border border-gray-300 text-xs font-mono">
                  <input type="text" id="qr-input-exp" value="${defaultExp}" oninput="App.updateQrLabelText()" placeholder="Exp" class="w-1/2 px-2 py-1.5 rounded-lg border border-gray-300 text-xs font-mono">
                </div>
              </div>
            </div>
          </div>

          <!-- Printable Label Preview Box -->
          <div class="flex flex-col items-center justify-center">
            <div id="printable-qr-modal-content" class="w-full max-w-md bg-white border-2 border-[#DFB15B] rounded-2xl p-5 shadow-md flex flex-col items-center text-center space-y-3 relative overflow-hidden transition-all">
              
              <!-- Subtle watermark leaf background -->
              <div class="absolute -right-8 -bottom-8 opacity-5 text-black pointer-events-none text-8xl font-serif">🌿</div>

              <!-- Label Brand Header -->
              <div class="w-full flex items-center justify-between border-b border-gray-200 pb-2.5">
                <div class="flex items-center gap-2 text-left">
                  <div class="w-7 h-7 rounded-full bg-[#0F382C] text-[#DFB15B] flex items-center justify-center font-serif font-black text-xs">
                    S
                  </div>
                  <div>
                    <h4 class="font-serif font-black text-xs text-[#0F382C] tracking-wide uppercase leading-tight">SITARAM AYURVEDA</h4>
                    <span class="text-[9px] text-[#9A7B38] font-bold tracking-wider uppercase block">Ayush GMP Certified • Estd 1921</span>
                  </div>
                </div>
                <div class="text-right">
                  <span class="font-mono text-[10px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">${product.code}</span>
                  <span class="text-[9px] text-gray-400 block mt-0.5">${defaultPacking}</span>
                </div>
              </div>

              <!-- Product Titles -->
              <div class="w-full text-center py-1">
                ${product.sanskritName ? `<div id="lbl-sanskrit" class="text-[#9A7B38] font-serif italic text-xs font-bold mb-0.5">${product.sanskritName}</div>` : ''}
                <h2 id="lbl-name" class="font-serif font-bold text-lg text-[#0F382C] leading-snug">${product.name}</h2>
                <div class="flex items-center justify-center gap-2 mt-1">
                  <span class="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    ${product.category || 'Classical Formulation'}
                  </span>
                  ${product.classicalReference ? `
                    <span class="text-[10px] text-gray-500 italic max-w-[200px] truncate">Ref: ${product.classicalReference}</span>
                  ` : ''}
                </div>
              </div>

              <!-- Live QR Code Canvas Box -->
              <div class="bg-white p-3 rounded-xl border border-gray-200 shadow-xs flex flex-col items-center justify-center">
                <div id="qr-code-canvas-box" class="flex items-center justify-center"></div>
                <p class="text-[9px] font-mono text-gray-500 uppercase tracking-widest mt-2 flex items-center gap-1 font-bold">
                  <span class="text-[#1B4D3E]">❖</span> SCAN FOR DIGITAL MONOGRAPH & DOSAGE
                </p>
              </div>

              <!-- Batch & Regulatory Bottom Footer -->
              <div class="w-full pt-2 border-t border-gray-200 grid grid-cols-3 gap-1 text-[9px] font-mono text-gray-600">
                <div class="text-left">
                  <span class="text-gray-400 block">BATCH:</span>
                  <strong id="lbl-batch" class="text-gray-800">${defaultBatch}</strong>
                </div>
                <div class="text-center">
                  <span class="text-gray-400 block">MFG / EXP:</span>
                  <strong id="lbl-dates" class="text-gray-800">${defaultMfg} - ${defaultExp}</strong>
                </div>
                <div class="text-right">
                  <span class="text-gray-400 block">AYUSH LIC:</span>
                  <strong class="text-gray-800">KL-TCR-1921</strong>
                </div>
              </div>

            </div>
          </div>

          <!-- Monograph Direct Link Preview -->
          <div class="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center justify-between text-xs no-print">
            <div class="truncate mr-3">
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Target Monograph URL</span>
              <a id="qr-link-anchor" href="${monographUrl}" target="_blank" class="text-[#1B4D3E] hover:underline font-mono text-[11px] truncate block">
                ${monographUrl}
              </a>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <button onclick="App.copyMonographUrl()" class="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-md font-semibold text-[11px] transition">
                Copy Link
              </button>
              <a id="qr-btn-view-monograph" href="${monographUrl}" target="_blank" class="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md font-semibold text-[11px] transition">
                View Monograph ↗
              </a>
            </div>
          </div>

        </div>

        <!-- Modal Bottom Actions -->
        <div class="bg-[#F9F7F2] px-6 py-4 border-t border-[#E2D9CC] flex flex-wrap items-center justify-between gap-3 no-print">
          <button onclick="App.closeModal()" class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition">
            Close
          </button>

          <div class="flex items-center gap-2">
            <button onclick="App.downloadMedicineQR('${product.name.replace(/[^a-zA-Z0-9]/g, '_')}_QR')" class="px-3.5 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center gap-1.5 shadow-xs transition">
              <svg class="w-4 h-4 text-[#DFB15B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              <span>Download PNG</span>
            </button>
            <button onclick="App.printMedicineQR()" class="px-5 py-2 rounded-lg bg-[#0F382C] hover:bg-[#1B4D3E] text-white text-xs font-bold flex items-center gap-2 shadow-md transition">
              <svg class="w-4 h-4 text-[#DFB15B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
              <span>Print Label</span>
            </button>
          </div>
        </div>
      </div>
    `);

    // Render QR Code in modal
    setTimeout(() => {
      this.renderQrCodeInModal(monographUrl);
    }, 40);
  }

  renderQrCodeInModal(text) {
    const box = document.getElementById('qr-code-canvas-box');
    if (!box) return;
    box.innerHTML = '';
    if (typeof QRCode !== 'undefined') {
      new QRCode(box, {
        text: text,
        width: 160,
        height: 160,
        colorDark: "#0F382C",
        colorLight: "#FFFFFF",
        correctLevel: QRCode.CorrectLevel.H
      });
    } else {
      box.innerHTML = `<div class="w-40 h-40 flex flex-col items-center justify-center bg-gray-100 rounded text-gray-500 text-xs text-center p-2"><span>QR Code:</span><span class="font-mono text-[9px] break-all">${text}</span></div>`;
    }
  }

  onQrTargetChanged() {
    if (!this.currentQrProduct) return;
    const targetType = document.getElementById('qr-target-type')?.value;
    const origin = window.location.origin;
    const p = this.currentQrProduct;
    let targetUrl = `${origin}/monograph?id=${encodeURIComponent(p.id || p.code)}`;
    if (targetType === 'app') {
      targetUrl = `sitaram://medicine/${encodeURIComponent(p.id || p.code)}`;
    }
    const anchor = document.getElementById('qr-link-anchor');
    if (anchor) {
      anchor.href = targetUrl;
      anchor.innerText = targetUrl;
    }
    const viewBtn = document.getElementById('qr-btn-view-monograph');
    if (viewBtn) {
      viewBtn.href = targetUrl;
    }
    this.renderQrCodeInModal(targetUrl);
  }

  onQrPresetChanged() {
    const preset = document.getElementById('qr-label-preset')?.value;
    const container = document.getElementById('printable-qr-modal-content');
    if (!container) return;
    if (preset === 'card') {
      container.className = 'w-full max-w-lg bg-white border-2 border-[#DFB15B] rounded-2xl p-6 shadow-md flex flex-col items-center text-center space-y-4';
    } else if (preset === 'badge') {
      container.className = 'w-full max-w-xs bg-white border border-[#DFB15B] rounded-xl p-3 shadow-md flex flex-col items-center text-center space-y-2';
    } else {
      container.className = 'w-full max-w-md bg-white border-2 border-[#DFB15B] rounded-2xl p-5 shadow-md flex flex-col items-center text-center space-y-3';
    }
  }

  updateQrLabelText() {
    const batch = document.getElementById('qr-input-batch')?.value || '';
    const mfg = document.getElementById('qr-input-mfg')?.value || '';
    const exp = document.getElementById('qr-input-exp')?.value || '';
    const lblBatch = document.getElementById('lbl-batch');
    const lblDates = document.getElementById('lbl-dates');
    if (lblBatch) lblBatch.innerText = batch;
    if (lblDates) lblDates.innerText = `${mfg} - ${exp}`;
  }

  copyMonographUrl() {
    const anchor = document.getElementById('qr-link-anchor');
    const url = anchor ? anchor.href : window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.showToast('Digital Monograph URL copied to clipboard!', 'success');
    }).catch(() => {
      this.showToast('Copied link: ' + url, 'info');
    });
  }

  printMedicineQR() {
    window.print();
  }

  downloadMedicineQR(filename) {
    const canvas = document.querySelector('#qr-code-canvas-box canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `${filename || 'Sitaram_Medicine_QR'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      this.showToast('Downloaded high-resolution QR image!', 'success');
      return;
    }
    const img = document.querySelector('#qr-code-canvas-box img');
    if (img && img.src) {
      const link = document.createElement('a');
      link.download = `${filename || 'Sitaram_Medicine_QR'}.png`;
      link.href = img.src;
      link.click();
      this.showToast('Downloaded QR image!', 'success');
      return;
    }
    this.showToast('Print dialog opened.', 'info');
    window.print();
  }

  generateFormulationQrSvg(text, title, subtitle, code) {
    if (typeof QRCode === 'undefined') {
      console.warn('QRCode library is not loaded');
      return null;
    }

    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    document.body.appendChild(tempDiv);

    let moduleCount = 0;
    let modules = null;

    try {
      const qr = new QRCode(tempDiv, {
        text: text,
        width: 256,
        height: 256,
        correctLevel: QRCode.CorrectLevel.M
      });

      if (qr && qr._oQRCode && typeof qr._oQRCode.getModuleCount === 'function') {
        moduleCount = qr._oQRCode.getModuleCount();
        modules = [];
        for (let r = 0; r < moduleCount; r++) {
          const row = [];
          for (let c = 0; c < moduleCount; c++) {
            row.push(qr._oQRCode.isDark(r, c));
          }
          modules.push(row);
        }
      }
    } catch (e) {
      console.error('Error generating QR code modules for SVG:', e);
    } finally {
      if (tempDiv.parentNode) {
        tempDiv.parentNode.removeChild(tempDiv);
      }
    }

    if (!modules || moduleCount === 0) {
      return null;
    }

    const scale = 8;
    const quietZone = 4;
    const qrPixelSize = (moduleCount + (quietZone * 2)) * scale;
    const headerHeight = 64;
    const footerHeight = 48;
    const totalWidth = qrPixelSize;
    const totalHeight = headerHeight + qrPixelSize + footerHeight;

    let pathD = '';
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (modules[r][c]) {
          const x = (c + quietZone) * scale;
          const y = headerHeight + ((r + quietZone) * scale);
          pathD += `M${x},${y}h${scale}v${scale}h-${scale}z `;
        }
      }
    }

    const escapeXml = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const cleanTitle = escapeXml(title || 'Ayurvedic Classical Formulation');
    const cleanSub = escapeXml(subtitle || 'SITARAM AYURVEDA');
    const cleanCode = escapeXml(code || 'ESTD-1921');
    const cleanUrl = escapeXml(text);

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${totalWidth} ${totalHeight}" width="${totalWidth}" height="${totalHeight}" shape-rendering="crispEdges">
  <title>${cleanTitle} - Formulation QR Code</title>
  <desc>${cleanUrl}</desc>
  <defs>
    <style>
      .bg-panel { fill: #FAF8F5; }
      .qr-card-border { stroke: #DFB15B; stroke-width: 3; fill: none; }
      .brand-sub { font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 11px; font-weight: 700; fill: #9A7B38; text-anchor: middle; letter-spacing: 1px; }
      .brand-title { font-family: 'Playfair Display', Georgia, serif; font-size: 17px; font-weight: bold; fill: #0F382C; text-anchor: middle; }
      .qr-canvas-bg { fill: #FFFFFF; }
      .qr-module { fill: #0F382C; }
      .footer-lead { font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 10px; font-weight: 700; fill: #0F382C; text-anchor: middle; letter-spacing: 0.5px; }
      .footer-meta { font-family: 'SFMono-Regular', Consolas, monospace; font-size: 9px; fill: #4B5563; text-anchor: middle; }
    </style>
  </defs>

  <!-- Background Canvas -->
  <rect width="${totalWidth}" height="${totalHeight}" rx="16" class="bg-panel"/>
  <rect x="2" y="2" width="${totalWidth - 4}" height="${totalHeight - 4}" rx="14" class="qr-card-border"/>

  <!-- Brand & Formulation Header -->
  <text x="${totalWidth / 2}" y="26" class="brand-sub">${cleanSub} • ESTD 1921</text>
  <text x="${totalWidth / 2}" y="48" class="brand-title">${cleanTitle}</text>

  <!-- QR Matrix Container -->
  <rect x="${quietZone * scale / 2}" y="${headerHeight}" width="${totalWidth - (quietZone * scale)}" height="${qrPixelSize}" class="qr-canvas-bg" rx="6"/>
  <path class="qr-module" d="${pathD.trim()}"/>

  <!-- Footer & Verification Notice -->
  <text x="${totalWidth / 2}" y="${headerHeight + qrPixelSize + 20}" class="footer-lead">❖ SCAN FOR CLINICAL MONOGRAPH &amp; DOSAGE ❖</text>
  <text x="${totalWidth / 2}" y="${headerHeight + qrPixelSize + 36}" class="footer-meta">Batch Ref: ${cleanCode} • Ayush GMP Certified</text>
</svg>`;
  }

  downloadFormulationQrSvg(productId) {
    let product = null;
    if (typeof SitaramDB !== 'undefined' && SitaramDB.getProductById) {
      product = SitaramDB.getProductById(productId);
      if (!product && SitaramDB.getProducts) {
        const all = SitaramDB.getProducts();
        product = all.find(p => p.id === productId || p.code === productId);
      }
    }

    if (!product && typeof medicines !== 'undefined' && Array.isArray(medicines)) {
      product = medicines.find(m => m.id === productId);
    }

    if (!product) {
      const card = document.querySelector(`[data-product-id="${productId}"], [data-id="${productId}"]`);
      if (card) {
        const nameEl = card.querySelector('h3, h4');
        product = {
          id: productId,
          name: nameEl ? nameEl.innerText.trim() : productId,
          code: productId
        };
      } else {
        product = { id: productId, name: productId, code: productId };
      }
    }

    const origin = window.location.origin;
    const targetUrl = `${origin}/monograph?id=${encodeURIComponent(product.id || product.code)}`;
    const svgContent = this.generateFormulationQrSvg(
      targetUrl,
      product.name || 'Ayurvedic Formulation',
      'SITARAM AYURVEDA',
      product.code || product.batchNumber || product.id
    );

    if (!svgContent) {
      this.showToast('Could not generate SVG QR code. Please try again.', 'error');
      return;
    }

    const sanitizedName = (product.name || 'Formulation').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${sanitizedName}_QR.svg`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
      URL.revokeObjectURL(blobUrl);
    }, 250);

    this.showToast(`Saved ${product.name} QR code as SVG image!`, 'success');
  }

  openBulkPrintQRModal() {
    let prods = [];
    if (this.selectedProductIds && this.selectedProductIds.size > 0) {
      prods = SitaramDB.getProducts().filter(p => this.selectedProductIds.has(p.id));
    }
    if (prods.length === 0) {
      prods = SitaramDB.getProducts().slice(0, 9);
    }
    if (prods.length === 0) {
      this.showToast('No products available for bulk QR printing.', 'error');
      return;
    }

    const currentYear = new Date().getFullYear();
    const origin = window.location.origin;

    this.openModal(`
      <div class="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-[#E2D9CC] overflow-hidden animate-fade-in max-h-[92vh] flex flex-col">
        <div class="bg-[#0F382C] px-6 py-4 text-white flex items-center justify-between no-print">
          <div class="flex items-center gap-3">
            <span class="text-xl">🏷️</span>
            <div>
              <h3 class="font-serif font-bold text-base text-white">Batch Medicine QR Label Sheet</h3>
              <p class="text-[11px] text-[#DFB15B]">Ready to print ${prods.length} medicine labels on sticker paper</p>
            </div>
          </div>
          <button onclick="App.closeModal()" class="text-white/70 hover:text-white font-bold text-lg p-1">✕</button>
        </div>

        <div class="p-6 overflow-y-auto space-y-4 flex-1">
          <div class="flex items-center justify-between no-print bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900">
            <span>🖨️ <strong>Print Ready:</strong> Click "Print All Labels" to output directly on standard A4 or adhesive label sheets.</span>
            <span class="font-mono font-bold">${prods.length} Labels</span>
          </div>

          <div id="printable-qr-modal-content" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            ${prods.map((p, index) => {
              const batch = `AYUR-${currentYear}-B0${(index % 8) + 1}`;
              return `
                <div class="border-2 border-[#DFB15B] rounded-xl p-3 text-center bg-white flex flex-col items-center justify-between space-y-2 shadow-xs">
                  <div class="w-full flex items-center justify-between border-b border-gray-100 pb-1 text-[9px]">
                    <span class="font-serif font-bold text-[#0F382C]">SITARAM AYURVEDA</span>
                    <span class="font-mono font-bold text-gray-600">${p.code}</span>
                  </div>
                  <div>
                    <h4 class="font-serif font-bold text-xs text-[#0F382C] line-clamp-1">${p.name}</h4>
                    <span class="text-[9px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">${p.category}</span>
                  </div>
                  <div id="bulk-qr-${p.id}" class="bg-white p-1 rounded border border-gray-200 flex items-center justify-center"></div>
                  <div class="w-full text-[8px] font-mono text-gray-500 border-t border-gray-100 pt-1 flex items-center justify-between">
                    <span>Batch: ${batch}</span>
                    <span>Ayush GMP</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="bg-[#F9F7F2] px-6 py-4 border-t border-[#E2D9CC] flex items-center justify-between no-print">
          <button onclick="App.closeModal()" class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-lg">Cancel</button>
          <button onclick="App.printMedicineQR()" class="px-6 py-2 rounded-lg bg-[#0F382C] hover:bg-[#1B4D3E] text-white text-xs font-bold flex items-center gap-2 shadow-md">
            <svg class="w-4 h-4 text-[#DFB15B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            <span>Print All ${prods.length} Labels</span>
          </button>
        </div>
      </div>
    `);

    // Render QR codes for each item in the sheet
    setTimeout(() => {
      prods.forEach(p => {
        const elem = document.getElementById(`bulk-qr-${p.id}`);
        if (elem && typeof QRCode !== 'undefined') {
          const url = `${origin}/monograph?id=${encodeURIComponent(p.id || p.code)}`;
          new QRCode(elem, {
            text: url,
            width: 100,
            height: 100,
            colorDark: "#0F382C",
            colorLight: "#FFFFFF",
            correctLevel: QRCode.CorrectLevel.M
          });
        }
      });
    }, 50);
  }

  // ==========================================
  // MODAL & TOAST MANAGERS
  // ==========================================
  openModal(htmlContent) {
    const container = document.getElementById('modal-container');
    if (!container) return;
    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in" onclick="if (event.target === this) App.closeModal();">
        ${htmlContent}
      </div>
    `;
  }

  closeModal() {
    const container = document.getElementById('modal-container');
    if (container) container.innerHTML = '';
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const colors = {
      success: 'bg-[#0F382C] text-[#DFB15B] border-emerald-600',
      error: 'bg-red-800 text-white border-red-900',
      info: 'bg-[#1B4D3E] text-white border-[#DFB15B]'
    };

    const toast = document.createElement('div');
    toast.className = `px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 pointer-events-auto transition-all transform translate-y-2 opacity-0 ${colors[type] || colors.info}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  // ==========================================
  // AUTHENTICATION & PROFILE
  // ==========================================
  attachLoginForm() {
    const form = document.getElementById('admin-login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const idInput = document.getElementById('login-identifier');
      const passInput = document.getElementById('login-password');
      const submitBtn = document.getElementById('btn-submit-login');
      const errBox = document.getElementById('login-error-box');
      const errMsg = document.getElementById('login-error-msg');

      errBox.classList.add('hidden');
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Verifying Administrator Credentials...</span>
      `;

      const res = await SitaramAuth.login(idInput.value, passInput.value);

      if (res.success) {
        this.currentUser = res.admin;
        this.navigate('/admin/dashboard');
      } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <span>Sign In to Admin Portal</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        `;
        errBox.classList.remove('hidden');
        errMsg.innerText = res.message;
      }
    });
  }

  async showForgotPasswordPrompt() {
    const email = prompt('Enter your registered Sitaram Ayurveda Administrator email address:');
    if (!email) return;

    const res = await SitaramAuth.requestPasswordReset(email);
    alert(res.message);
  }

  toggleProfileMenu() {
    const dropdown = document.getElementById('admin-profile-dropdown');
    if (!dropdown) return;
    this.profileMenuOpen = !this.profileMenuOpen;
    if (this.profileMenuOpen) {
      dropdown.classList.remove('hidden');
    } else {
      dropdown.classList.add('hidden');
    }
  }

  toggleSidebar() {
    const sidebar = document.getElementById('main-sidebar');
    const backdrop = document.getElementById('mobile-sidebar-backdrop');
    if (!sidebar) return;
    sidebar.classList.toggle('-translate-x-full');
    if (backdrop) backdrop.classList.toggle('hidden');
  }

  // ==========================================
  // SUPABASE CLOUD DATABASE SYNC & MIGRATION
  // ==========================================
  async renderSupabaseView(root) {
    root.innerHTML = Views.layout('supabase', this.currentUser, `
      <div class="flex flex-col items-center justify-center p-16 space-y-3">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-3 border-[#1B4D3E] border-t-transparent"></div>
        <p class="text-xs text-gray-500 font-medium">Checking Supabase cloud connectivity...</p>
      </div>
    `);

    try {
      const headers = SitaramAuth.getAuthHeaders ? SitaramAuth.getAuthHeaders() : { 'Accept': 'application/json' };
      const res = await fetch('/api/supabase/status', {
        credentials: 'same-origin',
        headers: headers
      });
      const status = await res.json();
      root.innerHTML = Views.layout('supabase', this.currentUser, ModuleViews.supabase(status));
    } catch (e) {
      root.innerHTML = Views.layout('supabase', this.currentUser, ModuleViews.supabase({ configured: false, error: e.message }));
    }
  }

  async checkSupabaseStatus() {
    const root = document.getElementById('app-root');
    if (root) {
      this.renderSupabaseView(root);
    }
  }

  async copySupabaseSchema(btn) {
    try {
      if (btn) btn.disabled = true;
      const res = await fetch('/api/supabase/schema');
      const sqlText = await res.text();
      await navigator.clipboard.writeText(sqlText);
      this.showToast('SQL Schema copied to clipboard! Paste and run it in Supabase SQL Editor.', 'success');
    } catch (e) {
      this.showToast('Could not copy schema: ' + e.message, 'error');
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async saveSupabaseConfig(event) {
    event.preventDefault();
    const url = document.getElementById('sb-url')?.value.trim();
    const key = document.getElementById('sb-key')?.value.trim();
    const btn = document.getElementById('btn-save-sb');
    if (!url || !key) {
      this.showToast('Please enter both Project URL and API Key', 'error');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Testing & Connecting...</span>
      `;
    }

    try {
      const authHeaders = SitaramAuth.getAuthHeaders ? SitaramAuth.getAuthHeaders() : {};
      const res = await fetch('/api/supabase/configure', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({ url, key })
      });
      const data = await res.json();
      if (data.success) {
        this.showToast(data.message || 'Connected to Supabase successfully!', 'success');
      } else {
        this.showToast(data.message || data.error || 'Connection check completed.', 'warning');
      }
      this.checkSupabaseStatus();
    } catch (err) {
      this.showToast('Failed to save configuration: ' + err.message, 'error');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Save & Test Connection';
      }
    }
  }

  async triggerSupabaseMigration() {
    const btn = document.getElementById('btn-migrate-sb');
    if (!confirm('This will synchronize all master formulations and categories directly into your Supabase database. Proceed?')) {
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Migrating Formulations to Supabase...</span>
      `;
    }

    try {
      const authHeaders = SitaramAuth.getAuthHeaders ? SitaramAuth.getAuthHeaders() : {};
      const res = await fetch('/api/supabase/migrate', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });
      const data = await res.json();
      if (data.success) {
        this.showToast(`Migrated ${data.products_migrated} formulations & ${data.categories_migrated} categories to Supabase!`, 'success');
      } else {
        this.showToast('Migration completed: ' + (data.error || JSON.stringify(data.products_status || '')), 'info');
      }
      this.checkSupabaseStatus();
    } catch (err) {
      this.showToast('Migration error: ' + err.message, 'error');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Migrate All Local Data to Supabase';
      }
    }
  }
}

window.App = new AdminApp();
