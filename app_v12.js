// --- PREMIUM AUTOELEVADORES - APPLICATION ENGINE ---

// 1. DATASETS (Simulating a local database)
const forklifts = [];

const spareParts = [];

function ensureDatabaseSeeded() {
  // Do nothing, no mock data
}

async function syncWithSupabaseIfAvailable() {
  if (window.M9Supabase && window.M9Supabase.isConfigured()) {
    try {
      const res = await window.M9Supabase.fetchAllAndCache();
      if (res.ok && res.DB) {
        window.M9_DB_CACHE = res.DB;
        const path = window.location.pathname.replace(/\/+$/, "");
        const rawPage = path.split("/").pop() || "index.html";
        const cleanPage = rawPage.replace(".html", "").toLowerCase();
        if (cleanPage === "index" || cleanPage === "") {
          initHomePage();
        } else if (cleanPage === "catalog") {
          initCatalogPage();
        } else if (cleanPage === "repuestos") {
          initPartsPage();
        } else if (cleanPage === "detalle") {
          initDetailPage();
        } else if (cleanPage === "camiones") {
          initCamionesPage();
        }
      }
    } catch(e) {
      console.warn('Caché local activa - No se pudo conectar a Supabase:', e);
    }
  }
}

// 2. DOM CONTENT LOADER & ROUTING
document.addEventListener("DOMContentLoaded", () => {
  ensureDatabaseSeeded();
  syncWithSupabaseIfAvailable();
  setupNavbar();
  
  // Detect current page with cleanUrls support (.html optional)
  const path = window.location.pathname.replace(/\/+$/, "");
  const rawPage = path.split("/").pop() || "index.html";
  const cleanPage = rawPage.replace(".html", "").toLowerCase();
  
  if (cleanPage === "index" || cleanPage === "") {
    initHomePage();
  } else if (cleanPage === "catalog") {
    initCatalogPage();
  } else if (cleanPage === "repuestos") {
    initPartsPage();
  } else if (cleanPage === "detalle") {
    initDetailPage();
  } else if (cleanPage === "camiones") {
    initCamionesPage();
  }
  
  setupGlobalModals();
  attachQuoteEvents();
});

// NAVBAR FUNCTIONALITY
function setupNavbar() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-menu");
  
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      menu.classList.toggle("active");
      toggle.querySelectorAll("span").forEach((bar, idx) => {
        if (menu.classList.contains("active")) {
          if (idx === 0) bar.style.transform = "rotate(45deg) translate(6px, 6px)";
          if (idx === 1) bar.style.opacity = "0";
          if (idx === 2) bar.style.transform = "rotate(-45deg) translate(5px, -5px)";
        } else {
          bar.style.transform = "none";
          bar.style.opacity = "1";
        }
      });
    });
  }
  
  // Highlight active link based on current page
  const links = document.querySelectorAll(".nav-link");
  const path = window.location.pathname.replace(/\/+$/, "");
  const rawPage = path.split("/").pop() || "index.html";
  const currentClean = rawPage.replace(".html", "").toLowerCase();
  
  links.forEach(link => {
    const href = (link.getAttribute("href") || "").replace(".html", "").toLowerCase();
    if (href === currentClean || (currentClean === "" && (href === "index" || href === "/"))) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

// 3. HOME PAGE ENGINE
function formatPriceHTML(item) {
  const currency = item.currency || 'USD';
  const sym = currency === 'ARS' ? '$' : 'U$S';
  const price = item.price || 0;
  const discount = item.discount || 0;
  
  if (price === 0) return '<span class="price-discounted">Consultar</span>';
  
  if (discount > 0) {
    const discountedPrice = price * (1 - discount / 100);
    return `<span class="price-original">${sym} ${price.toLocaleString('es-AR')}</span><span class="price-discounted">${sym} ${discountedPrice.toLocaleString('es-AR')}</span>`;
  }
  return `<span class="price-discounted">${sym} ${price.toLocaleString('es-AR')}</span>`;
}

function initHomePage() {

  // ── Entrance animations ──────────────────────────────────────
  const heroText    = document.getElementById('hero-text-parallax');
  const heroBadge   = document.getElementById('hero-brand-badge');
  const heroForklift = document.getElementById('hero-forklift-parallax');
  const heroModelBadge = document.querySelector('.hero-v2-model-badge');

  // Staggered reveal on load
  requestAnimationFrame(() => {
    if (heroText)       heroText.classList.add('visible');
    if (heroBadge)      heroBadge.classList.add('visible');
    if (heroForklift)   heroForklift.classList.add('visible');
    if (heroModelBadge) heroModelBadge.classList.add('visible');
  });

  // ── Scroll Parallax ──────────────────────────────────────────
  const heroBg = document.getElementById('hero-bg-parallax');
  const heroEl = document.getElementById('hero-main');
  let   ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  function updateParallax() {
    const scrolled    = window.pageYOffset;
    const heroHeight  = heroEl ? heroEl.offsetHeight : window.innerHeight;

    // Only animate while hero is visible
    if (scrolled < heroHeight * 1.5) {

      // Background drifts up slowest (deepest layer)
      if (heroBg) {
        heroBg.style.transform = `translateY(${scrolled * 0.45}px)`;
      }

      // Forklift drifts at intermediate speed — creates "floating above" depth
      if (heroForklift) {
        // Pause the CSS float animation while scrolling so transforms don't conflict
        const isScrolling = scrolled > 30;
        heroForklift.style.animationPlayState = isScrolling ? 'paused' : 'running';
        if (isScrolling) {
          heroForklift.style.transform = `translateY(${scrolled * 0.18}px)`;
        } else {
          heroForklift.style.transform = '';
        }
      }

      // Text floats up slightly + fades out gently
      if (heroText) {
        heroText.style.transform = `translateY(${scrolled * 0.08}px)`;
        heroText.style.opacity   = `${Math.max(0, 1 - scrolled * 0.0018)}`;
      }
    }

    ticking = false;
  }

  // ── Category Slider Progress Listener ───────────────────────
  const catGrid = document.querySelector('.category-grid');
  const catProgressBar = document.getElementById('category-progress-bar');
  if (catGrid && catProgressBar) {
    catGrid.addEventListener('scroll', () => {
      const maxScroll = catGrid.scrollWidth - catGrid.clientWidth;
      if (maxScroll > 0) {
        const ratio = Math.min(1, Math.max(0, catGrid.scrollLeft / maxScroll));
        catProgressBar.style.width = `${33.3 + (ratio * 66.7)}%`;
      }
    }, { passive: true });
  }

  // ── Why Us Mobile Collapsible Listener ───────────────────────
  const whyUsToggleBtn = document.getElementById('why-us-toggle-btn');
  const whyUsList = document.getElementById('why-us-list');
  const whyUsToggleText = document.getElementById('why-us-toggle-text');
  
  if (whyUsToggleBtn && whyUsList && whyUsToggleText) {
    whyUsToggleBtn.addEventListener('click', () => {
      const isExpanded = whyUsList.classList.contains('expanded');
      if (isExpanded) {
        whyUsList.classList.remove('expanded');
        whyUsList.classList.add('collapsed');
        whyUsToggleBtn.classList.remove('expanded');
        whyUsToggleText.textContent = 'Ver todos los beneficios';
        whyUsToggleBtn.setAttribute('aria-expanded', 'false');
      } else {
        whyUsList.classList.remove('collapsed');
        whyUsList.classList.add('expanded');
        whyUsToggleBtn.classList.add('expanded');
        whyUsToggleText.textContent = 'Ver menos';
        whyUsToggleBtn.setAttribute('aria-expanded', 'true');
      }
    });
  }

  // ── Home Parts Quick Search routing ──────────────────────────
  const quickSearchForm = document.getElementById('home-parts-search');
  if (quickSearchForm) {
    quickSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = document.getElementById('home-search-input').value;
      if (query.trim()) {
        window.location.href = `repuestos.html?search=${encodeURIComponent(query)}`;
      }
    });
  }
}


// --- DYNAMIC EXPANDABLE BRAND LIST HELPER ---
function renderExpandableBrandList(container, brands, filterDataAttr) {
  if (!container || !brands.length) return;

  const MAX_VISIBLE = 3;
  if (brands.length <= MAX_VISIBLE) {
    container.innerHTML = brands.map(b => `
      <label class="checkbox-label">
        <input type="checkbox" value="${b}" data-filter="${filterDataAttr}" class="filter-checkbox">
        ${b}
      </label>
    `).join('');
    return;
  }

  const visibleBrands = brands.slice(0, MAX_VISIBLE);
  const hiddenBrands = brands.slice(MAX_VISIBLE);

  let html = visibleBrands.map(b => `
    <label class="checkbox-label">
      <input type="checkbox" value="${b}" data-filter="${filterDataAttr}" class="filter-checkbox">
      ${b}
    </label>
  `).join('');

  html += `
    <div class="more-brands-wrapper" style="display: none; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem;">
      ${hiddenBrands.map(b => `
        <label class="checkbox-label">
          <input type="checkbox" value="${b}" data-filter="${filterDataAttr}" class="filter-checkbox">
          ${b}
        </label>
      `).join('')}
    </div>
    <button type="button" class="btn-toggle-more-brands" style="background: none; border: none; color: var(--primary-yellow); font-size: 0.82rem; font-weight: 600; cursor: pointer; text-align: left; padding: 0.45rem 0 0 0; display: flex; align-items: center; gap: 0.35rem; transition: color 0.2s;">
      <span>+ Ver más marcas (${hiddenBrands.length})</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
    </button>
  `;

  container.innerHTML = html;

  const toggleBtn = container.querySelector(".btn-toggle-more-brands");
  const moreWrapper = container.querySelector(".more-brands-wrapper");

  if (toggleBtn && moreWrapper) {
    toggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const isHidden = moreWrapper.style.display === "none";
      if (isHidden) {
        moreWrapper.style.display = "flex";
        toggleBtn.innerHTML = `
          <span>- Mostrar menos</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
        `;
      } else {
        moreWrapper.style.display = "none";
        toggleBtn.innerHTML = `
          <span>+ Ver más marcas (${hiddenBrands.length})</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
        `;
      }
    });
  }
}

