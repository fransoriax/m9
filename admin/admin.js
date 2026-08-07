/* ════════════════════════════════════════════
   MAQUINARIAS 9 DE ABRIL — ADMIN PANEL JS
   WhatsApp: (011) 2673-8983 → 5491126738983
════════════════════════════════════════════ */

'use strict';

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const WA_NUMBER = '5491126738983';
const CREDENTIALS = { user: 'admin', pass: 'admin' };

/* ═══════════════════════════════════════════════════════
   SUPABASE INTEGRATION UI (CRM ADMIN)
═══════════════════════════════════════════════════════ */
const SupabaseUI = {
  async init() {
    const dot = $('sb-status-dot');
    const label = $('sb-status-label');
    if (!dot || !label) return;

    if (window.M9Supabase && window.M9Supabase.isConfigured()) {
      dot.className = 'sb-dot sb-dot-online';
      label.textContent = '☁️ Supabase Conectado';
      // Cargar los últimos datos desde la nube silenciosamente
      const res = await window.M9Supabase.fetchAllAndCache();
      if (res.ok && res.DB) {
        if (typeof DB !== 'undefined') {
          if (res.DB.autoelevadores && res.DB.autoelevadores.length) DB.autoelevadores = res.DB.autoelevadores;
          if (res.DB.camiones && res.DB.camiones.length) DB.camiones = res.DB.camiones;
          if (res.DB.repuestos && res.DB.repuestos.length) DB.repuestos = res.DB.repuestos;
          syncInventoryWithWeb(DB);
        }
        if (res.leads && Array.isArray(res.leads)) {
          // Group flat leads back into DB.leads object
          const groupedLeads = { nuevas: [], cotizacion: [], enviado: [], ganado: [] };
          res.leads.forEach(l => {
            const status = l.status || 'nuevas';
            if (groupedLeads[status]) {
              groupedLeads[status].push(l);
            } else {
              groupedLeads.nuevas.push(l);
            }
          });
          DB.leads = groupedLeads;
        }
        if (typeof Router !== 'undefined') Router.updateAllBadges();
        if (typeof Router !== 'undefined' && state.activeView && state.activeView !== 'home') {
          Router.go(state.activeView);
        }
      }
    } else {
      dot.className = 'sb-dot sb-dot-offline';
      label.textContent = '☁️ Conectar Supabase';
    }
  },
  openModal() {
    if ($('sb-cfg-url')) $('sb-cfg-url').value = window.M9Supabase ? window.M9Supabase.getUrl() : 'https://ktfrpccefxhlrrwlahmk.supabase.co';
    if ($('sb-cfg-key')) $('sb-cfg-key').value = window.M9Supabase ? window.M9Supabase.getKey() : '';
    if ($('sb-test-result')) $('sb-test-result').textContent = '';
    Modal.open('modal-supabase');
  },
  async saveConfig() {
    const url = $('sb-cfg-url') ? $('sb-cfg-url').value.trim() : '';
    const key = $('sb-cfg-key') ? $('sb-cfg-key').value.trim() : '';
    if (!key) {
      toast('Ingresá tu Anon Key de Supabase', 'error');
      return;
    }
    const res = window.M9Supabase.saveCredentials(url, key);
    if (res) {
      const el = $('sb-test-result');
      if (el) el.textContent = 'Probando conexión...';
      const test = await window.M9Supabase.testConnection();
      if (test.ok) {
        if (el) {
          el.style.color = '#2ed573';
          el.textContent = '✅ Conexión exitosa con Supabase';
        }
        toast('Conectado a Supabase correctamente', 'success');
        this.init();
        setTimeout(() => Modal.close('modal-supabase'), 1200);
      } else {
        if (el) {
          el.style.color = '#ff4757';
          el.textContent = '❌ Error de conexión: ' + test.error;
        }
        toast('Error al conectar: verifíca tu clave', 'error');
      }
    }
  },
  async syncNow(silent = false) {
    if (!window.M9Supabase || !window.M9Supabase.isConfigured()) {
      if (!silent) {
        toast('Por favor configura tu clave de Supabase primero', 'error');
        this.openModal();
      }
      return;
    }
    if (!silent) toast('Sincronizando con Supabase en la nube...', 'info');
    const btn = $('btn-do-supabase-sync');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ Subiendo a la nube...';
    }
    try {
      const leads = (typeof DB !== 'undefined' && DB.leads) ? DB.leads : JSON.parse(localStorage.getItem('m9-crm-leads') || 'null');
      const res = await window.M9Supabase.syncAllToSupabase(DB, leads);
      if (btn) {
        btn.disabled = false;
        btn.textContent = '🚀 Subir base local a Supabase ahora';
      }
      if (res.ok) {
        if (!silent) {
          toast(`¡Nube actualizada! (${res.counts.autoelevadores} autoelev., ${res.counts.camiones} camiones, ${res.counts.leads || 0} leads)`, 'success');
          const el = $('sb-test-result');
          if (el) {
            el.style.color = '#2ed573';
            el.textContent = '✅ Sincronización completa a la nube.';
          }
        }
        this.init();
      } else {
        if (!silent) toast('Advertencia al sincronizar: ' + res.error, 'error');
      }
    } catch (e) {
      if (btn) {
        btn.disabled = false;
        btn.textContent = '🚀 Subir base local a Supabase ahora';
      }
      if (!silent) toast('Error al sincronizar: ' + e.message, 'error');
    }
  }
};

// ─── STATE ────────────────────────────────────────────────────────────────────
let state = {
  activeView: 'home',
  activeTab: localStorage.getItem('m9-admin-inv-tab') || 'autoelevadores',
  searchQuery: '',
  filterStatus: '',
  filterBrand: '',
  editingId: null,
  deletingId: null,
  deletingType: null,
  activeUnitId: null,
  activeLeadId: null,
  serviceUnitId: null,
  editingImages: [],
  editingPortadaIndex: 0,
};

// ─── MOCK DATA & STORAGE ──────────────────────────────────────────────────────
let DB = {
  autoelevadores: [],
  repuestos: [],
  camiones: [],
  leads: {
    nuevas: [],
    cotizacion: [],
    enviado: [],
    ganado: []
  },
  units: [],
  reviews: [],
  accounts: [
    {
      id: 'acc-1',
      user: 'admin',
      pass: 'admin',
      name: 'Administrador General',
      role: 'Superadmin CRM',
      isSuperAdmin: true,
      modules: ['inventario', 'cotizaciones', 'presupuestos', 'postventa', 'resenas', 'reportes', 'cuentas']
    }
  ],
  quotes: []
};

function loadDatabase() {
  try {
    const saved = localStorage.getItem('m9-inventory-db');
    if (saved) {
      const parsed = JSON.parse(saved);
      DB = { ...DB, ...parsed };
      if (!parsed.accounts) DB.accounts = DB.accounts || [];
      if (DB.accounts) {
        DB.accounts.forEach(acc => {
          if (acc.isSuperAdmin || acc.user === 'admin') {
            ['inventario','cotizaciones','presupuestos','postventa','resenas','reportes','cuentas'].forEach(m => {
              if (!acc.modules.includes(m)) acc.modules.push(m);
            });
          }
        });
      }
      try {
        const rawSu = sessionStorage.getItem('m9-user');
        if (rawSu) {
          const su = JSON.parse(rawSu);
          if (su.isSuperAdmin || su.user === 'admin') {
            ['inventario','cotizaciones','presupuestos','postventa','resenas','reportes','cuentas'].forEach(m => {
              if (!su.modules.includes(m)) su.modules.push(m);
            });
            sessionStorage.setItem('m9-user', JSON.stringify(su));
          }
        }
      } catch(e) {}
    }
    syncInventoryWithWeb(DB);
    updateNextIds(DB);
    if (typeof Router !== 'undefined') Router.updateAllBadges();
    saveDatabase();
  } catch(e) {
    console.error('Error al cargar base de datos:', e);
  }
}

function saveDatabase() {
  try {
    localStorage.setItem('m9-inventory-db', JSON.stringify(DB));
    if (DB.reviews) {
      const visible = DB.reviews.filter(r => r.visible !== false);
      localStorage.setItem('m9-reviews', JSON.stringify(visible));
    }
    if (typeof SupabaseUI !== 'undefined' && window.M9Supabase && window.M9Supabase.isConfigured()) {
      SupabaseUI.syncNow(true);
    }
  } catch(e) {
    console.error('Error al guardar base de datos:', e);
  }
}


function syncInventoryWithWeb(db) {
  return false;
}
function updateNextIds(db) {
  if (db.autoelevadores && db.autoelevadores.length) {
    const maxAuto = db.autoelevadores.reduce((m, x) => Math.max(m, parseInt(x.id) || 0), 0);
    nextId.auto = Math.max(nextId.auto, maxAuto + 1);
  }
  if (db.repuestos && db.repuestos.length) {
    const maxRep = db.repuestos.reduce((m, x) => Math.max(m, parseInt(x.id) || 0), 0);
    nextId.rep = Math.max(nextId.rep, maxRep + 1);
  }
  if (db.camiones && db.camiones.length) {
    const maxCam = db.camiones.reduce((m, x) => Math.max(m, parseInt(x.id) || 0), 0);
    nextId.cam = Math.max(nextId.cam, maxCam + 1);
  }
}

let nextId = { auto: 14, rep: 24, cam: 7, lead: 6, service: 6, quote: 3 };

// ─── UTILS ────────────────────────────────────────────────────────────────────
function $(id) { return document.getElementById(id); }
function $$(sel, ctx = document) { return ctx.querySelectorAll(sel); }

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-AR', { day:'2-digit', month:'2-digit', year:'numeric' });
}

function daysFrom(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  return `hace ${days} días`;
}

function isWarrantyActive(expiryDate) {
  return new Date(expiryDate) > new Date();
}

