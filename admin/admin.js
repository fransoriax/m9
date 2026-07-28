/* ════════════════════════════════════════════
   MAQUINARIAS 9 DE ABRIL — ADMIN PANEL JS
   WhatsApp: (011) 2673-8983 → 5491126738983
════════════════════════════════════════════ */

'use strict';

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const WA_NUMBER = '5491126738983';
const CREDENTIALS = { user: 'admin', pass: 'admin' };

// ─── STATE ────────────────────────────────────────────────────────────────────
let state = {
  activeView: 'inventario',
  activeTab: 'autoelevadores',
  searchQuery: '',
  filterStatus: '',
  filterBrand: '',
  editingId: null,
  deletingId: null,
  deletingType: null,
  activeUnitId: null,
  activeLeadId: null,
  serviceUnitId: null,
};

// ─── MOCK DATA & STORAGE ──────────────────────────────────────────────────────
let DB = {
  autoelevadores: [
    { id: 1, name: 'Hangcha XS-20 Eléctrico', brand: 'Hangcha', capacity: '2.000 kg', motor: 'Eléctrico', hours: 1200, price: 18500, status: 'active', visible: true, img: '/assets/electric_forklift.png' },
    { id: 2, name: 'HELI CPD15 Eléctrico',     brand: 'HELI',    capacity: '1.500 kg', motor: 'Eléctrico', hours: 850,  price: 14200, status: 'active', visible: true, img: '/assets/apiladora.jpg' },
    { id: 3, name: 'Toyota 8FGF15 GLP',         brand: 'Toyota',  capacity: '1.500 kg', motor: 'GLP',       hours: 3400, price: 22000, status: 'active', visible: true, img: '/assets/autoelevador.jpg' },
    { id: 4, name: 'Hangcha CPCD35 Diesel',     brand: 'Hangcha', capacity: '3.500 kg', motor: 'Diesel',    hours: 2100, price: 27500, status: 'active', visible: true, img: '/assets/diesel_forklift.png' },
    { id: 5, name: 'Hecha CBD20 Eléctrico',     brand: 'Hecha',   capacity: '2.000 kg', motor: 'Eléctrico', hours: 600,  price: 12800, status: 'paused', visible: false, img: '/assets/apilador.png' },
  ],
  repuestos: [
    { id: 1, oem: 'OEM-BAT-48500', name: 'Batería 48V 500Ah',   category: 'Eléctrico',  stock: 12, price: 1850, status: 'active', compat: 'Hangcha XS-20, HELI CPD15', img: '/assets/bateria_electrica.jpg' },
    { id: 2, oem: 'OEM-FIL-HID',  name: 'Filtro Hidráulico',    category: 'Hidráulico', stock: 45, price: 85,   status: 'active', compat: 'Universal',                   img: '/assets/forklift_parts.png' },
    { id: 3, oem: 'OEM-PAF-T15',  name: 'Pastillas de Freno',   category: 'Frenos',     stock: 8,  price: 120,  status: 'active', compat: 'Toyota 8FGF15, HELI CPD15',   img: '/assets/forklift_parts.png' },
    { id: 4, oem: 'OEM-BOM-H20',  name: 'Bomba Hidráulica',     category: 'Hidráulico', stock: 3,  price: 2200, status: 'active', compat: 'Hangcha XS-20, Hangcha CPCD35', img: '/assets/bomba_hidraulica.jpg' },
    { id: 5, oem: 'OEM-CAR-4880', name: 'Cargador 48V 80A',     category: 'Eléctrico',  stock: 6,  price: 780,  status: 'active', compat: 'Universal eléctrico',         img: '/assets/bateria_electrica.jpg' },
    { id: 6, oem: 'OEM-MAS-T3M',  name: 'Mástil Telescópico 3m',category: 'Estructura', stock: 0,  price: 4500, status: 'paused', compat: 'Hangcha XS-20',                 img: '/assets/forklift_parts.png' },
  ],
  camiones: [
    { id: 1, name: 'Mercedes Benz Actros 2651', brand: 'Mercedes Benz', capacity: '26 Tn', motor: 'Diesel', hours: 380000, price: 95000, status: 'active', visible: true, img: '/assets/truck.png' },
    { id: 2, name: 'Volvo FH 460',              brand: 'Volvo',         capacity: '24 Tn', motor: 'Diesel', hours: 210000, price: 110000, status: 'active', visible: true, img: '/assets/truck.png' },
    { id: 3, name: 'Scania R450 6×2',           brand: 'Scania',        capacity: '22 Tn', motor: 'Diesel', hours: 290000, price: 88000, status: 'paused', visible: false, img: '/assets/truck.png' },
  ],
  leads: {
    nuevas: [
      { id: 'L001', client: 'Juan García', phone: '+54 9 11 5678-1234', product: 'Autoelevador Eléctrico 2T', date: '2026-07-23', urgency: 'alta', notes: [] },
      { id: 'L002', client: 'Logística del Sur SRL', phone: '+54 9 11 8765-4321', product: '5 unidades Hangcha XS-20', date: '2026-07-22', urgency: 'alta', notes: [] },
    ],
    cotizacion: [
      { id: 'L003', client: 'Carlos Mendoza', phone: '+54 9 11 5555-4444', product: 'Filtro hidráulico OEM-FIL-HID x10', date: '2026-07-21', urgency: 'media', notes: ['Cliente pidió precio final el viernes'] },
    ],
    enviado: [
      { id: 'L004', client: 'Frigorífico Norte SA', phone: '+54 9 11 7777-8888', product: 'Hangcha CPCD35 Diesel 3.5T', date: '2026-07-19', urgency: 'media', notes: ['Presupuesto enviado por mail el 19/07'] },
    ],
    ganado: [
      { id: 'L005', client: 'Distribuidora Pérez', phone: '+54 9 11 9999-0000', product: '2× HELI CPD15 Eléctrico', date: '2026-07-15', urgency: 'normal', notes: ['¡Cerrado! Entrega programada para 30/07'] },
    ],
  },
  units: [
    {
      id: 'U001', model: 'Hangcha XS-20 Eléctrico', serial: 'HC-2024-001', chassis: 'CHX20240001',
      client: 'Logística del Sur SRL', saleDate: '2024-03-15', warrantyExpiry: '2025-03-15',
      img: '/assets/electric_forklift.png',
      services: [
        { id: 'S1', date: '2024-06-01', hours: 500,  type: 'Cambio de aceite y filtros',  parts: 'Filtro OEM-FIL-HID, Aceite 10W40 5L', notes: 'Equipo en perfecto estado. Se realizó el primer service de 500hs sin novedades.', tech: 'Ramiro Blanco' },
        { id: 'S2', date: '2024-09-15', hours: 1000, type: 'Service general',               parts: 'Filtro OEM-FIL-HID, Pastillas OEM-PAF-T15, Aceite 10W40 5L', notes: 'Se reemplazaron pastillas de freno por desgaste. Todo lo demás OK. Próximo service: 1500hs.', tech: 'Pablo Ríos' },
      ]
    },
    {
      id: 'U002', model: 'HELI CPD15 Eléctrico', serial: 'HE-2023-087', chassis: 'HLC20230087',
      client: 'Frigorífico Norte SA', saleDate: '2023-11-10', warrantyExpiry: '2024-11-10',
      img: '/assets/apiladora.jpg',
      services: [
        { id: 'S3', date: '2024-02-15', hours: 300, type: 'Ajuste de frenos', parts: 'Pastillas OEM-PAF-T15', notes: 'Cliente reportó frenado con vibración. Se ajustaron pastillas traseras. Solución aplicada con éxito.', tech: 'Ramiro Blanco' },
        { id: 'S4', date: '2024-05-20', hours: 600, type: 'Cambio de batería', parts: 'Batería OEM-BAT-48500, Cargador OEM-CAR-4880', notes: 'Batería original con capacidad reducida al 60%. Se reemplazó por unidad nueva. Rendimiento óptimo restaurado.', tech: 'Pablo Ríos' },
      ]
    },
    {
      id: 'U003', model: 'Toyota 8FGF15 GLP', serial: 'TY-2024-022', chassis: 'TOY20240022',
      client: 'Distribuidora Pérez', saleDate: '2024-05-20', warrantyExpiry: '2025-05-20',
      img: '/assets/autoelevador.jpg',
      services: [
        { id: 'S5', date: '2024-09-10', hours: 200, type: 'Mantenimiento preventivo', parts: 'Filtro OEM-FIL-HID, Aceite 10W40 3L', notes: 'Primera revisión preventiva. Equipo en excelentes condiciones. Sin observaciones.', tech: 'Matías Sosa' },
      ]
    },
  ],
  reviews: [
    { id: 'R001', author: 'Carlos Mendoza', stars: 5, date: 'hace 2 meses', text: 'Excelente atención y servicio. Compramos un autoelevador Toyota y quedamos muy conformes con la calidad del equipo y el asesoramiento del equipo de ventas. Muy profesionales.', visible: true },
    { id: 'R002', author: 'Logística del Sur SRL', stars: 5, date: 'hace 4 meses', text: 'Adquirimos 3 unidades Hangcha para nuestro depósito. El servicio postventa es impecable, responden rápido y los repuestos son originales. Los recomendamos sin dudas.', visible: true },
    { id: 'R003', author: 'María González', stars: 5, date: 'hace 1 mes', text: 'Muy buena experiencia. El equipo de trabajo es muy atento y nos asesoraron perfectamente para elegir el apilador eléctrico que necesitábamos. Entrega en tiempo y forma.', visible: true },
    { id: 'R004', author: 'Distribuidora Norte SA', stars: 4, date: 'hace 6 meses', text: 'Buen servicio técnico y atención al cliente. Los repuestos OEM llegan rápido y a buen precio. Seguimos eligiéndolos para el mantenimiento de toda nuestra flota.', visible: true },
    { id: 'R005', author: 'Ricardo Flores', stars: 5, date: 'hace 3 semanas', text: 'Compramos un autoelevador diesel de segunda mano en excelente estado. Precio justo, documentación en orden y garantía real. Muy recomendable para empresas que buscan calidad.', visible: true },
  ],
};