// 4. CATALOG PAGE ENGINE
function initCatalogPage() {
  const grid = document.getElementById("catalog-grid");
  const capacityRange = document.getElementById("filter-capacity");
  const capacityVal = document.getElementById("capacity-val");
  
  if (!grid) return;

  // 1. Combine static forklifts dataset with CRM items from localStorage
  let allEquipments = [];
  try {
    const rawDB = localStorage.getItem('m9-inventory-db');
    const parsedDB = rawDB ? JSON.parse(rawDB) : (window.M9_DB_CACHE || null);
    
    if (!parsedDB && window.M9Supabase && window.M9Supabase.isConfigured()) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem; border: 1px dashed var(--border-color); border-radius: 8px;">
          <div class="spinner" style="margin: 0 auto 1rem auto; width: 40px; height: 40px; border: 4px solid rgba(255, 198, 0, 0.2); border-left-color: var(--primary-yellow); border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <h3 style="font-family: var(--font-headings); font-size: 1.5rem; margin-bottom: 0.5rem;">Cargando catálogo...</h3>
          <p>Sincronizando con la base de datos.</p>
          <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        </div>`;
      return;
    }

    if (parsedDB) {
      if (parsedDB.autoelevadores && Array.isArray(parsedDB.autoelevadores)) {
        parsedDB.autoelevadores.forEach(crmItem => {
          if (crmItem.visible !== false && crmItem.status !== 'paused') {
            let capKg = 2500;
            if (crmItem.capacity) {
              const numMatch = crmItem.capacity.replace('.', '').match(/\d+/);
              if (numMatch) capKg = parseInt(numMatch[0]);
            }
            const staticMatch = forklifts.find(f => f.name.toLowerCase() === crmItem.name.toLowerCase());
            allEquipments.push({
              id: staticMatch ? staticMatch.id : `crm-auto-${crmItem.id}`,
              name: crmItem.name,
              brand: crmItem.brand,
              type: crmItem.type || (staticMatch ? staticMatch.type : "Autoelevador"),
              capacity: capKg,
              height: crmItem.height || (staticMatch ? staticMatch.height : 4.5),
              year: crmItem.year || (staticMatch ? staticMatch.year : 2025),
              condition: crmItem.hours > 0 ? "Usado" : (crmItem.condition || (staticMatch ? staticMatch.condition : "Nuevo")),
              price: crmItem.price !== undefined ? crmItem.price : (staticMatch ? staticMatch.price : 25000),
              currency: crmItem.currency || 'USD',
              discount: crmItem.discount || 0,
              image: crmItem.img ? crmItem.img.replace('../', '').replace(/^\//, '') : (staticMatch ? staticMatch.image : "assets/diesel_forklift.png"),
              description: staticMatch ? staticMatch.description : `Equipo de elevación industrial ${crmItem.brand} ${crmItem.name}.`,
              specs: staticMatch ? staticMatch.specs : {
                engine: crmItem.motor || "Convencional",
                transmission: "Powershift",
                hours: crmItem.hours ? `${crmItem.hours} hs` : "0 hs"
              }
            });
          }
        });
      }
    }
  } catch(e) { /* fallback to static forklifts */ }

  forklifts.forEach(f => {
    if (!allEquipments.some(e => e.name.toLowerCase() === f.name.toLowerCase() || e.id === f.id)) {
      allEquipments.push(f);
    }
  });

  let catalogCurrentPage = 1;
  const CATALOG_PER_PAGE = 6;

  // 2. Populate Brand Filter Checkboxes Dynamically with "Ver más marcas" toggle
  const brandContainer = document.getElementById("brand-filter-options");
  if (brandContainer) {
    const allBrands = [...new Set(allEquipments.map(item => item.brand).filter(Boolean))].sort();
    renderExpandableBrandList(brandContainer, allBrands, "brand");
  }

  // Render Function
  function renderForklifts(filteredData) {
    grid.innerHTML = "";
    const paginationContainer = document.getElementById("catalog-pagination");
    if (filteredData.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem; border: 1px dashed var(--border-color); border-radius: 8px;">
          <h3 style="font-family: var(--font-headings); font-size: 1.5rem; margin-bottom: 0.5rem;">No se encontraron equipos</h3>
          <p>Intente flexibilizar los filtros técnicos aplicados.</p>
        </div>
      `;
      if (paginationContainer) paginationContainer.innerHTML = "";
      return;
    }

    const totalPages = Math.ceil(filteredData.length / CATALOG_PER_PAGE);
    if (catalogCurrentPage > totalPages) catalogCurrentPage = 1;

    const pageSlice = filteredData.slice((catalogCurrentPage - 1) * CATALOG_PER_PAGE, catalogCurrentPage * CATALOG_PER_PAGE);

    pageSlice.forEach(fork => {
      const card = document.createElement("div");
      card.className = "product-card truck-card-v2";
      card.setAttribute("data-url", `detalle.html?id=${fork.id}`);
      card.innerHTML = `
        <div class="product-card-img-wrapper">
          <img class="product-card-img" src="${fork.image}" alt="${fork.name}" loading="lazy">
          <div class="product-card-badges badge truck-brand-badge">
            <span class="badge badge-yellow">${fork.condition}</span>
            <span class="badge badge-grey">${fork.type}</span>
          </div>
        </div>
        <div class="product-card-body truck-card-body-v2" style="padding: 1rem; display: flex; flex-direction: column; flex-grow: 1;">
          <div class="product-card-brand truck-card-category-v2" style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-secondary); margin-bottom:0.3rem;">${fork.brand}</div>
          <h3 class="product-card-title truck-card-title-v2" style="font-size:1.1rem; font-weight:700; color:var(--text-primary); margin-bottom: 0.5rem; line-height:1.3;">${fork.name}</h3>
          
          <div class="product-card-specs truck-card-specs-v2" style="display:grid; grid-template-columns: 1fr 1fr; gap: 0.45rem 0.8rem; margin: 0.5rem 0 1rem 0; background: rgba(255,255,255,0.02); border-radius: 6px;">
            <div class="product-card-spec">
              <span class="product-card-spec-label" style="display:block; font-size:0.68rem; color:var(--text-muted); text-transform:uppercase;">Capacidad</span>
              <span class="product-card-spec-val" style="font-size:0.85rem; color:var(--text-primary); font-weight:600;">${(fork.capacity / 1000).toFixed(1)} TN</span>
            </div>
            <div class="product-card-spec">
              <span class="product-card-spec-label" style="display:block; font-size:0.68rem; color:var(--text-muted); text-transform:uppercase;">Elevación</span>
              <span class="product-card-spec-val" style="font-size:0.85rem; color:var(--text-primary); font-weight:600;">${fork.height.toFixed(1)} m</span>
            </div>
            <div class="product-card-spec">
              <span class="product-card-spec-label" style="display:block; font-size:0.68rem; color:var(--text-muted); text-transform:uppercase;">Año</span>
              <span class="product-card-spec-val" style="font-size:0.85rem; color:var(--text-primary); font-weight:600;">${fork.year}</span>
            </div>
            <div class="product-card-spec">
              <span class="product-card-spec-label" style="display:block; font-size:0.68rem; color:var(--text-muted); text-transform:uppercase;">Tracción</span>
              <span class="product-card-spec-val" style="font-size:0.85rem; color:var(--text-primary); font-weight:600;">${fork.type === "Autoelevador" ? "Nafta/GNC/Diésel" : "Eléctrica"}</span>
            </div>
          </div>
          
          <div class="product-card-footer truck-card-footer-mobile" style="display:flex; align-items:center; justify-content:space-between; gap:0.6rem; margin-top:auto;">
            <div class="truck-card-price-wrap-v2" style="flex-shrink: 0; min-width: max-content;">
              <span class="truck-card-price-label-v2" style="font-size:0.7rem; color:var(--text-secondary); display:block; text-transform:uppercase;">Valor referencia</span>
              <span class="product-price truck-card-price-val-v2" style="font-size:1.15rem; font-weight:800; color:var(--text-primary); display:block; margin-bottom:0.4rem;">${formatPriceHTML(fork)}</span>
            </div>
            
            <div class="truck-card-mobile-info-v2" style="display:none; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.6rem;">
              <div style="font-weight: 500; color: var(--text-primary); margin-bottom: 0.1rem;">${fork.year || new Date().getFullYear()}</div>
              <div style="font-size: 0.7rem;">Capital Federal - Capital Federal</div>
            </div>

            <div class="truck-card-actions-v2" style="display:flex; gap:0.4rem; width:auto; justify-content: flex-end;">
              <a href="detalle.html?id=${fork.id}&cb=${Date.now()}" class="btn btn-secondary btn-sm truck-btn-detail" style="padding: 0.45rem 0.75rem; font-size: 0.8rem;">Ver Detalle</a>
              <button class="btn btn-primary btn-sm open-quote-modal truck-btn-quote" data-product="${fork.type}: ${fork.name}" style="padding: 0.45rem 0.75rem; font-size: 0.8rem;">Cotizar</button>
              <a href="https://wa.me/?text=Hola, quiero consultar por ${encodeURIComponent(fork.name)}" target="_blank" class="btn btn-primary btn-sm truck-btn-wa" style="display:none; padding: 0.5rem 0.75rem; font-size: 0.85rem; background: #E8F0FE; color: #1a73e8; border: none; font-weight: 600; width: 100%; text-align: center; justify-content: center; align-items: center; gap: 0.4rem;">
                <svg style="width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 24 24"><path d="M12.031 21.033c-1.503 0-2.969-.39-4.274-1.127l-4.72.932 1.341-4.227a8.956 8.956 0 01-1.229-4.524c0-4.945 4.024-8.97 8.97-8.97 4.945 0 8.97 4.025 8.97 8.97 0 4.945-4.025 8.97-8.97 8.97h-.088zm0-19.537c-5.836 0-10.584 4.748-10.584 10.584 0 1.865.488 3.687 1.417 5.292L1 23l5.808-1.516a10.536 10.536 0 005.223 1.385h.1c5.836 0 10.584-4.748 10.584-10.584C22.615 6.244 17.867 1.496 12.031 1.496zm5.811 14.86c-.32-.16-1.895-.935-2.188-1.042-.293-.107-.506-.16-.72.16-.214.32-.826 1.042-1.012 1.254-.186.213-.372.24-.693.08-1.558-.787-2.736-1.425-3.805-3.32-.213-.373-.022-.572.138-.732.146-.145.32-.372.48-.56.16-.186.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.734-.987-2.375-.26-.625-.526-.54-.72-.547-.186-.008-.4-.01-.613-.01-.213 0-.56.08-.853.4s-1.12 1.094-1.12 2.668 1.147 3.095 1.307 3.308c.16.213 2.253 3.441 5.466 4.828.766.333 1.365.533 1.834.683.771.246 1.472.211 2.023.128.62-.093 1.895-.774 2.161-1.52.267-.747.267-1.388.187-1.52-.08-.134-.294-.214-.614-.374z"/></svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    renderPagination(paginationContainer, catalogCurrentPage, totalPages, (newPage) => {
      catalogCurrentPage = newPage;
      renderForklifts(filteredData);
      const gridEl = document.getElementById("catalog-grid");
      if (gridEl) gridEl.scrollIntoView({ behavior: 'smooth' });
    });

    attachQuoteEvents();
  }

  // Update capacity label on input
  if (capacityRange && capacityVal) {
    capacityRange.addEventListener("input", () => {
      const tons = (capacityRange.value / 1000).toFixed(1);
      capacityVal.textContent = `${tons} TN`;
      applyFilters();
    });
  }

  // ── Mobile Catalog Filter Toggle & Active Count Badge ─────────
  const mobileFilterToggle = document.getElementById('mobile-filter-toggle');
  const filtersContent = document.getElementById('filters-sidebar-content');
  const filterCountBadge = document.getElementById('filter-count-badge');

  if (mobileFilterToggle && filtersContent) {
    mobileFilterToggle.addEventListener('click', () => {
      const isExpanded = filtersContent.classList.contains('expanded-mobile');
      if (isExpanded) {
        filtersContent.classList.remove('expanded-mobile');
        filtersContent.classList.add('collapsed-mobile');
        mobileFilterToggle.classList.remove('active');
        mobileFilterToggle.setAttribute('aria-expanded', 'false');
      } else {
        filtersContent.classList.remove('collapsed-mobile');
        filtersContent.classList.add('expanded-mobile');
        mobileFilterToggle.classList.add('active');
        mobileFilterToggle.setAttribute('aria-expanded', 'true');
      }
    });
  }

  function updateMobileFilterCountBadge() {
    if (!filterCountBadge) return;
    const activeCheckboxes = document.querySelectorAll('.filter-checkbox:checked').length;
    if (activeCheckboxes > 0) {
      filterCountBadge.textContent = activeCheckboxes;
      filterCountBadge.style.display = 'inline-block';
    } else {
      filterCountBadge.style.display = 'none';
    }
  }

  function applyFilters() {
    catalogCurrentPage = 1;
    const selectedTypes = Array.from(document.querySelectorAll("input[data-filter='type']:checked")).map(el => el.value);
    const selectedBrands = Array.from(document.querySelectorAll("input[data-filter='brand']:checked")).map(el => el.value);
    const selectedConds = Array.from(document.querySelectorAll("input[data-filter='condition']:checked")).map(el => el.value);
    const maxCapacity = parseInt(capacityRange ? capacityRange.value : 7000);

    const filtered = allEquipments.filter(fork => {
      if (fork.type === "Camión" || fork.type === "Camiones" || fork.type === "Tractor Carretera" || fork.type === "Chasis Volcador") return false;
      const matchType = selectedTypes.length === 0 || selectedTypes.includes(fork.type);
      const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(fork.brand);
      const matchCond = selectedConds.length === 0 || selectedConds.includes(fork.condition);
      const matchCapacity = fork.capacity <= maxCapacity;

      return matchType && matchBrand && matchCond && matchCapacity;
    });

    updateMobileFilterCountBadge();
    renderForklifts(filtered);
  }

  // Attach change listeners to all checkboxes (including dynamically generated brands)
  document.querySelectorAll(".filter-checkbox").forEach(cb => {
    cb.addEventListener("change", applyFilters);
  });

  // Parse URL search parameters (e.g. ?type=Autoelevador, ?brand=Hangcha)
  const urlParams = new URLSearchParams(window.location.search);
  const typeParam = urlParams.get("type");
  const brandParam = urlParams.get("brand");

  if (typeParam) {
    const typeCb = document.querySelector(`input[data-filter='type'][value='${typeParam}']`);
    if (typeCb) typeCb.checked = true;
  }

  if (brandParam) {
    const brandCb = document.querySelector(`input[data-filter='brand'][value='${brandParam}']`);
    if (brandCb) brandCb.checked = true;
  }

  // Initial filtered render
  applyFilters();
}

function getMergedSpareParts() {
  let list = [];
  try {
    const rawDB = localStorage.getItem('m9-inventory-db');
    const parsedDB = rawDB ? JSON.parse(rawDB) : (window.M9_DB_CACHE || null);
    if (parsedDB) {
      if (parsedDB.repuestos && Array.isArray(parsedDB.repuestos)) {
        parsedDB.repuestos.forEach(r => {
          if (r.status !== 'paused' && r.visible !== false) {
            let cat = "mecanico";
            const cLower = (r.category || "").toLowerCase();
            if (cLower.includes("eléctrico") || cLower.includes("electrico")) cat = "baterias";
            else if (cLower.includes("hidráulico") || cLower.includes("hidraulico")) cat = "bombas";
            else if (cLower.includes("filtro")) cat = "filtros";
            else if (cLower.includes("freno")) cat = "mecanico";

            let sys = "motor";
            if (cat === "baterias") sys = "electrico";
            if (cat === "bombas") sys = "hidraulico";

            let img = r.img ? r.img.replace('../', '').replace(/^\//, '') : "assets/forklift_parts.png";
            const staticMatch = spareParts.find(s => s.oem.toLowerCase() === (r.oem || "").toLowerCase());

            list.push({
              oem: r.oem || (staticMatch ? staticMatch.oem : "OEM-GEN"),
              name: r.name,
              machine: r.compat || (staticMatch ? staticMatch.machine : "Universal"),
              system: staticMatch ? staticMatch.system : sys,
              category: staticMatch ? staticMatch.category : cat,
              price: r.price !== undefined ? r.price : (staticMatch ? staticMatch.price : 100),
              stock: r.stock > 0 ? "in" : "low",
              desc: staticMatch ? staticMatch.desc : `Repuesto ${r.name} (${r.oem}). Compatible con ${r.compat || 'varios modelos'}.`,
              image: img
            });
          }
        });
      }
    }
  } catch(e) {}

  spareParts.forEach(sp => {
    if (!list.some(x => x.oem.toLowerCase() === sp.oem.toLowerCase())) {
      list.push(sp);
    }
  });

  return list;
}

// 5. TECHNICAL PARTS SEARCH ENGINE (BLIND SEARCH)
function initPartsPage() {
  const searchInput = document.getElementById("blind-search-input");
  const searchBtn = document.getElementById("blind-search-btn");
  const searchResult = document.getElementById("blind-search-result");
  const queryDisplay = document.getElementById("blind-search-query-display");
  const whatsappBtn = document.getElementById("blind-search-whatsapp-btn");
  
  if (!searchInput || !searchBtn) return;

  function doSearch() {
    const query = searchInput.value.trim();
    if (query.length === 0) {
      searchResult.style.display = "none";
      return;
    }
    
    queryDisplay.textContent = query;
    const waText = encodeURIComponent(`Hola, necesito cotizar disponibilidad y plazo de entrega para el siguiente repuesto: ${query}`);
    whatsappBtn.href = `https://wa.me/5491121699968?text=${waText}`;
    
    searchResult.style.display = "flex";
  }

  searchBtn.addEventListener("click", doSearch);
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") doSearch();
  });

  // Wire up category cards to auto-search
  document.querySelectorAll(".part-cat-card").forEach(card => {
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      const catName = card.querySelector("h3").textContent;
      searchInput.value = `Repuestos para ${catName}`;
      doSearch();
      
      const searchSection = document.querySelector(".blind-search-section");
      if (searchSection) {
        searchSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });
}