function toast(msg, type = 'success') {
  const icons = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
    error:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  };
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.innerHTML = icons[type] + `<span>${msg}</span>`;
  $('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

// ─── AUTHENTICATION ───────────────────────────────────────────────────────────
const Auth = {
  check() {
    return sessionStorage.getItem('m9-auth') === '1' && sessionStorage.getItem('m9-user') !== null;
  },
  getCurrentUser() {
    let u = null;
    try {
      const raw = sessionStorage.getItem('m9-user');
      if (raw) u = JSON.parse(raw);
    } catch(e) {}
    if (!u) u = (DB.accounts && DB.accounts[0]) || { user: 'admin', name: 'Admin', role: 'Superadmin', modules: ['inventario','cotizaciones','presupuestos','postventa','resenas','reportes','cuentas'], isSuperAdmin: true };
    if (u && (u.isSuperAdmin || u.user === 'admin')) {
      if (!u.modules) u.modules = [];
      ['inventario','cotizaciones','presupuestos','postventa','resenas','reportes','cuentas'].forEach(m => {
        if (!u.modules.includes(m)) u.modules.push(m);
      });
    }
    return u;
  },
  login(user, pass) {
    const acc = (DB.accounts || []).find(a => a.user.toLowerCase() === user.toLowerCase() && a.pass === pass);
    if (acc) {
      sessionStorage.setItem('m9-auth', '1');
      sessionStorage.setItem('m9-user', JSON.stringify(acc));
      return true;
    }
    return false;
  },
  logout() {
    sessionStorage.removeItem('m9-auth');
    sessionStorage.removeItem('m9-user');
    $('app').style.display = 'none';
    $('login-screen').style.display = 'flex';
    $('login-user').value = '';
    $('login-pass').value = '';
    const bnav = $('bottom-nav');
    if (bnav) bnav.style.display = 'none';
  },
  init() {
    loadDatabase();
    if (this.check()) {
      this.showApp();
    } else {
      $('login-screen').style.display = 'flex';
      $('app').style.display = 'none';
      const bnav = $('bottom-nav');
      if (bnav) bnav.style.display = 'none';
    }
    $('login-form').addEventListener('submit', e => {
      e.preventDefault();
      const u = $('login-user').value.trim();
      const p = $('login-pass').value;
      if (this.login(u, p)) {
        sessionStorage.setItem('m9-auth', '1');
        $('login-error').textContent = '';
        $('login-error').classList.remove('visible');
        this.showApp();
      } else {
        const err = $('login-error');
        err.textContent = '⚠ Usuario o contraseña incorrectos';
        err.classList.add('visible');
        err.classList.remove('visible');
        void err.offsetWidth; // reflow for animation
        err.classList.add('visible');
      }
    });
    $('logout-btn').addEventListener('click', () => this.logout());
    const headerLogout = $('logout-btn-header');
    if (headerLogout) headerLogout.addEventListener('click', () => this.logout());
  },
  showApp() {
    $('login-screen').style.display = 'none';
    $('app').style.display = 'flex';
    const bnav = $('bottom-nav');
    if (bnav) bnav.style.display = '';
    App.init();
    if (typeof SupabaseUI !== 'undefined') SupabaseUI.init();
  }
};

// ─── ROUTER ───────────────────────────────────────────────────────────────────
const Router = {
  titles: {
    home:          { title: 'Inicio',                     crumb: 'Panel de Control M9' },
    inventario:    { title: 'Inventario & Stock',         crumb: 'Gestión de productos, maquinaria y stock' },
    cotizaciones:  { title: 'Cotizaciones & Leads',       crumb: 'Tablero Kanban de seguimiento comercial' },
    presupuestos:  { title: 'Presupuestos',               crumb: 'Generador de presupuestos en PDF para clientes' },
    postventa:     { title: 'Post-Venta & Service',       crumb: 'Historial de unidades vendidas y mantenimientos' },
    resenas:       { title: 'Reseñas Google',             crumb: 'Gestión de opiniones visibles en el sitio web' },
    reportes:      { title: 'Reportes',                   crumb: 'Métricas del negocio, alertas y rendimiento comercial' },
    cuentas:       { title: 'Centro de Cuentas',          crumb: 'Gestión de usuarios y permisos de acceso al CRM' },
  },
  updateAllBadges() {
    let totalInv = 0;
    if (DB.autoelevadores) totalInv += DB.autoelevadores.length;
    if (DB.camiones) totalInv += DB.camiones.length;
    if (DB.repuestos) totalInv += DB.repuestos.length;
    if ($('badge-inv')) $('badge-inv').textContent = totalInv;
    if ($('hmbadge-inv')) $('hmbadge-inv').textContent = totalInv;
    
    let totalCot = 0;
    if (DB.leads) {
      Object.values(DB.leads).forEach(arr => { if(arr) totalCot += arr.length; });
    }
    if ($('badge-cot')) $('badge-cot').textContent = totalCot;
    if ($('hmbadge-cot')) $('hmbadge-cot').textContent = totalCot;
    
    const totalPre = DB.quotes ? DB.quotes.length : 0;
    if ($('badge-presupuestos')) $('badge-presupuestos').textContent = totalPre;
    if ($('hmbadge-pre')) $('hmbadge-pre').textContent = totalPre;
    
    if ($('badge-resenas')) $('badge-resenas').textContent = DB.reviews ? DB.reviews.length : 0;
    if ($('badge-cuentas')) $('badge-cuentas').textContent = DB.accounts ? DB.accounts.length : 0;
  },
  go(view) {
    const user = Auth.getCurrentUser();
    const allowed = user.modules || ['inventario','cotizaciones','presupuestos','postventa','resenas','reportes'];
    if (user.isSuperAdmin || user.user === 'admin') {
      ['cuentas','presupuestos','reportes'].forEach(m => {
        if (!allowed.includes(m)) allowed.push(m);
      });
    }

    // Permission enforcement: if user doesn't have access to this view, redirect to first allowed view
    if (view !== 'home' && !allowed.includes(view)) {
      view = allowed[0] || 'inventario';
    }

    if (window.innerWidth >= 769 && view === 'home') {
      view = allowed[0] || 'inventario';
    }
    state.activeView = view;
    localStorage.setItem('m9-admin-view', view);
    $$('.view-panel').forEach(p => p.classList.remove('active-panel'));
    $$('.sb-item').forEach(b => b.classList.remove('active'));
    $$('.crm-hmod-card').forEach(b => b.classList.remove('active'));

    const targetPanel = $(`view-${view}`);
    const targetSb = $(`nav-${view}`);

    if (targetPanel) targetPanel.classList.add('active-panel');
    if (targetSb) targetSb.classList.add('active');

    // Bottom nav only has Inicio — keep it always active so user knows it navigates home
    const bnavHome = $('bnav-home');
    if (bnavHome) bnavHome.classList.add('active');

    // Botón volver al inicio: solo en mobile, nunca en desktop
    const backBtn = $('btn-back-home');
    if (backBtn) {
      const isMobile = window.innerWidth < 769;
      if (isMobile && view !== 'home') {
        backBtn.style.display = 'inline-flex';
      } else {
        backBtn.style.display = 'none';
      }
    }

    const t = this.titles[view];
    if (t) {
      $('view-title').textContent = t.title;
      $('view-crumb').textContent = t.crumb;
    }
    // Render on first visit or re-visit
    if (view === 'inventario')   Inv.render();
    if (view === 'cotizaciones') K.render();
    if (view === 'presupuestos') Quotes.render();
    if (view === 'postventa')    PV.render();
    if (view === 'resenas')      Rev.render();
    if (view === 'reportes')     Reports.render();
    if (view === 'cuentas')      Cuentas.render();
  },
  init() {
    $$('.sb-item[data-view], .bnav-item[data-view], .crm-hmod-card[data-view]').forEach(btn => {
      btn.addEventListener('click', () => this.go(btn.dataset.view));
    });

    document.addEventListener('click', e => {
      const btn = e.target.closest('#btn-back-home, .btn-back-home-trigger');
      if (btn) {
        e.preventDefault();
        this.go('home');
      }
    });
  }
};

// ─── MODAL MANAGER ────────────────────────────────────────────────────────────
const Modal = {
  open(id) {
    const el = $(id);
    el.classList.add('open');
    el.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  },
  close(id) {
    const el = $(id);
    el.classList.remove('open');
    el.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  },
  init() {
    // Close on overlay click
    $$('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', e => {
        if (e.target === overlay) this.close(overlay.id);
      });
    });
    // Close buttons
    $$('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => this.close(btn.dataset.close));
    });
    // Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        $$('.modal-overlay.open').forEach(m => this.close(m.id));
      }
    });
  }
};