function loadDatabase() {
  try {
    const saved = localStorage.getItem('m9-inventory-db');
    if (saved) {
      const parsed = JSON.parse(saved);
      DB = { ...DB, ...parsed };
    } else {
      saveDatabase();
    }
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
  } catch(e) {
    console.error('Error al guardar base de datos:', e);
  }
}

let nextId = { auto: 6, rep: 7, cam: 4, lead: 6, service: 6 };

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

// ─── AUTH MODULE ──────────────────────────────────────────────────────────────
const Auth = {
  check() {
    return sessionStorage.getItem('m9-auth') === '1';
  },
  login(user, pass) {
    return user === CREDENTIALS.user && pass === CREDENTIALS.pass;
  },
  logout() {
    sessionStorage.removeItem('m9-auth');
    $('app').style.display = 'none';
    $('login-screen').style.display = 'flex';
    $('login-user').value = '';
    $('login-pass').value = '';
  },
  init() {
    if (this.check()) {
      this.showApp();
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
  },
  showApp() {
    $('login-screen').style.display = 'none';
    $('app').style.display = 'flex';
    App.init();
  }
};

// ─── ROUTER ───────────────────────────────────────────────────────────────────
const Router = {
  titles: {
    home:         { title: 'Inicio',                     crumb: 'Panel de Control M9' },
    inventario:   { title: 'Inventario & Stock',         crumb: 'Gestión de productos, maquinaria y stock' },
    cotizaciones: { title: 'Cotizaciones & Leads',       crumb: 'Tablero Kanban de seguimiento comercial' },
    postventa:    { title: 'Post-Venta & Service',       crumb: 'Historial de unidades vendidas y mantenimientos' },
    resenas:      { title: 'Reseñas Google',             crumb: 'Gestión de opiniones visibles en el sitio web' },
  },
  go(view) {
    state.activeView = view;
    $$('.view-panel').forEach(p => p.classList.remove('active-panel'));
    $$('.sb-item').forEach(b => b.classList.remove('active'));
    $$('.bnav-item').forEach(b => b.classList.remove('active'));
    $$('.crm-hmod-card').forEach(b => b.classList.remove('active'));

    const targetPanel = $(`view-${view}`);
    const targetSb = $(`nav-${view}`);
    const targetBnav = $(`bnav-${view}`);

    if (targetPanel) targetPanel.classList.add('active-panel');
    if (targetSb) targetSb.classList.add('active');
    if (targetBnav) targetBnav.classList.add('active');

    // Control de botón volver al inicio en celulares
    const backBtn = $('btn-back-home');
    if (backBtn) {
      if (view === 'home') {
        backBtn.style.display = 'none';
      } else {
        backBtn.style.display = 'inline-flex';
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
    if (view === 'postventa')    PV.render();
    if (view === 'resenas')      Rev.render();
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
        <th>Foto</th><th>Código OEM</th><th>Nombre</th><th>Categoría</th>
        <th>Precio</th><th>Stock</th><th>Compatibilidad</th>
        <th>Estado</th><th>Acciones</th>
      </tr>`;
    } else {
      thead.innerHTML = `<tr>
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
    if (items.length === 0) {
      tbody.innerHTML = '';
      empty.style.display = 'flex';
      return;
    }
    empty.style.display = 'none';
    if (state.activeTab === 'repuestos') {
      tbody.innerHTML = items.map(r => {
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
        return `<tr>
          <td>${thumb}</td>
          <td><span class="badge badge--oem">${r.oem}</span></td>
          <td><div class="td-name">${r.name}</div></td>
          <td><span class="badge badge--cat">${r.category||'General'}</span></td>
          <td><span class="td-price-tag">USD ${r.price.toLocaleString('es-AR')}</span></td>
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
      tbody.innerHTML = items.map(item => {
        const statusBadge = item.status === 'active'
          ? `<span class="badge badge--active">Activo</span>`
          : `<span class="badge badge--paused">Pausado</span>`;
        const visBadge = item.visible
          ? `<span class="badge badge--vis-on">● Visible</span>`
          : `<span class="badge badge--vis-off">Oculto</span>`;
        const thumb = item.img
          ? `<img class="td-thumb" src="${item.img}" alt="${item.name}" loading="lazy">`
          : `<div class="td-thumb-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;
        return `<tr>
          <td>${thumb}</td>
          <td><div class="td-name">${item.name}</div></td>
          <td><span class="badge badge--brand">${item.brand}</span></td>
          <td><div class="td-specs-row"><span class="td-spec-chip">Capacidad: ${item.capacity||'—'}</span> <span class="td-spec-chip">Motor: ${item.motor||'—'}</span></div></td>
          <td></td>
          <td><span class="td-price-tag">USD ${item.price.toLocaleString('es-AR')}</span></td>
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
    // Update badge
    const total = DB.autoelevadores.length + DB.repuestos.length + DB.camiones.length;
    $('badge-inv').textContent = total;
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
      $('m-status').value = item.status;
      $('m-visible').checked = item.visible;
      $('m-vis-lbl').textContent = item.visible ? 'Visible en el sitio' : 'Oculto en el sitio';
      $('img-preview').innerHTML = '';
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
  doDelete() {
    const { deletingId: id, deletingType: type } = state;
    if (type === 'rep') {
      DB.repuestos = DB.repuestos.filter(x => x.id !== id);
    } else {
      DB[state.activeTab] = DB[state.activeTab].filter(x => x.id !== id);
    }
    Modal.close('modal-delete');
    this.publish();
    this.render();
    toast('Registro eliminado correctamente', 'success');
    state.deletingId = null; state.deletingType = null;
  },
  openAdd() {
    state.editingId = null;
    if (state.activeTab === 'repuestos') {
      $('modal-repuesto-title').textContent = 'Nuevo Repuesto';
      $('form-repuesto').reset();
      $('r-stock').value = 0;
      this.setRepImg(null);
      Modal.open('modal-repuesto');
    } else {
      $('modal-machinery-title').textContent = state.activeTab === 'camiones' ? 'Nuevo Camión' : 'Nueva Maquinaria';
      $('form-machinery').reset();
      $('m-visible').checked = true;
      $('m-vis-lbl').textContent = 'Visible en el sitio';
      $('img-preview').innerHTML = '';
      $('pdf-filename').textContent = 'Ningún archivo seleccionado';
      Modal.open('modal-machinery');
    }
  },
  saveMachinery() {
    const name = $('m-name').value.trim();
    const brand = $('m-brand').value;
    const price = parseFloat($('m-price').value);
    if (!name || !brand || isNaN(price)) { toast('Completá los campos obligatorios (*)', 'error'); return; }
    const item = {
      name, brand,
      capacity: $('m-capacity').value.trim(),
      motor:    $('m-motor').value,
      hours:    parseInt($('m-hours').value) || 0,
      price,
      status:   $('m-status').value,
      visible:  $('m-visible').checked,
      img: null,
    };
    if (state.editingId) {
      const idx = DB[state.activeTab].findIndex(x => x.id === state.editingId);
      if (idx !== -1) DB[state.activeTab][idx] = { ...DB[state.activeTab][idx], ...item };
      toast('Equipo actualizado correctamente');
    } else {
      const tab = state.activeTab;
      const newId = tab === 'camiones' ? nextId.cam++ : nextId.auto++;
      DB[state.activeTab].unshift({ id: newId, ...item, img: '/assets/electric_forklift.png' });
      toast('Equipo agregado correctamente');
    }
    Modal.close('modal-machinery');
    this.publish();
    this.render();
  },
  publish() {
    saveDatabase();
  },
  saveRepuesto() {
    const oem  = $('r-oem').value.trim();
    const name = $('r-name').value.trim();
    const price = parseFloat($('r-price').value);
    if (!oem || !name || isNaN(price)) { toast('Completá los campos obligatorios (*)', 'error'); return; }
    const item = {
      oem, name,
      category: $('r-category').value,
      price,
      stock:    parseInt($('r-stock').value) || 0,
      status:   $('r-status').value,
      compat:   $('r-compat').value.trim(),
      img:      state.editingRepImg || '/assets/forklift_parts.png',
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
    $$('.cat-tab, .crm-mcat-card').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabKey = tab.dataset.tab;
        $$('.cat-tab, .crm-mcat-card').forEach(t => t.classList.remove('active'));
        $$(`.cat-tab[data-tab="${tabKey}"], .crm-mcat-card[data-tab="${tabKey}"]`).forEach(t => t.classList.add('active'));
        state.activeTab = tabKey;
        state.searchQuery = '';
        state.filterStatus = '';
        state.filterBrand = '';
        if ($('inv-search')) $('inv-search').value = '';
        if ($('filter-status')) $('filter-status').value = '';
        this.render();
      });
    });
    // Search
    $('inv-search').addEventListener('input', e => {
      state.searchQuery = e.target.value;
      this.render();
    });
    // Filters
    $('filter-status').addEventListener('change', e => { state.filterStatus = e.target.value; this.render(); });
    $('filter-brand').addEventListener('change',  e => { state.filterBrand  = e.target.value; this.render(); });
    // Add button
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
    }
    // Image upload zone (Repuestos)
    const rImgZone = $('r-img-zone');
    const rImgInput = $('r-img-input');
    if (rImgZone && rImgInput) {
      rImgZone.addEventListener('click', () => rImgInput.click());
      rImgZone.addEventListener('dragover', e => { e.preventDefault(); rImgZone.classList.add('drag-over'); });
      rImgZone.addEventListener('dragleave', () => rImgZone.classList.remove('drag-over'));
      
      const handleRepFile = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
          this.setRepImg(ev.target.result);
          $('r-img-filename').textContent = file.name;
        };
        reader.readAsDataURL(file);
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
  previewImages(files) {
    const grid = $('img-preview');
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const wrap = document.createElement('div');
      wrap.className = 'prev-item';
      wrap.innerHTML = `<img src="${url}" alt="preview"><span class="prev-remove" title="Quitar">✕</span>`;
      wrap.querySelector('.prev-remove').addEventListener('click', () => wrap.remove());
      grid.appendChild(wrap);
    });
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
        card.addEventListener('dragstart', e => {
          this.draggingId   = card.dataset.id;
          this.draggingFrom = col;
          card.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
        });
        card.addEventListener('dragend', () => card.classList.remove('dragging'));
        this.initTouchDrag(card, col);
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
      if (arr.some(x => x.id === id)) { currentCol = colKey; break; }
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
    const leadIdx = DB.leads[fromCol].findIndex(l => l.id === id);
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
    const waUrl = `https://wa.me/${WA_NUMBER.replace(/\D/g,'')}?text=Hola%20${encodeURIComponent(l.client)}%2C%20te%20contactamos%20desde%20Maquinarias%209%20de%20Abril.`;
    const isMobile = window.innerWidth <= 992;
    const draggableAttr = isMobile ? '' : 'draggable="true"';
    return `<div class="kcard" ${draggableAttr} data-id="${l.id}">
      <div class="kcard-top-bar">
        <span class="kcard-urgency kcard-urgency--${l.urgency}">${urgLabel[l.urgency]||l.urgency}</span>
        <div class="kcard-actions-row">
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
      <div class="kcard-product">${l.product}</div>
      <div class="kcard-meta">
        <span class="kcard-date">${daysFrom(l.date)}</span>
        <a class="kcard-wa" href="${waUrl}" target="_blank" rel="noopener noreferrer" ontouchstart="event.stopPropagation()">
          <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          WhatsApp
        </a>
      </div>
    </div>`;
  },
  drop(event, targetCol) {
    event.preventDefault();
    $(`col-${targetCol}`).classList.remove('drag-active');
    if (!this.draggingId || this.draggingFrom === targetCol) return;
    const leadIdx = DB.leads[this.draggingFrom].findIndex(l => l.id === this.draggingId);
    if (leadIdx === -1) return;
    const [lead] = DB.leads[this.draggingFrom].splice(leadIdx, 1);
    DB.leads[targetCol].push(lead);
    this.render();
    toast(`Lead movido a "${targetCol === 'cotizacion' ? 'En Cotización' : targetCol === 'enviado' ? 'Presupuesto Enviado' : targetCol === 'ganado' ? 'Cerrado/Ganado' : 'Nuevas'}"`, 'info');
    this.draggingId = null; this.draggingFrom = null;
  },
  findLead(id) {
    for (const col of Object.values(DB.leads)) {
      const l = col.find(x => x.id === id);
      if (l) return l;
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
  init() {
    $('pv-search').addEventListener('input', e => this.search(e.target.value));
    $('form-service').addEventListener('submit', e => { e.preventDefault(); this.saveService(); });
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
    this.publish(); // publicar datos de ejemplo al cargar
    this.render();
  }
};

// ─── APP INIT ─────────────────────────────────────────────────────────────────
const App = {
  init() {
    loadDatabase();
    Modal.init();
    Router.init();
    Inv.init();
    K.init();
    PV.init();
    Rev.init();
    
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
    $$('.sb-item').forEach(btn => btn.addEventListener('click', closeSidebar));

    const isMobile = window.innerWidth <= 992;
    if (isMobile) {
      Router.go('home');
    } else {
      Router.go('inventario');
    }
  }
};

// ─── BOOTSTRAP ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
});