// 6. PRODUCT DETAIL LOADER
function initDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id") || "toyota-8fg25";

  let item = forklifts.find(f => f.id.toString() === id.toString());
  if (!item && typeof staticTrucks !== "undefined") {
    item = staticTrucks.find(t => t.id.toString() === id.toString());
  }
  try {
    const rawDB = localStorage.getItem('m9-inventory-db');
    const parsedDB = rawDB ? JSON.parse(rawDB) : (window.M9_DB_CACHE || null);
    
    if (!parsedDB && window.M9Supabase && window.M9Supabase.isConfigured()) {
      const layout = document.querySelector(".detail-layout");
      if (layout) {
        layout.style.display = 'none';
        if (!document.getElementById("detail-loading-spinner")) {
          const spinner = document.createElement("div");
          spinner.id = "detail-loading-spinner";
          spinner.style = "text-align: center; padding: 8rem 0;";
          spinner.innerHTML = `
            <div class="spinner" style="margin: 0 auto 1rem auto; width: 40px; height: 40px; border: 4px solid rgba(255, 198, 0, 0.2); border-left-color: var(--primary-yellow); border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <h3 style="font-family: var(--font-headings); font-size: 1.5rem; margin-bottom: 0.5rem;">Cargando equipo...</h3>
            <p>Obteniendo información desde la base de datos.</p>
            <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
          `;
          layout.parentNode.insertBefore(spinner, layout);
        }
      }
      return;
    }

    const spinner = document.getElementById("detail-loading-spinner");
    if (spinner) spinner.remove();
    const layout = document.querySelector(".detail-layout");
    if (layout) layout.style.display = '';

    if (parsedDB) {
      const allEquip = [...(parsedDB.autoelevadores || []), ...(parsedDB.camiones || [])];
      const found = allEquip.find(e => e.id.toString() === id.toString() || `crm-auto-${e.id}` === id || `crm-truck-${e.id}` === id || (item && e.name.toLowerCase() === item.name.toLowerCase()));
      if (found) {
        let parsedImages = [];
        if (Array.isArray(found.images)) {
          parsedImages = found.images;
        } else if (typeof found.images === 'string' && found.images.trim().length > 0) {
          try {
            parsedImages = JSON.parse(found.images.replace(/^\{/, '[').replace(/\}$/, ']'));
          } catch(e) {
            const matches = found.images.match(/(data:image\/[^;]+;base64,[^"',\}]+|https?:\/\/[^\s"',\}]+|[\w\.\/-]+\.(?:jpg|jpeg|png|webp|gif))/gi);
            if (matches) {
              parsedImages = matches;
            } else {
              parsedImages = found.images.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(s => s.length > 0);
            }
          }
        }
        
        parsedImages = parsedImages.map(img => {
          if (typeof img === 'object' && img !== null) {
            return img.url || img.src || img.image || '';
          }
          return img;
        }).filter(img => typeof img === 'string' && img.trim().length > 0);
        
        const finalImg = found.img ? found.img : (parsedImages[0] || '');
        if (item) {
          item = {
            ...item,
            name: found.name || item.name,
            brand: found.brand || item.brand,
            price: found.price !== undefined ? found.price : item.price,
            condition: found.condition || item.condition,
            year: found.year || item.year,
            description: found.description || item.description,
            image: finalImg || item.image,
            images: parsedImages.length > 0 ? parsedImages : item.images
          };
        } else {
          item = {
            id: found.id,
            name: found.name,
            brand: found.brand,
            type: found.type || (found.motor ? 'Camión Heavy Duty' : 'Autoelevador'),
            capacity: found.capacity || 'N/A',
            height: found.height || 4.5,
            year: found.year || 2025,
            condition: found.condition || (found.hours > 0 ? 'Usado' : 'Nuevo'),
            image: finalImg,
            images: parsedImages,
            description: found.description || `Unidad industrial ${found.brand} ${found.name}.`,
            specs: {
              engine: found.motor || 'Convencional',
              hours: found.hours ? `${found.hours}` : '0'
            }
          };
        }
      }
    }
  } catch(e) {}

  if (!item) {
    document.querySelector(".detail-layout").innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 8rem 0;">
        <h2>Unidad no encontrada</h2>
        <p style="margin-bottom: 2rem;">El equipo especificado no se encuentra en nuestro catálogo activo.</p>
        <a href="catalog.html" class="btn btn-primary">Volver al Catálogo</a>
      </div>
    `;
    return;
  }

  // Populate dynamic data
  document.getElementById("detail-brand").textContent = item.brand;
  document.getElementById("detail-title").textContent = item.name;
  document.getElementById("detail-condition-badge").textContent = item.condition;
  document.getElementById("detail-type-badge").textContent = item.type;
  document.getElementById("detail-description").textContent = item.description;
  
  const priceContainer = document.getElementById("detail-price-container");
  if (priceContainer) {
    priceContainer.innerHTML = formatPriceHTML(item);
  }

  // Set quotes product name input
  const inputProduct = document.getElementById("quote-product-name");
  if (inputProduct) {
    inputProduct.value = `${item.brand} ${item.name}`;
  }
  
  // Set detail whatsapp direct link
  const detailWa = document.getElementById("detail-whatsapp-direct");
  if (detailWa) {
    const waText = encodeURIComponent(`Hola, quisiera consultar sobre el equipo: ${item.brand} ${item.name}`);
    detailWa.href = `https://wa.me/5491121699968?text=${waText}`;
  }

  // Populate Specs
  const specList = document.getElementById("detail-specs-list");
  if (specList) {
    let specHTML = "";
    if (item.capacity) {
      const capVal = typeof item.capacity === "number" ? `${item.capacity} kg (${(item.capacity / 1000).toFixed(1)} TN)` : item.capacity;
      specHTML += `
        <div class="detail-spec-row">
          <span>Capacidad de carga</span>
          <span>${capVal}</span>
        </div>
      `;
    }
    if (item.height) {
      specHTML += `
        <div class="detail-spec-row">
          <span>Altura máxima de elevación</span>
          <span>${typeof item.height === "number" ? item.height.toFixed(1) + " metros" : item.height}</span>
        </div>
      `;
    }
    if (item.year) {
      specHTML += `
        <div class="detail-spec-row">
          <span>Año de fabricación</span>
          <span>${item.year}</span>
        </div>
      `;
    }

    if (item.specs) {
      for (const [key, value] of Object.entries(item.specs)) {
        let label = key;
        if (key === "voltage") label = "Batería / Tensión";
        else if (key === "engine") label = "Motorización";
        else if (key === "transmission") label = "Transmisión";
        else if (key === "turningRadius") label = "Radio de Giro";
        else if (key === "controller") label = "Controlador Electrónico";
        else if (key === "mastType") label = "Tipo de Mástil";
        else if (key === "suspension") label = "Suspensión";
        else if (key === "brakes") label = "Sistema de Frenos";
        else if (key === "hours") label = "Kilometraje / Uso";

        specHTML += `
          <div class="detail-spec-row">
            <span>${label}</span>
            <span>${value}</span>
          </div>
        `;
      }
    }
    specList.innerHTML = specHTML;
  }

  // Main gallery image (Portada)
  const mainImg = document.getElementById("gallery-main-img");
  const portadaSrc = item.image || item.img || (item.images && item.images[0]) || "";
  if (mainImg && typeof portadaSrc === 'string' && portadaSrc.length > 0) {
    mainImg.src = portadaSrc;
  } else if (mainImg) {
    mainImg.style.display = 'none';
  }

  // Gallery thumbnails switcher
  const thumbsContainer = document.getElementById("gallery-thumbnails-container");
  if (thumbsContainer) {
    thumbsContainer.innerHTML = ''; // Clear container

    const galleryList = (item.images && Array.isArray(item.images) && item.images.length > 0)
      ? item.images
      : [portadaSrc];
    
    // We only show multiple thumbnails if there is more than 1 image
    if (galleryList.length > 1) {
      galleryList.forEach((src, idx) => {
        const thumb = document.createElement("div");
        thumb.className = "gallery-thumb" + (idx === 0 ? " active" : "");
        
        const img = document.createElement("img");
        img.src = src;
        img.alt = `Vista ${idx + 1}`;
        
        thumb.appendChild(img);
        thumbsContainer.appendChild(thumb);
        
        thumb.addEventListener("click", () => {
          document.querySelectorAll(".gallery-thumb").forEach(t => t.classList.remove("active"));
          thumb.classList.add("active");
          if (mainImg) {
            mainImg.style.opacity = "0.3";
            setTimeout(() => {
              mainImg.src = src;
              mainImg.style.opacity = "1";
            }, 150);
          }
        });
      });
    }
  }

  // PDF Spec Sheet download simulation
  const downloadBtn = document.getElementById("pdf-download-btn");
  const progressContainer = document.querySelector(".progress-bar-container");
  const progressBar = document.querySelector(".progress-bar");
  const pdfSizeEl = document.querySelector(".pdf-size");

  if (downloadBtn && progressContainer && progressBar) {
    downloadBtn.addEventListener("click", (e) => {
      e.preventDefault();
      downloadBtn.style.pointerEvents = "none";
      downloadBtn.style.opacity = "0.7";
      progressContainer.style.display = "block";
      pdfSizeEl.textContent = "Preparando descarga...";

      let width = 0;
      const interval = setInterval(() => {
        if (width >= 100) {
          clearInterval(interval);
          pdfSizeEl.textContent = "Completado";
          setTimeout(() => {
            progressContainer.style.display = "none";
            progressBar.style.width = "0%";
            downloadBtn.style.pointerEvents = "all";
            downloadBtn.style.opacity = "1";
            pdfSizeEl.textContent = "PDF • 2.4 MB";
            
            // Show successful popup
            openNotificationModal("Ficha Técnica", `La ficha técnica para el equipo ${item.brand} ${item.name} se ha generado y descargado con éxito en su ordenador.`);
          }, 800);
        } else {
          width += 5;
          progressBar.style.width = `${width}%`;
          pdfSizeEl.textContent = `Descargando: ${width}%`;
        }
      }, 80);
    });
  }
}

// 7. GLOBAL MODAL CONTROLS
function setupGlobalModals() {
  const modal = document.getElementById("quote-modal");
  const overlay = modal ? modal.querySelector(".modal-overlay") : null;
  const form = document.getElementById("modal-quote-form");

  if (modal && overlay) {
    overlay.addEventListener("click", () => closeModal(modal));
  }
  if (modal) {
    modal.querySelectorAll(".btn-secondary, .modal-close-btn").forEach(closeBtn => {
      closeBtn.addEventListener("click", () => closeModal(modal));
    });
  }

  // Function to create lead in CRM
  const addLeadToCRM = (client, product, phone, email, message) => {
    try {
      const rawDB = localStorage.getItem('m9-inventory-db');
      const db = rawDB ? JSON.parse(rawDB) : (window.M9_DB_CACHE || {});
      if (!db.leads) {
        db.leads = { nuevas: [], enproceso: [], cotizado: [], ganado: [], perdido: [] };
      }
      if (!db.leads.nuevas) db.leads.nuevas = [];
      const leadId = Date.now();
      db.leads.nuevas.unshift({
        id: leadId,
        client: client,
        phone: phone || "No provisto",
        email: email || "No provisto",
        product: product,
        date: new Date().toISOString().split('T')[0],
        urgency: 'normal',
        notes: message ? [message] : [],
        source: 'Formulario Web'
      });
      localStorage.setItem('m9-inventory-db', JSON.stringify(db));
      if (window.M9Supabase && window.M9Supabase.isConfigured()) {
        window.M9Supabase.syncAllToSupabase(db, db.leads || null).catch(err => {
          console.error("Error syncing lead to Supabase:", err);
        });
      }
    } catch (err) {
      console.error("Error saving lead:", err);
    }
  };

  // Quote Form Submission logic
  const detailsForm = document.getElementById("detail-quote-form");
  if (detailsForm) {
    detailsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const product = document.getElementById("quote-product-name").value;
      const client = document.getElementById("client-name").value;
      const email = document.getElementById("client-email").value;
      const message = document.getElementById("client-message").value;
      
      addLeadToCRM(client, product, '', email, message);
      
      openNotificationModal("Cotización Enviada", `Gracias ${client}. Hemos recibido su consulta para el equipo ${product}. Un asesor comercial premium se contactará con usted a la brevedad.`);
      detailsForm.reset();
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const productTitleEl = document.getElementById("modal-product-title");
      const product = productTitleEl ? productTitleEl.textContent : "Equipo";
      const clientNameEl = document.getElementById("modal-client-name") || document.getElementById("quote-name");
      const clientName = clientNameEl ? clientNameEl.value : "Cliente";
      const clientEmail = document.getElementById("modal-client-email") ? document.getElementById("modal-client-email").value : "";
      const clientPhone = document.getElementById("modal-client-phone") ? document.getElementById("modal-client-phone").value : "";
      const clientMessage = document.getElementById("modal-message") ? document.getElementById("modal-message").value : "";
      
      addLeadToCRM(clientName, product, clientPhone, clientEmail, clientMessage);
      
      closeModal(modal);
      openNotificationModal("Cotización Solicitada", `Estimado ${clientName}, su cotización por "${product}" ha sido registrada con éxito. Recibirá detalles a la brevedad.`);
      form.reset();
    });
  }
}