// ─── INVENTORY MODULE ─────────────────────────────────────────────────────────
const Inv = {
  currentPage: 1,
  PER_PAGE: 10,
  renderPagination(totalPages, totalItems) {
    const container = $('inv-pagination');
    if (!container) return;
    if (!totalItems || totalItems === 0) {
      container.innerHTML = '';
      return;
    }
    const startIdx = (this.currentPage - 1) * this.PER_PAGE + 1;
    const endIdx = Math.min(this.currentPage * this.PER_PAGE, totalItems);
    
    let html = `
      <div class="inv-pagination-wrapper">
        <div class="inv-pagination-info">
          Mostrando <span>${startIdx} - ${endIdx}</span> de <span>${totalItems}</span> ítems
        </div>
        <div class="inv-pagination-buttons">
    `;

    if (totalPages > 1) {
      html += `
        <button class="inv-pagination-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                onclick="if(Inv.currentPage > 1) { Inv.currentPage--; Inv.render(); }"
                ${this.currentPage === 1 ? 'disabled' : ''}>
          &laquo; Anterior
        </button>
      `;
      for (let i = 1; i <= totalPages; i++) {
        html += `
          <button class="inv-pagination-btn ${i === this.currentPage ? 'active' : ''}"
                  onclick="Inv.currentPage = ${i}; Inv.render();">
            ${i}
          </button>
        `;
      }
      html += `
        <button class="inv-pagination-btn ${this.currentPage === totalPages ? 'disabled' : ''}" 
                onclick="if(Inv.currentPage < ${totalPages}) { Inv.currentPage++; Inv.render(); }"
                ${this.currentPage === totalPages ? 'disabled' : ''}>
          Siguiente &raquo;
        </button>
      `;
    }
    html += `
        </div>
      </div>
    `;
    container.innerHTML = html;
  },
  getItems() {
    return DB[state.activeTab] || [];
  },
  filteredItems() {
    let items = this.getItems();
    const q = state.searchQuery.toLowerCase();
    if (q) {
      items = items.filter(i => {
        const haystack = `${i.name||''} ${i.brand||''} ${i.oem||''} ${i.category||''} ${i.compat||''}`.toLowerCase();
        return haystack.includes(q);
      });
    }
    if (state.filterStatus) {
      items = items.filter(i => i.status === state.filterStatus);
    }
    if (state.filterBrand) {
      items = items.filter(i => i.brand === state.filterBrand);
    }
    return items;
  },
  renderHead() {
    const thead = $('inv-thead');
    if (state.activeTab === 'repuestos') {
      thead.innerHTML = `<tr>
        <th style="width:40px"><input type="checkbox" id="inv-select-all" onchange="Inv.toggleSelectAll(event)"></th>
        <th>Foto</th><th>Código OEM</th><th>Nombre</th><th>Categoría</th>
        <th>Precio</th><th>Stock</th><th>Compatibilidad</th>
        <th>Estado</th><th>Acciones</th>
      </tr>`;
    } else {
      thead.innerHTML = `<tr>
        <th style="width:40px"><input type="checkbox" id="inv-select-all" onchange="Inv.toggleSelectAll(event)"></th>
        <th></th><th>Nombre</th><th>Marca</th>
        <th>Capacidad</th><th>Motorización</th><th>Precio</th>
        <th>Estado</th><th>Web</th><th>Acciones</th>
      </tr>`;
    }
  },
  renderBrandFilter() {
    const sel = $('filter-brand');
    const items = DB[state.activeTab];
    const brands = [...new Set(items.map(i => i.brand).filter(Boolean))].sort();
    sel.innerHTML = '<option value="">Todas las marcas</option>' +
      brands.map(b => `<option value="${b}">${b}</option>`).join('');
    sel.value = state.filterBrand;
  },
  updateCategoryBadges() {
    const autoCount = DB.autoelevadores ? DB.autoelevadores.length : 0;
    const repCount  = DB.repuestos ? DB.repuestos.length : 0;
    const camCount  = DB.camiones ? DB.camiones.length : 0;

    const elAuto = document.querySelector('.crm-mcat-card[data-tab="autoelevadores"] .crm-mcat-sub');
    const elRep  = document.querySelector('.crm-mcat-card[data-tab="repuestos"] .crm-mcat-sub');
    const elCam  = document.querySelector('.crm-mcat-card[data-tab="camiones"] .crm-mcat-sub');

    if (elAuto) elAuto.textContent = `${autoCount} Unidades`;
    if (elRep)  elRep.textContent  = `${repCount} Repuestos`;
    if (elCam)  elCam.textContent  = `${camCount} Vehículos`;
  },
  render() {
    this.renderHead();
    this.renderBrandFilter();
    this.updateCategoryBadges();
    const items = this.filteredItems();
    const tbody = $('inv-tbody');
    const empty = $('inv-empty');
    const pagContainer = $('inv-pagination');
    if (items.length === 0) {
      tbody.innerHTML = '';
      empty.style.display = 'flex';
      if (pagContainer) pagContainer.innerHTML = '';
      return;
    }
    empty.style.display = 'none';
    const totalPages = Math.ceil(items.length / this.PER_PAGE);
    if (this.currentPage > totalPages) this.currentPage = 1;
    const pageItems = items.slice((this.currentPage - 1) * this.PER_PAGE, this.currentPage * this.PER_PAGE);
    if (state.activeTab === 'repuestos') {
      tbody.innerHTML = pageItems.map(r => {
        const stockBadge = r.stock > 5
          ? `<span class="badge badge--stock-ok">● ${r.stock} u.</span>`
          : r.stock > 0
          ? `<span class="badge badge--stock-low">⚠ ${r.stock} u.</span>`
          : `<span class="badge badge--stock-out">✕ Sin stock</span>`;
        const statusBadge = r.status === 'active'
          ? `<span class="badge badge--active">Activo</span>`
          : `<span class="badge badge--paused">Pausado</span>`;
        const thumb = r.img
          ? `<img class="td-thumb" src="${r.img}" alt="${r.name}" loading="lazy">`
          : `<div class="td-thumb-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;
        const discountHtml = (r.discount > 0) ? `<span style="color:#ffaa00; font-size:0.75rem; font-weight:700; margin-left:6px; background:rgba(255,170,0,0.15); padding:2px 5px; border-radius:4px;">-${r.discount}%</span>` : '';
        const isSelected = (state.selectedItems && state.selectedItems.has(r.id)) ? 'checked' : '';
        return `<tr>
          <td><input type="checkbox" class="inv-row-cb" value="${r.id}" ${isSelected} onchange="Inv.toggleSelect(${r.id}, event.target.checked)"></td>
          <td>${thumb}</td>
          <td><span class="badge badge--oem">${r.oem}</span></td>
          <td><div class="td-name">${r.name}</div></td>
          <td><span class="badge badge--cat">${r.category||'General'}</span></td>
          <td><div style="display:flex; align-items:center;"><span class="td-price-tag">${r.currency||'USD'} ${r.price.toLocaleString('es-AR')}</span>${discountHtml}</div></td>
          <td><div class="td-badges-group">${stockBadge} ${statusBadge}</div></td>
          <td><span class="td-compat-info">${r.compat ? 'Compatibilidad: ' + r.compat : ''}</span></td>
          <td></td>
          <td><div class="td-actions">
            <button class="action-btn action-btn--edit" title="Editar" onclick="Inv.edit('rep',${r.id})">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="action-btn action-btn--del" title="Eliminar" onclick="Inv.confirmDelete('rep',${r.id},'${r.name}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
            </button>
          </div></td>
        </tr>`;
      }).join('');
    } else {
      tbody.innerHTML = pageItems.map(item => {
        const statusBadge = item.status === 'active'
          ? `<span class="badge badge--active">Activo</span>`
          : `<span class="badge badge--paused">Pausado</span>`;
        const visBadge = item.visible
          ? `<span class="badge badge--vis-on">● Visible</span>`
          : `<span class="badge badge--vis-off">Oculto</span>`;
        const thumb = item.img
          ? `<img class="td-thumb" src="${item.img}" alt="${item.name}" loading="lazy">`
          : `<div class="td-thumb-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;
        const isSelected = (state.selectedItems && state.selectedItems.has(item.id)) ? 'checked' : '';
        return `<tr>
          <td><input type="checkbox" class="inv-row-cb" value="${item.id}" ${isSelected} onchange="Inv.toggleSelect(${item.id}, event.target.checked)"></td>
          <td>${thumb}</td>
          <td><div class="td-name">${item.name}</div></td>
          <td><span class="badge badge--brand">${item.brand}</span></td>
          <td><div class="td-specs-row"><span class="td-spec-chip">Capacidad: ${item.capacity||'—'}</span> <span class="td-spec-chip">Motor: ${item.motor||'—'}</span></div></td>
          <td></td>
          <td><div style="display:flex; align-items:center;"><span class="td-price-tag">${item.currency||'USD'} ${item.price.toLocaleString('es-AR')}</span>${item.discount > 0 ? `<span style="color:#ffaa00; font-size:0.75rem; font-weight:700; margin-left:6px; background:rgba(255,170,0,0.15); padding:2px 5px; border-radius:4px;">-${item.discount}%</span>` : ''}</div></td>
          <td><div class="td-badges-group">${statusBadge} ${visBadge}</div></td>
          <td></td>
          <td><div class="td-actions">
            <button class="action-btn action-btn--edit" title="Editar" onclick="Inv.edit('mach',${item.id})">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="action-btn action-btn--del" title="Eliminar" onclick="Inv.confirmDelete('mach',${item.id},'${item.name}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
            </button>
          </div></td>
        </tr>`;
      }).join('');
    }
    this.renderPagination(totalPages, items.length);
    // Update badge
    const total = DB.autoelevadores.length + DB.repuestos.length + DB.camiones.length;
    $('badge-inv').textContent = total;
    this.updateDeleteBtn();
  },
  setRepImg(src) {
    state.editingRepImg = src;
    const prev = $('r-img-preview');
    if (prev) {
      if (src) {
        prev.innerHTML = `
          <div style="position:relative;width:90px;height:90px;border-radius:8px;overflow:hidden;border:1px solid var(--border-color)">
            <img src="${src}" alt="Preview" style="width:100%;height:100%;object-fit:cover">
            <button type="button" onclick="Inv.removeRepImg()" style="position:absolute;top:4px;right:4px;background:rgba(0,0,0,0.7);color:#fff;border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px">✕</button>
          </div>`;
      } else {
        prev.innerHTML = '';
      }
    }
  },
  removeRepImg() {
    state.editingRepImg = null;
    $('r-img-preview').innerHTML = '';
    $('r-img-input').value = '';
  },
  edit(type, id) {
    if (type === 'rep') {
      const r = DB.repuestos.find(x => x.id === id);
      if (!r) return;
      state.editingId = id;
      $('modal-repuesto-title').textContent = 'Editar Repuesto';
      $('r-oem').value = r.oem;
      $('r-name').value = r.name;
      $('r-category').value = r.category || '';
      $('r-price').value = r.price;
      $('r-stock').value = r.stock;
      $('r-status').value = r.status;
      $('r-compat').value = r.compat || '';
      $('r-currency').value = r.currency || 'USD';
      $('r-discount').value = r.discount || '';
      this.setRepImg(r.img || null);
      Modal.open('modal-repuesto');
    } else {
      const items = DB[state.activeTab];
      const item = items.find(x => x.id === id);
      if (!item) return;
      state.editingId = id;
      $('modal-machinery-title').textContent = 'Editar Equipo';
      $('m-name').value = item.name;
      $('m-brand').value = item.brand;
      $('m-capacity').value = item.capacity || '';
      $('m-motor').value = item.motor || '';
      $('m-hours').value = item.hours || 0;
      $('m-price').value = item.price;
      $('m-currency').value = item.currency || 'USD';
      $('m-discount').value = item.discount || '';
      $('m-status').value = item.status;
      $('m-visible').checked = item.visible;
      $('m-vis-lbl').textContent = item.visible ? 'Visible en el sitio' : 'Oculto en el sitio';
      state.editingImages = (item.images && Array.isArray(item.images) && item.images.length > 0)
        ? [...item.images]
        : (item.img ? [item.img] : []);
      const currentPortada = item.img || state.editingImages[0];
      const pIdx = state.editingImages.indexOf(currentPortada);
      if (pIdx > 0) {
        const [pImg] = state.editingImages.splice(pIdx, 1);
        state.editingImages.unshift(pImg);
      }
      state.editingPortadaIndex = 0;
      this.renderImagePreview();
      $('pdf-filename').textContent = 'Ningún archivo seleccionado';
      Modal.open('modal-machinery');
    }
  },
  confirmDelete(type, id, name) {
    state.deletingId = id;
    state.deletingType = type;
    $('delete-msg').textContent = `¿Eliminás "${name}"?`;
    Modal.open('modal-delete');
  },
  toggleSelectAll(e) {
    const checked = e.target.checked;
    state.selectedItems = new Set();
    if (checked) {
      const items = this.filteredItems();
      const pageItems = items.slice((this.currentPage - 1) * this.PER_PAGE, this.currentPage * this.PER_PAGE);
      pageItems.forEach(i => state.selectedItems.add(String(i.id)));
    }
    this.render();
  },
  toggleSelect(id, checked) {
    if (!state.selectedItems) state.selectedItems = new Set();
    const strId = String(id);
    if (checked) state.selectedItems.add(strId);
    else state.selectedItems.delete(strId);
    this.updateDeleteBtn();
  },
  updateDeleteBtn() {
    const btn = $('btn-delete-selected');
    const cnt = $('sel-count');
    if (!btn || !cnt) return;
    if (!state.selectedItems) state.selectedItems = new Set();
    if (state.selectedItems.size > 0) {
      btn.style.display = 'inline-flex';
      cnt.textContent = `(${state.selectedItems.size})`;
    } else {
      btn.style.display = 'none';
    }
    
    const items = this.filteredItems();
    const pageItems = items.slice((this.currentPage - 1) * this.PER_PAGE, this.currentPage * this.PER_PAGE);
    const allChecked = pageItems.length > 0 && pageItems.every(i => state.selectedItems.has(String(i.id)));
    const cbAll = $('inv-select-all');
    if (cbAll) cbAll.checked = allChecked;
  },
  confirmDeleteSelected() {
    if (!state.selectedItems || state.selectedItems.size === 0) return;
    state.deletingId = 'multiple';
    $('delete-msg').textContent = `¿Eliminás ${state.selectedItems.size} registros seleccionados?`;
    Modal.open('modal-delete');
  },
  async doDelete() {
    const { deletingId: id, deletingType: type } = state;
    const tab = state.activeTab;
    
    const deleteFromSupabase = async (itemId) => {
      if (typeof window.M9Supabase !== 'undefined' && window.M9Supabase.isConfigured()) {
        try {
          await window.M9Supabase.deleteRow(tab, itemId);
        } catch(e) { console.error('Error supabase delete', e); }
      }
    };

    if (id === 'multiple') {
      const idsToDelete = Array.from(state.selectedItems);
      DB[tab] = DB[tab].filter(x => !state.selectedItems.has(String(x.id)));
      state.selectedItems.clear();
      toast(`${idsToDelete.length} registros eliminados`, 'success');
      
      idsToDelete.forEach(itemId => deleteFromSupabase(itemId));
    } else {
      if (type === 'rep') {
        DB.repuestos = DB.repuestos.filter(x => String(x.id) !== String(id));
      } else {
        DB[state.activeTab] = DB[state.activeTab].filter(x => String(x.id) !== String(id));
      }
      toast('Registro eliminado correctamente', 'success');
      
      deleteFromSupabase(id);
    }
    
    Modal.close('modal-delete');
    this.publish();
    this.render();
    state.deletingId = null; state.deletingType = null;
  },
  openAdd() {
    state.editingId = null;
    if (state.activeTab === 'repuestos') {
      $('modal-repuesto-title').textContent = 'Nuevo Repuesto';
      $('form-repuesto').reset();
      $('r-stock').value = 0;
      $('r-currency').value = 'USD';
      $('r-discount').value = '';
      this.setRepImg(null);
      Modal.open('modal-repuesto');
    } else {
      $('modal-machinery-title').textContent = state.activeTab === 'camiones' ? 'Nuevo Camión' : 'Nueva Maquinaria';
      $('form-machinery').reset();
      $('m-visible').checked = true;
      $('m-vis-lbl').textContent = 'Visible en el sitio';
      $('m-currency').value = 'USD';
      $('m-discount').value = '';
      state.editingImages = [];
      state.editingPortadaIndex = 0;
      this.renderImagePreview();
      $('pdf-filename').textContent = 'Ningún archivo seleccionado';
      Modal.open('modal-machinery');
    }
  },
  saveMachinery() {
    const name = $('m-name').value.trim();
    const brand = $('m-brand').value;
    const price = parseFloat($('m-price').value);
    const currency = $('m-currency').value || 'USD';
    const discount = parseInt($('m-discount').value) || 0;
    if (!name || !brand || isNaN(price)) { toast('Completá los campos obligatorios (*)', 'error'); return; }
    const savedPortada = state.editingImages[state.editingPortadaIndex] || state.editingImages[0] || '';
    const savedImages = [...(state.editingImages || [])];
    const item = {
      name, brand,
      capacity: $('m-capacity').value.trim(),
      motor:    $('m-motor').value,
      hours:    parseInt($('m-hours').value) || 0,
      price,
      currency,
      discount,
      status:   $('m-status').value,
      visible:  $('m-visible').checked,
      img:      savedPortada,
      images:   savedImages,
    };
    if (state.editingId) {
      const idx = DB[state.activeTab].findIndex(x => x.id === state.editingId);
      if (idx !== -1) DB[state.activeTab][idx] = { ...DB[state.activeTab][idx], ...item };
      toast('Equipo actualizado correctamente');
    } else {
      const tab = state.activeTab;
      const newId = tab === 'camiones' ? nextId.cam++ : nextId.auto++;
      DB[state.activeTab].unshift({ id: newId, ...item });
      toast('Equipo agregado correctamente');
    }
    Modal.close('modal-machinery');
    this.publish();
    this.render();
  },
  publish() {
    saveDatabase();
    if (typeof SupabaseUI !== 'undefined') {
      SupabaseUI.syncNow(true);
    }
  },
  saveRepuesto() {
    const oem  = $('r-oem').value.trim();
    const name = $('r-name').value.trim();
    const price = parseFloat($('r-price').value);
    const currency = $('r-currency').value || 'USD';
    const discount = parseInt($('r-discount').value) || 0;
    if (!oem || !name || isNaN(price)) { toast('Completá los campos obligatorios (*)', 'error'); return; }
    const item = {
      oem, name,
      category: $('r-category').value,
      price,
      currency,
      discount,
      stock:    parseInt($('r-stock').value) || 0,
      status:   $('r-status').value,
      compat:   $('r-compat').value.trim(),
      img:      state.editingRepImg || '',
    };
    if (state.editingId) {
      const idx = DB.repuestos.findIndex(x => x.id === state.editingId);
      if (idx !== -1) DB.repuestos[idx] = { ...DB.repuestos[idx], ...item };
      toast('Repuesto actualizado correctamente');
    } else {
      DB.repuestos.unshift({ id: nextId.rep++, ...item });
      toast('Repuesto agregado correctamente');
    }
    Modal.close('modal-repuesto');
    this.publish();
    this.render();
  },
  init() {
    this.publish();
    // Tabs & Mobile Visual Category Cards
    $$('.cat-tab, .crm-mcat-card').forEach(t => t.classList.remove('active'));
    $$(`.cat-tab[data-tab="${state.activeTab}"], .crm-mcat-card[data-tab="${state.activeTab}"]`).forEach(t => t.classList.add('active'));

    $$('.cat-tab, .crm-mcat-card').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabKey = tab.dataset.tab;
        $$('.cat-tab, .crm-mcat-card').forEach(t => t.classList.remove('active'));
        $$(`.cat-tab[data-tab="${tabKey}"], .crm-mcat-card[data-tab="${tabKey}"]`).forEach(t => t.classList.add('active'));
        state.activeTab = tabKey;
        state.selectedItems = new Set();
        localStorage.setItem('m9-admin-inv-tab', tabKey);
        state.searchQuery = '';
        state.filterStatus = '';
        state.filterBrand = '';
        if ($('inv-search')) $('inv-search').value = '';
        if ($('filter-status')) $('filter-status').value = '';
        Inv.currentPage = 1;
        this.render();
      });
    });
    // Search
    $('inv-search').addEventListener('input', e => {
      state.searchQuery = e.target.value;
      Inv.currentPage = 1;
      this.render();
    });
    // Filters
    $('filter-status').addEventListener('change', e => { state.filterStatus = e.target.value; Inv.currentPage = 1; this.render(); });
    $('filter-brand').addEventListener('change',  e => { state.filterBrand  = e.target.value; Inv.currentPage = 1; this.render(); });
    // Add button
    $('btn-delete-selected').addEventListener('click', () => this.confirmDeleteSelected());
    $('btn-add-item').addEventListener('click', () => this.openAdd());
    // Forms
    $('form-machinery').addEventListener('submit', e => { e.preventDefault(); this.saveMachinery(); });
    $('form-repuesto').addEventListener('submit',  e => { e.preventDefault(); this.saveRepuesto(); });
    // Delete confirm
    $('confirm-delete-btn').addEventListener('click', () => this.doDelete());
    // Stock controls
    $('stock-plus').addEventListener('click',  () => { const v = parseInt($('r-stock').value)||0; $('r-stock').value = v+1; });
    $('stock-minus').addEventListener('click', () => { const v = parseInt($('r-stock').value)||0; if(v>0) $('r-stock').value = v-1; });
    // Toggle label
    $('m-visible').addEventListener('change', e => {
      $('m-vis-lbl').textContent = e.target.checked ? 'Visible en el sitio' : 'Oculto en el sitio';
    });
    // Image upload zone (Machinery)
    const imgZone = $('img-drop-zone');
    const imgInput = $('m-imgs');
    if (imgZone && imgInput) {
      imgZone.addEventListener('click', () => imgInput.click());
      imgZone.addEventListener('dragover', e => { e.preventDefault(); imgZone.classList.add('drag-over'); });
      imgZone.addEventListener('dragleave', () => imgZone.classList.remove('drag-over'));
      imgZone.addEventListener('drop', e => { e.preventDefault(); imgZone.classList.remove('drag-over'); this.previewImages(e.dataTransfer.files); });
      imgInput.addEventListener('change', e => {
        if (e.target.files.length) {
          this.previewImages(e.target.files);
          imgInput.value = '';
        }
      });
    }
    // Image upload zone (Repuestos)
    const rImgZone = $('r-img-zone');
    const rImgInput = $('r-img-input');
    if (rImgZone && rImgInput) {
      rImgZone.addEventListener('click', () => rImgInput.click());
      rImgZone.addEventListener('dragover', e => { e.preventDefault(); rImgZone.classList.add('drag-over'); });
      rImgZone.addEventListener('dragleave', () => rImgZone.classList.remove('drag-over'));
      
      const handleRepFile = async (file) => {
        if (!file) return;
        $('r-img-filename').textContent = 'Subiendo...';
        if (typeof window.M9Supabase !== 'undefined' && window.M9Supabase.isConfigured()) {
          const res = await window.M9Supabase.uploadImage(file, 'images', 'repuestos');
          if (res.url) {
            this.setRepImg(res.url);
            $('r-img-filename').textContent = file.name;
          } else {
            toast('Error subiendo: ' + res.error, 'error');
            $('r-img-filename').textContent = 'Error al subir';
          }
        } else {
          const reader = new FileReader();
          reader.onload = ev => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 1000;
              const MAX_HEIGHT = 1000;
              let width = img.width;
              let height = img.height;
              
              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }
              
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);
              this.setRepImg(canvas.toDataURL('image/jpeg', 0.8));
              $('r-img-filename').textContent = file.name;
            };
            img.src = ev.target.result;
          };
          reader.readAsDataURL(file);
        }
      };

      rImgInput.addEventListener('change', e => handleRepFile(e.target.files[0]));
      rImgZone.addEventListener('drop', e => {
        e.preventDefault();
        rImgZone.classList.remove('drag-over');
        if (e.dataTransfer.files.length) handleRepFile(e.dataTransfer.files[0]);
      });
    }
    // PDF zone
    const pdfZone = $('pdf-zone');
    const pdfInput = $('m-pdf');
    pdfZone.addEventListener('click', () => pdfInput.click());
    pdfInput.addEventListener('change', e => {
      const f = e.target.files[0];
      $('pdf-filename').textContent = f ? f.name : 'Ningún archivo seleccionado';
    });
    this.render();
  },
  renderImagePreview() {
    const grid = $('img-preview');
    if (!grid) return;
    grid.innerHTML = '';
    if (!state.editingImages || state.editingImages.length === 0) {
      grid.innerHTML = '<span style="font-size:0.82rem;color:var(--t3);padding:0.75rem 0;display:block;text-align:center;width:100%;">Sin imágenes cargadas</span>';
      return;
    }
    state.editingImages.forEach((url, idx) => {
      const isPortada = idx === 0;
      const wrap = document.createElement('div');
      wrap.className = 'prev-item' + (isPortada ? ' is-portada' : '');
      let actionHtml = isPortada
        ? `<span class="portada-badge">★ Portada</span>`
        : `<button type="button" class="btn-set-portada" onclick="Inv.setPortada(${idx})">★ Hacer portada</button>`;
      wrap.innerHTML = `
        <img src="${url}" alt="Equipo ${idx + 1}" loading="lazy">
        ${actionHtml}
        <div class="img-card-actions">
          <button type="button" class="btn-move-img" onclick="Inv.moveImg(${idx}, -1)" title="Mover a la izquierda" ${idx === 0 ? 'disabled' : ''}>◀</button>
          <span class="img-order-num">#${idx + 1}</span>
          <button type="button" class="btn-move-img" onclick="Inv.moveImg(${idx}, 1)" title="Mover a la derecha" ${idx === state.editingImages.length - 1 ? 'disabled' : ''}>▶</button>
        </div>
        <span class="prev-remove" title="Quitar imagen" onclick="Inv.removeImage(${idx})">✕</span>
      `;
      grid.appendChild(wrap);
    });
  },
  setPortada(idx) {
    if (idx > 0 && idx < state.editingImages.length) {
      const [chosen] = state.editingImages.splice(idx, 1);
      state.editingImages.unshift(chosen);
      state.editingPortadaIndex = 0;
      this.renderImagePreview();
      toast('Portada actualizada (ubicada en 1er lugar)', 'success');
    }
  },
  moveImg(idx, dir) {
    const targetIdx = idx + dir;
    if (targetIdx >= 0 && targetIdx < state.editingImages.length) {
      const temp = state.editingImages[idx];
      state.editingImages[idx] = state.editingImages[targetIdx];
      state.editingImages[targetIdx] = temp;
      state.editingPortadaIndex = 0;
      this.renderImagePreview();
    }
  },
  removeImage(idx) {
    if (idx >= 0 && idx < state.editingImages.length) {
      state.editingImages.splice(idx, 1);
      state.editingPortadaIndex = 0;
      this.renderImagePreview();
    }
  },
  async previewImages(files) {
    if (files.length === 0) return;
    toast('Subiendo imagen(es)...', 'info');
    for (const file of Array.from(files)) {
      const compressedBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1000;
            const MAX_HEIGHT = 1000;
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          };
          img.onerror = () => {
            resolve(e.target.result); // Fallback to original
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
      state.editingImages.push(compressedBase64);
    }
    this.renderImagePreview();
    toast('Imagen(es) procesada(s)', 'success');
  }
};

// ─── KANBAN MODULE ────────────────────────────────────────────────────────────
const K = {
  draggingId: null,
  draggingFrom: null,

  render() {
    ['nuevas','cotizacion','enviado','ganado'].forEach(col => {
      const el = $(`col-${col}`);
      el.innerHTML = DB.leads[col].map(l => this.cardHTML(l)).join('');
      $(`count-${col}`).textContent = DB.leads[col].length;
      // Rebind drag events
      el.querySelectorAll('.kcard').forEach(card => {
        const handle = card.querySelector('.kcard-drag-handle');
        const dragElem = handle || card;
        dragElem.addEventListener('dragstart', e => {
          this.draggingId   = card.dataset.id;
          this.draggingFrom = col;
          card.classList.add('dragging');
          if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', card.dataset.id || '');
          }
        });
        dragElem.addEventListener('dragend', () => {
          card.classList.remove('dragging');
          this.draggingId = null;
          this.draggingFrom = null;
          document.querySelectorAll('.kboard-col, .kcol-body').forEach(c => c.classList.remove('drag-active'));
        });
      });
    });
    // Total badge
    const total = Object.values(DB.leads).reduce((s, arr) => s + arr.length, 0);
    $('badge-cot').textContent = total;
  },
  openMoveMenu(e, id) {
    if (e) {
      e.stopPropagation();
      if (e.preventDefault) e.preventDefault();
    }
    let currentCol = null;
    for (const [colKey, arr] of Object.entries(DB.leads)) {
      if (arr.some(x => String(x.id) === String(id))) { currentCol = colKey; break; }
    }
    if (!currentCol) return;

    document.querySelectorAll('.kmove-menu-overlay').forEach(m => m.remove());

    const menu = document.createElement('div');
    menu.className = 'kmove-menu-overlay';
    menu.onclick = (evt) => {
      if (evt.target === menu) menu.remove();
    };
    menu.ontouchstart = (evt) => {
      if (evt.target === menu) menu.remove();
    };
    menu.innerHTML = `
      <div class="kmove-menu-box">
        <div class="kmove-menu-hdr">
          <span>Mover Oportunidad</span>
          <button class="kmove-close-btn" onclick="this.closest('.kmove-menu-overlay').remove()">✕</button>
        </div>
        <div class="kmove-options">
          <button class="kmove-opt ${currentCol==='nuevas'?'active':''}" onclick="K.moveLeadDirect('${id}','${currentCol}','nuevas')">
            <span class="kcol-dot kcol-dot--nuevas"></span> Nuevas Consultas
          </button>
          <button class="kmove-opt ${currentCol==='cotizacion'?'active':''}" onclick="K.moveLeadDirect('${id}','${currentCol}','cotizacion')">
            <span class="kcol-dot kcol-dot--cotizacion"></span> En Cotización
          </button>
          <button class="kmove-opt ${currentCol==='enviado'?'active':''}" onclick="K.moveLeadDirect('${id}','${currentCol}','enviado')">
            <span class="kcol-dot kcol-dot--enviado"></span> Presupuesto Enviado
          </button>
          <button class="kmove-opt ${currentCol==='ganado'?'active':''}" onclick="K.moveLeadDirect('${id}','${currentCol}','ganado')">
            <span class="kcol-dot kcol-dot--ganado"></span> Cerrado / Ganado
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(menu);
  },
  moveLeadDirect(id, fromCol, targetCol) {
    document.querySelectorAll('.kmove-menu-overlay').forEach(m => m.remove());
    if (fromCol === targetCol) return;
    this.moveLeadTo(id, fromCol, targetCol);
  },
  moveLeadTo(id, fromCol, targetCol) {
    if (!id || fromCol === targetCol) return;
    const leadIdx = DB.leads[fromCol].findIndex(l => String(l.id) === String(id));
    if (leadIdx === -1) return;
    const [lead] = DB.leads[fromCol].splice(leadIdx, 1);
    DB.leads[targetCol].push(lead);
    this.render();

    const targetTab = document.querySelector(`.kstage-tab[data-col="${targetCol}"]`);
    if (targetTab) {
      document.querySelectorAll('.kstage-tab').forEach(t => t.classList.remove('active'));
      targetTab.classList.add('active');
      const targetWrap = $(`kcol-wrap-${targetCol}`);
      if (targetWrap) {
        targetWrap.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      }
    }

    const stageNames = { nuevas: 'Nuevas', cotizacion: 'En Cotización', enviado: 'Presupuesto Enviado', ganado: 'Cerrado/Ganado' };
    toast(`Lead movido a "${stageNames[targetCol] || targetCol}"`, 'info');
    this.draggingId = null;
    this.draggingFrom = null;
  },
  cardHTML(l) {
    const urg = { alta: 'badge--urgency--alta alta', media: 'badge--urgency--media media', normal: 'badge--urgency--normal normal' };
    const urgLabel = { alta: '🔴 Alta', media: '🟡 Media', normal: '🟢 Normal' };
    
    // Determine phone number to use
    let phoneNum = String(l.phone || '').replace(/\D/g, '');
    if (!phoneNum || phoneNum.length < 8) {
      phoneNum = WA_NUMBER.replace(/\D/g, ''); // Fallback to company number if invalid
    }
    const waUrl = `https://wa.me/${phoneNum}?text=Hola%20${encodeURIComponent(l.client)}%2C%20te%20contactamos%20desde%20Maquinarias%209%20de%20Abril.`;
    
    // Check if we have email
    const hasEmail = l.email && l.email !== "No provisto" && l.email.includes('@');
    const mailUrl = hasEmail ? `mailto:${l.email}?subject=Consulta%20-%20Maquinarias%209%20de%20Abril` : '#';
    
    const emailBtnHtml = hasEmail ? `<a class="kcard-wa" style="background-color:#007BFF; color:white; margin-right: 0.4rem;" href="${mailUrl}" target="_blank" rel="noopener noreferrer" ontouchstart="event.stopPropagation()">
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style="margin-right:4px"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
          Email
        </a>` : '';

    const urgency = l.urgency || 'normal';
    const productStr = l.product || l.unit || 'Sin equipo';
    const dateStr = l.date || l.created_at || l.createdAt || new Date().toISOString();

    return `<div class="kcard" data-id="${l.id}">
      <div class="kcard-top-bar">
        <span class="kcard-urgency kcard-urgency--${urgency}">${urgLabel[urgency]||urgency}</span>
        <div class="kcard-actions-row">
          <span class="kcard-drag-handle" draggable="true" title="Arrastrar para mover">⋮⋮</span>
          <button class="kcard-btn-move" onclick="K.openMoveMenu(event, '${l.id}')" ontouchstart="event.stopPropagation()" title="Mover etapa">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg>
            Mover
          </button>
          <button class="kcard-btn-detail" onclick="K.openLead('${l.id}')" ontouchstart="event.stopPropagation()" title="Ver detalle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </div>
      <div class="kcard-name">${l.client}</div>
      <div class="kcard-product">${productStr}</div>
      <div class="kcard-meta">
        <span class="kcard-date">${daysFrom(dateStr)}</span>
        <div style="display:flex;">
        ${emailBtnHtml}
        <a class="kcard-wa" href="${waUrl}" target="_blank" rel="noopener noreferrer" ontouchstart="event.stopPropagation()">
          <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          WhatsApp
        </a>
        </div>
      </div>
    </div>`;
  },
  drop(event, targetCol) {
    event.preventDefault();
    const targetColEl = $(`col-${targetCol}`);
    if (targetColEl) targetColEl.classList.remove('drag-active');
    const dragId = this.draggingId;
    const dragFrom = this.draggingFrom;
    this.draggingId = null;
    this.draggingFrom = null;

    if (!dragId || dragFrom === targetCol || !dragFrom) return;
    const leadIdx = DB.leads[dragFrom].findIndex(l => String(l.id) === String(dragId));
    if (leadIdx === -1) return;
    const [lead] = DB.leads[dragFrom].splice(leadIdx, 1);
    DB.leads[targetCol].push(lead);
    this.render();
    toast(`Lead movido a "${targetCol === 'cotizacion' ? 'En Cotización' : targetCol === 'enviado' ? 'Presupuesto Enviado' : targetCol === 'ganado' ? 'Cerrado/Ganado' : 'Nuevas'}"`, 'info');
  },
  findLead(id) {
    for (const col of Object.values(DB.leads)) {
      const f = col.find(x => String(x.id) === String(id));
      if (f) return f;
    }
    return null;
  },
  openLead(id) {
    const l = this.findLead(id);
    if (!l) return;
    state.activeLeadId = id;
    $('modal-lead-title').textContent = `Consulta — ${l.client}`;
    const waUrl = `https://wa.me/${WA_NUMBER}?text=Hola%20${encodeURIComponent(l.client)}`;
    $('lead-client-card').innerHTML = `
      <div class="lcc-name">${l.client}</div>
      <div class="lcc-row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8a16 16 0 0 0 6.91 6.91l.75-.74a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        <a href="${waUrl}" target="_blank" rel="noopener">${l.phone}</a>
      </div>
      <div class="lcc-row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        <span>${l.product}</span>
      </div>
      <div class="lcc-row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span>${formatDate(l.date)}</span>
      </div>`;
    this.renderNotes(l);
    $('q-product').value = l.product;
    $('q-price').value = '';
    $('q-validity').value = '15 días';
    $('q-payment').value = '';
    $('q-obs').value = '';
    Modal.open('modal-lead');
  },
  renderNotes(l) {
    const feed = $('notes-feed');
    if (!l.notes || l.notes.length === 0) {
      feed.innerHTML = '<p style="font-size:.78rem;color:var(--t3);padding:.5rem 0">Sin notas internas aún.</p>';
      return;
    }
    feed.innerHTML = l.notes.map(n => typeof n === 'string'
      ? `<div class="note-item"><div class="note-text">${n}</div></div>`
      : `<div class="note-item"><div class="note-text">${n.text}</div><div class="note-ts">${n.ts}</div></div>`
    ).join('');
  },
  addNote() {
    const txt = $('note-input').value.trim();
    if (!txt) return;
    const l = this.findLead(state.activeLeadId);
    if (!l) return;
    l.notes.push({ text: txt, ts: new Date().toLocaleString('es-AR') });
    $('note-input').value = '';
    this.renderNotes(l);
    toast('Nota agregada');
  },
  openAddLead() {
    // Quick add lead form — simplified inline approach
    const id = `L${nextId.lead++}`;
    const client = prompt('Nombre del cliente o empresa:');
    if (!client) return;
    const phone  = prompt('Teléfono / WhatsApp:') || '—';
    const product = prompt('Producto o servicio consultado:') || '—';
    DB.leads.nuevas.unshift({ id, client, phone, product, date: new Date().toISOString().split('T')[0], urgency: 'normal', notes: [] });
    this.render();
    toast('Nueva consulta agregada');
  },
  printQuote() {
    const l = this.findLead(state.activeLeadId);
    if (!l) return;
    const product  = $('q-product').value.trim() || l.product;
    const price    = $('q-price').value.trim() || '—';
    const validity = $('q-validity').value.trim() || '—';
    const payment  = $('q-payment').value.trim() || '—';
    const obs      = $('q-obs').value.trim() || '—';
    const num = `M9-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900)+100)}`;
    $('pd-num').textContent = num;
    $('pd-date').textContent = new Date().toLocaleDateString('es-AR', { day:'2-digit', month:'2-digit', year:'numeric' });
    $('pd-validity').textContent = validity;
    $('pd-client').textContent = l.client;
    $('pd-phone').textContent  = l.phone;
    $('pd-consulta').textContent = l.product;
    $('pd-product').textContent = product;
    $('pd-price').textContent = price ? `USD ${parseFloat(price).toLocaleString('es-AR')}` : '—';
    $('pd-payment').textContent = payment;
    $('pd-obs').textContent = obs;
    window.print();
  },
  init() {
    $('btn-add-lead').addEventListener('click', () => this.openAddLead());
    $('btn-add-note').addEventListener('click', () => this.addNote());
    $('btn-print-quote').addEventListener('click', () => this.printQuote());
    $$('.kstage-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const col = tab.dataset.col;
        $$('.kstage-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const targetCol = $(`kcol-wrap-${col}`);
        if (targetCol) {
          targetCol.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
        }
      });
    });
    this.render();
  }
};