// Global click delegation for all quote & contact modal triggers & close actions across all pages
document.addEventListener("click", (e) => {
  // 1. Handle Modal Close Actions (Overlay click, X button, Cancel button, Close button)
  const closeTrigger = e.target.closest(".modal-overlay, .modal-close-btn, .modal-close-x, .close-modal, .close-notif");
  if (closeTrigger) {
    const modal = closeTrigger.closest(".modal");
    if (modal) {
      e.preventDefault();
      closeModal(modal);
      return;
    }
  }

  const cancelBtn = e.target.closest(".modal .btn-secondary");
  if (cancelBtn && cancelBtn.getAttribute("type") !== "submit") {
    e.preventDefault();
    const modal = cancelBtn.closest(".modal");
    if (modal) {
      closeModal(modal);
      return;
    }
  }

  // 2. Handle Opening Quote/Contact Modal (.open-quote-modal)
  const btn = e.target.closest(".open-quote-modal");
  if (btn) {
    e.preventDefault();
    const modal = document.getElementById("quote-modal");
    if (!modal) return;

    const productName = btn.getAttribute("data-product") || "Contacto General";
    const titleEl = document.getElementById("modal-product-title");
    if (titleEl) titleEl.textContent = productName;

    // Update direct WhatsApp link in modal with pre-filled message
    const waBtn = document.getElementById("modal-whatsapp-direct");
    if (waBtn) {
      const msg = encodeURIComponent(`Hola, quisiera realizar una consulta sobre: ${productName}`);
      waBtn.href = `https://wa.me/5491121699968?text=${msg}`;
    }

    // Close mobile navbar menu if open
    const navMenu = document.querySelector(".nav-menu");
    const navToggle = document.querySelector(".nav-toggle");
    if (navMenu && navMenu.classList.contains("active")) {
      navMenu.classList.remove("active");
      if (navToggle) {
        navToggle.classList.remove("active");
        navToggle.querySelectorAll("span").forEach(bar => {
          bar.style.transform = "none";
          bar.style.opacity = "1";
        });
      }
    }

    openModal(modal);
    return;
  }
});