// ─── POST-VENTA MODULE ────────────────────────────────────────────────────────
const PV = {
  render() {
    this.renderList(DB.units);
    if (state.activeUnitId) {
      const u = DB.units.find(x => x.id === state.activeUnitId);
      if (u) this.renderDetail(u);
    }
  },
  renderList(units) {
    const el = $('pv-list');
    if (units.length === 0) {
      el.innerHTML = '<p style="color:var(--t3);font-size:.82rem;padding:.5rem">Sin resultados.</p>';
      return;
    }
    el.innerHTML = units.map(u => {
      const active = isWarrantyActive(u.warrantyExpiry);
      const badge = active
        ? `<span class="badge badge--active">🟢 Garantía activa</span>`
        : `<span class="badge badge--paused">🔴 Garantía vencida</span>`;
      const selected = state.activeUnitId === u.id ? ' selected' : '';
      return `<div class="unit-card${selected}" onclick="PV.select('${u.id}')">
        <div class="uc-model">${u.model}</div>
        <div class="uc-serial">${u.serial}</div>
        <div class="uc-client">👤 ${u.client}</div>
        <div class="uc-footer">
          ${badge}
          <span style="font-size:.72rem;color:var(--t3)">${u.services.length} service${u.services.length!==1?'s':''}</span>
        </div>
      </div>`;
    }).join('');
  },
  select(id) {
    state.activeUnitId = id;
    this.renderList(DB.units);
    const u = DB.units.find(x => x.id === id);
    if (u) {
      this.renderDetail(u);
      if (window.innerWidth <= 992) {
        setTimeout(() => {
          const detailEl = $('pv-detail');
          if (detailEl) detailEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      }
    }
  },
  renderDetail(u) {
    const active = isWarrantyActive(u.warrantyExpiry);
    const warBadge = active
      ? `<span class="badge badge--active" style="font-size:.8rem">🟢 Garantía Activa hasta ${formatDate(u.warrantyExpiry)}</span>`
      : `<span class="badge badge--paused" style="font-size:.8rem">🔴 Garantía Vencida — ${formatDate(u.warrantyExpiry)}</span>`;
    const detail = $('pv-detail');
    detail.innerHTML = `
      <div class="ud-header">
        <img class="ud-img" src="${u.img}" alt="${u.model}" loading="lazy">
        <div class="ud-info">
          <h2>${u.model}</h2>
          <p>${warBadge}</p>
        </div>
      </div>
      <div class="ud-info-grid">
        <div class="ud-info-item"><span class="lbl">N° de Serie</span><span class="val" style="font-family:monospace">${u.serial}</span></div>
        <div class="ud-info-item"><span class="lbl">N° de Chasis</span><span class="val" style="font-family:monospace">${u.chassis}</span></div>
        <div class="ud-info-item"><span class="lbl">Cliente</span><span class="val">${u.client}</span></div>
        <div class="ud-info-item"><span class="lbl">Fecha de Venta</span><span class="val">${formatDate(u.saleDate)}</span></div>
      </div>
      <div class="timeline-header">
        <h3>🔧 Historial de Service</h3>
        <button class="btn-primary btn-add" onclick="PV.openService('${u.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Registrar Service
        </button>
      </div>
      <div class="timeline" id="timeline-${u.id}">
        ${this.renderTimeline(u.services)}
      </div>
    `;
  },
  renderTimeline(services) {
    if (!services || services.length === 0) {
      return `<div style="color:var(--t3);font-size:.82rem;padding:.5rem 0">Sin registros de service aún.</div>`;
    }
    return [...services].reverse().map(s => `
      <div class="tl-item">
        <div class="tl-dot"></div>
        <div class="tl-card">
          <div class="tl-card-top">
            <span class="tl-date">${formatDate(s.date)}</span>
            <span class="tl-type">${s.type}</span>
            ${s.hours ? `<span class="tl-hours">⏱ ${s.hours.toLocaleString('es-AR')} hs</span>` : ''}
          </div>
          ${s.parts ? `<div class="tl-parts"><strong>Repuestos:</strong> ${s.parts}</div>` : ''}
          <div class="tl-notes">${s.notes}</div>
          ${s.tech ? `<div class="tl-tech">Técnico: ${s.tech}</div>` : ''}
        </div>
      </div>`).join('');
  },
  openService(unitId) {
    state.serviceUnitId = unitId;
    $('form-service').reset();
    $('sv-date').value = new Date().toISOString().split('T')[0];
    Modal.open('modal-service');
  },
  saveService() {
    const date  = $('sv-date').value;
    const hours = parseInt($('sv-hours').value) || 0;
    const type  = $('sv-type').value;
    const parts = $('sv-parts').value.trim();
    const notes = $('sv-notes').value.trim();
    const tech  = $('sv-tech').value.trim();
    if (!notes) { toast('Ingresá las observaciones del técnico', 'error'); return; }
    const u = DB.units.find(x => x.id === state.serviceUnitId);
    if (!u) return;
    u.services.push({ id: `S${nextId.service++}`, date, hours, type, parts, notes, tech });
    Modal.close('modal-service');
    this.renderDetail(u);
    this.renderList(DB.units);
    toast('Service registrado correctamente');
  },
  search(q) {
    if (!q.trim()) { this.renderList(DB.units); return; }
    const filtered = DB.units.filter(u => {
      const hay = `${u.model} ${u.serial} ${u.chassis} ${u.client}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
    this.renderList(filtered);
  },

  openUnit() {
    $('modal-unit-title').textContent = 'Nueva Venta — Seguimiento Post-Venta';
    $('form-unit').reset();
    // Default sale date = today, warranty = 1 year from today
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0];
    $('un-sale-date').value = today;
    $('un-warranty').value = nextYear;
    Modal.open('modal-unit');
  },

  saveUnit() {
    const model   = $('un-model').value.trim();
    const client  = $('un-client').value.trim();
    const serial  = $('un-serial').value.trim();
    const chassis = $('un-chassis').value.trim();
    const saleDate    = $('un-sale-date').value;
    const warrantyExpiry = $('un-warranty').value;
    const img     = $('un-img').value.trim() || '/assets/electric_forklift.png';
    const phone   = $('un-phone').value.trim();
    const notes   = $('un-notes').value.trim();

    if (!model || !client || !serial || !saleDate || !warrantyExpiry) {
      toast('Completá los campos obligatorios (*)', 'error');
      return;
    }

    const newUnit = {
      id: `U${Date.now()}`,
      model,
      client,
      serial,
      chassis: chassis || '—',
      saleDate,
      warrantyExpiry,
      img,
      phone: phone || '',
      notes: notes || '',
      services: []
    };

    DB.units.push(newUnit);
    saveDatabase();
    Modal.close('modal-unit');
    this.renderList(DB.units);
    state.activeUnitId = newUnit.id;
    this.renderList(DB.units);
    this.renderDetail(newUnit);
    toast(`Venta de "${model}" registrada ✓`);
  },

  init() {
    $('pv-search').addEventListener('input', e => this.search(e.target.value));
    $('form-service').addEventListener('submit', e => { e.preventDefault(); this.saveService(); });
    $('form-unit').addEventListener('submit', e => { e.preventDefault(); this.saveUnit(); });
    const addUnitBtn = $('btn-add-unit');
    if (addUnitBtn) addUnitBtn.addEventListener('click', () => this.openUnit());
    this.render();
  }
};

// ─── REVIEWS MODULE ───────────────────────────────────────────────────────────
const Rev = {
  nextId: 6,
  avatarColors: ['#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#ec4899','#14b8a6'],

  getInitial(name) {
    return name ? name.trim()[0].toUpperCase() : '?';
  },

  getColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return this.avatarColors[Math.abs(hash) % this.avatarColors.length];
  },

  starsHTML(n) {
    const star = (filled) => `<svg viewBox="0 0 24 24" width="14" height="14" fill="${filled ? '#ffb800' : 'none'}" stroke="#ffb800" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    return Array.from({length: 5}, (_, i) => star(i < n)).join('');
  },

  publish() {
    // Publicar solo las reseñas visibles al sitio público vía localStorage
    const visible = DB.reviews.filter(r => r.visible);
    localStorage.setItem('m9-reviews', JSON.stringify(visible));
    // Actualizar badge
    $('badge-resenas').textContent = DB.reviews.length;
  },

  filtered(q = '') {
    const lq = q.toLowerCase();
    return DB.reviews.filter(r =>
      !lq || r.author.toLowerCase().includes(lq) || r.text.toLowerCase().includes(lq)
    );
  },

  render(q = '') {
    const rows = this.filtered(q);
    const thead = $('rev-thead');
    const tbody = $('rev-tbody');
    const empty = $('rev-empty');

    thead.innerHTML = `<tr>
      <th>Autor</th>
      <th>Estrellas</th>
      <th>Fecha</th>
      <th>Reseña</th>
      <th>Visible</th>
      <th>Acciones</th>
    </tr>`;

    if (!rows.length) {
      tbody.innerHTML = '';
      empty.style.display = 'flex';
      return;
    }
    empty.style.display = 'none';

    tbody.innerHTML = rows.map(r => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:.6rem">
            <div style="width:32px;height:32px;border-radius:50%;background:${this.getColor(r.author)};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.85rem;color:#000;flex-shrink:0">${this.getInitial(r.author)}</div>
            <span style="font-weight:600">${r.author}</span>
          </div>
        </td>
        <td><div style="display:flex;gap:2px">${this.starsHTML(r.stars)}</div></td>
        <td style="color:var(--text-muted);font-size:.85rem">${r.date}</td>
        <td style="max-width:300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text-secondary);font-size:.85rem">${r.text}</td>
        <td><span class="status-badge ${r.visible ? 'status-active' : 'status-paused'}">${r.visible ? 'Visible' : 'Oculta'}</span></td>
        <td>
          <div class="row-actions">
            <button class="btn-icon" title="Editar" onclick="Rev.edit('${r.id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn-icon btn-icon--danger" title="Eliminar" onclick="Rev.confirmDelete('${r.id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  openNew() {
    state.editingId = null;
    $('modal-review-title').textContent = 'Nueva Reseña';
    $('form-review').reset();
    $('rv-stars').value = '5';
    $('rv-visible').value = 'true';
    Modal.open('modal-review');
  },

  edit(id) {
    const r = DB.reviews.find(x => x.id === id);
    if (!r) return;
    state.editingId = id;
    $('modal-review-title').textContent = 'Editar Reseña';
    $('rv-author').value  = r.author;
    $('rv-stars').value   = String(r.stars);
    $('rv-date').value    = r.date;
    $('rv-text').value    = r.text;
    $('rv-visible').value = String(r.visible);
    Modal.open('modal-review');
  },

  save() {
    const author  = $('rv-author').value.trim();
    const stars   = parseInt($('rv-stars').value);
    const date    = $('rv-date').value.trim();
    const text    = $('rv-text').value.trim();
    const visible = $('rv-visible').value === 'true';

    if (!author || !date || !text) { toast('Completá los campos obligatorios', 'error'); return; }

    if (state.editingId) {
      const idx = DB.reviews.findIndex(r => r.id === state.editingId);
      if (idx !== -1) DB.reviews[idx] = { ...DB.reviews[idx], author, stars, date, text, visible };
      toast('Reseña actualizada ✓');
    } else {
      DB.reviews.push({ id: `R${String(this.nextId++).padStart(3,'0')}`, author, stars, date, text, visible });
      toast('Reseña agregada ✓');
    }

    this.publish();
    Modal.close('modal-review');
    this.render($('rev-search').value);
  },

  confirmDelete(id) {
    if (!confirm('¿Eliminár esta reseña?')) return;
    DB.reviews = DB.reviews.filter(r => r.id !== id);
    this.publish();
    this.render($('rev-search').value);
    toast('Reseña eliminada', 'info');
  },

  search(q) { this.render(q); },

  init() {
    $('btn-add-review').addEventListener('click', () => this.openNew());
    $('rev-search').addEventListener('input', e => this.search(e.target.value));
    $('form-review').addEventListener('submit', e => { e.preventDefault(); this.save(); });
    this.render();
  }
};

// ─── CENTRO DE CUENTAS MODULE ──────────────────────────────────────────────────
const Cuentas = {
  filtered(q = '') {
    let list = DB.accounts || [];
    if (q) {
      const query = q.toLowerCase();
      list = list.filter(a =>
        a.user.toLowerCase().includes(query) ||
        a.name.toLowerCase().includes(query) ||
        a.role.toLowerCase().includes(query)
      );
    }
    return list;
  },

  render(q = '') {
    const list = this.filtered(q);
    const thead = $('acc-thead');
    const tbody = $('acc-tbody');
    const empty = $('acc-empty');

    if (!thead || !tbody) return;

    thead.innerHTML = `<tr>
      <th>Usuario / Login</th>
      <th>Nombre y Apellido</th>
      <th>Cargo / Rol</th>
      <th>Módulos Habilitados</th>
      <th>Acciones</th>
    </tr>`;

    if (!list.length) {
      tbody.innerHTML = '';
      if (empty) empty.style.display = 'flex';
      return;
    }
    if (empty) empty.style.display = 'none';

    const modLabels = {
      inventario: '📦 Stock',
      cotizaciones: '📋 Leads',
      postventa: '🛠️ Service',
      resenas: '⭐ Reseñas',
      cuentas: '👑 Cuentas'
    };

    tbody.innerHTML = list.map(a => {
      const isSuper = a.isSuperAdmin || a.user === 'admin';
      const permsHTML = (a.modules || []).map(m =>
        `<span class="badge ${m === 'cuentas' ? 'badge--oem' : 'badge--brand'}" style="margin:2px">${modLabels[m]||m}</span>`
      ).join('');

      return `<tr>
        <td>
          <div style="display:flex;align-items:center;gap:.6rem">
            <div style="width:32px;height:32px;border-radius:50%;background:${isSuper ? '#FFB800' : 'rgba(255,184,0,0.2)'};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.85rem;color:${isSuper ? '#000' : 'var(--y)'};flex-shrink:0">${(a.name||a.user).charAt(0).toUpperCase()}</div>
            <span style="font-weight:700;color:var(--t1)">@${a.user}</span>
          </div>
        </td>
        <td><span style="font-weight:600">${a.name}</span></td>
        <td><span class="badge ${isSuper ? 'badge--oem' : 'badge--vis-on'}">${a.role}</span></td>
        <td><div style="display:flex;flex-wrap:wrap;gap:4px">${permsHTML}</div></td>
        <td>
          <div class="row-actions">
            <button class="action-btn action-btn--edit" title="Editar Permisos" onclick="Cuentas.edit('${a.id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            ${isSuper ? '' : `
            <button class="action-btn action-btn--del" title="Eliminar Cuenta" onclick="Cuentas.confirmDelete('${a.id}','${a.user}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
            </button>
            `}
          </div>
        </td>
      </tr>`;
    }).join('');

    const badge = $('badge-cuentas');
    if (badge) badge.textContent = list.length;
  },

  openNew() {
    state.editingId = null;
    $('modal-account-title').textContent = 'Nueva Cuenta CRM';
    $('form-account').reset();
    $('acc-user').disabled = false;
    $('perm-inventario').checked = true;
    $('perm-cotizaciones').checked = true;
    $('perm-presupuestos').checked = true;
    $('perm-postventa').checked = false;
    $('perm-resenas').checked = false;
    $('perm-reportes').checked = false;
    Modal.open('modal-account');
  },

  edit(id) {
    const a = DB.accounts.find(x => x.id === id);
    if (!a) return;
    state.editingId = id;
    $('modal-account-title').textContent = `Editar Permisos: @${a.user}`;
    $('acc-user').value = a.user;
    $('acc-user').disabled = (a.user === 'admin');
    $('acc-pass').value = a.pass || '';
    $('acc-name').value = a.name || '';
    $('acc-role').value = a.role || '';

    const mods = a.modules || [];
    $('perm-inventario').checked = mods.includes('inventario');
    $('perm-cotizaciones').checked = mods.includes('cotizaciones');
    $('perm-presupuestos').checked = mods.includes('presupuestos');
    $('perm-postventa').checked = mods.includes('postventa');
    $('perm-resenas').checked = mods.includes('resenas');
    $('perm-reportes').checked = mods.includes('reportes');

    Modal.open('modal-account');
  },

  save() {
    const user = $('acc-user').value.trim();
    const pass = $('acc-pass').value.trim();
    const name = $('acc-name').value.trim();
    const role = $('acc-role').value.trim();

    if (!user || !pass || !name || !role) {
      toast('Completá todos los campos requeridos', 'error');
      return;
    }

    const modules = [];
    if ($('perm-inventario').checked) modules.push('inventario');
    if ($('perm-cotizaciones').checked) modules.push('cotizaciones');
    if ($('perm-presupuestos').checked) modules.push('presupuestos');
    if ($('perm-postventa').checked) modules.push('postventa');
    if ($('perm-resenas').checked) modules.push('resenas');
    if ($('perm-reportes').checked) modules.push('reportes');

    if (state.editingId) {
      const idx = DB.accounts.findIndex(a => a.id === state.editingId);
      if (idx !== -1) {
        const isSuper = DB.accounts[idx].isSuperAdmin || DB.accounts[idx].user === 'admin';
        if (isSuper) modules.push('cuentas');
        DB.accounts[idx] = {
          ...DB.accounts[idx],
          user,
          pass,
          name,
          role,
          modules
        };
        toast(`Permisos de @${user} actualizados ✓`);
      }
    } else {
      if (DB.accounts.some(a => a.user.toLowerCase() === user.toLowerCase())) {
        toast('Ese nombre de usuario ya existe', 'error');
        return;
      }
      const newAcc = {
        id: `acc-${Date.now()}`,
        user,
        pass,
        name,
        role,
        isSuperAdmin: false,
        modules
      };
      DB.accounts.push(newAcc);
      toast(`Cuenta @${user} creada con éxito ✓`);
    }

    saveDatabase();
    Modal.close('modal-account');
    App.applyPermissions();
    this.render($('acc-search').value);
  },

  confirmDelete(id, username) {
    if (username === 'admin') {
      toast('No se puede eliminar la cuenta principal de Administrador', 'error');
      return;
    }
    if (!confirm(`¿Eliminar la cuenta @${username}?`)) return;
    DB.accounts = DB.accounts.filter(a => a.id !== id);
    saveDatabase();
    App.applyPermissions();
    this.render($('acc-search').value);
    toast(`Cuenta @${username} eliminada`, 'info');
  },

  init() {
    const addBtn = $('btn-add-account');
    if (addBtn) addBtn.addEventListener('click', () => this.openNew());
    const searchInput = $('acc-search');
    if (searchInput) searchInput.addEventListener('input', e => this.render(e.target.value));
    const form = $('form-account');
    if (form) form.addEventListener('submit', e => { e.preventDefault(); this.save(); });
  }
};

// ─── QUOTES (PRESUPUESTOS) MODULE ──────────────────────────────────────────────────
const Quotes = {
  statusLabel: { borrador: 'Borrador', enviado: 'Enviado', aceptado: 'Aceptado', rechazado: 'Rechazado' },
  statusClass: { borrador: 'badge--vis-off', enviado: 'badge--vis-on', aceptado: 'badge--active', rechazado: 'badge--paused' },

  getTotal(items) {
    return items.reduce((s, i) => s + (i.qty * i.price), 0);
  },

  filtered(q = '') {
    let list = DB.quotes || [];
    if (q) {
      const lq = q.toLowerCase();
      list = list.filter(q => q.client.toLowerCase().includes(lq) || q.number.toLowerCase().includes(lq) || q.company.toLowerCase().includes(lq));
    }
    return list;
  },

  render(q = '') {
    const list = this.filtered(q);
    const thead = $('qt-thead');
    const tbody = $('qt-tbody');
    const empty = $('qt-empty');
    if (!thead) return;

    thead.innerHTML = `<tr>
      <th>N° Presupuesto</th><th>Cliente / Empresa</th><th>Fecha</th><th>Válido hasta</th><th>Total USD</th><th>Estado</th><th>Acciones</th>
    </tr>`;

    if (!list.length) { tbody.innerHTML = ''; empty.style.display = 'flex'; return; }
    empty.style.display = 'none';

    tbody.innerHTML = list.map(q => {
      const total = this.getTotal(q.items);
      return `<tr>
        <td><span class="badge badge--oem">${q.number}</span></td>
        <td>
          <div style="font-weight:700;color:var(--t1)">${q.client}</div>
          <div style="font-size:.75rem;color:var(--t3)">${q.company !== q.client ? q.company : ''}</div>
        </td>
        <td style="color:var(--t2);font-size:.85rem">${formatDate(q.date)}</td>
        <td style="color:var(--t2);font-size:.85rem">${formatDate(q.validUntil)}</td>
        <td><span class="td-price-tag">USD ${total.toLocaleString('es-AR')}</span></td>
        <td><span class="badge ${this.statusClass[q.status]}">${this.statusLabel[q.status]}</span></td>
        <td>
          <div class="td-actions">
            <button class="action-btn action-btn--edit" title="Ver / Imprimir PDF" onclick="Quotes.printPDF('${q.id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            </button>
            <button class="action-btn action-btn--edit" title="Editar" onclick="Quotes.edit('${q.id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="action-btn action-btn--del" title="Eliminar" onclick="Quotes.confirmDelete('${q.id}','${q.number}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');

    const badge = $('badge-presupuestos');
    if (badge) badge.textContent = list.length;
  },

  openNew() {
    state.editingId = null;
    $('modal-quote-title').textContent = 'Nuevo Presupuesto';
    $('form-quote').reset();
    // default dates
    const today = new Date().toISOString().split('T')[0];
    const inMonth = new Date(Date.now() + 30*86400000).toISOString().split('T')[0];
    $('qt-date').value = today;
    $('qt-valid').value = inMonth;
    $('qt-status').value = 'borrador';
    this.clearItems();
    this.addItemRow();
    Modal.open('modal-quote');
  },

  edit(id) {
    const q = (DB.quotes||[]).find(x => x.id === id);
    if (!q) return;
    state.editingId = id;
    $('modal-quote-title').textContent = `Editar: ${q.number}`;
    $('qt-client').value = q.client;
    $('qt-company').value = q.company;
    $('qt-phone').value = q.phone;
    $('qt-email').value = q.email;
    $('qt-cuit').value = q.cuit;
    $('qt-date').value = q.date;
    $('qt-valid').value = q.validUntil;
    $('qt-status').value = q.status;
    $('qt-conditions').value = q.conditions;
    $('qt-notes').value = q.notes;
    this.clearItems();
    q.items.forEach(item => this.addItemRow(item));
    Modal.open('modal-quote');
  },

  clearItems() {
    const tbody = $('qt-items-body');
    if (tbody) tbody.innerHTML = '';
  },

  addItemRow(item = {}) {
    const tbody = $('qt-items-body');
    if (!tbody) return;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input class="mf-input qt-item-desc" type="text" placeholder="Descripción del producto o servicio" value="${item.desc||''}" style="width:100%"></td>
      <td><input class="mf-input qt-item-qty" type="number" min="1" value="${item.qty||1}" style="width:70px"></td>
      <td>
        <select class="mf-input qt-item-unit" style="width:100px">
          ${['unidad','kit','par','bidón','metro','hora','servicio'].map(u => `<option${item.unit===u?' selected':''}>${u}</option>`).join('')}
        </select>
      </td>
      <td><input class="mf-input qt-item-price" type="number" min="0" step="0.01" placeholder="0.00" value="${item.price||''}" style="width:100px"></td>
      <td class="qt-item-subtotal" style="font-weight:700;color:var(--y);text-align:right">USD ${((item.qty||1)*(item.price||0)).toLocaleString('es-AR')}</td>
      <td><button type="button" class="action-btn action-btn--del" onclick="this.closest('tr').remove();Quotes.recalcTotal()" title="Quitar" style="width:28px;height:28px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button></td>`;
    row.querySelectorAll('input, select').forEach(el => el.addEventListener('input', () => this.recalcTotal()));
    tbody.appendChild(row);
    this.recalcTotal();
  },

  recalcTotal() {
    const rows = document.querySelectorAll('#qt-items-body tr');
    let total = 0;
    rows.forEach(row => {
      const qty = parseFloat(row.querySelector('.qt-item-qty')?.value) || 0;
      const price = parseFloat(row.querySelector('.qt-item-price')?.value) || 0;
      const sub = qty * price;
      const subCell = row.querySelector('.qt-item-subtotal');
      if (subCell) subCell.textContent = `USD ${sub.toLocaleString('es-AR')}`;
      total += sub;
    });
    const el = $('qt-total-display');
    if (el) el.textContent = `USD ${total.toLocaleString('es-AR')}`;
  },

  collectItems() {
    const rows = document.querySelectorAll('#qt-items-body tr');
    return Array.from(rows).map(row => ({
      desc: row.querySelector('.qt-item-desc')?.value.trim() || '',
      qty: parseFloat(row.querySelector('.qt-item-qty')?.value) || 1,
      unit: row.querySelector('.qt-item-unit')?.value || 'unidad',
      price: parseFloat(row.querySelector('.qt-item-price')?.value) || 0,
    })).filter(i => i.desc);
  },

  save() {
    const client = $('qt-client').value.trim();
    const company = $('qt-company').value.trim() || client;
    if (!client) { toast('El nombre del cliente es obligatorio', 'error'); return; }
    const items = this.collectItems();
    if (!items.length) { toast('Agrego al menos un producto o servicio', 'error'); return; }

    const data = {
      client, company,
      phone: $('qt-phone').value.trim(),
      email: $('qt-email').value.trim(),
      cuit: $('qt-cuit').value.trim(),
      date: $('qt-date').value,
      validUntil: $('qt-valid').value,
      status: $('qt-status').value,
      conditions: $('qt-conditions').value.trim(),
      notes: $('qt-notes').value.trim(),
      items,
    };

    if (state.editingId) {
      const idx = DB.quotes.findIndex(q => q.id === state.editingId);
      if (idx !== -1) { DB.quotes[idx] = { ...DB.quotes[idx], ...data }; toast('Presupuesto actualizado ✓'); }
    } else {
      const num = `PRE-${new Date().getFullYear()}-${String(nextId.quote++).padStart(3,'0')}`;
      DB.quotes.push({ id: `Q${Date.now()}`, number: num, ...data });
      toast('Presupuesto creado ✓');
    }
    saveDatabase();
    Modal.close('modal-quote');
    this.render($('qt-search')?.value || '');
  },

  confirmDelete(id, number) {
    if (!confirm(`¿Eliminar el presupuesto ${number}?`)) return;
    DB.quotes = DB.quotes.filter(q => q.id !== id);
    saveDatabase();
    this.render();
    toast('Presupuesto eliminado', 'info');
  },

  printPDF(id) {
    const q = (DB.quotes||[]).find(x => x.id === id);
    if (!q) return;
    const total = this.getTotal(q.items);
    const itemsHTML = q.items.map(i => `
      <tr>
        <td style="padding:8px 10px;border-bottom:1px solid #2a2a3a">${i.desc}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #2a2a3a;text-align:center">${i.qty}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #2a2a3a;text-align:center">${i.unit}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #2a2a3a;text-align:right">USD ${i.price.toLocaleString('es-AR')}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #2a2a3a;text-align:right;font-weight:700">USD ${(i.qty*i.price).toLocaleString('es-AR')}</td>
      </tr>`).join('');

    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
    <title>${q.number} — Maquinarias 9 de Abril</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: 'Segoe UI', Arial, sans-serif; background:#fff; color:#111; padding:40px; max-width:900px; margin:0 auto; }
      .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px; border-bottom:3px solid #FFB800; padding-bottom:20px; }
      .brand-wrap { display:flex; align-items:center; gap:20px; }
      .brand-logo { max-height:75px; width:auto; object-fit:contain; display:block; }
      .brand h1 { font-size:1.5rem; font-weight:900; color:#111; }
      .brand p { font-size:.85rem; color:#555; margin-top:4px; }
      .quote-meta { text-align:right; }
      .quote-meta .number { font-size:1.2rem; font-weight:800; color:#FFB800; }
      .quote-meta p { font-size:.82rem; color:#555; margin-top:2px; }
      .section { margin-bottom:24px; }
      .section h3 { font-size:.78rem; font-weight:700; color:#888; text-transform:uppercase; letter-spacing:.08em; margin-bottom:10px; }
      .client-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px 24px; }
      .client-field label { font-size:.72rem; color:#888; display:block; }
      .client-field span { font-size:.9rem; font-weight:600; color:#111; }
      table { width:100%; border-collapse:collapse; margin-top:8px; }
      thead th { background:#111; color:#FFB800; padding:10px; font-size:.8rem; text-align:left; }
      thead th:last-child, thead th:nth-child(4) { text-align:right; }
      thead th:nth-child(2), thead th:nth-child(3) { text-align:center; }
      .total-row td { background:#f9f9f9; font-weight:800; font-size:1rem; padding:12px 10px; border-top:2px solid #FFB800; }
      .footer { margin-top:32px; padding-top:16px; border-top:1px solid #eee; display:grid; grid-template-columns:1fr 1fr; gap:24px; }
      .footer p { font-size:.8rem; color:#555; line-height:1.6; }
      .footer strong { color:#111; display:block; margin-bottom:4px; }
      .sign-block { margin-top:48px; text-align:center; }
      .sign-block .line { border-top:1px solid #bbb; width:220px; margin:0 auto 6px; }
      .sign-block p { font-size:.78rem; color:#888; }
      .badge { display:inline-block; padding:3px 10px; border-radius:99px; font-size:.75rem; font-weight:700; }
      .badge-yellow { background:#fff3cc; color:#a67c00; }
      @media print { body { padding:20px; } button { display:none; } }
    </style></head><body>
    <div class="header">
      <div class="brand-wrap">
        <img src="/assets/logotipo_png.png" alt="Maquinarias 9 de Abril" class="brand-logo">
        <div class="brand">
          <h1>Maquinarias 9 de Abril</h1>
          <p>Autoelevadores • Repuestos OEM • Camiones</p>
          <p style="margin-top:8px;font-size:.8rem">Buenos Aires, Argentina &nbsp;|&nbsp; +54 9 11 2673-8983</p>
        </div>
      </div>
      <div class="quote-meta">
        <div class="number">${q.number}</div>
        <p>Fecha: <strong>${formatDate(q.date)}</strong></p>
        <p>Válido hasta: <strong>${formatDate(q.validUntil)}</strong></p>
        <p style="margin-top:6px"><span class="badge badge-yellow">${this.statusLabel[q.status]}</span></p>
      </div>
    </div>

    <div class="section">
      <h3>Datos del Cliente</h3>
      <div class="client-grid">
        <div class="client-field"><label>Nombre / Razón Social</label><span>${q.client}</span></div>
        <div class="client-field"><label>Empresa</label><span>${q.company}</span></div>
        <div class="client-field"><label>Teléfono / WhatsApp</label><span>${q.phone||'—'}</span></div>
        <div class="client-field"><label>Email</label><span>${q.email||'—'}</span></div>
        ${q.cuit ? `<div class="client-field"><label>CUIT</label><span>${q.cuit}</span></div>` : ''}
      </div>
    </div>

    <div class="section">
      <h3>Detalle del Presupuesto</h3>
      <table>
        <thead><tr>
          <th>Producto / Servicio</th><th style="text-align:center">Cant.</th><th style="text-align:center">Unidad</th><th style="text-align:right">P. Unit.</th><th style="text-align:right">Subtotal</th>
        </tr></thead>
        <tbody>${itemsHTML}</tbody>
        <tfoot><tr class="total-row">
          <td colspan="4" style="padding:12px 10px">TOTAL GENERAL</td>
          <td style="padding:12px 10px;text-align:right;color:#a67c00">USD ${total.toLocaleString('es-AR')}</td>
        </tr></tfoot>
      </table>
    </div>

    <div class="footer">
      <div><strong>Condiciones</strong><p>${q.conditions||'Consultar condiciones con el vendedor.'}</p></div>
      ${q.notes ? `<div><strong>Observaciones</strong><p>${q.notes}</p></div>` : '<div></div>'}
    </div>

    <div class="sign-block" style="margin-top:60px;display:flex;justify-content:space-around">
      <div><div class="line"></div><p>Firma y Sello del Vendedor</p></div>
      <div><div class="line"></div><p>Conformidad del Cliente</p></div>
    </div>

    <div style="text-align:center;margin-top:32px">
      <button onclick="window.print()" style="background:#FFB800;color:#000;border:none;padding:10px 28px;border-radius:8px;font-weight:800;font-size:1rem;cursor:pointer">Imprimir / Guardar PDF</button>
    </div>
    </body></html>`);
    win.document.close();
  },

  init() {
    const addBtn = $('btn-add-quote');
    if (addBtn) addBtn.addEventListener('click', () => this.openNew());
    const search = $('qt-search');
    if (search) search.addEventListener('input', e => this.render(e.target.value));
    const form = $('form-quote');
    if (form) form.addEventListener('submit', e => { e.preventDefault(); this.save(); });
    const addItemBtn = $('qt-add-item');
    if (addItemBtn) addItemBtn.addEventListener('click', () => this.addItemRow());
  }
};

// ─── REPORTS MODULE ──────────────────────────────────────────────────────────────
const Reports = {
  render() {
    this.renderMetrics();
    this.renderAlerts();
    this.renderLeadDistribution();
    this.renderRecentQuotes();
    this.bindMobileToggle();
  },

  bindMobileToggle() {
    const btn = $('rpt-toggle-btn');
    const grid = $('rpt-metrics-grid');
    const chev = $('rpt-toggle-chevron');
    const label = $('rpt-toggle-label');
    if (!btn || !grid) return;
    if (btn._bound) return;
    btn._bound = true;
    btn.addEventListener('click', () => {
      const exp = btn.classList.toggle('expanded');
      grid.classList.toggle('expanded');
      if (chev) chev.style.transform = exp ? 'rotate(180deg)' : '';
      if (label) label.textContent = exp ? 'Ocultar Métricas Principales' : 'Ver Métricas Principales (5 KPIs)';
    });
  },

  renderMetrics() {
    let totalUsd = 0;
    let totalArs = 0;

    // Stock value from active equipment
    const activeEquipArr = [
      ...(DB.autoelevadores || []).filter(x => x.status === 'active'),
      ...(DB.camiones || []).filter(x => x.status === 'active')
    ];
    
    activeEquipArr.forEach(x => {
      if ((x.currency || 'USD') === 'ARS') totalArs += x.price || 0;
      else totalUsd += x.price || 0;
    });

    // Stock value from parts
    (DB.repuestos || []).forEach(x => {
      const p = (x.price || 0) * (x.stock || 0);
      if ((x.currency || 'USD') === 'ARS') totalArs += p;
      else totalUsd += p;
    });

    let stockStr = [];
    if (totalUsd > 0 || totalArs === 0) stockStr.push(`USD ${totalUsd.toLocaleString('es-AR')}`);
    if (totalArs > 0) stockStr.push(`ARS ${totalArs.toLocaleString('es-AR')}`);

    // Active equipment count
    const activeEquipCount = activeEquipArr.length;

    // Active leads (all non-ganado/perdido columns)
    const allLeads = Object.values(DB.leads || {}).flat();
    const activeLeads = allLeads.filter(l => l).length;
    const wonLeads = ((DB.leads && DB.leads.ganado) || []).length;

    // Quotes
    const totalQuotes = (DB.quotes || []).length;
    const sentQuotes = (DB.quotes || []).filter(q => q.status === 'enviado').length;

    const set = (id, val) => { const el = $(id); if (el) el.textContent = val; };
    set('rpt-stock-val', stockStr.join(' + '));
    set('rpt-active-equip', activeEquipCount);
    set('rpt-active-leads', activeLeads);
    set('rpt-won-leads', wonLeads);
    set('rpt-total-quotes', totalQuotes);
    set('rpt-sent-quotes', sentQuotes);
  },

  renderAlerts() {
    const el = $('rpt-alerts');
    if (!el) return;
    const alerts = [];

    // Low stock parts
    DB.repuestos.filter(r => r.stock <= 3).forEach(r => {
      const cls = r.stock === 0 ? 'rpt-alert--danger' : 'rpt-alert--warning';
      alerts.push(`<div class="rpt-alert ${cls}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <div><strong>${r.name}</strong> <span class="badge badge--oem">${r.oem}</span><br>
        <span>${r.stock === 0 ? '❌ Sin stock' : `⚠️ Stock crítico: ${r.stock} unidades`}</span></div>
      </div>`);
    });

    // Warranties expiring soon (next 60 days)
    const now = Date.now();
    const in60 = now + 60 * 86400000;
    DB.units.forEach(u => {
      const exp = new Date(u.warrantyExpiry + 'T12:00:00').getTime();
      if (exp > now && exp <= in60) {
        const days = Math.ceil((exp - now) / 86400000);
        alerts.push(`<div class="rpt-alert rpt-alert--info">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div><strong>Garantía por vencer: ${u.model}</strong><br>
          <span>Cliente: ${u.client} — Vence en ${days} días (${formatDate(u.warrantyExpiry)})</span></div>
        </div>`);
      } else if (exp <= now) {
        alerts.push(`<div class="rpt-alert rpt-alert--danger">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div><strong>Garantía vencida: ${u.model}</strong><br>
          <span>Cliente: ${u.client} — Venció el ${formatDate(u.warrantyExpiry)}</span></div>
        </div>`);
      }
    });

    el.innerHTML = alerts.length
      ? alerts.join('')
      : `<div class="rpt-alert rpt-alert--ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="20 6 9 17 4 12"/></svg><div><strong>Sin alertas activas</strong><span>Stock y garantías en orden.</span></div></div>`;
  },

  renderLeadDistribution() {
    const el = $('rpt-leads-chart');
    if (!el) return;
    const stages = [
      { key: 'nuevas',      label: 'Nuevas',     color: '#3b82f6' },
      { key: 'cotizacion',  label: 'Cotización', color: '#f59e0b' },
      { key: 'enviado',     label: 'Enviado',    color: '#8b5cf6' },
      { key: 'ganado',      label: 'Ganados',    color: '#22c55e' },
    ];
    const total = Object.values(DB.leads).flat().length || 1;
    el.innerHTML = stages.map(s => {
      const count = (DB.leads[s.key] || []).length;
      const pct = Math.round(count / total * 100);
      return `<div class="rpt-bar-row">
        <div class="rpt-bar-label">${s.label}</div>
        <div class="rpt-bar-track">
          <div class="rpt-bar-fill" style="width:${pct}%;background:${s.color}"></div>
        </div>
        <div class="rpt-bar-count">${count} <span>(${pct}%)</span></div>
      </div>`;
    }).join('');
  },

  renderRecentQuotes() {
    const el = $('rpt-recent-quotes');
    if (!el) return;
    const recents = [...(DB.quotes||[])].reverse().slice(0, 5);
    if (!recents.length) { el.innerHTML = '<p style="color:var(--t3);font-size:.85rem">Sin presupuestos aun.</p>'; return; }
    const sc = Quotes.statusClass;
    const sl = Quotes.statusLabel;
    el.innerHTML = recents.map(q => {
      const total = Quotes.getTotal(q.items);
      return `<div class="rpt-quote-row">
        <div><span class="badge badge--oem" style="margin-right:.5rem">${q.number}</span><strong>${q.client}</strong></div>
        <div style="display:flex;align-items:center;gap:.75rem;flex-shrink:0">
          <span style="font-weight:700;color:var(--y)">USD ${total.toLocaleString('es-AR')}</span>
          <span class="badge ${sc[q.status]}">${sl[q.status]}</span>
        </div>
      </div>`;
    }).join('');
  },

  init() {}
};

// ─── APP INIT ─────────────────────────────────────────────────────────────────
const App = {
  applyPermissions() {
    const user = Auth.getCurrentUser();
    state.currentUser = user;

    // Update Top Header User Pill
    const userAvatarEl = document.querySelector('.th-avatar');
    const userNameEl = document.querySelector('.th-user-name');
    const userRoleEl = document.querySelector('.th-user-role');
    const heroTitleEl = document.querySelector('.crm-hh-title');
    const heroAvatarEl = document.querySelector('.crm-hh-avatar');

    const initial = user.name ? user.name.charAt(0).toUpperCase() : 'A';
    if (userAvatarEl) userAvatarEl.textContent = initial;
    if (userNameEl) userNameEl.textContent = user.name || user.user;
    if (userRoleEl) userRoleEl.textContent = user.role || 'Usuario CRM';
    if (heroTitleEl) heroTitleEl.textContent = `Bienvenido, ${user.name ? user.name.split(' ')[0] : user.user}`;
    if (heroAvatarEl) heroAvatarEl.textContent = initial;

    // Module list allowed
    const allowed = user.modules || ['inventario', 'cotizaciones', 'postventa', 'resenas'];
    if (user.isSuperAdmin || user.user === 'admin') {
      if (!allowed.includes('cuentas')) allowed.push('cuentas');
      if (!allowed.includes('presupuestos')) allowed.push('presupuestos');
      if (!allowed.includes('reportes')) allowed.push('reportes');
    }

    // Toggle Sidebar Items & Bottom Nav Items & Home Cards
    ['inventario', 'cotizaciones', 'presupuestos', 'postventa', 'resenas', 'reportes', 'cuentas'].forEach(mod => {
      const sbItem = $(`nav-${mod}`);
      const bnavItem = $(`bnav-${mod}`);
      const hmodItem = $(`hmod-${mod}`) || document.querySelector(`.crm-hmod-card[data-view="${mod}"]`);
      const hasPerm = allowed.includes(mod);

      if (sbItem) sbItem.style.display = hasPerm ? 'flex' : 'none';
      if (bnavItem) bnavItem.style.display = hasPerm ? 'flex' : 'none';
      if (hmodItem) hmodItem.style.display = hasPerm ? 'flex' : 'none';
    });

    // Update Accounts Badge
    const accBadge = $('badge-cuentas');
    if (accBadge && DB.accounts) accBadge.textContent = DB.accounts.length;
  },

  init() {
    loadDatabase();
    Modal.init();
    Router.init();
    Inv.init();
    K.init();
    PV.init();
    Rev.init();
    Cuentas.init();
    Quotes.init();
    Reports.init();

    this.applyPermissions();

    const toggleBtn = $('sb-toggle-mobile');
    const sidebar = $('sidebar');
    const backdrop = $('sidebar-backdrop');

    function openSidebar() {
      if (sidebar) sidebar.classList.add('mobile-open');
      if (backdrop) backdrop.classList.add('active');
    }

    function closeSidebar() {
      if (sidebar) sidebar.classList.remove('mobile-open');
      if (backdrop) backdrop.classList.remove('active');
    }

    if (toggleBtn) toggleBtn.addEventListener('click', openSidebar);
    if (backdrop) backdrop.addEventListener('click', closeSidebar);

    const user = Auth.getCurrentUser();
    const allowed = user.modules || ['inventario','cotizaciones'];
    let initialView = localStorage.getItem('m9-admin-view');
    if (!initialView || !allowed.includes(initialView)) {
      initialView = window.innerWidth < 769 ? 'home' : (allowed[0] || 'inventario');
    }
    Router.go(initialView);
  }
};

// ─── GLOBAL DRAG & SELECTION FAILSAFE ─────────────────────────────────────────
function resetDragFailsafe() {
  document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
  document.querySelectorAll('.drag-active').forEach(el => el.classList.remove('drag-active'));
  document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  if (typeof K !== 'undefined') {
    K.draggingId = null;
    K.draggingFrom = null;
  }
}

window.addEventListener('mouseup', resetDragFailsafe);
window.addEventListener('dragend', resetDragFailsafe);
window.addEventListener('mouseleave', resetDragFailsafe);
window.addEventListener('blur', resetDragFailsafe);

// ─── BOOTSTRAP ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
});