function attachQuoteEvents() {
  // Handled globally by document click listener
}

function openModal(modalEl) {
  modalEl.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal(modalEl) {
  modalEl.classList.remove("active");
  document.body.style.overflow = "";
}

function openNotificationModal(title, text) {
  let notifModal = document.getElementById("notification-modal");
  
  // Create on the fly if it doesn't exist
  if (!notifModal) {
    notifModal = document.createElement("div");
    notifModal.id = "notification-modal";
    notifModal.className = "modal";
    notifModal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-icon">✓</div>
        <h3 id="notif-title"></h3>
        <p id="notif-text" style="color: var(--text-secondary);"></p>
        <button class="btn btn-primary close-notif" style="width: 100%;">Aceptar</button>
      </div>
    `;
    document.body.appendChild(notifModal);
    
    notifModal.querySelector(".modal-overlay").addEventListener("click", () => notifModal.classList.remove("active"));
    notifModal.querySelector(".close-notif").addEventListener("click", () => {
      notifModal.classList.remove("active");
      document.body.style.overflow = "";
    });
  }

  document.getElementById("notif-title").textContent = title;
  document.getElementById("notif-text").textContent = text;
  
  notifModal.classList.add("active");
  document.body.style.overflow = "hidden";
}

// ================================================================
// BRANDS CAROUSEL ENGINE
// ================================================================
(function initBrandsCarousel() {
  const INTERVAL_MS = 5000; // ms per slide

  const carousel   = document.getElementById("brands-carousel");
  if (!carousel) return;

  const slides     = carousel.querySelectorAll(".brand-slide");
  const dots       = carousel.querySelectorAll(".brands-dot");
  const prevBtn    = document.getElementById("brands-prev");
  const nextBtn    = document.getElementById("brands-next");
  const progressEl = document.getElementById("brands-progress");

  let current  = 0;
  let timer    = null;

  function goTo(index) {
    // Wrap around
    index = (index + slides.length) % slides.length;

    // Deactivate old
    slides[current].classList.remove("active");
    dots[current].classList.remove("active");

    // Activate new
    current = index;
    slides[current].classList.add("active");
    dots[current].classList.add("active");

    // Reset progress bar & elapsed counter
    elapsedOnPause = 0;
    startProgress(0);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  let slideStartTime = null;   // timestamp when current slide started
  let elapsedOnPause = 0;      // ms already elapsed when paused

  function startProgress(fromMs = 0) {
    if (!progressEl) return;
    const remaining = INTERVAL_MS - fromMs;
    const startPct  = (fromMs / INTERVAL_MS) * 100;
    progressEl.style.transition = "none";
    progressEl.style.width = startPct + "%";
    void progressEl.offsetWidth;  // force reflow
    progressEl.style.transition = `width ${remaining}ms linear`;
    progressEl.style.width = "100%";
  }

  function pauseProgress() {
    if (!progressEl) return;
    // Freeze the bar exactly where it is
    const w = parseFloat(getComputedStyle(progressEl).width);
    const total = parseFloat(getComputedStyle(progressEl.parentElement).width);
    const pct = total > 0 ? (w / total) * 100 : 0;
    progressEl.style.transition = "none";
    progressEl.style.width = pct + "%";
  }

  function startAutoPlay(fromMs = 0) {
    clearInterval(timer);
    const remaining = INTERVAL_MS - fromMs;
    slideStartTime = Date.now() - fromMs;
    timer = setTimeout(() => {
      next();
    }, remaining);
    startProgress(fromMs);
  }

  function stopAutoPlay() {
    clearTimeout(timer);
    clearInterval(timer);
    timer = null;
    // Save how much time has elapsed so we can resume from here
    elapsedOnPause = slideStartTime ? Math.min(Date.now() - slideStartTime, INTERVAL_MS) : 0;
    pauseProgress();
  }

  // Navigation buttons — restart timer cleanly on manual nav
  if (prevBtn) prevBtn.addEventListener("click", () => { prev(); startAutoPlay(); });
  if (nextBtn) nextBtn.addEventListener("click", () => { next(); startAutoPlay(); });

  // Dot navigation
  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      goTo(parseInt(dot.dataset.index, 10));
      startAutoPlay();
    });
  });

  // No mouse interaction — carousel runs continuously

  // Touch / swipe support
  let touchStartX = 0;
  carousel.addEventListener("touchstart", e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  carousel.addEventListener("touchend", e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
      if (isInView) startAutoPlay();
    }
  }, { passive: true });

  // Keyboard support when carousel is in view
  document.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") { next(); if (isInView) startAutoPlay(); }
    if (e.key === "ArrowLeft")  { prev(); if (isInView) startAutoPlay(); }
  });

  // ── Visibility observer: stop when off-screen, restart when back ──
  let isInView = false;
  const visibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isInView = entry.isIntersecting;
      if (isInView) {
        // Carousel just entered the viewport — start fresh
        elapsedOnPause = 0;
        startAutoPlay(0);
      } else {
        // Carousel left the viewport — stop everything cleanly
        stopAutoPlay();
      }
    });
  }, {
    threshold: 0.1  // fire when at least 10% is visible
  });

  visibilityObserver.observe(carousel);
})();


// ================================================================
// SCROLL REVEAL ENGINE
// ================================================================
(function initScrollReveal() {

  // ── 1. Auto-tag elements that need animation ─────────────────
  // (so we don't have to touch every HTML element manually)

  function tag(el, reveal, delay) {
    if (!el) return;
    el.setAttribute("data-reveal", reveal);
    if (delay) el.setAttribute("data-reveal-delay", delay);
  }

  // Brands section header — stagger each child
  tag(document.querySelector(".brands-section-header .section-tag"),        "fade-up", 0);
  tag(document.querySelector(".brands-section-header .brands-section-title"),"fade-up", 100);
  tag(document.querySelector(".brands-section-header .brands-section-sub"),  "fade-up", 200);

  // Carousel entrance — reliable fade-up + scale
  tag(document.querySelector(".brands-carousel-wrap"), "carousel-wrap", 150);

  // Category cards — stagger with fade-up
  document.querySelectorAll(".category-card").forEach((el, i) => {
    tag(el, "scale", i * 120);
  });

  // Section headers (generic)
  document.querySelectorAll(".section-header").forEach(el => {
    tag(el.querySelector(".section-tag"),      "fade-up", 0);
    tag(el.querySelector(".section-title"),    "fade-up", 100);
    tag(el.querySelector(".section-subtitle"), "fade-up", 200);
  });

  // Hero mini stats — stagger
  document.querySelectorAll(".hero-mini-stat").forEach((el, i) => {
    tag(el, "fade-up", i * 100);
  });

  // Parts quick finder box
  tag(document.querySelector(".finder-box"), "scale");

  // Trucks banner content
  tag(document.querySelector(".trucks-banner"), "fade-up");

  // Footer columns
  document.querySelectorAll(".footer-grid > div").forEach((el, i) => {
    tag(el, "fade-up", i * 80);
  });

  // ── 2. Intersection Observer ──────────────────────────────────
  if (!("IntersectionObserver" in window)) {
    // Fallback: reveal everything immediately
    document.querySelectorAll("[data-reveal]").forEach(el => el.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-revealed");
        // Once revealed, stop watching
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,    // trigger as soon as 5% is visible
    rootMargin: "0px 0px 0px 0px"
  });

  // Observe all tagged elements
  document.querySelectorAll("[data-reveal]").forEach(el => observer.observe(el));

  // ── 3. Watch for dynamically added elements ───────────────────
  // (useful if any section is injected later)
  const mutationObs = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        if (node.hasAttribute("data-reveal")) observer.observe(node);
        node.querySelectorAll?.("[data-reveal]").forEach(el => observer.observe(el));
      });
    });
  });
  mutationObs.observe(document.body, { childList: true, subtree: true });

})();

// ================================================================
// REVIEWS CAROUSEL — lee desde localStorage (publicado por el CRM)
// ================================================================
(function initReviewsCarousel() {
  const track    = document.getElementById('reviews-track');
  const dotsWrap = document.getElementById('reviews-dots');
  const prevBtn  = document.getElementById('reviews-prev');
  const nextBtn  = document.getElementById('reviews-next');
  const emptyEl  = document.getElementById('reviews-empty');
  if (!track) return;

  const AVATAR_COLORS = ['#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#ec4899','#14b8a6'];

  // Reseñas de ejemplo — el admin las reemplaza vía localStorage
  const DEFAULT_REVIEWS = [
    { author: 'Carlos Mendoza',       stars: 5, date: 'hace 2 meses',  text: 'Excelente atención y servicio. Compramos un autoelevador Toyota y quedamos muy conformes con la calidad del equipo y el asesoramiento del equipo de ventas. Muy profesionales.' },
    { author: 'Logística del Sur SRL',stars: 5, date: 'hace 4 meses',  text: 'Adquirimos 3 unidades Hangcha para nuestro depósito. El servicio postventa es impecable, responden rápido y los repuestos son originales. Los recomendamos sin dudas.' },
    { author: 'María González',        stars: 5, date: 'hace 1 mes',    text: 'Muy buena experiencia. El equipo de trabajo es muy atento y nos asesoraron perfectamente para elegir el apilador eléctrico que necesitábamos. Entrega en tiempo y forma.' },
    { author: 'Distribuidora Norte SA',stars: 4, date: 'hace 6 meses',  text: 'Buen servicio técnico y atención al cliente. Los repuestos OEM llegan rápido y a buen precio. Seguimos eligiéndolos para el mantenimiento de toda nuestra flota.' },
    { author: 'Ricardo Flores',        stars: 5, date: 'hace 3 semanas',text: 'Compramos un autoelevador diesel de segunda mano en excelente estado. Precio justo, documentación en orden y garantía real. Muy recomendable para empresas que buscan calidad.' },
  ];

  function getColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }

  function starsHTML(n) {
    return Array.from({ length: 5 }, (_, i) =>
      `<svg viewBox="0 0 24 24" width="15" height="15"
        fill="${i < n ? '#ffb800' : 'none'}"
        stroke="#ffb800" stroke-width="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>`
    ).join('');
  }

  function getVisibleCount() {
    if (window.innerWidth <= 640)  return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  // Leer desde localStorage; si no hay datos usar el fallback
  let reviews = DEFAULT_REVIEWS;
  try {
    const stored = localStorage.getItem('m9-reviews');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) reviews = parsed;
    }
  } catch(e) { /* usar default */ }

  // Render cards
  track.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-card-header">
        <div class="review-avatar" style="background:${getColor(r.author)}">
          ${r.author.trim()[0].toUpperCase()}
        </div>
        <div class="review-author-info">
          <div class="review-author-name">${r.author}</div>
          <div class="review-date">${r.date}</div>
        </div>
      </div>
      <div class="review-stars">${starsHTML(r.stars)}</div>
      <p class="review-text">${r.text}</p>
      <div class="review-google-icon">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      </div>
    </div>
  `).join('');

  // Carousel logic
  let current = 0;
  let autoTimer = null;

  function maxIndex() {
    return Math.max(0, reviews.length - getVisibleCount());
  }

  function getCardWidth() {
    const card = track.querySelector('.review-card');
    if (!card) return 0;
    return card.getBoundingClientRect().width + 24;
  }

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, maxIndex()));
    track.style.transform = `translateX(-${current * getCardWidth()}px)`;
    updateDots();
    updateBtns();
  }

  function buildDots() {
    if (!dotsWrap) return;
    const total = maxIndex() + 1;
    dotsWrap.innerHTML = Array.from({ length: total }, (_, i) =>
      `<button class="reviews-dot${i === 0 ? ' active' : ''}" data-i="${i}" aria-label="Ir a reseña ${i+1}"></button>`
    ).join('');
    dotsWrap.querySelectorAll('.reviews-dot').forEach(dot => {
      dot.addEventListener('click', () => { goTo(+dot.dataset.i); resetAuto(); });
    });
  }

  function updateDots() {
    if (!dotsWrap) return;
    dotsWrap.querySelectorAll('.reviews-dot').forEach((d, i) =>
      d.classList.toggle('active', i === current)
    );
  }

  function updateBtns() {
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current >= maxIndex();
  }

  function startAuto() {
    autoTimer = setInterval(() => {
      goTo(current >= maxIndex() ? 0 : current + 1);
    }, 5000);
  }

  function resetAuto() { clearInterval(autoTimer); startAuto(); }

  prevBtn?.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  nextBtn?.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  window.addEventListener('resize', () => { buildDots(); goTo(Math.min(current, maxIndex())); });

  track.closest('.reviews-carousel-wrap')?.addEventListener('mouseenter', () => clearInterval(autoTimer));
  track.closest('.reviews-carousel-wrap')?.addEventListener('mouseleave', () => startAuto());

  // Esperar al siguiente frame para que el DOM esté pintado antes de medir
  requestAnimationFrame(() => {
    buildDots();
    goTo(0);
    startAuto();
  });

})();



// --- TRUCKS DIVISION ENGINE ---
const staticTrucks = [];

function initCamionesPage() {
  const grid = document.getElementById("trucks-grid");
  const searchInput = document.getElementById("search-trucks");
  const brandContainer = document.getElementById("truck-brand-filters");
  const sortSelect = document.getElementById("sort-trucks");
  const countSpan = document.getElementById("trucks-count");

  if (!grid) return;

  let truckCurrentPage = 1;
  const TRUCKS_PER_PAGE = 6;

  // 1. Gather static trucks + CRM trucks from localStorage
  let allTrucks = [];
  try {
    const rawDB = localStorage.getItem('m9-inventory-db');
    const parsedDB = rawDB ? JSON.parse(rawDB) : (window.M9_DB_CACHE || null);
    
    if (!parsedDB && window.M9Supabase && window.M9Supabase.isConfigured()) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem; border: 1px dashed var(--border-color); border-radius: 8px;">
          <div class="spinner" style="margin: 0 auto 1rem auto; width: 40px; height: 40px; border: 4px solid rgba(255, 198, 0, 0.2); border-left-color: var(--primary-yellow); border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <h3 style="font-family: var(--font-headings); font-size: 1.5rem; margin-bottom: 0.5rem;">Cargando catálogo...</h3>
          <p>Sincronizando con la base de datos.</p>
        </div>`;
      return;
    }

    if (parsedDB) {
      if (parsedDB.camiones && Array.isArray(parsedDB.camiones)) {
        parsedDB.camiones.forEach(crmItem => {
          if (crmItem.visible !== false && crmItem.status !== 'paused') {
            let capKg = 20000;
            if (crmItem.capacity) {
              const match = crmItem.capacity.replace('.', '').match(/\d+/);
              if (match) capKg = parseInt(match[0]) * 1000;
            }
            const staticMatch = staticTrucks.find(t => t.name.toLowerCase() === crmItem.name.toLowerCase() || (crmItem.name.toLowerCase().includes(t.name.toLowerCase().split(' ')[0]) && crmItem.brand.toLowerCase() === t.brand.toLowerCase() && crmItem.name.toLowerCase().includes(t.name.toLowerCase().split(' ').slice(0, 2).join(' '))));
            allTrucks.push({
              id: staticMatch ? staticMatch.id : `crm-truck-${crmItem.id}`,
              name: crmItem.name,
              brand: crmItem.brand || "Generico",
              type: crmItem.type || (staticMatch ? staticMatch.type : "Tractor Carretera"),
              capacityKg: staticMatch ? staticMatch.capacityKg : capKg,
              capacity: crmItem.capacity || (staticMatch ? staticMatch.capacity : "20 Tn"),
              power: crmItem.motor || (staticMatch ? staticMatch.power : "460 CV"),
              axles: staticMatch ? staticMatch.axles : "6x2",
              year: crmItem.year || (staticMatch ? staticMatch.year : 2024),
              condition: crmItem.condition || (staticMatch ? staticMatch.condition : (crmItem.hours > 0 ? "Usado" : "Nuevo")),
              price: crmItem.price !== undefined ? crmItem.price : (staticMatch ? staticMatch.price : 85000),
              currency: crmItem.currency || 'USD',
              discount: crmItem.discount || 0,
              priceLabel: ``,
              image: crmItem.img ? crmItem.img.replace('../', '').replace(/^\//, '') : '',
              images: (crmItem.images && Array.isArray(crmItem.images)) ? crmItem.images.map(u => typeof u === 'string' ? u.replace('../', '').replace(/^\//, '') : u) : [],
              description: staticMatch ? staticMatch.description : `Unidad ${crmItem.brand} ${crmItem.name}.`,
              specs: staticMatch ? staticMatch.specs : {
                engine: crmItem.motor || "Diesel HD",
                transmission: "Automatizada HD",
                suspension: "Neumática",
                brakes: "ABS / EBS",
                hours: crmItem.hours ? `${crmItem.hours} km` : "0 km"
              }
            });
          }
        });
      }
    }
  } catch(e) {}
  staticTrucks.forEach(t => {
    if (!allTrucks.some(e => e.name.toLowerCase() === t.name.toLowerCase() || e.id === t.id)) {
      allTrucks.push(t);
    }
  });

  // 2. Render Brand Filter checkboxes dynamically with "Ver más marcas" toggle
  if (brandContainer) {
    const brands = [...new Set(allTrucks.map(t => t.brand).filter(Boolean))].sort();
    renderExpandableBrandList(brandContainer, brands, "truck-brand");
  }

  // 3. Render Trucks Function
  function renderTrucks() {
    if (!grid) return;
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const selectedBrands = Array.from(document.querySelectorAll('[data-filter="truck-brand"]:checked')).map(cb => cb.value);
    const selectedTypes = Array.from(document.querySelectorAll('[data-filter="truck-type"]:checked')).map(cb => cb.value);
    const selectedCond = Array.from(document.querySelectorAll('[data-filter="truck-condition"]:checked')).map(cb => cb.value);
    const sortVal = sortSelect ? sortSelect.value : "featured";

    let filtered = allTrucks.filter(item => {
      // Search text
      if (query && !item.name.toLowerCase().includes(query) && !item.brand.toLowerCase().includes(query) && !item.description.toLowerCase().includes(query)) {
        return false;
      }
      // Brand
      if (selectedBrands.length > 0 && !selectedBrands.includes(item.brand)) {
        return false;
      }
      // Type
      if (selectedTypes.length > 0 && !selectedTypes.includes(item.type)) {
        return false;
      }
      // Condition
      if (selectedCond.length > 0 && !selectedCond.includes(item.condition)) {
        return false;
      }
      return true;
    });

    // Sorting
    if (sortVal === "price-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortVal === "price-desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortVal === "power-desc") {
      filtered.sort((a, b) => parseInt(b.power) - parseInt(a.power));
    }

    if (countSpan) countSpan.textContent = `${filtered.length} unidades encontradas`;
    updateActiveFilterCount();

    grid.innerHTML = "";
    const paginationContainer = document.getElementById("trucks-pagination");
    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem; border: 1px dashed var(--border-color); border-radius: 8px;">
          <h3 style="font-family: var(--font-headings); font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--text-primary);">No se encontraron camiones</h3>
          <p style="color: var(--text-secondary);">Intente modificar o limpiar los filtros seleccionados.</p>
        </div>
      `;
      if (paginationContainer) paginationContainer.innerHTML = "";
      return;
    }

    const totalPages = Math.ceil(filtered.length / TRUCKS_PER_PAGE);
    if (truckCurrentPage > totalPages) truckCurrentPage = 1;

    const pageSlice = filtered.slice((truckCurrentPage - 1) * TRUCKS_PER_PAGE, truckCurrentPage * TRUCKS_PER_PAGE);

    pageSlice.forEach(truck => {
      const card = document.createElement("div");
      card.className = "product-card truck-card-v2";
      card.setAttribute("data-url", `detalle.html?id=${truck.id}`);
      card.innerHTML = `
        <div class="product-card-img-wrapper">
          <img src="${truck.image}" alt="${truck.name}" class="product-card-img" loading="lazy">
          <span class="badge ${truck.condition === 'Nuevo' ? 'badge-yellow' : 'badge-dark'}">${truck.condition}</span>
          <span class="truck-brand-badge">${truck.brand}</span>
        </div>
        <div class="product-card-body truck-card-body-v2" style="padding: 1.2rem; display: flex; flex-direction: column; flex-grow: 1;">
          <div class="product-category truck-card-category-v2" style="font-size:0.78rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-secondary); margin-bottom:0.3rem;">${truck.type} • ${truck.axles}</div>
          <h3 class="product-title truck-card-title-v2" style="font-family:var(--font-headings); font-size:1.15rem; font-weight:700; color:var(--text-primary); margin-bottom: 0.8rem; line-height:1.3;">${truck.name}</h3>
          
          <div class="product-specs-grid truck-card-specs-v2" style="display:grid; grid-template-columns: repeat(2, 1fr); gap: 0.6rem; margin: 0.8rem 0 1.2rem 0; padding: 0.6rem 0.8rem; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px;">
            <div class="spec-item">
              <span class="spec-label" style="display:block; font-size:0.72rem; color:var(--text-secondary); text-transform:uppercase;">Potencia</span>
              <span class="spec-value" style="font-size:0.92rem; color:var(--primary-yellow); font-weight:700;">${truck.power}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label" style="display:block; font-size:0.72rem; color:var(--text-secondary); text-transform:uppercase;">Capacidad</span>
              <span class="spec-value" style="font-size:0.92rem; color:var(--text-primary); font-weight:600;">${truck.capacity}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label" style="display:block; font-size:0.72rem; color:var(--text-secondary); text-transform:uppercase;">Año</span>
              <span class="spec-value" style="font-size:0.92rem; color:var(--text-primary); font-weight:600;">${truck.year}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label" style="display:block; font-size:0.72rem; color:var(--text-secondary); text-transform:uppercase;">Kilometraje</span>
              <span class="spec-value" style="font-size:0.92rem; color:var(--text-primary); font-weight:600;">${truck.specs && truck.specs.hours ? truck.specs.hours : "0 km"}</span>
            </div>
          </div>
          
          <div class="product-card-footer truck-card-footer-mobile" style="display:flex; align-items:center; justify-content:space-between; gap:0.6rem; margin-top:auto;">
            <div class="truck-card-price-wrap-v2" style="flex-shrink: 0; min-width: max-content;">
              <span class="truck-card-price-label-v2" style="font-size:0.7rem; color:var(--text-secondary); display:block; text-transform:uppercase;">Valor referencia</span>
              <span class="product-price truck-card-price-val-v2" style="font-size:1.05rem; font-weight:800; color:var(--text-primary);">${formatPriceHTML(truck)}</span>
            </div>
            
            <div class="truck-card-mobile-info-v2" style="display:none; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.6rem;">
              <div style="font-weight: 500; color: var(--text-primary); margin-bottom: 0.1rem;">${truck.year || new Date().getFullYear()}</div>
              <div style="font-size: 0.7rem;">Capital Federal - Capital Federal</div>
            </div>

            <div class="truck-card-actions-v2" style="display:flex; gap:0.4rem; width:auto; justify-content: flex-end;">
              <a href="detalle.html?id=${truck.id}&cb=${Date.now()}" class="btn btn-secondary btn-sm truck-btn-detail" style="padding: 0.45rem 0.75rem; font-size: 0.8rem;">Ver Detalle</a>
              <button class="btn btn-primary btn-sm open-quote-modal truck-btn-quote" data-product="${truck.type}: ${truck.name} (${truck.power})" style="padding: 0.45rem 0.75rem; font-size: 0.8rem;">
                Cotizar
              </button>
              <a href="https://wa.me/?text=Hola, quiero consultar por ${encodeURIComponent(truck.name)}" target="_blank" class="btn btn-primary btn-sm truck-btn-wa" style="display:none; padding: 0.5rem 0.75rem; font-size: 0.85rem; background: #E8F0FE; color: #1a73e8; border: none; font-weight: 600; width: 100%; text-align: center; justify-content: center; align-items: center; gap: 0.4rem;">
                <svg style="width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 24 24"><path d="M12.031 21.033c-1.503 0-2.969-.39-4.274-1.127l-4.72.932 1.341-4.227a8.956 8.956 0 01-1.229-4.524c0-4.945 4.024-8.97 8.97-8.97 4.945 0 8.97 4.025 8.97 8.97 0 4.945-4.025 8.97-8.97 8.97h-.088zm0-19.537c-5.836 0-10.584 4.748-10.584 10.584 0 1.865.488 3.687 1.417 5.292L1 23l5.808-1.516a10.536 10.536 0 005.223 1.385h.1c5.836 0 10.584-4.748 10.584-10.584C22.615 6.244 17.867 1.496 12.031 1.496zm5.811 14.86c-.32-.16-1.895-.935-2.188-1.042-.293-.107-.506-.16-.72.16-.214.32-.826 1.042-1.012 1.254-.186.213-.372.24-.693.08-1.558-.787-2.736-1.425-3.805-3.32-.213-.373-.022-.572.138-.732.146-.145.32-.372.48-.56.16-.186.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.734-.987-2.375-.26-.625-.526-.54-.72-.547-.186-.008-.4-.01-.613-.01-.213 0-.56.08-.853.4s-1.12 1.094-1.12 2.668 1.147 3.095 1.307 3.308c.16.213 2.253 3.441 5.466 4.828.766.333 1.365.533 1.834.683.771.246 1.472.211 2.023.128.62-.093 1.895-.774 2.161-1.52.267-.747.267-1.388.187-1.52-.08-.134-.294-.214-.614-.374z"/></svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    renderPagination(paginationContainer, truckCurrentPage, totalPages, (newPage) => {
      truckCurrentPage = newPage;
      renderTrucks();
      const gridEl = document.getElementById("trucks-grid");
      if (gridEl) gridEl.scrollIntoView({ behavior: 'smooth' });
    });

    // Re-attach quote modal listener
    if (typeof attachQuoteEvents === "function") attachQuoteEvents();
  }

  function updateActiveFilterCount() {
    const activeCountEl = document.getElementById("mobile-filter-count");
    if (!activeCountEl) return;
    const brandCount = document.querySelectorAll('[data-filter="truck-brand"]:checked').length;
    const typeCount = document.querySelectorAll('[data-filter="truck-type"]:checked').length;
    const condCount = document.querySelectorAll('[data-filter="truck-condition"]:checked').length;
    const hasSearch = searchInput && searchInput.value.trim() !== "" ? 1 : 0;
    const total = brandCount + typeCount + condCount + hasSearch;
    activeCountEl.textContent = total;
    activeCountEl.style.display = total > 0 ? "inline-flex" : "none";
  }

  // Mobile drawer toggle
  const mobileToggleBtn = document.getElementById("toggle-mobile-truck-filters");
  const sidebarEl = document.querySelector(".catalog-sidebar");
  if (mobileToggleBtn && sidebarEl) {
    mobileToggleBtn.addEventListener("click", () => {
      sidebarEl.classList.toggle("mobile-open");
      const isOpen = sidebarEl.classList.contains("mobile-open");
      mobileToggleBtn.classList.toggle("active", isOpen);
    });
  }

  // Quick Chips listener
  document.querySelectorAll(".truck-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".truck-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      const val = chip.getAttribute("data-chip");

      if (searchInput) searchInput.value = "";
      document.querySelectorAll('[data-filter^="truck-"]').forEach(cb => cb.checked = false);

      if (val.startsWith("brand:")) {
        const brandVal = val.split(":")[1];
        const targetCb = document.querySelector(`[data-filter="truck-brand"][value="${brandVal}"]`);
        if (targetCb) targetCb.checked = true;
      } else if (val.startsWith("type:")) {
        const typeVal = val.split(":")[1];
        const targetCb = document.querySelector(`[data-filter="truck-type"][value="${typeVal}"]`);
        if (targetCb) targetCb.checked = true;
      } else if (val.startsWith("cond:")) {
        const condVal = val.split(":")[1];
        const targetCb = document.querySelector(`[data-filter="truck-condition"][value="${condVal}"]`);
        if (targetCb) targetCb.checked = true;
      }
      renderTrucks();
    });
  });

  // Initial render
  renderTrucks();

  // Event Listeners
  if (searchInput) searchInput.addEventListener("input", renderTrucks);
  if (sortSelect) sortSelect.addEventListener("change", renderTrucks);
  document.addEventListener("change", (e) => {
    if (e.target && e.target.matches('[data-filter^="truck-"]')) {
      renderTrucks();
    }
  });

  const clearBtn = document.getElementById("clear-truck-filters");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      document.querySelectorAll('[data-filter^="truck-"]').forEach(cb => cb.checked = false);
      document.querySelectorAll(".truck-chip").forEach(c => c.classList.remove("active"));
      const defaultChip = document.querySelector('.truck-chip[data-chip="all"]');
      if (defaultChip) defaultChip.classList.add("active");
      if (sortSelect) sortSelect.value = "featured";
      renderTrucks();
    });
  }
}

// --- GLOBAL CARD CLICK DELEGATION FOR ALL PRODUCT CARDS ---
document.addEventListener("click", (e) => {
  const card = e.target.closest(".product-card, .truck-card-v2");
  if (!card) return;

  // Do not navigate if user clicked an interactive modal trigger or button
  if (e.target.closest(".open-quote-modal") || e.target.closest("button.open-quote-modal") || e.target.closest("input") || e.target.closest("label")) {
    return;
  }

  const dataUrl = card.getAttribute("data-url");
  const detailLink = card.querySelector("a[href*='detalle.html']");
  const targetUrl = dataUrl || (detailLink ? detailLink.getAttribute("href") : null);

  if (targetUrl) {
    window.location.href = targetUrl;
  }
});

// --- REUSABLE NUMERICAL PAGINATION CONTROLS RENDERER ---
function renderPagination(container, currentPage, totalPages, onPageChange) {
  if (!container) return;
  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  let html = `<div class="pagination" style="display: flex; align-items: center; justify-content: center; gap: 0.4rem; margin-top: 2rem;">`;

  // Previous button
  html += `
    <button class="pagination-btn pagination-prev ${currentPage === 1 ? 'disabled' : ''}" 
            ${currentPage === 1 ? 'disabled' : ''} 
            style="padding: 0.5rem 0.9rem; background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.88rem;">
      &laquo; Ant
    </button>
  `;

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const isActive = i === currentPage;
    html += `
      <button class="pagination-btn pagination-num ${isActive ? 'active' : ''}" 
              data-page="${i}"
              style="padding: 0.5rem 0.85rem; background: ${isActive ? 'var(--primary-yellow)' : 'var(--bg-card)'}; border: 1px solid ${isActive ? 'var(--primary-yellow)' : 'var(--border-color)'}; color: ${isActive ? '#000000' : 'var(--text-primary)'}; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 0.88rem;">
        ${i}
      </button>
    `;
  }

  // Next button
  html += `
    <button class="pagination-btn pagination-next ${currentPage === totalPages ? 'disabled' : ''}" 
            ${currentPage === totalPages ? 'disabled' : ''} 
            style="padding: 0.5rem 0.9rem; background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.88rem;">
      Sig &raquo;
    </button>
  `;

  html += `</div>`;
  container.innerHTML = html;

  // Attach click listeners to pagination buttons
  const prevBtn = container.querySelector(".pagination-prev");
  const nextBtn = container.querySelector(".pagination-next");
  const numBtns = container.querySelectorAll(".pagination-num");

  if (prevBtn && currentPage > 1) {
    prevBtn.addEventListener("click", () => onPageChange(currentPage - 1));
  }
  if (nextBtn && currentPage < totalPages) {
    nextBtn.addEventListener("click", () => onPageChange(currentPage + 1));
  }
  numBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetPage = parseInt(btn.dataset.page);
      if (targetPage && targetPage !== currentPage) {
        onPageChange(targetPage);
      }
    });
  });
}



